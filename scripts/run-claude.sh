#!/usr/bin/env bash
set -euo pipefail

command -v claude >/dev/null 2>&1 || {
  echo "Claude CLI was not found in PATH."
  exit 1
}

test -f CLAUDE.md || {
  echo "Run this script from the project root."
  exit 1
}

claude "$(cat MASTER-PROMPT.md)"
