#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Variables
REPO_URL="$1"
BRANCH="$2"
WORK_DIR_BASE=~/pipeline/repos
LOG_DIR_BASE=~/pipeline/logs
DEPLOY_DIR_BASE=/var/www
NVM_GLOBAL_MODULE_PATH=/home/ubuntu/.nvm/versions/node/v20.17.0/lib/node_modules

# Define the temporary repo directory
TEMP_REPO_DIR=temp_repo

# Create log directory and log file
mkdir -p "$LOG_DIR_BASE"
MAIN_LOG_FILE="$LOG_DIR_BASE/$(date +'%Y-%m-%d_%H-%M-%S')_main.log"

# Function to log messages
log_message() {
    echo "$1" | tee -a "$MAIN_LOG_FILE"
}

# Parse the YAML file first to get the appId
cd "$WORK_DIR_BASE" || { mkdir -p "$WORK_DIR_BASE" && cd "$WORK_DIR_BASE"; }

# Remove the temp_repo directory if it exists
if [ -d "$TEMP_REPO_DIR" ]; then
    log_message "Removing existing directory: $TEMP_REPO_DIR"
    sudo rm -rf "$TEMP_REPO_DIR"
fi

log_message "Cloning repository: $REPO_URL branch: $BRANCH"
git clone -b "$BRANCH" "$REPO_URL" "$TEMP_REPO_DIR" || { log_message "Failed to clone repository"; exit 1; }
cd "$TEMP_REPO_DIR" || { log_message "Failed to navigate to $TEMP_REPO_DIR"; exit 1; }

# Create a Node.js script to parse the YAML file
cat <<EOF > parse_yaml.cjs
const fs = require('fs');
const yaml = require('$NVM_GLOBAL_MODULE_PATH/js-yaml');

try {
    const doc = yaml.load(fs.readFileSync('shipiru.yml', 'utf8'));
    console.log(JSON.stringify(doc, null, 2));
} catch (e) {
    console.error(e);
    process.exit(1);
}
EOF

# Parse the YAML file
log_message "Parsing YAML file"
PARSED_YAML=$(node parse_yaml.cjs)
if [ $? -ne 0 ]; then
    log_message "Failed to parse YAML file"
    exit 1
fi

# Function to execute steps
execute_steps() {
    local STEPS=$1
    local APP_ID=$2
    local DOCKER_IMAGE=$3
    local LOG_FILE=$4

    echo "$STEPS" | jq -c '.[]' | while read -r STEP; do
        STEP_NAME=$(echo "$STEP" | jq -r '.step.name')
        log_message "Executing step: $STEP_NAME for $APP_ID" | tee -a "$LOG_FILE"

        # Handle deployment step
        if [ "$(echo "$STEP" | jq -r '.step.deployment')" != "null" ]; then
            DEPLOYMENT_NAME=$(echo "$STEP" | jq -r '.step.deployment[] | select(.name != null) | .name')
            SOURCE_PATH=$(echo "$STEP" | jq -r '.step.deployment[] | select(.source != null) | .source')
            DESTINATION_PATH=$(echo "$STEP" | jq -r '.step.deployment[] | select(.destination != null) | .destination')

            log_message "Deploying for $APP_ID..." | tee -a "$LOG_FILE"
            log_message "Deployment Name: $DEPLOYMENT_NAME" | tee -a "$LOG_FILE"
            log_message "Source Path: $SOURCE_PATH" | tee -a "$LOG_FILE"
            log_message "Destination Path: $DESTINATION_PATH" | tee -a "$LOG_FILE"

            # Ensure the destination directory exists
            sudo mkdir -p "$DESTINATION_PATH"

            # Check if the source directory exists
            if [ -d "$SOURCE_PATH" ]; then
                # Copy files to deployment directory
                sudo rm -rf "$DESTINATION_PATH" && sudo mkdir -p "$DESTINATION_PATH" && sudo cp -r "$SOURCE_PATH"/* "$DESTINATION_PATH"/ || { log_message "Failed to copy files to $DESTINATION_PATH for $APP_ID" | tee -a "$LOG_FILE"; return 1; }
                log_message "Deployment completed for $APP_ID" | tee -a "$LOG_FILE"
            else
                log_message "Source directory $SOURCE_PATH does not exist for $APP_ID. Skipping deployment." | tee -a "$LOG_FILE"
            fi
        fi

        # Handle script step
        if [ "$(echo "$STEP" | jq -r '.step.script')" != "null" ]; then
            STEP_SCRIPTS=$(echo "$STEP" | jq -r '.step.script[]')
            echo "$STEP_SCRIPTS" | while IFS= read -r SCRIPT; do
                if [ ! -z "$SCRIPT" ]; then
                    log_message "Running Script: $SCRIPT for $APP_ID" | tee -a "$LOG_FILE"
                    sudo docker run --rm -v $(pwd):/app -w /app $DOCKER_IMAGE /bin/sh -c "$SCRIPT" 2>&1 | tee -a "$LOG_FILE"
                fi
            done
        fi
    done
}

# Iterate through each app
echo "$PARSED_YAML" | jq -c '.apps[]' | while read -r APP; do
    APP_ID=$(echo "$APP" | jq -r '.appId')
    DOCKER_IMAGE=$(echo "$APP" | jq -r '.dockerImage')
    ENV_FILE_LOCATION=$(echo "$APP" | jq -r '.envFileLocation')
    DEFAULT_PIPELINE=$(echo "$APP" | jq -r '.pipelines.default')
    BRANCH_PIPELINE=$(echo "$APP" | jq -r ".pipelines.branches.\"$BRANCH\"")



    # Define directories for this app
    WORK_DIR="$WORK_DIR_BASE/$APP_ID"
    LOG_DIR="$LOG_DIR_BASE/$APP_ID"

    # Create log directory and log file for this app
    mkdir -p $LOG_DIR
    LOG_FILE="$LOG_DIR/$(date +'%Y-%m-%d_%H-%M-%S').log"

    # Log the beginning of the script for this app
    log_message "Starting deployment for $APP_ID on branch $BRANCH" | tee -a "$LOG_FILE"

    # Copy environment file
    ENV_SOURCE=~/pipeline/envFiles/$APP_ID
    if [ -f "$ENV_SOURCE" ]; then
        log_message "Environment file found at $ENV_SOURCE" | tee -a "$LOG_FILE"

        if [ ! -z "$ENV_FILE_LOCATION" ] && [ "$ENV_FILE_LOCATION" != "null" ]; then
            ENV_DESTINATION="$ENV_FILE_LOCATION/.env"
            mkdir -p "$ENV_FILE_LOCATION"
        else
            ENV_DESTINATION="./.env"
        fi

        log_message "Copying environment file from $ENV_SOURCE to $ENV_DESTINATION" | tee -a "$LOG_FILE"
        cp "$ENV_SOURCE" "$ENV_DESTINATION" || { log_message "Failed to copy environment file for $APP_ID" | tee -a "$LOG_FILE"; exit 1; }
    else
        log_message "Environment file not found at $ENV_SOURCE for $APP_ID. Skipping environment file copy." | tee -a "$LOG_FILE"
    fi


    # Determine if the branch-specific pipeline exists
    if [ -z "$BRANCH_PIPELINE" ] || [ "$BRANCH_PIPELINE" == "null" ]; then
        log_message "No branch-specific pipeline found for branch $BRANCH. Executing default pipeline for $APP_ID..." | tee -a "$LOG_FILE"
        execute_steps "$DEFAULT_PIPELINE" "$APP_ID" "$DOCKER_IMAGE" "$LOG_FILE"
    else
        log_message "Executing branch-specific pipeline for branch $BRANCH for $APP_ID..." | tee -a "$LOG_FILE"
        execute_steps "$BRANCH_PIPELINE" "$APP_ID" "$DOCKER_IMAGE" "$LOG_FILE"
    fi

    log_message "Pipeline execution completed for $APP_ID on branch $BRANCH" | tee -a "$LOG_FILE"
done

log_message "All app deployments completed"

