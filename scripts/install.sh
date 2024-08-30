sudo apt update
sudo apt install jq
sudo apt install ansible

chmod +x ./pipeline.sh
npm i js-yaml -g

ansible-playbook -i localhost, ../tasks/install_docker.yml --connection=local --become
