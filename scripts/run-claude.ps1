param(
  [switch]$SkipPermissions
)

$ErrorActionPreference = "Stop"

Write-Host "=== Fake News Verifier / Claude Code Autonomous Run ===" -ForegroundColor Cyan

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Write-Error "Claude CLI was not found. Install Claude Code first and make sure 'claude' is in PATH."
}

if (-not (Test-Path "CLAUDE.md")) {
  Write-Error "CLAUDE.md was not found. Run this script from the project root."
}

$prompt = Get-Content ".\MASTER-PROMPT.md" -Raw

if ($SkipPermissions) {
  claude --print $prompt
} else {
  Write-Host "Starting Claude Code with the project master prompt..." -ForegroundColor Green
  claude $prompt
}
