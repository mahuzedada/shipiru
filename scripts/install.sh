#!/bin/bash

set -e

# Update and upgrade the system
sudo apt-get update
sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y git ansible

# Clone the repository
git clone https://github.com/yourusername/your-repo-name.git devops-stack

# Navigate to the project directory
cd devops-stack

# Run the Ansible playbook
ansible-playbook -i localhost, -c local ansible/site.yml --ask-become-pass

echo "Installation complete. You can access the management interface at http://localhost:3001"
echo "Please create an admin user by running:"
echo "cd devops-stack/apps/management-interface/backend && node create-admin-user.js"

# Remind the user to log out and back in
echo "Please log out and log back in for the Docker group changes to take effect."
