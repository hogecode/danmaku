#!/bin/bash

set -e

# Database Migration Helper Script
ENVIRONMENT=$1
MIGRATION_TYPE=${2:-migrate}
IMAGE_TAG=$3

AWS_REGION="${AWS_REGION}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ECR_NESTJS_REPOSITORY="${ECR_NESTJS_REPOSITORY}"
ECS_CLUSTER="${ECS_CLUSTER}"
DB_SUBNET_IDS="${DB_SUBNET_IDS}"
NESTJS_SECURITY_GROUP_ID="${NESTJS_SECURITY_GROUP_ID}"

# Get current task definition
TASK_DEF_ARN=$(aws ecs describe-services \
  --cluster "$ECS_CLUSTER" \
  --services "ecs-sample-nestjs-service" \
  --region "$AWS_REGION" \
  --query 'services[0].taskDefinition' \
  --output text)

echo "📋 Current task definition: $TASK_DEF_ARN"
echo "🔧 Preparing network configuration..."
echo "  Subnets: $DB_SUBNET_IDS"
echo "  Security Group: $NESTJS_SECURITY_GROUP_ID"

# Convert comma-separated subnets to JSON array using jq
SUBNET_JSON=$(echo "$DB_SUBNET_IDS" | jq -R 'split(",") | map(ltrimstr(" ") | rtrimstr(" "))')

# Get current task definition details
TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$TASK_DEF_ARN" \
  --region "$AWS_REGION" \
  --query 'taskDefinition' \
  --output json)

# Construct image URI
REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_NESTJS_REPOSITORY}:${IMAGE_TAG}"

# Build command based on migration type
if [ "$MIGRATION_TYPE" = "dry" ]; then
  CMD='["yarn","db:migrate","--dry"]'
else
  CMD='["yarn","db:migrate"]'
fi

# Register new task definition
NEW_TASK_DEF=$(echo "$TASK_DEF" | jq \
  --arg IMAGE "$REPO_URI" \
  --argjson CMD "$CMD" \
  '.taskDefinitionArn = (.taskDefinitionArn | split(":") | .[0:-1] | join(":")) | .revision = null | .containerDefinitions[0].image = $IMAGE | .containerDefinitions[0].command = $CMD')

NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json "$(echo "$NEW_TASK_DEF" | jq -c .)" \
  --region "$AWS_REGION" \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "✅ Registered: $NEW_TASK_DEF_ARN"

# Build run-task request with proper JSON formatting
RUN_TASK_JSON=$(jq -n \
  --arg cluster "$ECS_CLUSTER" \
  --arg taskDef "$NEW_TASK_DEF_ARN" \
  --argjson subnets "$SUBNET_JSON" \
  --arg sg "$NESTJS_SECURITY_GROUP_ID" \
  '{
    cluster: $cluster,
    taskDefinition: $taskDef,
    launchType: "FARGATE",
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: $subnets,
        securityGroups: [$sg],
        assignPublicIp: "DISABLED"
      }
    }
  }')

echo "📋 Network configuration:"
echo "$RUN_TASK_JSON" | jq '.'

# Run task
TASK_OUTPUT=$(aws ecs run-task \
  --cli-input-json "$RUN_TASK_JSON" \
  --region "$AWS_REGION" \
  --output json 2>&1)

echo "📋 Task output:"
echo "$TASK_OUTPUT" | jq '.' | head -50

# Parse task ARN
TASK_ARN=$(echo "$TASK_OUTPUT" | jq -r '.tasks[0].taskArn // empty' 2>/dev/null)

if [ -z "$TASK_ARN" ]; then
  echo "❌ Error running task:"
  echo "$TASK_OUTPUT"
  exit 1
fi

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

# Get task results
TASK_INFO=$(aws ecs describe-tasks \
  --cluster "$ECS_CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$AWS_REGION" \
  --output json)

echo ""
echo "📊 Task Details:"
echo "$TASK_INFO" | jq '.tasks[0] | {lastStatus, exitCode: .containers[0].exitCode, stoppedReason}'

EXIT_CODE=$(echo "$TASK_INFO" | jq -r '.tasks[0].containers[0].exitCode // "null"')

echo ""
if [ "$EXIT_CODE" = "0" ]; then
  echo "✅ Migration completed successfully!"
  exit 0
else
  echo "❌ Migration failed with exit code: $EXIT_CODE"
  exit 1
fi
