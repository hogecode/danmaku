# ========================================
# Configuration Variables
# ========================================
# Update these for different projects/environments
# OR create a Makefile.config file to override (see Makefile.config.example)

# Project configuration
APP_NAME := ecs-sample
AWS_PROFILE :=
AWS_REGION := us-east-1

# Paths
TF_DIR := terraform
DOCKER_FILE := Dockerfile

# Docker configuration
DOCKER_PLATFORM := linux/amd64

# ECS services to deploy (Next.js and Go Server)
ECS_SERVICES := nextjs-service go-server-service

# Environments
ENVIRONMENTS := dev staging prod

# Load optional local config (overrides above variables)
# -include Makefile.config

# ========================================
# Helper Functions
# ========================================


# AWS CLI with profile
aws = aws --profile $(AWS_PROFILE)

# Detect OS (Windows is detected by checking if COMSPEC exists)
ifeq ($(OS),Windows_NT)
    # Windows
    tf = terraform -chdir=$(TF_DIR)
    SHELL := powershell.exe
    .SHELLFLAGS := -NoProfile -Command
else
    # Unix-like systems (Linux, macOS)
    tf = AWS_PROFILE=$(AWS_PROFILE) terraform -chdir=$(TF_DIR)
endif

# Get cluster name for environment
cluster = $(APP_NAME)-$(1)

# Get service name for environment and service type
service = $(APP_NAME)-$(1)-$(2)

# ========================================
# Terraform Targets
# ========================================

.PHONY: terraform.init
terraform.init:
	@echo "Initializing Terraform..."
	@$(tf) init -input=false

.PHONY: terraform.graph
terraform.graph: ## ローカルのTerraform構成から依存関係グラフを生成
	@echo "Generating Terraform dependency graph..."
ifeq ($(OS),Windows_NT)
	@cmd /c "cd terraform && terraform graph > terraform-graph.dot && echo Dependency graph generated: terraform-graph.dot"
	@cmd /c "if exist terraform\terraform-graph.dot dot -Tpng terraform\terraform-graph.dot -o terraform\terraform-graph.png && echo Graph PNG also generated: terraform-graph.png || echo (requires Graphviz: https://graphviz.org/download/)"
else
	@$(tf) graph > terraform-graph.dot
	@echo "Dependency graph generated: terraform-graph.dot"
	@if command -v dot > /dev/null 2>&1; then \
		$(tf) graph | dot -Tpng -o terraform-graph.png; \
		echo "Graph PNG also generated: terraform-graph.png"; \
	else \
		echo "To generate PNG, install Graphviz:"; \
		echo "   macOS: brew install graphviz"; \
		echo "   Linux: apt-get install graphviz"; \
	fi
endif


.PHONY: inframap.generate ## Terraformの状態からInframapを使用してインフラストラクチャ図を生成
inframap.generate:
	@$(tf) state pull > terraform.tfstate
	@inframap generate --tfstate terraform.tfstate > inframap-diagram.dot


# Terraform plan with explicit .tfvars target
.PHONY: tf.plan.dev
tf.plan.dev:
	@echo "Running Terraform plan for dev environment..."
	@cd $(TF_DIR) ; terraform plan -var-file="environments/dev.tfvars" -out=tfplan

.PHONY: tf.plan.staging
tf.plan.staging:
	@echo "Running Terraform plan for staging environment..."
	@cd $(TF_DIR) ; terraform plan -var-file="environments/staging.tfvars"  -out=tfplan

.PHONY: tf.plan.prod
tf.plan.prod:
	@echo "Running Terraform plan for prod environment..."
	@cd $(TF_DIR) ;terraform plan -var-file="environments/prod.tfvars" -out=tfplan	


# Production/prod requires explicit confirmation (no auto-approve)
.PHONY: tf.apply.dev
tf.apply.dev:
	@echo "Applying Terraform changes for dev environment..."
	@$(tf) apply tfplan

.PHONY: tf.destroy.dev
tf.destroy.dev:
	@echo "Destroying Terraform resources for dev environment..."
	@$(tf) destroy -var-file=environments/dev.tfvars -auto-approve

# ========================================
# Go/Database Targets
# ========================================

.PHONY: sqlc.generate
sqlc.generate:
	@echo "Generating code from SQL queries using sqlc..."
	@cd server; sqlc generate
	@echo "Code generation completed!"

.PHONY: sqlc.verify
sqlc.verify:
	@echo "Verifying sqlc configuration..."
	@cd server && sqlc compile
	@echo "Configuration verified!"

.PHONY: dbmate.new-migration
dbmate.new-migration:
	@if [ -z "$(NAME)" ]; then \
		echo "Usage: make dbmate.new-migration NAME=your_migration_name"; \
		exit 1; \
	fi
	@echo "Creating new dbmate migration: $(NAME)..."
	@cd server && dbmate new $(NAME)

.PHONY: dbmate.up
dbmate.up:
	@echo "Running dbmate migrations..."
	@cd server && APP_ENV=dev dbmate up

.PHONY: dbmate.down
dbmate.down:
	@echo "Rolling back dbmate migrations..."
	@cd server && APP_ENV=dev dbmate down

.PHONY: dbmate.dump
dbmate.dump:
	@echo "Dumping current database schema..."
	@cd server && APP_ENV=dev dbmate dump

.PHONY: dbmate.status
dbmate.status:
	@echo "Checking dbmate migration status..."
	@cd server && APP_ENV=dev dbmate status

# ========================================
# Docker Targets
# ========================================

# Generic docker build target
.PHONY: docker.%.build
docker.%.build:
	@echo "Building Docker image for $(call emoji,$*) $* ($(DOCKER_PLATFORM))..."
	@docker build --platform $(DOCKER_PLATFORM) -f $(DOCKER_FILE) -t $(APP_NAME)-$* .
	@echo "Docker image built and tagged as $(APP_NAME)-$*:latest"

# Generic docker push target with ECS redeployment
.PHONY: docker.%.push
docker.%.push: aws.login
	@ECR=$$($(tf) output -raw ecr_repository_url) && \
	if [ -z "$$ECR" ]; then \
		echo "ERROR: terraform output 'ecr_repository_url' is empty"; \
		exit 1; \
	fi && \
	echo "Tagging image as $$ECR:latest" && \
	docker tag $(APP_NAME)-$*:latest $$ECR:latest && \
	echo "Pushing image to $$ECR:latest" && \
	docker push $$ECR:latest && \
	$(MAKE) aws.$*.redeploy.quiet && \
	echo "Push completed successfully!"

# ========================================
# AWS Targets
# ========================================

.PHONY: aws.login
aws.login:
	@$(aws) ecr get-login-password --region $(AWS_REGION) | \
	docker login --username AWS --password-stdin \
	$$($(tf) output -raw ecr_repository_url | cut -d'/' -f1)

# Generic ECS redeploy target (with output)
.PHONY: aws.%.redeploy
aws.%.redeploy:
	@echo "Force redeploying $* services..."
	@$(foreach svc,$(ECS_SERVICES), \
		$(aws) ecs update-service \
			--cluster $(call cluster,$*) \
			--service $(call service,$*,$(svc)) \
			--force-new-deployment \
			--query "service.deployments[0].status" \
			--output text && \
	) true
	@echo "Waiting for all deployments to stabilize..."
	@$(aws) ecs wait services-stable \
		--cluster $(call cluster,$*) \
		--services $(foreach svc,$(ECS_SERVICES),$(call service,$*,$(svc)))
	@echo "$* redeployment completed!"

# Silent redeploy (for use in docker.push)
.PHONY: aws.%.redeploy.quiet
aws.%.redeploy.quiet:
	@$(foreach svc,$(ECS_SERVICES), \
		echo "Triggering ECS deployment for $(svc)" && \
		$(aws) ecs update-service \
			--cluster $(call cluster,$*) \
			--service $(call service,$*,$(svc)) \
			--force-new-deployment \
			--query "service.deployments[0].status" \
			--output text && \
	) true

# Generic ECS SSH target
.PHONY: aws.%.ssh
aws.%.ssh:
	@echo "Connecting to $* container..."
	@TASK_ID=$$($(aws) ecs list-tasks \
		--cluster $(call cluster,$*) \
		--service $(call service,$*,service) \
		--desired-status RUNNING \
		--query "taskArns[0]" \
		--output text | cut -d'/' -f3) && \
	if [ -z "$$TASK_ID" ] || [ "$$TASK_ID" = "None" ]; then \
		echo "ERROR: No running tasks found for $(call service,$*,service)"; \
		exit 1; \
	fi && \
	echo "Connecting to task: $$TASK_ID" && \
	( trap 'kill 0' INT TERM; \
	  $(aws) ecs execute-command \
	    --cluster $(call cluster,$*) \
	    --task $$TASK_ID \
	    --container app \
	    --interactive \
	    --command "/bin/sh -l" \
	)

# ========================================
# Git Deployment Targets
# ========================================

# Generic git deploy target
.PHONY: git.%.deploy
git.%.deploy:
	@echo "Deploying latest code to $(call emoji,$*) $*..."
	@(git branch -D $* || true) && \
	git checkout -b $* && \
	git push -f origin $* && \
	git checkout main

# ========================================
# Convenience Targets
# ========================================

.PHONY: help
help:
	@echo "$(APP_NAME) Makefile Commands"
	@echo "=============================="
	@echo ""
	@echo "Terraform:"
	@echo "  make terraform.init                    - Initialize Terraform"
	@echo "  make terraform.<env>.plan              - Plan infrastructure changes"
	@echo "  make terraform.<env>.apply             - Apply infrastructure changes"
	@echo ""
	@echo "Terraform Plan (with .tfvars):"
	@echo "  make tf.plan.dev                       - Plan dev environment"
	@echo "  make tf.plan.staging                   - Plan staging environment"
	@echo "  make tf.plan.prod                      - Plan prod environment"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make terraform.graph                   - Generate dependency graph (DOT/PNG)"
	@echo "  make inframap.generate                 - Generate infrastructure diagram with Inframap"
	@echo "  make inframap.<env>.generate           - Generate infrastructure diagram for specific environment"
	@echo ""
	@echo "Docker:"
	@echo "  make docker.<env>.build                - Build Docker image"
	@echo "  make docker.<env>.push                 - Push image and redeploy services"
	@echo ""
	@echo "AWS/ECS:"
	@echo "  make aws.login                         - Login to ECR"
	@echo "  make aws.<env>.redeploy                - Force redeploy all ECS services"
	@echo "  make aws.<env>.ssh                     - SSH into ECS container"
	@echo ""
	@echo "Bastion:"
	@echo "  make bastion.<env>.ssh                 - SSH into bastion host"
	@echo ""
	@echo "Git:"
	@echo "  make git.<env>.deploy                  - Deploy via git branch"
	@echo ""
	@echo "Environments: $(ENVIRONMENTS)"

.DEFAULT_GOAL := help
