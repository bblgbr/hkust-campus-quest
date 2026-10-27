#!/bin/zsh
set -e
project_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
exec python3 "$project_dir/serve_local.py"
