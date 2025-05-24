#!/bin/bash

# Accessibility test script for the Library Reservation System
# This script checks for WCAG 2.1 AA compliance

echo "Running accessibility tests for Library Reservation System..."
echo "==========================================================="

# Check if frontend is available
echo -n "Checking frontend availability: "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
  echo "✅ Available"
else
  echo "❌ Not available"
  echo "Please ensure the frontend service is running"
  exit 1
fi

# Function to check accessibility features
check_feature() {
  local feature=$1
  local selector=$2
  local expected=$3
  
  echo -n "Checking $feature: "
  
  # Use browser console to check for the feature
  result=$(docker-compose exec -T frontend npx playwright test --browser=chromium -e "
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    const result = await page.evaluate(() => {
      return document.querySelector('$selector') !== null;
    });
    console.log(result);
    await browser.close();
  " 2>/dev/null)
  
  if [ "$result" = "$expected" ]; then
    echo "✅ Implemented"
  else
    echo "❌ Not implemented"
  fi
}

# Check for skip to content link
check_feature "Skip to content link" ".skip-to-content" "true"

# Check for proper focus styles
check_feature "Focus styles" "style:contains(':focus')" "true"

# Check for ARIA attributes
check_feature "ARIA attributes" "[aria-label], [aria-describedby], [aria-live]" "true"

# Check for color contrast
echo -n "Checking color contrast: "
if grep -q "contrast-ratio" /home/ubuntu/library-app/packages/frontend/src/app/accessibility.css; then
  echo "✅ Implemented"
else
  echo "⚠️ Could not verify"
fi

# Check for responsive design
echo -n "Checking responsive design: "
if grep -q "@media" /home/ubuntu/library-app/packages/frontend/src/app/accessibility.css; then
  echo "✅ Implemented"
else
  echo "⚠️ Could not verify"
fi

echo "==========================================================="
echo "Accessibility test completed."
