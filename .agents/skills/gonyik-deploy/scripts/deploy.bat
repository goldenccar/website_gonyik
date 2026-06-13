@echo off
REM 跨平台一键部署脚本包装器（Windows）
REM 实际逻辑在 deploy.mjs（Node）

node "%~dp0deploy.mjs" %*
