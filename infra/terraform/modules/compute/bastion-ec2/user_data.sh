#!/bin/bash
# Bastion EC2 User Data Script
# This script runs on EC2 instance startup and installs necessary tools

echo "Starting Bastion EC2 initialization..." | tee /var/log/bastion-init.log

# Function to log and execute commands
log_cmd() {
  echo "[$$(date '+%Y-%m-%d %H:%M:%S')] Executing: $1" >> /var/log/bastion-init.log
  eval "$1" >> /var/log/bastion-init.log 2>&1 || echo "[$$(date '+%Y-%m-%d %H:%M:%S')] Warning: $1 failed (non-critical)" >> /var/log/bastion-init.log
}

# Update system (non-critical)
echo "Updating system packages..." | tee -a /var/log/bastion-init.log
yum update -y >> /var/log/bastion-init.log 2>&1 || echo "Warning: yum update failed" >> /var/log/bastion-init.log

# Install basic tools first (critical for SSM to work)
echo "Installing curl and unzip..." | tee -a /var/log/bastion-init.log
yum install -y curl unzip >> /var/log/bastion-init.log 2>&1 || true

# Install AWS CLI v2 (non-critical)
echo "Installing AWS CLI v2..." | tee -a /var/log/bastion-init.log
if ! command -v aws &> /dev/null; then
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" >> /var/log/bastion-init.log 2>&1 && \
  unzip awscliv2.zip >> /var/log/bastion-init.log 2>&1 && \
  ./aws/install >> /var/log/bastion-init.log 2>&1 && \
  rm -rf aws awscliv2.zip || echo "Warning: AWS CLI install failed" >> /var/log/bastion-init.log
fi

# Install CloudWatch Agent (non-critical)
echo "Installing CloudWatch Agent..." | tee -a /var/log/bastion-init.log
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm -O /tmp/amazon-cloudwatch-agent.rpm >> /var/log/bastion-init.log 2>&1 && \
rpm -U /tmp/amazon-cloudwatch-agent.rpm >> /var/log/bastion-init.log 2>&1 && \
rm /tmp/amazon-cloudwatch-agent.rpm >> /var/log/bastion-init.log 2>&1 || \
echo "Warning: CloudWatch Agent install failed" >> /var/log/bastion-init.log

# Install database clients (non-critical)
echo "Installing database clients for ${db_engine}..." | tee -a /var/log/bastion-init.log
yum install -y mysql >> /var/log/bastion-init.log 2>&1 || echo "Warning: mysql-client install failed" >> /var/log/bastion-init.log

%{ if db_engine == "postgres" ~}
yum install -y postgresql >> /var/log/bastion-init.log 2>&1 || echo "Warning: postgresql-client install failed" >> /var/log/bastion-init.log
%{ endif ~}

# Install additional useful tools (non-critical)
echo "Installing additional tools..." | tee -a /var/log/bastion-init.log
yum install -y git docker wget vim nano htop jq >> /var/log/bastion-init.log 2>&1 || true

yum install -y amazon-ssm-agent >> /var/log/bastion-init.log 2>&1 || echo "Warning: amazon-ssm-agent install failed" >> /var/log/bastion-init.log

# Enable and start SSM Agent (CRITICAL - must succeed)
echo "Starting SSM Agent..." | tee -a /var/log/bastion-init.log
if systemctl enable amazon-ssm-agent >> /var/log/bastion-init.log 2>&1 && \
   systemctl start amazon-ssm-agent >> /var/log/bastion-init.log 2>&1; then
  echo "SSM Agent started successfully" >> /var/log/bastion-init.log
else
  echo "ERROR: Failed to start SSM Agent" >> /var/log/bastion-init.log
  exit 1
fi

# Create a helpful script for connecting to RDS
cat > /home/ec2-user/connect-rds.sh << 'EOF'
#!/bin/bash

RDS_ENDPOINT="${rds_endpoint}"
RDS_PORT="${rds_port}"
DB_NAME="${db_name}"
DB_ENGINE="${db_engine}"

echo "Bastion RDS Connection Helper"
echo "=============================="
echo "RDS Endpoint: $RDS_ENDPOINT"
echo "RDS Port: $RDS_PORT"
echo "Database: $DB_NAME"
echo "Engine: $DB_ENGINE"
echo ""
echo "To connect to RDS, run one of the following commands:"
echo ""

if [ "$DB_ENGINE" = "mysql" ]; then
  echo "mysql -h $RDS_ENDPOINT -P $RDS_PORT -u <username> -p"
  echo ""
  echo "Example: mysql -h $RDS_ENDPOINT -P $RDS_PORT -u admin -p $DB_NAME"
else
  echo "psql -h $RDS_ENDPOINT -p $RDS_PORT -U <username> -d $DB_NAME"
  echo ""
  echo "Example: psql -h $RDS_ENDPOINT -p $RDS_PORT -U admin -d $DB_NAME"
fi

echo ""
echo "Environment: ${aws_region}"
EOF

chmod +x /home/ec2-user/connect-rds.sh
chown ec2-user:ec2-user /home/ec2-user/connect-rds.sh

# Log completion
echo "Bastion EC2 initialization completed successfully" >> /var/log/bastion-init.log
