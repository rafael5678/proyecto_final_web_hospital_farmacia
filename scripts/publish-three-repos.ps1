$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$work = Join-Path $env:TEMP "hospy-split-$(Get-Random)"
$msg = if ($args[0]) { $args[0] } else { "sync: actualizar Hospy desde el monorepo" }
New-Item -ItemType Directory -Path $work | Out-Null

function Sync-Repo($name, $url, $copy) {
  $dir = Join-Path $work $name
  git clone --depth 1 $url $dir
  if (-not $?) { throw "No se pudo clonar $url" }
  Get-ChildItem $dir -Force | Where-Object { $_.Name -ne ".git" } | Remove-Item -Recurse -Force
  & $copy $dir
  Set-Location $dir
  git add -A
  if (git status --porcelain) {
    git commit -m $msg
    git push origin HEAD
    Write-Host "OK $name -> $url"
  } else {
    Write-Host "Sin cambios en $name"
  }
}

Sync-Repo "backend" "https://github.com/rafael5678/Proyecto_Hospital_backend.git" {
  param($dir)
  Copy-Item "$root\pom.xml" $dir
  Copy-Item "$root\mvnw" $dir
  Copy-Item "$root\mvnw.cmd" $dir
  Copy-Item "$root\Dockerfile" $dir -ErrorAction SilentlyContinue
  Copy-Item "$root\render.yaml" $dir -ErrorAction SilentlyContinue
  Copy-Item "$root\.mvn" $dir -Recurse -ErrorAction SilentlyContinue
  Copy-Item "$root\src" $dir -Recurse
  Copy-Item "$root\spark" $dir -Recurse -ErrorAction SilentlyContinue
  Get-ChildItem "$dir\spark" -Recurse -Include "__pycache__", "*.pyc", "smoke_skin_api.py" -ErrorAction SilentlyContinue |
    Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
  @"
target/
.idea/
*.iml
**/application-local.properties
.env
spark/.venv/
spark/__pycache__/
src/main/resources/datasets/skin-features.npz
"@ | Set-Content "$dir\.gitignore"
}

Sync-Repo "frontend" "https://github.com/rafael5678/Proyecto_Hospital_Frotend.git" {
  param($dir)
  Get-ChildItem "$root\frontend" -Force | Where-Object { $_.Name -notin @('node_modules','dist','.angular') } | ForEach-Object {
    Copy-Item $_.FullName $dir -Recurse -Force
  }
}

Sync-Repo "database" "https://github.com/rafael5678/Proyecto_Hospital_base_datos.git" {
  param($dir)
  Copy-Item "$root\database\*" $dir -Recurse -Force
}

Write-Host "Listo $work"
