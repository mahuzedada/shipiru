# Basic Setup Guide

This guide will walk you through setting up the basic DevOps stack on an EC2 instance.

## Prerequisites

- An EC2 instance running Ubuntu 20.04 or later
- SSH access to the EC2 instance
- Sudo privileges on the EC2 instance

## Installation

1. SSH into your EC2 instance:
   ```
   ssh ubuntu@your-ec2-instance-ip
   ```

2. Download the installation script:
   ```
   wget https://raw.githubusercontent.com/yourusername/shipiru/main/scripts/install-basic.sh
   ```

3. Make the script executable:
   ```
   chmod +x install-basic.sh
   ```

4. Run the installation script:
   ```
   sudo ./install-basic.sh
   ```

5. Follow the prompts and wait for the installation to complete.

## Post-Installation

After installation, you should have the following services running:

- Nginx (Web Server)
- Your Web Application (running in a Docker container)
- Prometheus (Monitoring)
- Grafana (Visualization)
- Alertmanager (Alerting)

To access these services:

- Web Application: http://your-ec2-instance-ip
- Grafana: http://your-ec2-instance-ip:3000 (default credentials: admin/admin)
- Prometheus: http://your-ec2-instance-ip:9090

## Management Interface

After installation, you can access the DevOps Stack Management Interface at `http://your-server-ip:3001`. This interface allows you to:

- Register new applications
- Manage services
- Configure deployments
- Set up monitoring and alerts

To get started, simply open the interface in your web browser and follow the on-screen instructions to add your first application.

## Customization

To customize your setup:

1. Edit the Docker Compose file at `/path/to/shipiru/docker/docker-compose.yml`
2. Modify Nginx configuration at `/etc/nginx/nginx.conf`
3. Update Prometheus configuration at `/etc/prometheus/prometheus.yml`
4. Customize Grafana dashboards through the Grafana UI

After making changes, restart the services:

```
sudo docker-compose -f /path/to/shipiru/docker/docker-compose.yml up -d
```

## Troubleshooting

If you encounter issues:

1. Check service status: `sudo docker-compose -f /path/to/shipiru/docker/docker-compose.yml ps`
2. View logs: `sudo docker-compose -f /path/to/shipiru/docker/docker-compose.yml logs`
3. Ensure all ports are open in your EC2 security group
