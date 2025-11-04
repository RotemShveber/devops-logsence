# DevOps LogSense Helm Chart

Helm chart for deploying DevOps LogSense on Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.x
- kubectl configured to access your cluster

## Installation

### 1. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t your-registry/devops-logsense:0.1.0 ../../

# Push to your container registry
docker push your-registry/devops-logsense:0.1.0
```

### 2. Install the Chart

#### Quick Install (Default Configuration)

```bash
helm install devops-logsense . \
  --set image.repository=your-registry/devops-logsense \
  --set image.tag=0.1.0
```

#### Install with Custom Values

```bash
# Copy the example values file
cp values-example.yaml values-custom.yaml

# Edit values-custom.yaml with your configuration
vim values-custom.yaml

# Install with custom values
helm install devops-logsense . -f values-custom.yaml
```

### 3. Access the Application

```bash
# Port forward to access locally
kubectl port-forward svc/devops-logsense 8080:80

# Visit http://localhost:8080
```

## Configuration

### Key Configuration Options

| Parameter | Description | Default |
|-----------|-------------|---------|
| `image.repository` | Docker image repository | `devops-logsense` |
| `image.tag` | Docker image tag | `latest` |
| `replicaCount` | Number of replicas | `1` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `ingress.enabled` | Enable ingress | `false` |
| `kubernetes.enabled` | Enable Kubernetes log collection | `true` |
| `docker.enabled` | Enable Docker log collection | `false` |
| `jenkins.enabled` | Enable Jenkins integration | `false` |
| `aws.enabled` | Enable AWS CloudWatch integration | `false` |
| `rbac.create` | Create RBAC resources | `true` |

See `values.yaml` for all available options.

## Examples

### Example 1: Basic Deployment with Ingress

```bash
helm install devops-logsense . \
  --set image.repository=myregistry/devops-logsense \
  --set image.tag=0.1.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=devops-logsense.example.com
```

### Example 2: Production Deployment with Auto-Scaling

```bash
helm install devops-logsense . \
  --set image.repository=myregistry/devops-logsense \
  --set image.tag=0.1.0 \
  --set replicaCount=2 \
  --set autoscaling.enabled=true \
  --set autoscaling.minReplicas=2 \
  --set autoscaling.maxReplicas=10 \
  --set resources.limits.cpu=2000m \
  --set resources.limits.memory=2Gi
```

### Example 3: Enable All Integrations

```bash
helm install devops-logsense . -f - <<EOF
image:
  repository: myregistry/devops-logsense
  tag: 0.1.0

kubernetes:
  enabled: true

docker:
  enabled: true

jenkins:
  enabled: true
  url: "http://jenkins:8080"
  username: "admin"
  apiToken: "your-token"

aws:
  enabled: true
  region: us-east-1
  accessKeyId: "your-key"
  secretAccessKey: "your-secret"

ingress:
  enabled: true
  hosts:
    - host: devops-logsense.example.com
      paths:
        - path: /
          pathType: Prefix
EOF
```

## Upgrading

```bash
# Upgrade with new values
helm upgrade devops-logsense . -f values-custom.yaml

# Upgrade only the image version
helm upgrade devops-logsense . \
  --reuse-values \
  --set image.tag=0.2.0
```

## Uninstalling

```bash
helm uninstall devops-logsense
```

## RBAC and Permissions

The chart creates the following RBAC resources:

- **ServiceAccount**: Unique identity for the application
- **ClusterRole**: Permissions to read pods, logs, events, and workloads
- **ClusterRoleBinding**: Binds the ClusterRole to the ServiceAccount

### Required Permissions

The application needs the following permissions:

```yaml
- apiGroups: [""]
  resources: ["pods", "pods/log", "events", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "daemonsets", "statefulsets"]
  verbs: ["get", "list"]
```

## Security Considerations

### Docker Socket Access

If enabling Docker log collection (`docker.enabled=true`), the chart mounts the host Docker socket into the container. This grants significant privileges:

```yaml
docker:
  enabled: true  # Use with caution
  socketPath: /var/run/docker.sock
  hostPath: /var/run/docker.sock
```

**Recommendations:**
- Only enable in trusted environments
- Use Pod Security Policies or Pod Security Standards to restrict
- Consider using read-only Docker socket access if supported

### Secrets Management

For sensitive data like API tokens and credentials:

**Option 1: Use Helm values (not recommended for production)**
```yaml
jenkins:
  apiToken: "my-token"  # Visible in Helm values
```

**Option 2: Create secrets manually (recommended)**
```bash
# Create a Kubernetes secret
kubectl create secret generic devops-logsense-secrets \
  --from-literal=jenkins-api-token=your-token \
  --from-literal=aws-secret-access-key=your-key

# Reference in values.yaml
# Secrets will be automatically used if they exist
```

**Option 3: Use external secret managers**
- AWS Secrets Manager with External Secrets Operator
- HashiCorp Vault
- Google Secret Manager

### AWS Authentication

For AWS CloudWatch integration, use IAM Roles for Service Accounts (IRSA) instead of access keys:

```yaml
serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/devops-logsense-role

aws:
  enabled: true
  region: us-east-1
  # Don't set accessKeyId and secretAccessKey - use IRSA instead
```

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -l app.kubernetes.io/name=devops-logsense
```

### View Logs
```bash
kubectl logs -f deployment/devops-logsense
```

### Check RBAC Permissions
```bash
# Check if the ServiceAccount can read pods
kubectl auth can-i get pods \
  --as=system:serviceaccount:default:devops-logsense

# Check if it can read pod logs
kubectl auth can-i get pods/log \
  --as=system:serviceaccount:default:devops-logsense
```

### Test the Chart
```bash
# Lint the chart
helm lint .

# Test rendering templates
helm template devops-logsense . \
  --set image.repository=test/image \
  --set image.tag=test

# Dry run installation
helm install devops-logsense . \
  --dry-run --debug \
  -f values-custom.yaml
```

### Common Issues

**Issue: Pods can't pull the image**
```bash
# Solution: Add image pull secrets
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-username \
  --docker-password=your-password

# Then set in values.yaml:
imagePullSecrets:
  - name: regcred
```

**Issue: Application can't access Kubernetes API**
```bash
# Check RBAC permissions
kubectl describe clusterrole devops-logsense
kubectl describe clusterrolebinding devops-logsense

# Verify ServiceAccount
kubectl get serviceaccount devops-logsense -o yaml
```

**Issue: Ingress not working**
```bash
# Check ingress resource
kubectl describe ingress devops-logsense

# Verify ingress controller is installed
kubectl get pods -n ingress-nginx
```

## Support

For issues and questions:
- Check the main [README](../../README.md)
- Open an issue on GitHub
- Review Kubernetes logs for error messages
