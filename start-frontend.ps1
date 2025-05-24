# Navigate to the frontend directory
Set-Location -Path ".\react-frontend"

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Cyan
Write-Host "The app will open automatically in your default browser." -ForegroundColor Green
Start-Process "http://localhost:3001"

# Start the React app
npm start
