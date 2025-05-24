# Create .env file in backend
$envContent = @"
# Database
DATABASE_URL="postgresql://library_user:library_password@db:5432/library_db?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# App
PORT=3000
NODE_ENV=development
"@

# Save .env file
$envContent | Out-File -FilePath ".\backend\.env" -Encoding utf8

Write-Host "✅ .env file created in backend folder"

# Create docker-compose file
$dockerComposeContent = @"
version: '3'

services:
  db:
    image: postgres:13
    container_name: library_db
    environment:
      POSTGRES_USER: library_user
      POSTGRES_PASSWORD: library_password
      POSTGRES_DB: library_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: library_app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://library_user:library_password@db:5432/library_db?schema=public
      - CHOKIDAR_USEPOLLING=true
    depends_on:
      - db
    volumes:
      - ./backend:/usr/src/app
      - /usr/src/app/node_modules
    tty: true

volumes:
  postgres_data:
"@

$dockerComposeContent | Out-File -FilePath ".\docker-compose.yml" -Encoding utf8
Write-Host "✅ docker-compose.yml file created"

# Create Dockerfile.dev
$dockerfileContent = @"
FROM node:18-alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy app source code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "run", "start:dev"]
"@

$dockerfileContent | Out-File -FilePath ".\backend\Dockerfile.dev" -Encoding utf8
Write-Host "✅ Dockerfile.dev created in backend folder"

Write-Host ""
Write-Host "🎉 Setup complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Open Docker Quickstart Terminal (from Desktop or Start Menu)"
Write-Host "2. Run these commands:"
Write-Host "   cd /c/Users/yusef.atteyih/CascadeProjects/Library\ Reservation\ System"
Write-Host "   docker-compose up --build"
Write-Host ""
Write-Host "The application will be available at: http://<docker-machine-ip>:3000"
Write-Host "API Documentation: http://<docker-machine-ip>:3000/api/docs"
Write-Host ""
Write-Host "To find your Docker Machine IP, run: docker-machine ip default"
