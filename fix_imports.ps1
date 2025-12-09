# PowerShell script to fix missing .js extensions in import statements
Get-ChildItem -Path "dist/src" -Recurse -Filter "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "from '([^']+)';", "from '`$1.js';"
    $content = $content -replace 'from "([^"]+)";', 'from "`$1.js";'
    Set-Content $_.FullName $content -NoNewline
}
Write-Host "Fixed import extensions in all JavaScript files"