#!/bin/bash

# Security scan script for the Library Reservation System
# This script performs security checks and reports vulnerabilities

echo "Running security scan for Library Reservation System..."
echo "======================================================"

# Check for security headers
echo "Checking security headers:"
curl -s -I http://localhost:3000 | grep -E 'X-Content-Type-Options|X-Frame-Options|X-XSS-Protection|Strict-Transport-Security|Content-Security-Policy|Referrer-Policy' | while read -r header; do
  echo "✅ $header"
done

# Check for CSRF protection
echo -n "Checking CSRF protection: "
if curl -s -I http://localhost:3000 | grep -q "XSRF-TOKEN"; then
  echo "✅ Enabled"
else
  echo "❌ Not detected"
fi

# Check for rate limiting
echo -n "Checking rate limiting: "
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:3001/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test"}' --max-time 2)
if [ "$response" = "429" ]; then
  echo "✅ Enabled"
else
  echo "⚠️ Could not verify (received HTTP $response)"
fi

# Check for npm vulnerabilities
echo "Checking npm vulnerabilities:"
echo -n "Backend: "
if cd /home/ubuntu/library-app/packages/backend && npm audit --production | grep -q "found 0 vulnerabilities"; then
  echo "✅ No vulnerabilities"
else
  echo "⚠️ Vulnerabilities found"
  npm audit --production | grep -A 3 "Severity"
fi

echo -n "Frontend: "
if cd /home/ubuntu/library-app/packages/frontend && npm audit --production | grep -q "found 0 vulnerabilities"; then
  echo "✅ No vulnerabilities"
else
  echo "⚠️ Vulnerabilities found"
  npm audit --production | grep -A 3 "Severity"
fi

# Check for secure cookies
echo -n "Checking secure cookies: "
if curl -s -I http://localhost:3000 | grep -q "Set-Cookie.*Secure"; then
  echo "✅ Enabled"
else
  echo "⚠️ Not enabled in development (should be enabled in production)"
fi

# Check for proper error handling
echo -n "Checking error handling: "
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/nonexistent" | grep -q "404"; then
  echo "✅ Proper status codes"
else
  echo "❌ Improper error handling"
fi

echo "======================================================"
echo "Security scan completed."
