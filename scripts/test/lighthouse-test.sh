#!/bin/bash

# Lighthouse test script for the Library Reservation System
# This script runs Lighthouse tests to verify performance scores

echo "Running Lighthouse tests for Library Reservation System..."
echo "========================================================="

# Check if frontend is available
echo -n "Checking frontend availability: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo "✅ Available"
else
  echo "❌ Not available"
  echo "Please ensure the frontend service is running"
  exit 1
fi

# Function to run Lighthouse and extract scores
run_lighthouse() {
  local page=$1
  local description=$2
  
  echo "Testing $description..."
  
  # Run Lighthouse using Puppeteer
  results=$(docker-compose exec -T frontend npx lighthouse "http://localhost:3000$page" \
    --output=json --quiet --chrome-flags="--headless --no-sandbox" 2>/dev/null | \
    jq '.categories.performance.score, .categories.accessibility.score, .categories.seo.score')
  
  # Extract scores (multiply by 100 to get percentage)
  perf_score=$(echo "$results" | head -1 | awk '{print $1 * 100}')
  a11y_score=$(echo "$results" | head -2 | tail -1 | awk '{print $1 * 100}')
  seo_score=$(echo "$results" | head -3 | tail -1 | awk '{print $1 * 100}')
  
  # Display results
  echo "Performance: $(printf "%.0f" $perf_score)% $([ $(echo "$perf_score >= 95" | bc) -eq 1 ] && echo "✅" || echo "❌")"
  echo "Accessibility: $(printf "%.0f" $a11y_score)% $([ $(echo "$a11y_score >= 90" | bc) -eq 1 ] && echo "✅" || echo "❌")"
  echo "SEO: $(printf "%.0f" $seo_score)% $([ $(echo "$seo_score >= 90" | bc) -eq 1 ] && echo "✅" || echo "❌")"
  echo ""
}

# Run Lighthouse tests on key pages
run_lighthouse "/" "Home page"
run_lighthouse "/rooms" "Rooms page"
run_lighthouse "/books" "Books page"
run_lighthouse "/dashboard" "Dashboard page"
run_lighthouse "/admin" "Admin page"

echo "========================================================="
echo "Lighthouse tests completed."
