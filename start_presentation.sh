#!/usr/bin/env bash
PORT=${1:-8090}
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo "================================================================="
echo "  AR & VR IN TOURISM — INTERACTIVE SLIDESHOW PRESENTATION WEB APP"
echo "  Department of Computer Engineering | RAIT Navi Mumbai"
echo "================================================================="
echo "Opening presentation on: http://localhost:${PORT}/"
echo "Press Ctrl+C to stop the server."
echo "================================================================="
python3 -m http.server "$PORT" --directory "$DIR"
