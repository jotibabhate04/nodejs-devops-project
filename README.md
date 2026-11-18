# Node.js Application Deployment using PM2, Nginx and Jenkins CI/CD

> **Deployed on AWS EC2 Ubuntu (cloud server), not on a local Ubuntu laptop.** The public URL is a temporary Cloudflare Quick Tunnel address.

| | |
|---|---|
| **GitHub repository** | https://github.com/jotibabhate04/nodejs-devops-project |
| **Public application URL** | https://animal-webster-festival-kurt.trycloudflare.com (temporary Cloudflare Quick Tunnel URL) |
| **Deployment platform** | AWS EC2, Ubuntu 24.04, US East (N. Virginia). Deployed on a cloud server, not on a local Ubuntu laptop. |
| **Documentation date** | 18 November 2026 |

![Deployment architecture](docs/architecture-diagram.png)

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Project Objectives](#2-project-objectives)
- [3. Technologies Used](#3-technologies-used)
- [4. System Architecture](#4-system-architecture)
- [5. AWS EC2 Instance Configuration](#5-aws-ec2-instance-configuration)
- [6. Ubuntu Server Setup](#6-ubuntu-server-setup)
- [7. Node.js Application Setup](#7-nodejs-application-setup)
- [8. PM2 Installation and Configuration](#8-pm2-installation-and-configuration)
- [9. Nginx Reverse Proxy Configuration](#9-nginx-reverse-proxy-configuration)
- [10. GitHub Repository Integration](#10-github-repository-integration)
- [11. Jenkins Installation and Configuration](#11-jenkins-installation-and-configuration)
- [12. Jenkins CI/CD Pipeline](#12-jenkins-cicd-pipeline)
- [13. Deployment Process](#13-deployment-process)
- [14. Cloudflare Tunnel Configuration](#14-cloudflare-tunnel-configuration)
- [15. Public HTTPS Access](#15-public-https-access)
- [16. Application Monitoring](#16-application-monitoring)
- [17. Important Linux and DevOps Commands](#17-important-linux-and-devops-commands)
- [18. Troubleshooting and Errors Solved](#18-troubleshooting-and-errors-solved)
- [19. Screenshots](#19-screenshots)
- [20. Final Project Outcome](#20-final-project-outcome)


## 1. Project Overview

This project deploys a small Node.js web application on an **AWS EC2 Ubuntu server** and automates every new deployment with a **Jenkins CI/CD pipeline**. The application is kept running by **PM2**, served to the internet through an **Nginx** reverse proxy, and shared on a public **HTTPS** URL using a **Cloudflare Quick Tunnel**.

The complete flow is: GitHub, then Jenkins CI/CD, then AWS EC2 Ubuntu, then the Node.js application managed by PM2, then Nginx, then Cloudflare Tunnel, and finally the public HTTPS URL.

> **Note:** **Where this was deployed:** the whole project runs on an **AWS EC2 Ubuntu instance in the cloud**. It was not deployed on a local Ubuntu laptop or virtual machine. Docker was not used.

| Item | Details |
|---|---|
| Project name | Node.js Application Deployment using PM2, Nginx and Jenkins CI/CD |
| GitHub repository | https://github.com/jotibabhate04/nodejs-devops-project |
| Public URL | https://animal-webster-festival-kurt.trycloudflare.com (temporary, see section 14) |
| Cloud platform | AWS EC2, region US East (N. Virginia) |
| Operating system | Ubuntu 24.04 |
| Runtime | Node.js 22 with npm |
| Process manager | PM2 (process name `nodejs-app`) |
| Reverse proxy | Nginx |
| CI/CD | Jenkins 2.580.2 with a declarative `Jenkinsfile` |
| Public access | Cloudflare Quick Tunnel over HTTPS |
| Containers | Docker was not used |

> **Note:** **How this document was written:** it is based on the real repository files (`Jenkinsfile`, `server.js`, `package.json`, commit history) and eight screenshots of the running system. Where something is not visible in the screenshots, the text says so. Setup command blocks in sections 6 to 11 and 14 show the standard procedure for this stack, while the screenshots verify the end result.


## 2. Project Objectives

- Host a Node.js application on a real cloud server (AWS EC2, Ubuntu).
- Keep the application running reliably with **PM2** (automatic restart, logs and monitoring).
- Put **Nginx** in front of the application as a reverse proxy.
- Store the source code and the pipeline definition in **GitHub**.
- Automate checkout, dependency install, deployment and verification with a **Jenkins Pipeline**.
- Make the application reachable from the internet over **HTTPS** with a **Cloudflare Quick Tunnel**.
- Monitor the application and the server with PM2, `free -h` and `df -h`.
- Document the work, including the problems that were solved, in a portfolio-ready format.


## 3. Technologies Used

| Technology | Details | Purpose in this project |
|---|---|---|
| AWS EC2 | Instance `demo`, US East (N. Virginia) | Cloud virtual machine that hosts Jenkins, PM2, Nginx and the application. |
| Ubuntu | 24.04 | Operating system of the EC2 server. |
| Node.js | 22 | Runtime that executes `server.js`. |
| NPM | Bundled with Node.js | Installs dependencies (`npm install --omit=dev`). |
| PM2 | Process name `nodejs-app` | Runs the app in the background, restarts it, collects logs and shows metrics. |
| Nginx | Reverse proxy on port 80 | Receives web requests and forwards them to the app on port 3000. |
| Git and GitHub | Branch `main` | Version control and remote storage of the code and `Jenkinsfile`. |
| Jenkins | 2.580.2 | CI/CD server that runs the deployment pipeline. |
| Jenkins Pipeline | Declarative `Jenkinsfile` | Defines the stages: Checkout, Install Dependencies, Deploy Application, Verify Application. |
| Cloudflare Tunnel | Quick Tunnel (`trycloudflare.com`) | Gives the server a temporary public URL without extra inbound ports for it. |
| HTTPS | Terminated at Cloudflare | Encrypts traffic between the visitor and Cloudflare. |

**Docker was not used** in this project. The application runs directly on the Ubuntu server under PM2.


## 4. System Architecture

The architecture has two flows that share one EC2 instance. The **CI/CD flow** (blue) moves new code from GitHub to the running application. The **request flow** (green) carries a visitor's browser request from the internet to the application.

![Project architecture](docs/architecture-diagram.png)

*Project architecture: GitHub, Jenkins, PM2, Nginx and Cloudflare Tunnel on one AWS EC2 Ubuntu instance.*


### Purpose of each component

| Component | Role |
|---|---|
| GitHub | Stores the application code and the `Jenkinsfile`. It is the single source of truth that Jenkins pulls from. |
| Jenkins | Runs the pipeline job `devops-project`. It checks out the code, installs dependencies, deploys and verifies the result. |
| AWS EC2 (Ubuntu) | The cloud server. Jenkins, PM2, Nginx and the application all run on this one instance. |
| Node.js application | A small HTTP server in `server.js` that returns an HTML page. It listens only on `127.0.0.1:3000`. |
| PM2 | Keeps `nodejs-app` running and restarts it on every deployment. Also provides logs and live monitoring. |
| Nginx | Reverse proxy on port 80. It forwards requests to the Node.js app, so the app itself is never exposed directly. |
| Cloudflare Tunnel | The `cloudflared` client on the server makes an outbound connection to Cloudflare. Cloudflare then publishes a public HTTPS URL for it. |
| HTTPS | Visitors connect to Cloudflare over HTTPS. The tunnel carries the traffic securely to the server. |


### CI/CD flow (deployment)

1. A developer pushes code to the `main` branch of the GitHub repository.
2. The Jenkins job `devops-project` is run. In the build shown in the screenshots (build #2) it was started manually by the user `admin`.
3. Jenkins checks out the repository, including the `Jenkinsfile`.
4. Jenkins installs the Node.js dependencies with `npm install --omit=dev`.
5. Jenkins calls the server-side deploy helper through `sudo`. PM2 restarts `nodejs-app`.
6. Jenkins runs `curl -f http://127.0.0.1:3000` to confirm the application answers.
7. Jenkins prints `Application deployed successfully!` and the build finishes with `SUCCESS`.


### Request flow (public access)

1. A visitor opens the public HTTPS URL in a browser.
2. Cloudflare receives the request and ends the HTTPS connection at its edge.
3. The request travels through the tunnel to the `cloudflared` client on the EC2 instance.
4. `cloudflared` hands the request to the local web server (Nginx).
5. Nginx proxies the request to the Node.js app on `127.0.0.1:3000`.
6. The app returns its HTML page and the response travels back along the same path.

> **Note:** **Evidence for this architecture:** the Node.js app listens only on `127.0.0.1` (see `server.js`), yet the page also loads from the server's public IP on port 80 (Figure 1). That is only possible because a reverse proxy on port 80 forwards the request. The same page loads from the Cloudflare URL (Figure 7). The Nginx configuration file and the `cloudflared` command were not captured in the screenshots.


## 5. AWS EC2 Instance Configuration

The values below were read from the screenshots. The AWS account ID that appeared in the console header has been blacked out in the saved screenshot.

| Setting | Value | Source |
|---|---|---|
| Instance name | demo | Figure 8 |
| Instance ID | i-02ea5f05d653f2bf5 | Figure 8 |
| Region | US East (N. Virginia) | Figure 8 |
| Public IPv4 | 54.204.233.99 | Figures 1 and 8 |
| Private IPv4 | 172.31.46.142 | Figures 6 and 8 |
| Operating system | Ubuntu 24.04, login user `ubuntu` | Project details, Figure 6 |
| Memory | 908 MiB total, no swap configured | Figure 6 |
| Root disk | 19 GB, 3.3 GB used (18%) | Figure 6 |
| Instance type | Not visible in the screenshots | - |


### Network ports (security group)

| Port | Used for | Status in this project |
|---|---|---|
| 22 | SSH or browser-based terminal access for administration | Needed for server administration. Not shown in the screenshots. |
| 80 | HTTP to Nginx | Reachable. The app loads on the public IP without a port number (Figure 1). |
| 8080 | Jenkins web interface | Reachable. The Jenkins console URL uses port 8080 (Figure 2). |
| 3000 | Node.js application | Not exposed. The app listens only on `127.0.0.1`. |
| 443 | HTTPS | Not needed on the server. HTTPS ends at Cloudflare. |

> **Important:** **Security tip:** a public IP and an open Jenkins port are fine for a demo, but for real use, limit ports 22 and 8080 to your own IP address in the security group and use a strong Jenkins admin password.


## 6. Ubuntu Server Setup

All work was done on the Ubuntu 24.04 EC2 server. First the system packages were brought up to date and the basic tools were installed:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
lsb_release -a        # confirm the Ubuntu version
```

After setup, the server resources were checked with `free -h` and `df -h` (Figure 6). The relevant lines are shown here, with the unrelated system mounts removed:

```bash
$ free -h
               total        used        free      shared  buff/cache   available
Mem:           908Mi       806Mi        47Mi        14Mi       177Mi       101Mi
Swap:             0B          0B          0B

$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        19G  3.3G   15G  18% /
tmpfs           455M     0  455M   0% /dev/shm
tmpfs           455M   12M  443M   3% /tmp
/dev/nvme0n1p13 989M   98M  824M  11% /boot
/dev/nvme0n1p15 105M  6.3M   99M   7% /boot/efi
```

> **Important:** **What the numbers tell us:** disk space is healthy (15 GB free on `/`), but memory is tight. Only 101 MiB is available and there is no swap. This matters when Jenkins and the app share a small server (see sections 16 and 20).


## 7. Node.js Application Setup

The application is very small. The repository contains three files:

| File | Description |
|---|---|
| `server.js` | HTTP server that returns an HTML page. Listens on `127.0.0.1`, port 3000. |
| `package.json` | Project name `devops-node-app`, version `1.0.0`, start script `node server.js`. No dependencies are declared. |
| `Jenkinsfile` | Declarative Jenkins pipeline (explained in section 12). |

This is the application code exactly as stored in the repository:

```bash
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    res.end(`
        <h1>Welcome to DevOps Project!</h1>
        <h2>Node.js Application Running Successfully</h2>
        <p>Deployed on AWS Ubuntu EC2</p>
        <p>Managed using PM2</p>
    `);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`Application running on port ${PORT}`);
});
```

> **Note:** **Why bind to loopback?** The server binds to `127.0.0.1`, so it accepts connections only from the same machine. Outside traffic must pass through Nginx, which is a safer design than exposing port 3000 directly.


### Install Node.js 22 and run the app

```bash
# Install Node.js 22 (NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

# Get the code and install dependencies
git clone https://github.com/jotibabhate04/nodejs-devops-project.git
cd nodejs-devops-project
npm install --omit=dev

# Quick manual test
node server.js
# In a second terminal:
curl http://127.0.0.1:3000
```

The expected output is the HTML page shown in the Jenkins console (section 13) and the log line `Application running on port 3000`.


## 8. PM2 Installation and Configuration

PM2 is a process manager for Node.js. It runs the app in the background, restarts it if it stops, stores its logs and shows live metrics.

```bash
sudo npm install -g pm2
pm2 start server.js --name nodejs-app
pm2 status
pm2 save          # remember the process list
pm2 startup       # prints a command that restores PM2 after a reboot
```

> **Note:** `pm2 save` and `pm2 startup` are recommended so the app returns after a server reboot. Their output was not captured in the screenshots.

The PM2 status table (Figure 4) and the `pm2 monit` metadata panel (Figure 8) confirm the real configuration:

| Field | Value seen in the screenshots |
|---|---|
| Name | `nodejs-app` |
| Namespace | `default` |
| Version | `1.0.0` (taken from `package.json`) |
| Mode | `fork` |
| PID | 7320 |
| Uptime | 21m (status table), 24m (monit dashboard) |
| Restarts | 1 |
| Status | `online` |
| CPU / Memory | 0% / 31.2 MB |
| User | `ubuntu` |
| Script path | `/home/ubuntu/devops-node-app/server.js` |
| Watching | disabled |

The restart count of 1 matches the Jenkins deployment, which restarted the process (see section 13). The two log lines in Figure 5 also match this: one line for the first start and one for the restart.


## 9. Nginx Reverse Proxy Configuration

Nginx listens on port 80 and forwards requests to the Node.js app on `127.0.0.1:3000`. This keeps the app private and gives a standard place to add features later, such as extra headers, caching or HTTPS.

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
sudo systemctl status nginx
```

A minimal reverse-proxy configuration for this architecture looks like this:

```bash
# Example: /etc/nginx/sites-available/devops-node-app
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/devops-node-app /etc/nginx/sites-enabled/
sudo nginx -t                 # test the configuration
sudo systemctl reload nginx   # apply it without downtime
```

> **Important:** **Please note:** the configuration above is a reference example for this architecture. The actual Nginx file on the server was not part of the screenshots or the repository, and no `systemctl status nginx` screenshot was taken. What the screenshots do prove is the result: the app answers on port 80 of the public IP (Figure 1) even though it only listens on `127.0.0.1`.


## 10. GitHub Repository Integration

The source code and the pipeline definition are stored in one public GitHub repository: https://github.com/jotibabhate04/nodejs-devops-project

| Property | Value |
|---|---|
| Default branch | `main` |
| Files | `Jenkinsfile`, `package.json`, `server.js` |
| Visibility | Public (the repository could be cloned without credentials) |
| Commits | 3, listed below |

| Commit | Message |
|---|---|
| `82c6fae` | Initial Node.js DevOps application |
| `5a52ed6` | Add Jenkins CI CD pipeline |
| `d467a2e` | Enhance Jenkinsfile with post-deployment messages |

The history shows the project growing step by step: first the application, then the pipeline, then the success and failure messages in the `post` section.

```bash
git clone https://github.com/jotibabhate04/nodejs-devops-project.git
git add .
git commit -m "Describe your change"
git push origin main
```

> **Note:** Never commit passwords, tokens or private keys to the repository. If a private repository is used, add the credentials in Jenkins (Manage Jenkins, Credentials) instead of writing them in the `Jenkinsfile`.


## 11. Jenkins Installation and Configuration

Jenkins 2.580.2 runs on the same EC2 instance and is opened in the browser on port 8080. The pipeline job is named `devops-project`.


### Install Jenkins

```bash
sudo apt update
sudo apt install -y fontconfig openjdk-21-jre
java -version
```

Then add the official Jenkins package repository by following the current instructions for Debian and Ubuntu at https://www.jenkins.io/doc/book/installing/linux/ and install it:

```bash
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins
sudo systemctl status jenkins
```


### First-time setup

1. Open `http://<EC2_PUBLIC_IP>:8080` in a browser (port 8080 must be allowed in the security group).
2. Unlock Jenkins with the initial admin password from `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`. **Never share or commit this password.**
3. Install the suggested plugins and create an admin user (the build in the screenshots was started by `admin`).
4. Create a new item of type **Pipeline** named `devops-project`.


### Pipeline job settings

| Setting | Value |
|---|---|
| Job name | `devops-project` (visible in the Jenkins breadcrumb, Figure 3) |
| Job type | Pipeline |
| Definition | Pipeline script from SCM (consistent with the automatic **Checkout SCM** stage in Figure 3) |
| SCM and URL | Git, https://github.com/jotibabhate04/nodejs-devops-project |
| Branch | `*/main` |
| Script path | `Jenkinsfile` (the file is in the repository root) |
| Runs on | Built-In Node (shown as `Jenkins` in Figure 3) |

> **Note:** **Deployment permission:** the `Deploy Application` stage runs `sudo /usr/local/bin/deploy-node-app`. Because Jenkins runs without a terminal, the Jenkins service user must be allowed to run that one script with `sudo` without a password prompt. This is configured on the server with `visudo` and is not part of the repository, so it is not reproduced here.


## 12. Jenkins CI/CD Pipeline

The pipeline is defined as code in the `Jenkinsfile` in the repository root. This is the file exactly as stored on the `main` branch:

```bash
pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --omit=dev'
            }
        }

        stage('Deploy Application') {
            steps {
                sh 'sudo /usr/local/bin/deploy-node-app "$WORKSPACE"'
            }
        }

        stage('Verify Application') {
            steps {
                sh 'curl -f http://127.0.0.1:3000'
            }
        }
    }

    post {
        success {
            echo 'Application deployed successfully!'
        }

        failure {
            echo 'Deployment failed. Check console output.'
        }
    }
}
```


### Stage-by-stage explanation

| Stage | What it does | Time in build #2 |
|---|---|---|
| Checkout SCM (automatic) | Added by Jenkins itself when the `Jenkinsfile` is loaded from Git. It is why the stage view shows an extra first stage. | 1s |
| 1. Checkout | Prints a message and runs `checkout scm` to fetch the source code from GitHub into the Jenkins workspace. | 0.56s |
| 2. Install Dependencies | Runs `npm install --omit=dev` to install the production dependencies. | 2s |
| 3. Deploy Application | Runs `sudo /usr/local/bin/deploy-node-app "$WORKSPACE"`. This helper script on the server deploys the new code and restarts `nodejs-app` with PM2. | 8s |
| 4. Verify Application | Runs `curl -f http://127.0.0.1:3000`. The `-f` flag makes curl fail on an HTTP error, so a broken app turns the build red. | 0.69s |
| Post Actions | The `post` section. On success it prints `Application deployed successfully!`. On failure it would print `Deployment failed. Check console output.` | 89ms |

> **Note:** **About the deploy helper:** `/usr/local/bin/deploy-node-app` lives on the server and not in the repository, so its source is not shown here. The console output (section 13) shows what it does: it restarts the PM2 process `nodejs-app` and prints `Deployment completed successfully!`. The failure branch of `post` was not triggered in the screenshots.


### How Jenkins automates the deployment

Without Jenkins, a deployment means logging in to the server and typing the same commands every time: pull the code, install packages, restart the app and test it. This is slow and easy to get wrong. With the pipeline, **one build runs all of these steps in the same order every time**. Each run is logged in the console output, and the result is clearly marked as passed or failed. The Verify stage acts as an automatic test, so a deployment is only reported as successful when the application really answers.

In the screenshots the build was started manually by the `admin` user. Automatic triggering from a GitHub push (webhook) was not part of this work and is listed as a next step in section 20.


## 13. Deployment Process

A deployment of this project follows the steps below. The evidence for each step comes from the Jenkins build #2 (Figures 2 and 3) and the PM2 screenshots.

| Step | Action | Evidence |
|---|---|---|
| 1 | Push the code to the `main` branch on GitHub. | Commit history of the repository |
| 2 | Start the `devops-project` job in Jenkins. | Build #2 "Started by admin" (Figure 3) |
| 3 | Jenkins fetches the code from GitHub. | Stages Checkout SCM and Checkout (Figure 3) |
| 4 | Dependencies are installed. | `up to date, audited 1 package`, `found 0 vulnerabilities` (Figure 2) |
| 5 | The deploy helper restarts the app in PM2. | `[PM2] Applying action restartProcessId on app [nodejs-app]` (Figure 2) |
| 6 | Jenkins calls the app with `curl -f`. | HTML of the page returned, 182 bytes (Figure 2) |
| 7 | The build finishes. | `Application deployed successfully!` and `Finished: SUCCESS` |

These are the key lines of the real console output of build #2 (shortened, see Figure 2 for the full screenshot):

```bash
up to date, audited 1 package in 4s
found 0 vulnerabilities
[PM2] Applying action restartProcessId on app [nodejs-app](ids: [ 0 ])
[PM2] [nodejs-app](0) ✓
Deployment completed successfully!
+ curl -f http://127.0.0.1:3000
        <h1>Welcome to DevOps Project!</h1>
        <h2>Node.js Application Running Successfully</h2>
        <p>Deployed on AWS Ubuntu EC2</p>
        <p>Managed using PM2</p>
Application deployed successfully!
Finished: SUCCESS
```

During the deployment, the PM2 host-metrics line printed in the log reported a RAM usage of 95.9%. Later, after the build finished, the PM2 status screen showed 87% (Figure 4). This confirms that the server memory is the main limit of this small setup.


## 14. Cloudflare Tunnel Configuration

A **Cloudflare Quick Tunnel** lets the server publish a web service without opening a new inbound port for it and without owning a domain. The `cloudflared` program on the EC2 instance opens an outbound connection to Cloudflare. Cloudflare then gives it a random address under `trycloudflare.com`.

> **Important:** **Temporary URL:** a Quick Tunnel provides a **temporary** public URL. The address changes when the tunnel is restarted, and it stops working when the `cloudflared` process stops. It is designed for testing and demos, not for production. If the URL in this document no longer opens, the tunnel has simply been stopped.

Typical way to install and start a Quick Tunnel on Ubuntu:

```bash
# Download and install cloudflared (choose the package that matches: dpkg --print-architecture)
curl -L -o cloudflared.deb \
  https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
cloudflared --version

# Start a Quick Tunnel to the local web server (Nginx on port 80)
cloudflared tunnel --url http://localhost:80
```

The command prints a random address in the form `https://<random-words>.trycloudflare.com`. For this project the address was `https://animal-webster-festival-kurt.trycloudflare.com`. The tunnel keeps running only while the command is running, so a terminal multiplexer such as `tmux` or a systemd service is used to keep it alive.

> **Note:** The exact `cloudflared` command and local port that were used are not visible in the screenshots. The command above matches the architecture (tunnel to Nginx on port 80). Adjust the port if your setup differs.


## 15. Public HTTPS Access

The application can be opened from anywhere at the public URL: https://animal-webster-festival-kurt.trycloudflare.com

Figure 7 shows the page loaded through this URL. Figure 1 shows the same page opened directly on the server's public IP. Comparing them is useful:

|  | Cloudflare URL (Figure 7) | Public IP (Figure 1) |
|---|---|---|
| Address | `animal-webster-festival-kurt.trycloudflare.com` | `54.204.233.99` |
| Protocol | HTTPS | HTTP |
| Browser warning | None visible in the address bar | Chrome shows **Not secure** |
| Page content | Identical: Welcome to DevOps Project! | Identical: Welcome to DevOps Project! |

HTTPS ends at the Cloudflare edge. The traffic from `cloudflared` to Nginx stays on the same server (a local HTTP connection). The direct IP address uses plain HTTP, which is why Chrome marks it as not secure. For real users, the HTTPS URL should be shared and not the raw IP.


## 16. Application Monitoring

Monitoring was done with PM2 for the application and with standard Linux commands for the server. The screenshots are in section 19.

| Check | Result observed | Figure |
|---|---|---|
| Process state (`pm2 status`) | `nodejs-app` is **online**, 0% CPU, 31.2 MB memory, 1 restart | 4 |
| Application logs (`pm2 logs`) | `Application running on port 3000` (twice, once per start), error log empty | 5 |
| Live dashboard (`pm2 monit`) | Mem 31 MB, CPU 1.2%, HTTP mean latency 1 ms, P95 latency 97 ms, 0 active requests, uptime 24m | 8 |
| Memory (`free -h`) | 908 MiB total, 806 MiB used, 101 MiB available, no swap | 6 |
| Disk (`df -h`) | `/` is 19 GB with 15 GB free (18% used) | 6 |

In the dashboard the Heap Usage of 79.93% refers to the small V8 heap of the app (6.18 MiB used of 7.73 MiB), not to the server memory. The server-level number to watch is the RAM usage of 87%.

> **Note:** `sudo systemctl status nginx` and `sudo systemctl status jenkins` are documented in section 17, but no screenshots of their output were taken. Jenkins is proven to be running by the Jenkins pages in Figures 2 and 3. Nginx is shown to work by Figure 1.


## 17. Important Linux and DevOps Commands


### Monitoring commands

| Command | What it does | What to look for |
|---|---|---|
| `pm2 status` | Lists all PM2 processes in a table. | Status should be `online`. Check restarts, CPU and memory. Observed: online, 1 restart, 31.2 MB. |
| `pm2 logs nodejs-app` | Shows the last 15 lines of the output and error logs of the app and keeps following new lines. | Errors in the error log. Observed: `Application running on port 3000`. Press Ctrl+C to stop. |
| `pm2 monit` | Opens a live terminal dashboard with process list, logs, custom metrics and metadata. | Memory, CPU, HTTP latency and heap size. Press Ctrl+C to exit. |
| `free -h` | Shows RAM and swap in human-readable units. | The `available` column. Observed: 101 MiB available, no swap. |
| `df -h` | Shows disk usage of each mounted file system. | The `Use%` and `Avail` columns. Observed: `/` at 18%, 15 GB free. |
| `sudo systemctl status nginx` | Shows whether the Nginx service is running. | `active (running)`. Press `q` to leave the pager. |
| `sudo systemctl status jenkins` | Shows whether the Jenkins service is running. | `active (running)`. Press `q` to leave the pager. |


### PM2 management

| Command | Purpose |
|---|---|
| `pm2 start server.js --name nodejs-app` | Start the app under PM2 with a name. |
| `pm2 restart nodejs-app` | Restart the app (this is the action the deployment performs). |
| `pm2 stop nodejs-app` | Stop the app. |
| `pm2 describe nodejs-app` | Show full details of one process. |
| `pm2 save` | Save the current process list. |
| `pm2 startup` | Print the command that starts PM2 on boot. |


### Nginx, Jenkins and networking

| Command | Purpose |
|---|---|
| `sudo nginx -t` | Test the Nginx configuration for errors. |
| `sudo systemctl reload nginx` | Apply a new Nginx configuration without downtime. |
| `sudo journalctl -u jenkins -n 50 --no-pager` | Read the last 50 lines of the Jenkins service log. |
| `sudo ss -tlnp` | List listening ports. Port 3000 should be bound to `127.0.0.1`. |
| `curl -I http://127.0.0.1:3000` | Check that the app answers locally (look for `200 OK`). |
| `curl -I https://animal-webster-festival-kurt.trycloudflare.com` | Check the public tunnel URL from any machine. |
| `pgrep -a cloudflared` | Check that the tunnel process is still running. |


### Git and Node.js

| Command | Purpose |
|---|---|
| `git clone`, `git add`, `git commit`, `git push` | Get the code and publish changes to GitHub. |
| `node -v` and `npm -v` | Check the installed Node.js and npm versions. |
| `npm install --omit=dev` | Install production dependencies only (used by the pipeline). |
| `node server.js` | Run the app directly for a quick manual test. |


## 18. Troubleshooting and Errors Solved

These are the real issues met during the project. Each entry lists the evidence that supports it.


### Issue 1: Jenkins Built-In Node went offline (temporary disk-space threshold)

|  | Details |
|---|---|
| Problem | Jenkins marked its Built-In Node offline because of a temporary disk-space threshold, so no build could start. |
| Cause | Jenkins has built-in node monitors that take a node offline when free disk space or free temp space drops below a threshold (the default is 1 GiB). The `df -h` output in Figure 6 shows that `/tmp` is a small 455 MiB `tmpfs`, which is below that default, while the main disk has 15 GB free. |
| Resolution | Opened **Manage Jenkins, Nodes, Built-In Node**, read the reason shown for the offline state, checked the server with `df -h`, and brought the node back online. |
| Verification | Build #2 ran on the built-in node (shown as `Jenkins`) and finished with SUCCESS (Figures 2 and 3). |


### Issue 2: Jenkins executor availability

|  | Details |
|---|---|
| Problem | The build did not start immediately because no executor was free. While the node was offline, the job waited for an available executor. |
| Evidence | Figure 3 shows that build #2 took **6 min 27 sec** in total, while the six stages together took only about 12 seconds. The stage view also shows the build started 26 minutes ago and the last stage started 20 minutes ago. This is consistent with the job waiting for an executor before the stages could run. |
| Resolution | Restored the Built-In Node (Issue 1) and confirmed in **Manage Jenkins, Nodes** that it was online and had at least one executor. |
| Verification | All stages ran one after another once the executor was available (Figure 3). |


### Issue 3: Jenkinsfile discovery and GitHub configuration

|  | Details |
|---|---|
| Problem | Jenkins can only run the pipeline if it finds the `Jenkinsfile` in the right repository, branch and path. |
| Checks made | 1) The `Jenkinsfile` sits in the repository root. 2) The job's **Script Path** is `Jenkinsfile`. 3) The branch is `*/main`, because the repository's default branch is `main` (older Jenkins defaults use `master`). 4) The repository URL is https://github.com/jotibabhate04/nodejs-devops-project. |
| Evidence | The commit history shows the `Jenkinsfile` was added in `5a52ed6` and improved in `d467a2e`. The stage **Checkout SCM** in Figure 3 shows Jenkins loaded the file from Git. |
| Verification | The pipeline ran the stages defined in the file, including the success message added in the latest commit. |


### Issue 4: Deploying with PM2 from Jenkins

|  | Details |
|---|---|
| Challenge | PM2 manages the app as the `ubuntu` user (see the User column in Figure 4), and the pipeline has to restart it from a Jenkins job. PM2 keeps a separate process list for each Linux user, so the pipeline needs a controlled way to reach that PM2. |
| Solution | The `Jenkinsfile` calls one helper script through `sudo`: `sudo /usr/local/bin/deploy-node-app "$WORKSPACE"`. The script deploys the new code and restarts the PM2 process. Only this one command needs elevated rights. |
| Evidence | The console shows `[PM2] Applying action restartProcessId on app [nodejs-app]` and `Deployment completed successfully!` (Figure 2). PM2 then reports `nodejs-app` as online with 1 restart (Figure 4). |
| Verification | The Verify stage returned the page with `curl -f`, so the restarted app was answering. |


### Issue 5: Cloudflare Tunnel connectivity checks

When the public URL does not open, the best method is to test from the inside out. Each check proves one more layer works:

| Layer | Check | Healthy result |
|---|---|---|
| 1. Node.js app | `curl -I http://127.0.0.1:3000` (the Verify stage does the same with `-f`) | `200 OK` |
| 2. PM2 | `pm2 status` | `nodejs-app` is `online` |
| 3. Nginx | `sudo systemctl status nginx` and `curl -I http://localhost` | `active (running)` and `200 OK` |
| 4. Public IP | Open `http://<EC2_PUBLIC_IP>` in a browser | Page loads (Figure 1) |
| 5. Tunnel process | `pgrep -a cloudflared` | The `cloudflared` process is listed |
| 6. Public URL | `curl -I https://animal-webster-festival-kurt.trycloudflare.com` | `200` and the page loads (Figure 7) |

Because the same page loads from the public IP and from the Cloudflare URL, the app, Nginx and the tunnel were all confirmed to work. A Quick Tunnel URL changes when the tunnel restarts, so after a restart the new URL printed by `cloudflared` must be used.


## 19. Screenshots

All screenshots are real captures of the working system. The only edit is that the AWS account ID in the console header of Figure 8 was blacked out. The files are stored in the `screenshots/` folder.


### Running Node.js Application

![Figure 1](screenshots/01-running-nodejs-application.png)

*Figure 1: The Node.js application opened on the EC2 public IP over HTTP (port 80, through Nginx). Chrome shows Not secure because this path does not use HTTPS.*


### Jenkins Pipeline Build Success

![Figure 2](screenshots/02-jenkins-build-success-console.png)

*Figure 2: Console output of build #2 of `devops-project`, ending with Finished: SUCCESS. It shows the PM2 restart, the curl check and the success message.*

![Figure 2 (zoomed)](screenshots/02b-jenkins-console-zoom.png)

*Figure 2 (zoomed): The same screenshot cropped to the readable part of the console log.*


### Jenkins Pipeline Stages

![Figure 3](screenshots/03-jenkins-pipeline-stages.png)

*Figure 3: Stage view of build #2. All stages are green: Checkout SCM, Checkout, Install Dependencies, Deploy Application, Verify Application and Post Actions. Started by admin, total time 6 min 27 sec.*


### PM2 Application Status

![Figure 4](screenshots/04-pm2-application-status.png)

*Figure 4: `pm2 status` on the EC2 server. `nodejs-app` is online in fork mode, 31.2 MB memory, 1 restart, and the host RAM usage is 87%.*


### PM2 Application Logs

![Figure 5](screenshots/05-pm2-application-logs.png)

*Figure 5: `pm2 logs nodejs-app`. The error log is empty and the output log shows Application running on port 3000.*


### AWS Ubuntu Resource Monitoring

![Figure 6](screenshots/06-ubuntu-resource-monitoring.png)

*Figure 6: `free -h` and `df -h` on the Ubuntu EC2 instance (908 MiB RAM, no swap, 19 GB root disk with 15 GB free).*


### Public HTTPS Application

![Figure 7](screenshots/07-public-https-application.png)

*Figure 7: The application opened through the Cloudflare Quick Tunnel URL (animal-webster-festival-kurt.trycloudflare.com).*


### PM2 Monitoring Dashboard

![Figure 8](screenshots/08-pm2-monit-dashboard.png)

*Figure 8: `pm2 monit` dashboard in the AWS Console terminal. The instance banner shows `i-02ea5f05d653f2bf5 (demo)`. The AWS account ID is blacked out.*


## 20. Final Project Outcome

The project met its main goal: a Node.js application is deployed on an AWS EC2 Ubuntu server, redeployed by a Jenkins pipeline, kept alive by PM2 and reachable on a public HTTPS URL.

| Outcome | Status | Evidence |
|---|---|---|
| Application running on AWS EC2 Ubuntu | Verified | Figures 1, 6 and 8 |
| Application managed by PM2 | Verified | Figures 4, 5 and 8 |
| Jenkins pipeline runs all stages successfully | Verified | Figures 2 and 3 |
| Jenkins restarts the app through PM2 and checks it with curl | Verified | Figure 2 |
| Application reachable on a public HTTPS URL | Verified | Figure 7 |
| App reachable on port 80 of the server (reverse proxy) | Verified by result | Figure 1 (app listens only on 127.0.0.1) |
| Nginx service status and configuration file | Not shown | No screenshot or file provided |
| `cloudflared` command and process | Not shown | No screenshot provided |
| Automatic build trigger from GitHub (webhook) | Not part of this work | Build #2 was started manually |


### Known limitations and next steps

- **Temporary URL:** the Quick Tunnel address changes and can stop. A named Cloudflare Tunnel with an own domain would give a stable address.
- **Low memory:** 87% to 96% RAM usage and no swap on a 908 MiB server. Add a swap file or use a larger instance.
- **Jenkins exposure:** restrict port 8080 to your own IP and use strong credentials. Consider HTTPS for Jenkins.
- **Stable address:** attach an Elastic IP so the public IP does not change when the instance is stopped and started.
- **Automatic builds:** add a GitHub webhook or SCM polling so a `git push` starts the pipeline.
- **Retry in Verify stage:** wait or retry briefly before `curl -f`, in case the app needs a moment to start.
- **Reproducibility:** store the Nginx config and the deploy helper script in the repository (for example in an `ops/` folder).
- **Reboot safety:** run `pm2 save` and `pm2 startup` so the app comes back after a restart.


### Skills demonstrated

Linux server administration on AWS EC2, Node.js deployment, process management with PM2, reverse proxying with Nginx, writing a declarative Jenkins pipeline, Git and GitHub workflow, secure public access with Cloudflare Tunnel, monitoring and troubleshooting, and clear technical documentation.
