# Organize backend files
$basePath = "c:\Users\yusef.atteyih\CascadeProjects\Library Reservation System"
$backendPath = Join-Path $basePath "backend\src"

# Move module files to their respective directories
$modules = @(
    @{ Name = "books"; Pattern = "books.*" },
    @{ Name = "loans"; Pattern = "loans.*" },
    @{ Name = "notifications"; Pattern = "notification.*" },
    @{ Name = "reservations"; Pattern = "reservations.*" },
    @{ Name = "rooms"; Pattern = "rooms.*" },
    @{ Name = "seats"; Pattern = "seats.*" },
    @{ Name = "auth"; Pattern = "auth-*" },
    @{ Name = "common"; Pattern = "*.middleware.ts", "*.guard.ts", "*.filter.ts", "*.decorator.ts" },
    @{ Name = "config"; Pattern = "*.config.ts" }
)

foreach ($module in $modules) {
    $modulePath = Join-Path $backendPath $module.Name
    if (-not (Test-Path $modulePath)) {
        New-Item -ItemType Directory -Path $modulePath -Force | Out-Null
    }
    
    if ($module.Pattern -is [array]) {
        foreach ($pattern in $module.Pattern) {
            Get-ChildItem -Path $backendPath -Filter $pattern -File | ForEach-Object {
                Move-Item -Path $_.FullName -Destination $modulePath -Force
            }
        }
    } else {
        Get-ChildItem -Path $backendPath -Filter $module.Pattern -File | ForEach-Object {
            Move-Item -Path $_.FullName -Destination $modulePath -Force
        }
    }
}

# Move remaining TypeScript files to common
Get-ChildItem -Path $backendPath -Filter "*.ts" -File | ForEach-Object {
    $destPath = Join-Path (Join-Path $backendPath "common") $_.Name
    Move-Item -Path $_.FullName -Destination $destPath -Force
}

# Move Prisma files
$prismaFiles = @("schema.prisma", "seed.ts")
$prismaPath = Join-Path $backendPath "prisma"
if (-not (Test-Path $prismaPath)) {
    New-Item -ItemType Directory -Path $prismaPath -Force | Out-Null
}
foreach ($file in $prismaFiles) {
    $sourcePath = Join-Path $basePath $file
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination $prismaPath -Force
    }
}

# Move Docker and docker-compose files
$dockerPath = Join-Path $backendPath "..\docker"
if (-not (Test-Path $dockerPath)) {
    New-Item -ItemType Directory -Path $dockerPath -Force | Out-Null
}
$dockerFiles = @("Dockerfile", "default.conf", "health-check.sh", "docker-compose.yml")
foreach ($file in $dockerFiles) {
    $sourcePath = Join-Path $basePath $file
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination $dockerPath -Force
    }
}

# Move test files to their respective module test directories
$testFiles = Get-ChildItem -Path (Join-Path $backendPath "..\test") -File
foreach ($file in $testFiles) {
    $moduleName = $file.Name -replace '\.(spec|e2e-spec)\.ts$', ''
    $modulePath = Join-Path $backendPath $moduleName
    $testDir = Join-Path $modulePath "test"
    
    if (Test-Path $modulePath) {
        if (-not (Test-Path $testDir)) {
            New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        }
        Move-Item -Path $file.FullName -Destination $testDir -Force
    }
}

# Move frontend files
$frontendPath = Join-Path $basePath "frontend\src"
$frontendFiles = @(
    @{ Name = "components"; Pattern = "*.tsx", "*.ts" },
    @{ Name = "pages"; Pattern = "page.tsx", "layout.tsx" },
    @{ Name = "services"; Pattern = "*.service.ts" },
    @{ Name = "hooks"; Pattern = "use*.ts" },
    @{ Name = "contexts"; Pattern = "*.context.tsx" },
    @{ Name = "utils"; Pattern = "*.ts" }
)

foreach ($dir in $frontendFiles) {
    $targetPath = Join-Path $frontendPath $dir.Name
    if (-not (Test-Path $targetPath)) {
        New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    }
    
    if ($dir.Pattern -is [array]) {
        foreach ($pattern in $dir.Pattern) {
            Get-ChildItem -Path $basePath -Filter $pattern -File | ForEach-Object {
                Move-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
    } else {
        Get-ChildItem -Path $basePath -Filter $dir.Pattern -File | ForEach-Object {
            Move-Item -Path $_.FullName -Destination $targetPath -Force
        }
    }
}

# Move HTML and CSS files to public directory
$publicPath = Join-Path $basePath "frontend\public"
if (-not (Test-Path $publicPath)) {
    New-Item -ItemType Directory -Path $publicPath -Force | Out-Null
}
$publicFiles = @("*.html", "*.css")
foreach ($pattern in $publicFiles) {
    Get-ChildItem -Path $basePath -Filter $pattern -File | ForEach-Object {
        Move-Item -Path $_.FullName -Destination $publicPath -Force
    }
}

# Move test scripts to scripts/test
$testScriptsPath = Join-Path $basePath "scripts\test"
if (-not (Test-Path $testScriptsPath)) {
    New-Item -ItemType Directory -Path $testScriptsPath -Force | Out-Null
}
$testScripts = @("accessibility-test.sh", "lighthouse-test.sh", "performance-test.sh", "security-scan.sh")
foreach ($script in $testScripts) {
    $sourcePath = Join-Path $basePath $script
    if (Test-Path $sourcePath) {
        Move-Item -Path $sourcePath -Destination $testScriptsPath -Force
    }
}

# Move CI/CD files
$workflowsPath = Join-Path $basePath ".github\workflows"
if (-not (Test-Path $workflowsPath)) {
    New-Item -ItemType Directory -Path $workflowsPath -Force | Out-Null
}
$ciCdFile = Join-Path $basePath "ci-cd.yml"
if (Test-Path $ciCdFile) {
    Move-Item -Path $ciCdFile -Destination $workflowsPath -Force
}

Write-Host "Project organization complete!"
