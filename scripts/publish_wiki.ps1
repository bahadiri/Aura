$ErrorActionPreference = "Stop"

$wikiUrl = "https://github.com/bahadiri/Aura.wiki.git"
$scriptPath = $PSScriptRoot
$rootPath = Resolve-Path (Join-Path $scriptPath "..")
$tempDir = Join-Path $rootPath "wiki_temp"
$docsDir = Join-Path $rootPath "documents"

Write-Host "🔹 Publishing Aura Docs to GitHub Wiki..."
Write-Host "   Docs Source: $docsDir"
Write-Host "   Temp Dir:    $tempDir"

# 1. Clear temp dir if exists
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# 2. Clone Wiki inside temp dir
Write-Host "⬇️  Cloning Wiki Repo..."
git clone $wikiUrl $tempDir

# 3. Copy Docs
Write-Host "📂 Copying documentation files..."
Copy-Item "$docsDir\*" $tempDir -Recurse -Force

# 4. Commit and Push
Set-Location $tempDir
git add .
$status = git status --porcelain
if ($status) {
    Write-Host "✍️  Committing changes..."
    git commit -m "docs: Sync from Aura main repo"
    
    Write-Host "🚀 Pushing to Wiki..."
    git push
    Write-Host "✅ Wiki published successfully!" -ForegroundColor Green
}
else {
    Write-Host "✨ Wiki is already up to date." -ForegroundColor Yellow
}

# 5. Cleanup
Set-Location $PSScriptRoot
Remove-Item $tempDir -Recurse -Force
