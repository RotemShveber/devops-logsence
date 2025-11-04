# Quick Fix for ImagePullBackOff Error

## Problem
Your deployment is failing with `ImagePullBackOff` because:
1. ❌ The Docker image doesn't exist yet
2. ❌ You haven't built and pushed the image to a registry

## Solution: Build and Push the Image

### Option 1: Automated Script (Easiest)

```bash
# Make sure Docker is running
docker ps

# Login to Docker Hub (if not already logged in)
docker login

# Run the automated script
./build-and-deploy.sh
```

This script will:
1. Build the Docker image
2. Push it to Docker Hub
3. Deploy/upgrade your Helm release
4. Wait for the deployment to be ready

---

### Option 2: Manual Steps

#### Step 1: Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password
```

#### Step 2: Build the Docker Image
```bash
# Replace 'rotemshveber' with your Docker Hub username
docker build -t rotemshveber/devops-logsense:0.1.0 .
```

#### Step 3: Push to Docker Hub
```bash
docker push rotemshveber/devops-logsense:0.1.0
```

#### Step 4: Upgrade Your Helm Deployment
```bash
# If already installed, upgrade:
helm upgrade devops-logsense ./helm/devops-logsense \
  --set image.repository=rotemshveber/devops-logsense \
  --set image.tag=0.1.0

# OR if not installed yet:
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=rotemshveber/devops-logsense \
  --set image.tag=0.1.0
```

#### Step 5: Wait for Pods to be Ready
```bash
# Watch the pod status
kubectl get pods -w

# Check rollout status
kubectl rollout status deployment/devops-logsense
```

---

### Option 3: Use a Pre-built Image (Testing Only)

If you just want to test the deployment quickly without building:

```bash
# Uninstall current deployment
helm uninstall devops-logsense

# Install with a generic Node.js image (for testing)
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=node \
  --set image.tag=20-alpine
```

**Note:** This won't run your application, but it will verify the Helm chart works.

---

## Verify Deployment

After building and pushing:

```bash
# Check pod status (should show Running)
kubectl get pods -l app.kubernetes.io/name=devops-logsense

# Check events
kubectl describe pod -l app.kubernetes.io/name=devops-logsense

# View logs
kubectl logs -f -l app.kubernetes.io/name=devops-logsense
```

## Access the Application

```bash
# Port forward
kubectl port-forward svc/devops-logsense 8080:80

# Open browser to http://localhost:8080
```

---

## Common Issues

### Issue: "unauthorized: authentication required"
**Solution:** Run `docker login` first

### Issue: "denied: requested access to the resource is denied"
**Solution:** Make sure the repository name matches your Docker Hub username

### Issue: Build fails with "no space left on device"
**Solution:** Clean up Docker:
```bash
docker system prune -a
```

### Issue: Still ImagePullBackOff after pushing
**Solution:** Delete the pod to force a new pull:
```bash
kubectl delete pod -l app.kubernetes.io/name=devops-logsense
```

---

## For Private Registries

If using a private registry (GCR, ECR, etc.):

### 1. Create image pull secret
```bash
kubectl create secret docker-registry regcred \
  --docker-server=your-registry \
  --docker-username=your-username \
  --docker-password=your-password
```

### 2. Update Helm values
```bash
helm upgrade devops-logsense ./helm/devops-logsense \
  --set image.repository=your-registry/devops-logsense \
  --set image.tag=0.1.0 \
  --set imagePullSecrets[0].name=regcred
```

---

## Clean Start

If you want to start fresh:

```bash
# Delete everything
helm uninstall devops-logsense

# Build and push
docker build -t rotemshveber/devops-logsense:0.1.0 .
docker push rotemshveber/devops-logsense:0.1.0

# Fresh install
helm install devops-logsense ./helm/devops-logsense \
  --set image.repository=rotemshveber/devops-logsense \
  --set image.tag=0.1.0

# Watch it come up
kubectl get pods -w
```
