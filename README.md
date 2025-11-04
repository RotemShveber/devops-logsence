# DevOps LogSense

AI-Powered Log Analysis & Monitoring Platform for Kubernetes, Docker, Jenkins, and AWS EC2.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Log Analysis](#log-analysis)
- [Deployment](#deployment)
  - [Docker Deployment](#docker-deployment)
  - [Kubernetes Deployment with Helm](#kubernetes-deployment-with-helm)
- [Development](#development)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Multi-Source Log Collection**: Gather logs from Kubernetes, Docker, Jenkins, and AWS EC2/CloudWatch
- **Intelligent Analysis**: Automatic error detection and categorization using pattern matching
- **Smart Categorization**: Logs are classified into categories:
  - Network errors
  - Permission issues
  - Resource constraints
  - Configuration problems
  - Security concerns
  - Performance issues
  - Application errors
- **Suggested Fixes**: Get actionable recommendations for common errors
- **Real-time Dashboard**: Beautiful Next.js UI with analytics and visualizations
- **Severity Classification**: Automatic severity detection (Critical, Error, Warning, Info, Debug)

## Architecture

```
devops-logsense/
├── app/
│   ├── api/
│   │   ├── logs/          # Log collection and ingestion API
│   │   └── analytics/     # Analytics and dashboard data API
│   └── page.tsx           # Main dashboard UI
├── lib/
│   ├── collectors/        # Log collectors for different sources
│   │   ├── kubernetesCollector.ts
│   │   ├── dockerCollector.ts
│   │   ├── jenkinsCollector.ts
│   │   └── ec2Collector.ts
│   ├── analyzers/         # Log analysis engine
│   │   └── logAnalyzer.ts
│   └── types/             # TypeScript type definitions
├── components/            # React components
└── helm/                  # Helm chart for Kubernetes deployment
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Integrations**:
  - Kubernetes Client (@kubernetes/client-node)
  - Dockerode (Docker API)
  - AWS SDK (CloudWatch Logs)
  - Axios (Jenkins API)
- **Deployment**: Docker, Kubernetes, Helm

## Prerequisites

- **Node.js** 20+ (for local development)
- **Docker** (optional, for containerized deployment)
- **Kubernetes** 1.19+ and **Helm** 3.x (optional, for Kubernetes deployment)
- **kubectl** configured to access your cluster (for Kubernetes deployment)

## Quick Start

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/RotemShveber/devops-logsence.git
cd devops-logsense
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
```
http://localhost:3000
```

## Configuration

### Kubernetes

Ensure you have a valid kubeconfig file. By default, the collector uses `~/.kube/config`.

```typescript
// Optional: specify custom kubeconfig path
config: {
  kubeConfigPath: '/path/to/kubeconfig'
}
```

### Docker

Requires access to Docker socket. Default: `/var/run/docker.sock`

```bash
# Grant Docker socket permissions if needed
sudo chmod 666 /var/run/docker.sock
```

### Jenkins

Requires Jenkins URL and API token:

1. Go to Jenkins → User → Configure → API Token
2. Generate a new token
3. Use URL format: `http://jenkins-server:8080`

### AWS EC2 (CloudWatch)

Requires AWS credentials with CloudWatch Logs read permissions:

```bash
# Option 1: Environment variables
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-1

# Option 2: AWS CLI configuration
aws configure
```

## Usage

### Dashboard

1. **Select a log source** from the dropdown (Kubernetes, Docker, Jenkins, or EC2)
2. **Click "Collect Logs"** to fetch and analyze logs
3. **View analytics** including:
   - Total logs collected
   - Error and warning counts
   - Category breakdown
   - Source summary
   - Top error types
   - Recent errors with suggested fixes

### API Endpoints

#### POST /api/logs
Collect and analyze logs from a specific source.

```bash
# Kubernetes
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"source": "kubernetes", "config": {"namespace": "default"}}'

# Docker
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"source": "docker"}'

# Jenkins
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"source": "jenkins", "config": {"baseUrl": "http://jenkins:8080"}}'

# EC2
curl -X POST http://localhost:3000/api/logs \
  -H "Content-Type: application/json" \
  -d '{"source": "ec2", "config": {"region": "us-east-1"}}'
```

#### GET /api/logs
Retrieve stored logs.

```bash
# Get all logs
curl http://localhost:3000/api/logs

# Filter by source
curl http://localhost:3000/api/logs?source=kubernetes&limit=50
```

#### GET /api/analytics
Get analytics dashboard data.

```bash
curl http://localhost:3000/api/analytics
```

## Log Analysis

The analyzer uses pattern matching to identify and categorize errors:

| Category | Detection Patterns |
|----------|-------------------|
| **Network Issues** | Connection refused/timeout, DNS failures, socket hang up |
| **Permission Issues** | Access denied, Unauthorized (401, 403), Insufficient privileges |
| **Resource Issues** | Out of memory (OOM), Disk space full, CPU throttling |
| **Configuration Issues** | Invalid configuration, Missing env vars, Port conflicts |
| **Security Issues** | Certificate errors (SSL/TLS), Security violations, Auth failures |
| **Performance Issues** | Slow queries/responses, High latency, Deadlocks |

---

## Deployment

### Docker Deployment

#### Build the Docker Image

```bash
docker build -t devops-logsense:latest .
```

#### Run with Docker

**Basic run:**
```bash
docker run -p 3000:3000 devops-logsense:latest
```

**With environment variables:**
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e JENKINS_URL=http://jenkins:8080 \
  -e JENKINS_USERNAME=admin \
  -e JENKINS_API_TOKEN=your-token \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  devops-logsense:latest
```

**With Docker socket access (for Docker log collection):**
```bash
docker run -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  devops-logsense:latest
```

**With kubeconfig (for local Kubernetes access):**
```bash
docker run -p 3000:3000 \
  -v ~/.kube/config:/home/nextjs/.kube/config:ro \
  devops-logsense:latest
```

#### Using Docker Compose

The repository includes a `docker-compose.yml` file for easy deployment:

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

**Customize `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  devops-logsense:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JENKINS_URL=${JENKINS_URL}
      - AWS_REGION=${AWS_REGION}
    volumes:
      # Uncomment for Docker log collection
      # - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped
```

---

### Kubernetes Deployment with Helm

#### Prerequisites

- Kubernetes cluster (1.19+)
- Helm 3.x installed
- kubectl configured to access your cluster
- Container registry (Docker Hub, GCR, ECR, etc.)

#### Step 1: Build and Push Docker Image

**Docker Hub:**
```bash
docker build -t username/devops-logsense:0.1.0 .
docker push username/devops-logsense:0.1.0
```

**Google Container Registry (GCR):**
```bash
docker build -t gcr.io/project-id/devops-logsense:0.1.0 .
docker push gcr.io/project-id/devops-logsense:0.1.0
```

**AWS Elastic Container Registry (ECR):**
```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t 123456789.dkr.ecr.us-east-1.amazonaws.com/devops-logsense:0.1.0 .
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/devops-logsense:0.1.0
```

#### Step 2: Install the Helm Chart

**Quick Install (Default Configuration):**
```bash
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=your-registry/devops-logsense \
  --set image.tag=0.1.0
```

**Install with Ingress:**
```bash
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=your-registry/devops-logsense \
  --set image.tag=0.1.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=devops-logsense.yourdomain.com
```

**Install with Custom Values:**
```bash
# Copy the example values file
cp helm/devops-logsense/values-example.yaml values-custom.yaml

# Edit with your configuration
vim values-custom.yaml

# Install
helm install devops-logsense ./helm/devops-logsense -f values-custom.yaml
```

#### Step 3: Access the Application

**Port Forward (for local access):**
```bash
kubectl port-forward svc/devops-logsense 8080:80
# Visit http://localhost:8080
```

**Using LoadBalancer:**
```bash
kubectl get svc devops-logsense
# Use the EXTERNAL-IP to access
```

**Using Ingress:**
```
https://devops-logsense.yourdomain.com
```

#### Configuration Examples

**Example 1: Production with Auto-Scaling**

```yaml
# values-production.yaml
image:
  repository: your-registry/devops-logsense
  tag: 0.1.0

replicaCount: 2

service:
  type: LoadBalancer

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: devops-logsense.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: devops-logsense-tls
      hosts:
        - devops-logsense.yourdomain.com

kubernetes:
  enabled: true

resources:
  limits:
    cpu: 2000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi

autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

**Example 2: All Integrations Enabled**

```yaml
# values-all-integrations.yaml
image:
  repository: your-registry/devops-logsense
  tag: 0.1.0

kubernetes:
  enabled: true

docker:
  enabled: true
  socketPath: /var/run/docker.sock
  hostPath: /var/run/docker.sock

jenkins:
  enabled: true
  url: "http://jenkins.default.svc.cluster.local:8080"
  username: "admin"
  apiToken: "your-jenkins-api-token"

aws:
  enabled: true
  region: us-east-1
  accessKeyId: "your-aws-access-key"
  secretAccessKey: "your-aws-secret-key"
```

Install:
```bash
helm install devops-logsense ./helm/devops-logsense -f values-all-integrations.yaml
```

#### Helm Chart Management

**Upgrade:**
```bash
helm upgrade devops-logsense ./helm/devops-logsense -f values-custom.yaml

# Or upgrade just the image version
helm upgrade devops-logsense ./helm/devops-logsense \
  --reuse-values \
  --set image.tag=0.2.0
```

**Status:**
```bash
helm status devops-logsense
helm list
```

**Uninstall:**
```bash
helm uninstall devops-logsense
```

**Test & Validate:**
```bash
# Lint the chart
helm lint ./helm/devops-logsense

# Dry run
helm install devops-logsense ./helm/devops-logsense \
  --dry-run --debug \
  -f values-custom.yaml

# Test template rendering
helm template devops-logsense ./helm/devops-logsense
```

#### RBAC and Permissions

The Helm chart automatically creates:

| Resource | Purpose |
|----------|---------|
| **ServiceAccount** | Unique identity for the application pods |
| **ClusterRole** | Permissions to read pods, logs, events, and workloads |
| **ClusterRoleBinding** | Binds the ClusterRole to the ServiceAccount |

**Required Permissions:**
- Read access to: `pods`, `pods/log`, `events`, `namespaces`
- List/watch: `deployments`, `replicasets`, `daemonsets`, `statefulsets`

**For namespace-scoped permissions:**
```yaml
rbac:
  create: true
  clusterWide: false  # Use Role instead of ClusterRole
```

#### Security Considerations

**AWS Authentication (Recommended):**
Use IRSA (IAM Roles for Service Accounts) instead of access keys:

```yaml
serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/devops-logsense-role

aws:
  enabled: true
  region: us-east-1
  # Don't set accessKeyId/secretAccessKey - use IRSA
```

**Docker Socket Access:**
Enabling Docker log collection mounts the host Docker socket. Use with caution:

```yaml
docker:
  enabled: true  # Only in trusted environments
```

**Secrets Management:**
For production, use Kubernetes secrets or external secret managers:

```bash
kubectl create secret generic devops-logsense-secrets \
  --from-literal=jenkins-api-token=your-token \
  --from-literal=aws-secret-access-key=your-key
```

#### Troubleshooting

**Check pod status:**
```bash
kubectl get pods -l app.kubernetes.io/name=devops-logsense
```

**View logs:**
```bash
kubectl logs -f deployment/devops-logsense
```

**Verify RBAC permissions:**
```bash
kubectl auth can-i get pods --as=system:serviceaccount:default:devops-logsense
kubectl auth can-i get pods/log --as=system:serviceaccount:default:devops-logsense
```

**Describe resources:**
```bash
kubectl describe deployment devops-logsense
kubectl describe ingress devops-logsense
kubectl get events --sort-by='.lastTimestamp'
```

**Image pull issues:**
```bash
# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-username \
  --docker-password=your-password

# Update values.yaml
imagePullSecrets:
  - name: regcred
```

---

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time log streaming (WebSockets)
- [ ] Advanced AI/ML models for anomaly detection
- [ ] Alert notifications (Slack, Email, PagerDuty)
- [ ] Log retention policies
- [ ] Search and filtering capabilities
- [ ] Export functionality (CSV, JSON)
- [ ] User authentication and multi-tenancy
- [ ] Historical trend analysis
- [ ] Custom pattern definitions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
