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
