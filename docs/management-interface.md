# DevOps Stack Management Interface

The Management Interface provides a web-based dashboard for managing your DevOps stack. It allows you to:

1. Manage Applications
    - Add new applications
    - View existing applications

2. Manage Services
    - Add new services and associate them with applications
    - View existing services

3. Manage Deployments
    - Create new deployments for services
    - View deployment history and status

4. Configure Alerts
    - Set up new alerts for services
    - View existing alerts

## Authentication

The Management Interface now requires user authentication. To use the interface:

1. If you don't have an account, ask your system administrator to create one for you.
2. Navigate to the Management Interface URL.
3. Enter your username and password in the login form.
4. Once logged in, you'll have access to all features based on your user role.
5. To log out, click the "Logout" button at the top of the interface.

Note: Your session will expire after 1 hour, at which point you'll need to log in again.

## Usage

1. Access the Management Interface at `http://your-server-ip:3001`

2. Applications:
    - To add a new application, enter the name and description in the "Apps" section and click "Add App"
    - Existing applications will be listed below the form

3. Services:
    - To add a new service, enter the service name and the ID of the associated application in the "Services" section and click "Add Service"
    - Existing services will be listed below the form

4. Deployments:
    - To create a new deployment, enter the service ID and version in the "Deployments" section and click "Add Deployment"
    - Existing deployments will be listed below the form, showing the service ID, version, and status

5. Alerts:
    - To set up a new alert, enter the alert name, condition, threshold, and associated service ID in the "Alerts" section and click "Add Alert"
    - Existing alerts will be listed below the form

Remember to refresh the page to see the most up-to-date information after making changes.

## Security Notes

- Keep your login credentials secure and do not share them with others.
- Always log out when you're done using the interface, especially on shared computers.
- If you suspect your account has been compromised, contact your system administrator immediately.
