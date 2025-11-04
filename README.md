# DevOps LogSense

AI-Powered Log Analysis & Monitoring Platform for Kubernetes, Docker, Jenkins, and AWS EC2.

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
└── components/            # React components (future)
```

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repo-url>
cd devops-logsense
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

#### Build the Docker Image

```bash
# Build the Docker image
docker build -t devops-logsense:latest .
```

#### Run with Docker

```bash
# Basic run (Kubernetes log collection only)
docker run -p 3000:3000 devops-logsense:latest

# With environment variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e JENKINS_URL=http://jenkins:8080 \
  -e JENKINS_USERNAME=admin \
  -e JENKINS_API_TOKEN=your-token \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  devops-logsense:latest

# With Docker socket access (for Docker log collection)
docker run -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  devops-logsense:latest

# With kubeconfig (for local Kubernetes access)
docker run -p 3000:3000 \
  -v ~/.kube/config:/home/nextjs/.kube/config:ro \
  devops-logsense:latest
```

#### Using Docker Compose

Create a `docker-compose.yml` file:

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
      - JENKINS_USERNAME=${JENKINS_USERNAME}
      - JENKINS_API_TOKEN=${JENKINS_API_TOKEN}
      - AWS_REGION=${AWS_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    volumes:
      # Uncomment for Docker log collection
      # - /var/run/docker.sock:/var/run/docker.sock
      # Uncomment for local Kubernetes access
      # - ~/.kube/config:/home/nextjs/.kube/config:ro
    restart: unless-stopped
```

Run with Docker Compose:

```bash
docker-compose up -d
```

### Kubernetes Deployment with Helm

#### Prerequisites

- Kubernetes cluster (1.19+)
- Helm 3.x installed
- kubectl configured to access your cluster

#### Quick Start

1. **Build and push your Docker image to a registry:**

```bash
# Build the image
docker build -t your-registry/devops-logsense:0.1.0 .

# Push to registry (Docker Hub, GCR, ECR, etc.)
docker push your-registry/devops-logsense:0.1.0
```

2. **Install the Helm chart:**

```bash
# Install with default values (Kubernetes log collection only)
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=your-registry/devops-logsense \
  --set image.tag=0.1.0

# Install with custom values
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=your-registry/devops-logsense \
  --set image.tag=0.1.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=devops-logsense.yourdomain.com
```

3. **Access the application:**

```bash
# Port forward to access locally
kubectl port-forward svc/devops-logsense 8080:80

# Visit http://localhost:8080
```

#### Configuration Options

Create a custom `values.yaml` file:

```yaml
# values-custom.yaml
image:
  repository: your-registry/devops-logsense
  tag: 0.1.0

replicaCount: 2

service:
  type: LoadBalancer  # or NodePort, ClusterIP

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

# Enable Kubernetes log collection (default)
kubernetes:
  enabled: true

# Enable Docker log collection (requires host Docker socket)
docker:
  enabled: true
  socketPath: /var/run/docker.sock
  hostPath: /var/run/docker.sock

# Enable Jenkins integration
jenkins:
  enabled: true
  url: "http://jenkins.default.svc.cluster.local:8080"
  username: "admin"
  apiToken: "your-jenkins-api-token"

# Enable AWS CloudWatch integration
aws:
  enabled: true
  region: us-east-1
  accessKeyId: "your-aws-access-key"
  secretAccessKey: "your-aws-secret-key"

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

Install with custom values:

```bash
helm install devops-logsense ./helm/devops-logsense -f values-custom.yaml
```

#### Helm Chart Management

```bash
# Upgrade the deployment
helm upgrade devops-logsense ./helm/devops-logsense -f values-custom.yaml

# Check deployment status
helm status devops-logsense

# List all releases
helm list

# Uninstall
helm uninstall devops-logsense

# Test the chart
helm lint ./helm/devops-logsense
helm template devops-logsense ./helm/devops-logsense

# Package the chart
helm package ./helm/devops-logsense
```

#### RBAC and Permissions

The Helm chart automatically creates:

1. **ServiceAccount**: For pod identity
2. **ClusterRole**: With permissions to read:
   - Pods and pod logs
   - Events
   - Namespaces
   - Deployments, ReplicaSets, DaemonSets, StatefulSets
3. **ClusterRoleBinding**: Binds the ClusterRole to the ServiceAccount

This allows the application to collect logs from all namespaces in the cluster.

For namespace-scoped permissions, modify `values.yaml`:

```yaml
rbac:
  create: true
  # Use Role instead of ClusterRole
  clusterWide: false
```

#### Using with Different Registries

**Docker Hub:**
```bash
docker build -t username/devops-logsense:0.1.0 .
docker push username/devops-logsense:0.1.0

helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=username/devops-logsense
```

**Google Container Registry (GCR):**
```bash
docker build -t gcr.io/project-id/devops-logsense:0.1.0 .
docker push gcr.io/project-id/devops-logsense:0.1.0

helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=gcr.io/project-id/devops-logsense
```

**AWS Elastic Container Registry (ECR):**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t 123456789.dkr.ecr.us-east-1.amazonaws.com/devops-logsense:0.1.0 .
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/devops-logsense:0.1.0

helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=123456789.dkr.ecr.us-east-1.amazonaws.com/devops-logsense
```

#### Troubleshooting

```bash
# View pod logs
kubectl logs -f deployment/devops-logsense

# Describe the deployment
kubectl describe deployment devops-logsense

# Check pod status
kubectl get pods -l app.kubernetes.io/name=devops-logsense

# Exec into pod for debugging
kubectl exec -it deployment/devops-logsense -- sh

# Check RBAC permissions
kubectl auth can-i get pods --as=system:serviceaccount:default:devops-logsense

# View Helm values
helm get values devops-logsense
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

### Network Issues
- Connection refused/timeout
- DNS resolution failures
- Socket hang up

### Permission Issues
- Access denied
- Unauthorized (401, 403)
- Insufficient privileges

### Resource Issues
- Out of memory (OOM)
- Disk space full
- CPU throttling

### Configuration Issues
- Invalid configuration
- Missing environment variables
- Port conflicts

### Security Issues
- Certificate errors (SSL/TLS)
- Security violations
- Authentication failures

### Performance Issues
- Slow queries/responses
- High latency
- Deadlocks

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

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Integrations**: 
  - Kubernetes Client (@kubernetes/client-node)
  - Dockerode (Docker API)
  - AWS SDK (CloudWatch Logs)
  - Axios (Jenkins API)

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
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
