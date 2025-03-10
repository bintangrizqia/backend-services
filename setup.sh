#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
DEPLOYMENT_METHOD=""
NODE_ENV="production"
PORT=3000
HOST="0.0.0.0"

# Print usage information
function print_usage() {
  echo -e "${BLUE}Usage:${NC} ./setup.sh [OPTIONS]"
  echo -e ""
  echo -e "${BLUE}Options:${NC}"
  echo -e "  --run-with <method>      Deployment method: 'pm2' or 'docker'"
  echo -e "  --env <environment>      Environment (default: production)"
  echo -e "  --port <port>            Port to run the server on (default: 3000)"
  echo -e "  --host <host>            Host to bind to (default: 0.0.0.0)"
  echo -e "  --help                   Show this help message"
  echo -e ""
  echo -e "${BLUE}Examples:${NC}"
  echo -e "  ./setup.sh --run-with pm2"
  echo -e "  ./setup.sh --run-with docker --port 4000"
  echo -e ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --run-with)
      DEPLOYMENT_METHOD="$2"
      if [ "$DEPLOYMENT_METHOD" != "pm2" ] && [ "$DEPLOYMENT_METHOD" != "docker" ]; then
        echo -e "${RED}Error: Deployment method must be 'pm2' or 'docker'${NC}"
        exit 1
      fi
      shift 2
      ;;
    --env)
      NODE_ENV="$2"
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --host)
      HOST="$2"
      shift 2
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option: $key${NC}"
      print_usage
      exit 1
      ;;
  esac
done

# Check if deployment method is specified
if [ -z "$DEPLOYMENT_METHOD" ]; then
  echo -e "${RED}Error: Deployment method is required. Use --run-with pm2 or --run-with docker${NC}"
  print_usage
  exit 1
fi

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if .env file exists
check_env_file() {
  if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from example...${NC}"
    if [ -f "env.example" ]; then
      cp env.example .env
      echo -e "${GREEN}Created .env file from example. Please update with your settings.${NC}"
    else
      echo -e "${RED}Error: env.example file not found. Please create a .env file manually.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}Found existing .env file.${NC}"
  fi
}

# Make sure we're in the right directory
SCRIPT_DIR=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_DIR" || exit 1
echo -e "${GREEN}Working directory: $(pwd)${NC}"

# Check for .env file
check_env_file

# Deploy with PM2
deploy_with_pm2() {
  echo -e "${BLUE}Setting up application using PM2...${NC}"

  # Check if npm is installed
  if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed. Please install Node.js and npm.${NC}"
    exit 1
  fi

  # Check if PM2 is installed
  if ! command_exists pm2; then
    echo -e "${YELLOW}PM2 is not installed. Installing...${NC}"
    npm install -g pm2
  fi

  # Install dependencies
  echo -e "${BLUE}Installing dependencies...${NC}"
  npm install --production

  # Build the application
  echo -e "${BLUE}Building application...${NC}"
  npm run build

  # Run database migrations
  echo -e "${BLUE}Running database migrations...${NC}"
  npx prisma migrate deploy

  # Seed the database if needed (optional)
  read -p "Do you want to seed the database? (y/n): " seed_choice
  if [[ $seed_choice == "y" || $seed_choice == "Y" ]]; then
    echo -e "${BLUE}Seeding the database...${NC}"
    npm run seed
  fi

  # Create PM2 ecosystem file
  echo -e "${BLUE}Creating PM2 ecosystem file...${NC}"
  cat > ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: "pmp-backend",
    script: "./dist/server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "${NODE_ENV}",
      PORT: ${PORT},
      HOST: "${HOST}"
    },
    watch: false,
    merge_logs: true
  }]
}
EOL

  # Start the application with PM2
  echo -e "${BLUE}Starting application with PM2...${NC}"
  pm2 start ecosystem.config.js

  # Save PM2 configuration
  pm2 save

  # Display running processes
  pm2 list

  # Setup PM2 to start on system boot if needed
  read -p "Do you want PM2 to start on system boot? (y/n): " startup_choice
  if [[ $startup_choice == "y" || $startup_choice == "Y" ]]; then
    pm2 startup
    echo -e "${YELLOW}↑ Please run the command above if prompted${NC}"
  fi

  echo -e "${GREEN}Deployment with PM2 completed!${NC}"
}

# Deploy with Docker
deploy_with_docker() {
  echo -e "${BLUE}Setting up application using Docker...${NC}"

  # Check if Docker is installed
  if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed. Please install Docker first.${NC}"
    exit 1
  fi

  # Check if Docker Compose is installed
  if ! command_exists docker-compose; then
    echo -e "${RED}Error: Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
  fi

  # Create Dockerfile if it doesn't exist
  if [ ! -f "Dockerfile" ]; then
    echo -e "${BLUE}Creating Dockerfile...${NC}"
    cat > Dockerfile << EOL
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/server.js"]
EOL
  fi

  # Create .dockerignore if it doesn't exist
  if [ ! -f ".dockerignore" ]; then
    echo -e "${BLUE}Creating .dockerignore file...${NC}"
    cat > .dockerignore << EOL
node_modules
npm-debug.log
.git
.gitignore
.env
.DS_Store
dist
coverage
.vscode
.idea
EOL
  fi

  # Create docker-compose.yml file
  echo -e "${BLUE}Creating docker-compose.yml file...${NC}"
  cat > docker-compose.yml << EOL
version: '3'

services:
  app:
    build: .
    ports:
      - "${PORT}:${PORT}"
    environment:
      - NODE_ENV=${NODE_ENV}
      - PORT=${PORT}
      - HOST=${HOST}
    restart: always
    depends_on:
      - db
    volumes:
      - ./.env:/app/.env

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=pmp_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
EOL

  # Build and start the containers
  echo -e "${BLUE}Building and starting Docker containers...${NC}"
  docker-compose up -d

  # Run database migrations
  echo -e "${BLUE}Running database migrations inside Docker container...${NC}"
  docker-compose exec app npx prisma migrate deploy

  # Seed the database if needed
  read -p "Do you want to seed the database? (y/n): " seed_choice
  if [[ $seed_choice == "y" || $seed_choice == "Y" ]]; then
    echo -e "${BLUE}Seeding the database...${NC}"
    docker-compose exec app npm run seed
  fi

  # Show container status
  echo -e "${BLUE}Docker container status:${NC}"
  docker-compose ps

  echo -e "${GREEN}Deployment with Docker completed!${NC}"
}

# Main deployment process
echo -e "${GREEN}Starting deployment process...${NC}"

# Run the appropriate deployment method
if [ "$DEPLOYMENT_METHOD" == "pm2" ]; then
  deploy_with_pm2
elif [ "$DEPLOYMENT_METHOD" == "docker" ]; then
  deploy_with_docker
else
  echo -e "${RED}Error: Unknown deployment method: $DEPLOYMENT_METHOD${NC}"
  exit 1
fi

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${GREEN}Your application should now be running on http://${HOST}:${PORT}${NC}"
