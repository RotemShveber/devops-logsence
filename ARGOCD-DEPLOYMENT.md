# ArgoCD Deployment Guide

This guide shows you how to deploy DevOps LogSense using ArgoCD.

## Prerequisites

- ArgoCD installed in your Kubernetes cluster
- kubectl access to your cluster
- Docker image pushed to a container registry

## Method 1: Using ArgoCD UI

### Step 1: Build and Push Docker Image

```bash
# Build the image
docker build -t your-registry/devops-logsense:0.1.0 .

# Push to your registry
docker push your-registry/devops-logsense:0.1.0
```

### Step 2: Deploy via ArgoCD UI

1. **Login to ArgoCD UI**
   ```bash
   # Get ArgoCD admin password
   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

   # Port forward ArgoCD server
   kubectl port-forward svc/argocd-server -n argocd 8080:443

   # Open browser to https://localhost:8080
   # Username: admin
   # Password: (from command above)
   ```

2. **Create New Application**
   - Click **"+ NEW APP"**
   - Fill in the form:

   **GENERAL**
   - Application Name: `devops-logsense`
   - Project: `default`
   - Sync Policy: `Automatic` (check "Prune Resources" and "Self Heal")

   **SOURCE**
   - Repository URL: `https://github.com/RotemShveber/devops-logsence.git`
   - Revision: `main`
   - Path: `helm/devops-logsense`

   **DESTINATION**
   - Cluster URL: `https://kubernetes.default.svc`
   - Namespace: `default`

   **HELM**
   - Click "VALUES FILES" section
   - Paste your custom values or use the values from `argocd-values.yaml`

   **Important:** Update the image repository:
   ```yaml
   image:
     repository: your-registry/devops-logsense
     tag: "0.1.0"
   ```

3. **Click "CREATE"**

4. **Sync the Application**
   - Click "SYNC" button
   - Click "SYNCHRONIZE"

### Step 3: Access Your Application

```bash
# Port forward to access the application
kubectl port-forward svc/devops-logsense 8080:80

# Visit http://localhost:8080
```

---

## Method 2: Using ArgoCD CLI

### Step 1: Install ArgoCD CLI

```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd
sudo mv argocd /usr/local/bin/
```

### Step 2: Login to ArgoCD

```bash
# Port forward ArgoCD server
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get admin password
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

# Login
argocd login localhost:8080 --username admin --password $ARGOCD_PASSWORD --insecure
```

### Step 3: Create Application via CLI

**Option A: Using inline values**

```bash
argocd app create devops-logsense \
  --repo https://github.com/RotemShveber/devops-logsence.git \
  --path helm/devops-logsense \
  --revision main \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --helm-set image.repository=your-registry/devops-logsense \
  --helm-set image.tag=0.1.0 \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

**Option B: Using values file**

First, edit `argocd-values.yaml` with your configuration, then:

```bash
argocd app create devops-logsense \
  --repo https://github.com/RotemShveber/devops-logsence.git \
  --path helm/devops-logsense \
  --revision main \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default \
  --values argocd-values.yaml \
  --sync-policy automated \
  --auto-prune \
  --self-heal
```

### Step 4: Sync the Application

```bash
argocd app sync devops-logsense
```

### Step 5: Check Status

```bash
# Get application status
argocd app get devops-logsense

# Watch sync progress
argocd app wait devops-logsense
```

---

## Method 3: Using Kubernetes Manifest

### Step 1: Edit the Application Manifest

Edit `argocd-application.yaml` and update the image repository:

```yaml
spec:
  source:
    helm:
      values: |
        image:
          repository: your-registry/devops-logsense  # CHANGE THIS
          tag: "0.1.0"
```

### Step 2: Apply the Manifest

```bash
kubectl apply -f argocd-application.yaml
```

### Step 3: Check Status

```bash
# Via kubectl
kubectl get application -n argocd

# Via ArgoCD CLI
argocd app get devops-logsense
```

---

## Configuration

### Enable Ingress

Edit your values in ArgoCD UI or update `argocd-application.yaml`:

```yaml
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
```

### Enable Additional Integrations

**Jenkins:**
```yaml
jenkins:
  enabled: true
  url: "http://jenkins.default.svc.cluster.local:8080"
  username: "admin"
  apiToken: "your-token"
```

**AWS CloudWatch:**
```yaml
aws:
  enabled: true
  region: us-east-1
  # Use IRSA (recommended)
serviceAccount:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/devops-logsense-role
```

**Docker Socket:**
```yaml
docker:
  enabled: true
  socketPath: /var/run/docker.sock
  hostPath: /var/run/docker.sock
```

### Enable Auto-Scaling

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

---

## Troubleshooting

### Check Application Status

```bash
# Via ArgoCD CLI
argocd app get devops-logsense

# Via kubectl
kubectl describe application devops-logsense -n argocd
```

### View Application Logs

```bash
# View pod logs
kubectl logs -l app.kubernetes.io/name=devops-logsense -f

# View sync operation logs
argocd app logs devops-logsense
```

### Sync Issues

```bash
# Force sync
argocd app sync devops-logsense --force

# Refresh app (fetch latest from Git)
argocd app get devops-logsense --refresh
```

### Delete and Recreate

```bash
# Delete application
argocd app delete devops-logsense

# Or via kubectl
kubectl delete application devops-logsense -n argocd

# Recreate
kubectl apply -f argocd-application.yaml
```

### Check ArgoCD Application Events

```bash
kubectl get events -n argocd --sort-by='.lastTimestamp'
```

---

## Best Practices

1. **Use Git as Source of Truth**
   - Store your `argocd-values.yaml` in Git
   - Use separate branches for dev/staging/prod

2. **Enable Auto-Sync with Caution**
   - Use auto-sync for non-production environments
   - Use manual sync for production

3. **Use Secrets Management**
   - Don't commit secrets to Git
   - Use Sealed Secrets, External Secrets Operator, or Vault

4. **Monitor Your Application**
   - Set up alerts for sync failures
   - Monitor resource usage
   - Check application health regularly

---

## Next Steps

- Set up Ingress for external access
- Configure monitoring and alerting
- Enable additional log sources (Jenkins, AWS, Docker)
- Set up auto-scaling based on load
- Implement proper secrets management

## Support

For issues:
- Check ArgoCD logs: `kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server`
- Check application status in ArgoCD UI
- Review Helm chart documentation in main README.md
