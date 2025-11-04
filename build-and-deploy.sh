#!/bin/bash

# DevOps LogSense - Build and Deploy Script
# This script builds the Docker image and deploys to Kubernetes via Helm

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== DevOps LogSense - Build and Deploy ===${NC}\n"

# Configuration
DOCKER_REGISTRY="rotemshveber"  # Change this to your Docker Hub username or registry
IMAGE_NAME="devops-logsense"
IMAGE_TAG="0.1.0"
FULL_IMAGE="${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Docker Image: ${FULL_IMAGE}"
echo ""

# Step 1: Build Docker Image
echo -e "${GREEN}Step 1: Building Docker image...${NC}"
docker build -t ${FULL_IMAGE} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker image built successfully${NC}\n"
else
    echo -e "${RED}✗ Failed to build Docker image${NC}"
    exit 1
fi

# Step 2: Push to Docker Registry
echo -e "${GREEN}Step 2: Pushing image to registry...${NC}"
echo -e "${YELLOW}Make sure you're logged in to Docker Hub: 'docker login'${NC}"
read -p "Press Enter to continue or Ctrl+C to cancel..."

docker push ${FULL_IMAGE}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Image pushed successfully${NC}\n"
else
    echo -e "${RED}✗ Failed to push image${NC}"
    echo -e "${YELLOW}Run 'docker login' first if not authenticated${NC}"
    exit 1
fi

# Step 3: Deploy or Upgrade with Helm
echo -e "${GREEN}Step 3: Deploying to Kubernetes with Helm...${NC}"

# Check if release exists
if helm list | grep -q "devops-logsense"; then
    echo -e "${YELLOW}Existing release found. Upgrading...${NC}"
    helm upgrade devops-logsense ./helm/devops-logsense \
        --set image.repository=${DOCKER_REGISTRY}/${IMAGE_NAME} \
        --set image.tag=${IMAGE_TAG}

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Helm upgrade successful${NC}\n"
    else
        echo -e "${RED}✗ Helm upgrade failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}No existing release found. Installing...${NC}"
    helm install devops-logsense ./helm/devops-logsense \
        --set image.repository=${DOCKER_REGISTRY}/${IMAGE_NAME} \
        --set image.tag=${IMAGE_TAG}

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Helm install successful${NC}\n"
    else
        echo -e "${RED}✗ Helm install failed${NC}"
        exit 1
    fi
fi

# Step 4: Wait for deployment
echo -e "${GREEN}Step 4: Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/devops-logsense --timeout=5m

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment is ready${NC}\n"
else
    echo -e "${RED}✗ Deployment failed to become ready${NC}"
    echo -e "${YELLOW}Check pod status with: kubectl get pods -l app.kubernetes.io/name=devops-logsense${NC}"
    exit 1
fi

# Step 5: Show status
echo -e "${GREEN}=== Deployment Complete ===${NC}\n"
echo -e "${YELLOW}Pod Status:${NC}"
kubectl get pods -l app.kubernetes.io/name=devops-logsense

echo -e "\n${YELLOW}Service Status:${NC}"
kubectl get svc devops-logsense

echo -e "\n${GREEN}=== Access Instructions ===${NC}"
echo -e "${YELLOW}To access the application:${NC}"
echo "  kubectl port-forward svc/devops-logsense 8080:80"
echo "  Then open: http://localhost:8080"

echo -e "\n${YELLOW}To view logs:${NC}"
echo "  kubectl logs -f -l app.kubernetes.io/name=devops-logsense"

echo -e "\n${GREEN}Done!${NC}"
