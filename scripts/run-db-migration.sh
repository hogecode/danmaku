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
# Filter out read-only fields that aren't allowed in register-task-definition
# Also ensure secrets are properly configured from AWS Secrets Manager
NEW_TASK_DEF=$(echo "$TASK_DEF" | jq \
  --arg IMAGE "$REPO_URI" \
  --argjson CMD "$CMD" \
  --arg ACCOUNT_ID "$AWS_ACCOUNT_ID" \
  --arg REGION "$AWS_REGION" \
  'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy) | 
   .containerDefinitions[0].image = $IMAGE | 
   .containerDefinitions[0].command = $CMD |
   # Ensure secrets are set from Secrets Manager
   if .containerDefinitions[0].secrets == null then
     .containerDefinitions[0].secrets = [
       {
         name = "DB_CREDENTIALS",
         valueFrom = ($ACCOUNT_ID + ":secret:danmaku/db-credentials::")
       },
       {
         name = "REDIS_CREDENTIALS",
         valueFrom = ($ACCOUNT_ID + ":secret:danmaku/redis-credentials::")
       },
       {
         name = "APP_SECRETS",
         valueFrom = ($ACCOUNT_ID + ":secret:danmaku/app-secrets::")
       },
       {
         name = "OAUTH_SECRETS",
         valueFrom = ($ACCOUNT_ID + ":secret:danmaku/oauth-secrets::")
       }
     ]
   else
     .containerDefinitions[0].secrets
   end')

echo "📝 Filtered task definition for registration:"
echo "$NEW_TASK_DEF" | jq 'keys'

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
echo "$TASK_INFO" | jq '.tasks[0] | {lastStatus, exitCode: .containers[0].exitCode, stoppedReason, stoppedCode: .stoppedCode}'

EXIT_CODE=$(echo "$TASK_INFO" | jq -r '.tasks[0].containers[0].exitCode // "null"')

# Get more detailed container info
echo ""
echo "📝 Container Details:"
echo "$TASK_INFO" | jq '.tasks[0].containers[0] | {name, lastStatus, exitCode, reason, image}' 2>/dev/null || echo "  (Unable to parse container details)"

# Get container logs from CloudWatch
echo ""
echo "📋 Fetching container logs from CloudWatch..."

# Extract task ID from task ARN (format: ...../task-id)
TASK_ID=$(echo "$TASK_ARN" | awk -F/ '{print $NF}')

# Try multiple log group patterns
# Priority: exact environment-based, then generic
declare -a LOG_GROUPS=(
  "/ecs/ecs-sample-nestjs-${ENVIRONMENT}"
  "/ecs/ecs-sample-nestjs-dev"
  "/ecs/ecs-sample-nestjs-prod"
  "/aws/ecs/ecs-sample-nestjs-service"
  "/aws/ecs/ecs-sample-nestjs-service-prod"
  "/aws/ecs/ecs-sample-nestjs-service-dev"
  "/aws/ecs/danmaku-nestjs"
)

LOGS=""
FOUND_LOG_GROUP=""
FOUND_LOG_STREAM=""

# Try to find logs
for LOG_GROUP in "${LOG_GROUPS[@]}"; do
  echo "  Trying log group: $LOG_GROUP"
  
  # Skip permission check, just try to get logs directly
  # This is faster and avoids DescribeLogGroups permission issues
  
  # Try different log stream patterns
  declare -a LOG_STREAMS=(
    "${TASK_ID}"
    "${ENVIRONMENT}/${TASK_ID}"
    "ecs-sample-nestjs-service/${TASK_ID}"
    "${ENVIRONMENT}/ecs-sample-nestjs-service/${TASK_ID}"
  )
  
  for LOG_STREAM in "${LOG_STREAMS[@]}"; do
    echo "    Trying log stream: $LOG_STREAM"
    
    LOGS=$(aws logs get-log-events \
      --log-group-name "$LOG_GROUP" \
      --log-stream-name "$LOG_STREAM" \
      --region "$AWS_REGION" \
      --output text \
      --query 'events[*].message' 2>/dev/null || echo "")
    
    if [ ! -z "$LOGS" ]; then
      FOUND_LOG_GROUP="$LOG_GROUP"
      FOUND_LOG_STREAM="$LOG_STREAM"
      echo "      ✅ Found logs!"
      break 2
    fi
  done
done

if [ ! -z "$LOGS" ]; then
  echo ""
  echo "🔍 Container Logs ($FOUND_LOG_GROUP / $FOUND_LOG_STREAM):"
  echo "---"
  echo "$LOGS"
  echo "---"
else
  echo ""
  echo "⚠️  No logs found in CloudWatch"
  echo ""
  echo "Trying alternative log retrieval method..."
  
  # Try to get logs using awslogs or describe-tasks details
  TASK_DETAILS=$(aws ecs describe-tasks \
    --cluster "$ECS_CLUSTER" \
    --tasks "$TASK_ARN" \
    --region "$AWS_REGION" \
    --query 'tasks[0]' \
    --output json 2>/dev/null)
  
  if [ ! -z "$TASK_DETAILS" ]; then
    echo ""
    echo "📌 Task Timing Info:"
    echo "$TASK_DETAILS" | jq '{
      createdAt,
      startedAt,
      pullStartedAt,
      pullStoppedAt,
      executionStoppedAt,
      stoppedAt,
      stoppedReason,
      stopCode
    }'
    
    echo ""
    echo "💡 Debugging tips:"
    echo "  1. Check if image pull failed:"
    PULL_DURATION=$(echo "$TASK_DETAILS" | jq -r 'if .pullStoppedAt and .pullStartedAt then "Pull succeeded" else "Check pull status" end')
    echo "     $PULL_DURATION"
    
    echo ""
    echo "  2. Check container startup logs with AWS Systems Manager:"
    echo "     aws ssm start-session --target <ecs-container-instance-id>"
    
    echo ""
    echo "  3. Check ECS task execution role CloudWatch permissions:"
    TASK_EXEC_ROLE=$(echo "$TASK_DETAILS" | jq -r '.taskDefinitionArn')
    echo "     Task Definition: $TASK_EXEC_ROLE"
  fi
fi

echo ""
if [ "$EXIT_CODE" = "0" ]; then
  echo "✅ Migration completed successfully!"
  exit 0
else
  echo "❌ Migration failed with exit code: $EXIT_CODE"
  echo ""
  echo "📚 Next steps:"
  echo "  1. Review the task details above for timing and error codes"
  echo "  2. Check ECS Container Insights for resource issues"
  echo "  3. Verify DB_USER, DB_PASSWORD in AWS Secrets Manager"
  echo "  4. Verify RDS security group allows NestJS security group"
  echo "  5. Check application logs: yarn db:migrate --verbose"
  exit 1
fi
