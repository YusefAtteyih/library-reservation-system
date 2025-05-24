# Create .env file for Docker
@"
# Database
DATABASE_URL="postgresql://library_user:library_password@db:5432/library_db?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# App
PORT=3000
NODE_ENV=development
"@ | Out-File -FilePath .\.env -Encoding utf8

Write-Host "✅ .env file created successfully for Docker"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Make sure Docker Desktop is running"
Write-Host "2. Run: docker-compose up --build"
Write-Host ""
Write-Host "The application will be available at: http://localhost:3000"
