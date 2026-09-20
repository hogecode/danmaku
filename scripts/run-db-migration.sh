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
echo "📦 Image URI: $REPO_URI"

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
  STATUS=$(aws ecs describe-tasks \
    --cluster "$ECS_CLUSTER" \
    --tasks "$TASK_ARN" \
    --region "$AWS_REGION" \
    --query 'tasks[0].lastStatus' \
    --output text 2>/dev/null || echo "UNKNOWN")
  
  if [ "$STATUS" = "STOPPED" ]; then
    echo "✅ Task stopped"
    break
  fi
  
  echo "⏳ Status: $STATUS (${ELAPSED}s)"
  sleep 5
  ELAPSED=$((ELAPSED + 5))
done

# Check exit code
EXIT_CODE=$(aws ecs describe-tasks \
  --cluster "$ECS_CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$AWS_REGION" \
  --query 'tasks[0].containers[0].exitCode' \
  --output text)

echo "📊 Exit code: $EXIT_CODE"

# Get logs
echo ""
echo "📋 Logs from CloudWatch:"
aws logs tail "/ecs/ecs-sample-nestjs-${ENVIRONMENT}" \
  --follow --since 15m \
  --region "$AWS_REGION" 2>/dev/null || echo "⚠️ Could not fetch logs"

# Result
if [ "$EXIT_CODE" = "0" ]; then
  echo ""
  echo "✅ Migration completed successfully!"
  exit 0
else
  echo ""
  echo "❌ Migration failed with exit code: $EXIT_CODE"
  exit 1
fi
