#!/bin/bash

set -e

# Database Migration Helper Script
# Usage: ./run-db-migration.sh <environment> <migration-type> <image-tag>

ENVIRONMENT=$1
MIGRATION_TYPE=${2:-migrate}
IMAGE_TAG=$3

# Secrets
AWS_REGION="${AWS_REGION}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ECR_NESTJS_REPOSITORY="${ECR_NESTJS_REPOSITORY}"
ECS_CLUSTER="${ECS_CLUSTER}"
DB_SUBNET_IDS="${DB_SUBNET_IDS}"
NESTJS_SECURITY_GROUP_ID="${NESTJS_SECURITY_GROUP_ID}"

# Task definition from current service
TASK_DEF_ARN=$(aws ecs describe-services \
  --cluster "$ECS_CLUSTER" \
  --services "ecs-sample-nestjs-service" \
  --region "$AWS_REGION" \
  --query 'services[0].taskDefinition' \
  --output text)

echo "📋 Current task definition: $TASK_DEF_ARN"

# Repository URI
REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_NESTJS_REPOSITORY}:${IMAGE_TAG}"
echo "📦 Requested image tag: $IMAGE_TAG"
echo "📦 Image URI: $REPO_URI"

# Check if image exists in ECR
echo ""
echo "🔍 Checking if image exists in ECR..."

# First, list all available images to debug
echo "📋 All images in repository:"
aws ecr describe-images \
  --repository-name "$ECR_NESTJS_REPOSITORY" \
  --region "$AWS_REGION" \
  --query 'imageDetails[].imageTags[]' \
  --output text 2>&1

echo ""
echo "🔍 Looking for tag: $IMAGE_TAG"

# Use jq to properly filter images
IMAGES=$(aws ecr describe-images \
  --repository-name "$ECR_NESTJS_REPOSITORY" \
  --region "$AWS_REGION" \
  --output json 2>&1 | jq -r ".imageDetails[] | select(.imageTags[]? == \"$IMAGE_TAG\") | .imageTags[0]" 2>/dev/null)

if [ -n "$IMAGES" ] && [ "$IMAGES" != "null" ]; then
  echo "✅ Image found in ECR: $IMAGE_TAG"
else
  echo "❌ Image not found in ECR with tag: $IMAGE_TAG"
  echo ""
  echo "📋 Available images in ECR (latest 10):"
  aws ecr describe-images \
    --repository-name "$ECR_NESTJS_REPOSITORY" \
    --region "$AWS_REGION" \
    --output json 2>/dev/null | jq -r '.imageDetails | sort_by(.imagePushedAt)[-10:][].imageTags[]' 2>/dev/null || echo "No images available"
  echo ""
  echo "💡 If no images, you need to build and push an image first:"
  echo "   cd server"
  echo "   docker build -t $ECR_NESTJS_REPOSITORY:latest ."
  echo "   aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin <ECR_REGISTRY>"
  echo "   docker tag $ECR_NESTJS_REPOSITORY:latest <ECR_REGISTRY>/$ECR_NESTJS_REPOSITORY:<TAG>"
  echo "   docker push <ECR_REGISTRY>/$ECR_NESTJS_REPOSITORY:<TAG>"
  exit 1
fi

# Get current task definition
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$TASK_DEF_ARN" \
  --region "$AWS_REGION" \
  --query 'taskDefinition' \
  --output json)

# Build migration command
if [ "$MIGRATION_TYPE" == "dry" ] || [ "$MIGRATION_TYPE" == "migrate" ]; then
  if [ "$MIGRATION_TYPE" == "dry" ]; then
    CMD='["yarn","db:migrate","--dry"]'
    echo "🔄 Dry-run mode"
  else
    CMD='["yarn","db:migrate"]'
    echo "🚀 Migration mode"
  fi
else
  echo "❌ Invalid migration type: $MIGRATION_TYPE"
  exit 1
fi

# Update task definition
NEW_TASK_DEF=$(echo "$TASK_DEF" | jq --arg IMAGE "$REPO_URI" --argjson CMD "$CMD" \
  '.containerDefinitions[0].image=$IMAGE | 
   .containerDefinitions[0].command=$CMD | 
   del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')

# Register new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "$(echo "$NEW_TASK_DEF" | jq -c .)" \
  --region "$AWS_REGION" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "✅ Registered: $NEW_TASK_DEF_ARN"

# Run task
TASK_ARN=$(aws ecs run-task \
  --cluster "$ECS_CLUSTER" \
  --task-definition "$NEW_TASK_DEF_ARN" \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[${DB_SUBNET_IDS}],securityGroups=[${NESTJS_SECURITY_GROUP_ID}],assignPublicIp=DISABLED}" \
  --region "$AWS_REGION" \
  --query 'tasks[0].taskArn' \
  --output text)

echo "🚀 Task ARN: $TASK_ARN"

# Wait for task completion
echo "⏳ Waiting for task to complete (max 15 min)..."
ELAPSED=0
MAX_WAIT=900

while [ $ELAPSED -lt $MAX_WAIT ]; do
  TASK_INFO=$(aws ecs describe-tasks \
    --cluster "$ECS_CLUSTER" \
    --tasks "$TASK_ARN" \
    --region "$AWS_REGION" \
    --output json)
  
  STATUS=$(echo "$TASK_INFO" | jq -r '.tasks[0].lastStatus')
  
  if [ "$STATUS" = "STOPPED" ]; then
    echo "✅ Task stopped"
    break
  fi
  
  echo "⏳ Status: $STATUS (${ELAPSED}s)"
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

# Get full task details
TASK_INFO=$(aws ecs describe-tasks \
  --cluster "$ECS_CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$AWS_REGION" \
  --output json)

echo ""
echo "📊 Task Details:"
echo "$TASK_INFO" | jq '.tasks[0] | {lastStatus, exitCode: .containers[0].exitCode, stoppedReason, containers: [.containers[] | {name, exitCode, reason}]}'

# Check exit code
EXIT_CODE=$(echo "$TASK_INFO" | jq -r '.tasks[0].containers[0].exitCode // "null"')
STOPPED_REASON=$(echo "$TASK_INFO" | jq -r '.tasks[0].stoppedReason // "unknown"')

echo ""
echo "📊 Exit code: $EXIT_CODE"
echo "📊 Stop reason: $STOPPED_REASON"

# Get logs
echo ""
echo "📋 Logs from CloudWatch:"
aws logs tail "/ecs/ecs-sample-nestjs-${ENVIRONMENT}" \
  --follow --since 20m \
  --region "$AWS_REGION" 2>/dev/null || echo "⚠️ Could not fetch logs (task may not have started)"

# Result
echo ""
if [ "$EXIT_CODE" = "0" ]; then
  echo "✅ Migration completed successfully!"
  exit 0
elif [ "$EXIT_CODE" = "null" ]; then
  echo "❌ Task failed to run. Reason: $STOPPED_REASON"
  echo ""
  echo "Common causes:"
  echo "  - Container image not found"
  echo "  - Network configuration error"
  echo "  - Insufficient resources (memory/CPU)"
  echo "  - Task execution role missing permissions"
  exit 1
else
  echo "❌ Migration failed with exit code: $EXIT_CODE"
  exit 1
fi
