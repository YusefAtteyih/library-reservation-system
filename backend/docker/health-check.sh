#!/bin/bash

# Health check script for the Library Reservation System
# This script checks the health of all services and reports their status

echo "Running health checks for Library Reservation System..."
echo "======================================================="

# Check if Docker is running
echo -n "Checking Docker service: "
if docker info &>/dev/null; then
  echo "✅ Running"
else
  echo "❌ Not running"
  echo "Please start Docker with: sudo systemctl start docker"
  exit 1
fi

# Check if containers are running
echo -n "Checking containers: "
if docker-compose ps | grep -q "Up"; then
  echo "✅ Running"
else
  echo "❌ Not running"
  echo "Please start containers with: docker-compose up -d"
  exit 1
fi

# Check backend health
echo -n "Checking backend health: "
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  echo "Check backend logs with: docker-compose logs backend"
fi

# Check frontend health
echo -n "Checking frontend health: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo "✅ Healthy"
else
  echo "❌ Unhealthy"
  echo "Check frontend logs with: docker-compose logs frontend"
fi

# Check database connection
echo -n "Checking database connection: "
if docker-compose exec -T backend npx prisma db execute --stdin <<< "SELECT 1;" &>/dev/null; then
  echo "✅ Connected"
else
  echo "❌ Not connected"
  echo "Check database logs with: docker-compose logs postgres"
fi

# Check memory usage
echo -n "Checking memory usage: "
MEM_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" | awk '{gsub(/%/,""); sum+=$1} END {print sum}')
if [ $(echo "$MEM_USAGE < 80" | bc) -eq 1 ]; then
  echo "✅ OK ($MEM_USAGE%)"
else
  echo "⚠️ High ($MEM_USAGE%)"
fi

# Check disk space
echo -n "Checking disk space: "
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
  echo "✅ OK ($DISK_USAGE%)"
else
  echo "⚠️ Low ($DISK_USAGE%)"
fi

echo "======================================================="
echo "Health check completed."
