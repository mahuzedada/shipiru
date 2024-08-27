# DevOps Stack

This project provides a flexible DevOps stack for setting up and managing applications on EC2 instances. It offers two deployment options: a basic setup using Docker and a more advanced setup using Kubernetes.

## Features

- Webserver setup (Nginx)
- SSL certificate management (Certbot)
- Docker container support
- Kubernetes orchestration (advanced setup)
- Observability and monitoring with Prometheus and Grafana
- Automated alerting with Alertmanager

## Quick Start

### Basic Setup (Docker-based)

```bash
wget https://raw.githubusercontent.com/mahuzedada/shipiru/main/scripts/install-basic.sh
chmod +x install-basic.sh
sudo ./install-basic.sh
```

### Advanced Setup (Kubernetes-based)

```bash
wget https://raw.githubusercontent.com/mahuzedada/shipiru/main/scripts/install-advanced.sh
chmod +x install-advanced.sh
sudo ./install-advanced.sh
```

## Documentation

For detailed instructions and configuration options, please refer to the following documentation:

- [Basic Setup Guide](docs/basic-setup.md)
- [Advanced Setup Guide](docs/advanced-setup.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the [MIT License](LICENSE).
