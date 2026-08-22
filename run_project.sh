#!/usr/bin/env bash

# ==============================================================================
# VORTEX Commerce - Full-Stack Application Launcher (Local & WiFi Network)
# ==============================================================================
# Starts Node.js/Express Backend on Port 5000 and Vite React Frontend on Port 3000,
# binds to 0.0.0.0 so anyone on your WiFi network can access the application,
# and automatically opens your default web browser.
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

# Colors for terminal output
BOLD="\033[1m"
GREEN="\033[0;32m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
YELLOW="\033[0;33m"
MAGENTA="\033[0;35m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}================================================================${RESET}"
echo -e "${BOLD}${CYAN}        VORTEX COMMERCE (Enterprise Relational DBMS)           ${RESET}"
echo -e "${BOLD}${CYAN}================================================================${RESET}"
echo -e "${BLUE}📁 Project Root:${RESET} ${PROJECT_ROOT}"

# Detect primary Local WiFi IPv4 address
LAN_IP=$(ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' || hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
if [ -z "$LAN_IP" ]; then
    LAN_IP="localhost"
fi

# 1. Dependency checks
if [ ! -d "${BACKEND_DIR}/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Backend dependencies...${RESET}"
    (cd "${BACKEND_DIR}" && npm install)
fi

if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing Frontend dependencies...${RESET}"
    (cd "${FRONTEND_DIR}" && npm install)
fi

# 2. Build Backend TypeScript if dist does not exist
if [ ! -f "${BACKEND_DIR}/dist/server.js" ]; then
    echo -e "${YELLOW}🔨 Compiling Backend TypeScript...${RESET}"
    (cd "${BACKEND_DIR}" && npm run build)
fi

# Clean up processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down VORTEX Commerce services...${RESET}"
    if [ -n "${BACKEND_PID}" ] && kill -0 "${BACKEND_PID}" 2>/dev/null; then
        kill "${BACKEND_PID}" 2>/dev/null || true
    fi
    if [ -n "${FRONTEND_PID}" ] && kill -0 "${FRONTEND_PID}" 2>/dev/null; then
        kill "${FRONTEND_PID}" 2>/dev/null || true
    fi
    echo -e "${GREEN}✓ All services stopped cleanly.${RESET}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 3. Kill existing processes on ports 5000 and 3000 if running
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true

# 4. Start Backend Server (Listening on 0.0.0.0:5000)
echo -e "${CYAN}🚀 Starting Backend API Server (0.0.0.0:5000)...${RESET}"
cd "${BACKEND_DIR}"
npm start > "${PROJECT_ROOT}/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to be healthy
echo -ne "${BLUE}⏳ Waiting for Backend to be ready...${RESET}"
for i in {1..30}; do
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e " ${GREEN}READY!${RESET}"
        break
    fi
    sleep 0.5
    echo -ne "."
done

# 5. Start Frontend Dev Server (Listening on 0.0.0.0:3000)
echo -e "${CYAN}⚡ Starting Frontend Dev Server (0.0.0.0:3000)...${RESET}"
cd "${FRONTEND_DIR}"
npm run dev -- --host 0.0.0.0 --port 3000 > "${PROJECT_ROOT}/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo -ne "${BLUE}⏳ Waiting for Frontend to be ready...${RESET}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e " ${GREEN}READY!${RESET}"
        break
    fi
    sleep 0.5
    echo -ne "."
done

LOCAL_URL="http://localhost:3000"
NETWORK_URL="http://${LAN_IP}:3000"

# 6. Display Links
echo -e "\n${BOLD}${GREEN}================================================================${RESET}"
echo -e "${BOLD}${GREEN}✓ VORTEX COMMERCE APPLICATION IS LIVE & BROADCASTING ON WIFI!${RESET}"
echo -e "${BOLD}${GREEN}================================================================${RESET}"
echo -e "  💻 ${BOLD}Local Machine URL:${RESET}      ${BOLD}${CYAN}${LOCAL_URL}${RESET}"
echo -e "  📱 ${BOLD}WiFi Network Share URL:${RESET} ${BOLD}${MAGENTA}${NETWORK_URL}${RESET}  ${YELLOW}👈 (Share with anyone on this WiFi!)${RESET}"
echo -e "  📡 ${BOLD}Backend REST API:${RESET}        ${BOLD}${CYAN}http://${LAN_IP}:5000/api${RESET}"
echo -e "  📄 ${BOLD}Healthcheck:${RESET}             ${BOLD}${CYAN}http://${LAN_IP}:5000/api/health${RESET}"
echo -e "----------------------------------------------------------------"
echo -e "  🔑 Demo Credentials:"
echo -e "     - Customer: ${BOLD}customer@test.com${RESET} / ${BOLD}Pass123!${RESET}"
echo -e "     - Admin:    ${BOLD}admin@vortex.com${RESET} / ${BOLD}Pass123!${RESET}"
echo -e "----------------------------------------------------------------"
echo -e "${YELLOW}Press [Ctrl+C] to stop both frontend and backend servers.${RESET}\n"

# Launch browser locally
if command -v xdg-open > /dev/null 2>&1; then
    xdg-open "${LOCAL_URL}" > /dev/null 2>&1 &
elif command -v google-chrome > /dev/null 2>&1; then
    google-chrome "${LOCAL_URL}" > /dev/null 2>&1 &
elif command -v firefox > /dev/null 2>&1; then
    firefox "${LOCAL_URL}" > /dev/null 2>&1 &
elif command -v open > /dev/null 2>&1; then
    open "${LOCAL_URL}" > /dev/null 2>&1 &
fi

# Keep script running and wait for background processes
wait "${FRONTEND_PID}" "${BACKEND_PID}"
