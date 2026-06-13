#!/bin/bash
# 跨平台一键部署脚本包装器
# 实际逻辑在 deploy.mjs（Node），可在 Windows / macOS / Linux 下运行
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

exec node "$SCRIPT_DIR/deploy.mjs" "$@"
