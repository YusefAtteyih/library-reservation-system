#!/bin/bash

# Performance test script for the Library Reservation System
# This script runs performance tests and reports metrics

echo "Running performance tests for Library Reservation System..."
echo "=========================================================="

# Function to measure API response time
measure_api_response() {
  local endpoint=$1
  local description=$2
  echo -n "Testing $description: "
  
  # Make 5 requests and calculate average
  total_time=0
  for i in {1..5}; do
    response_time=$(curl -s -w "%{time_total}\n" -o /dev/null "http://localhost:3001/api/$endpoint")
    total_time=$(echo "$total_time + $response_time" | bc)
  done
  
  avg_time=$(echo "scale=3; $total_time / 5" | bc)
  avg_ms=$(echo "$avg_time * 1000" | bc | cut -d'.' -f1)
  
  if [ "$avg_ms" -lt 300 ]; then
    echo "✅ $avg_ms ms"
  else
    echo "⚠️ $avg_ms ms (exceeds 300ms target)"
  fi
}

# Check if API is available
echo -n "Checking API availability: "
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
  echo "✅ Available"
else
  echo "❌ Not available"
  echo "Please ensure the backend service is running"
  exit 1
fi

# Measure API response times for key endpoints
measure_api_response "rooms" "Rooms endpoint"
measure_api_response "seats" "Seats endpoint"
measure_api_response "books?limit=20" "Books endpoint (20 items)"
measure_api_response "reservations/available?date=$(date +%Y-%m-%d)" "Availability endpoint"

# Check database query performance
echo -n "Testing database query performance: "
query_time=$(docker-compose exec -T backend npx prisma db execute --stdin <<< "EXPLAIN ANALYZE SELECT * FROM \"Room\" LIMIT 10;" 2>/dev/null | grep "Execution Time" | awk '{print $3}')

if [ -n "$query_time" ]; then
  if [ $(echo "$query_time < 50" | bc) -eq 1 ]; then
    echo "✅ $query_time ms"
  else
    echo "⚠️ $query_time ms (exceeds 50ms target)"
  fi
else
  echo "❌ Could not measure"
fi

echo "=========================================================="
echo "Performance test completed."
