# Advanced Setup Guide (Kubernetes)

This guide will walk you through setting up the advanced DevOps stack with Kubernetes on an EC2 instance.

## Prerequisites

- An EC2 instance with at least 2 CPUs and 4GB RAM, running Ubuntu 20.04 or later
- SSH access to the EC2 instance
- Sudo privileges on the EC2 instance

## Installation

1. SSH into your EC2 instance:
   ```
   ssh ubuntu@your-ec2-instance-ip
   ```

2. Download the installation script:
   ```
   wget https://raw.githubusercontent.com/yourusername/shipiru/main/scripts/install-advanced.sh
   ```

3. Make the script executable:
   ```
   chmod +x install-advanced.sh
   ```

4. Run the installation script:
   ```
   sudo ./install-advanced.sh
   ```

5. Follow the prompts and wait for the installation to complete.

## Post-Installation

After installation, you should have a Kubernetes cluster running with the following components:

- Nginx Ingress Controller
- Your Web Application
- Prometheus Operator
- Grafana
- Alertmanager

To access these services:

- Web Application: http://your-ec2-instance-ip
- Grafana: http://your-ec2-instance-ip/grafana (default credentials: admin/admin)
- Prometheus: http://your-ec2-instance-ip/prometheus
- Alertmanager: http://your-ec2-instance-ip/alertmanager

## Management Interface

After installation, you can access the DevOps Stack Management Interface at `http://your-server-ip:3001`. This interface allows you to:

- Register new applications
- Manage services
- Configure deployments
- Set up monitoring and alerts

To get started, simply open the interface in your web browser and follow the on-screen instructions to add your first application.

## Customization

To customize your setup:

1. Modify Kubernetes manifests in the `/path/to/shipiru/kubernetes/` directory
2. Update Prometheus rules and configuration in `/path/to/shipiru/monitoring/prometheus/`
3. Customize Grafana dashboards through the Grafana UI or by modifying `/path/to/shipiru/monitoring/grafana/dashboards/`

After making changes, apply them to the cluster:

```
kubectl apply -f /path/to/shipiru/kubernetes/
```

## Troubleshooting

If you encounter issues:

1. Check pod status: `kubectl get pods --all-namespaces`
2. View pod logs: `kubectl logs <pod-name> -n <namespace>`
3. Ensure all required ports are open in your EC2 security group
4. Check Kubernetes events: `kubectl get events --all-namespaces`
