#!/usr/bin/env bash
# Helper de debug local : (re)démarre un serveur de production isolé sur le port 3100.
# Debug uniquement — la validation finale passe toujours par `build_and_start`.
# Next.js renomme son processus en « next-server (vX.Y.Z) » : on cible donc ce titre.
set -euo pipefail

PORT=3100

pkill -f "next-server" 2>/dev/null || true
pkill -f "next start -p ${PORT}" 2>/dev/null || true
sleep 2

: > /tmp/next-debug.log
nohup npx next start -p "$PORT" > /tmp/next-debug.log 2>&1 &
echo "started pid $!"
