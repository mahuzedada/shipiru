#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root or using sudo${NC}"
  exit 1
fi

echo -e "${GREEN}Starting advanced DevOps stack installation (with Kubernetes)...${NC}"

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Ansible
echo "Installing Ansible..."
apt install -y ansible

# Clone the repository
echo "Cloning the DevOps stack repository..."
git clone https://github.com/mahuzedada/shipiru.git
cd shipiru

# Run Ansible playbook
echo "Running Ansible playbook..."
ansible-playbook -i ansible/inventories/hosts ansible/site.yml -e "setup_type=advanced"


echo "Setting up Management Interface"
if [ "$SETUP_TYPE" = "basic" ]; then
  docker-compose up -d management-interface
else
  kubectl apply -f kubernetes/deployments/management-interface.yaml
fi

echo "Management Interface is now available at http://your-server-ip:3001"


echo -e "${GREEN}Advanced installation completed successfully!${NC}"
echo "Please check the documentation for next steps and configuration options."
