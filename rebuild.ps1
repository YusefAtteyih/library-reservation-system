# Stop and remove any existing containers
docker-compose down --remove-orphans

# Remove any existing node_modules
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .\backend\node_modules

# Rebuild and start the containers
docker-compose up --build
