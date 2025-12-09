# PowerShell script to fix TypeScript imports by removing .js extensions

Get-ChildItem -Path "src/agent/cognitive" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    
    # Replace imports without extensions to imports with .js extensions for ts-node ES modules
    $content = $content -replace "from '([^']+)'$", "from '`$1.js'"
    $content = $content -replace "from '([^']+)(?<!\.js)'", "from '`$1.js'"
    
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Fixed imports in $($_.FullName)"
}

Get-ChildItem -Path "src/agent/langgraph" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    
    # Replace imports without extensions to imports with .js extensions for ts-node ES modules
    $content = $content -replace "from '([^']+)'$", "from '`$1.js'"
    $content = $content -replace "from '([^']+)(?<!\.js)'", "from '`$1.js'"
    
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Fixed imports in $($_.FullName)"
}

Get-ChildItem -Path "src/agent/memory" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    
    # Replace imports without extensions to imports with .js extensions for ts-node ES modules
    $content = $content -replace "from '([^']+)'$", "from '`$1.js'"
    $content = $content -replace "from '([^']+)(?<!\.js)'", "from '`$1.js'"
    
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Fixed imports in $($_.FullName)"
}

Write-Host "All TypeScript imports fixed!"