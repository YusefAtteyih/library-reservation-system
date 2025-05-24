# Move module files to their respective directories
$basePath = "c:\Users\yusef.atteyih\CascadeProjects\Library Reservation System\backend\src"

# Move books module files
Move-Item -Path "$basePath\books\*" -Destination "$basePath\books\" -Force

# Move other module files to their respective directories
$modules = @(
    @{ Name = "auth"; Pattern = "auth-*" },
    @{ Name = "books"; Pattern = "books.*" },
    @{ Name = "loans"; Pattern = "loans.*" },
    @{ Name = "notifications"; Pattern = "notification.*" },
    @{ Name = "reservations"; Pattern = "reservations.*" },
    @{ Name = "rooms"; Pattern = "rooms.*" },
    @{ Name = "seats"; Pattern = "seats.*" },
    @{ Name = "common"; Pattern = @("*.middleware.ts", "*.guard.ts", "*.filter.ts", "*.decorator.ts", "*.gateway.ts") }
)

foreach ($module in $modules) {
    $modulePath = Join-Path $basePath $module.Name
    if (-not (Test-Path $modulePath)) {
        New-Item -ItemType Directory -Path $modulePath -Force | Out-Null
    }
    
    if ($module.Pattern -is [array]) {
        foreach ($pattern in $module.Pattern) {
            Get-ChildItem -Path $basePath -Filter $pattern -File | ForEach-Object {
                $targetPath = Join-Path $modulePath $_.Name
                Move-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
    } else {
        Get-ChildItem -Path $basePath -Filter $module.Pattern -File | ForEach-Object {
            $targetPath = Join-Path $modulePath $_.Name
            Move-Item -Path $_.FullName -Destination $targetPath -Force
        }
    }
}

# Move test files to their respective module test directories
$testFiles = Get-ChildItem -Path "$basePath\..\test" -File
foreach ($file in $testFiles) {
    $moduleName = $file.BaseName -replace '\.(spec|e2e-spec)$', ''
    $modulePath = Join-Path $basePath $moduleName
    $testDir = Join-Path $modulePath "test"
    
    if (Test-Path $modulePath) {
        if (-not (Test-Path $testDir)) {
            New-Item -ItemType Directory -Path $testDir -Force | Out-Null
        }
        $targetPath = Join-Path $testDir $file.Name
        Move-Item -Path $file.FullName -Destination $targetPath -Force
    }
}

# Move main.ts to the root of src
Move-Item -Path "$basePath\common\main.ts" -Destination $basePath -Force

Write-Host "Backend organization complete!"
