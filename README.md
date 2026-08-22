# ⚡ VORTEX HARDWARE LABS (CORE-DB)

> **Boutique E-Commerce Platform for Flagship Developer & Creator Hardware**  
> Engineered with an 11-table relational database architecture, ACID transactional checkout, and a modern React 18 + Tailwind CSS frontend.

---

## 🌟 Features

- **Unique Editorial Hardware Storefront**: High-end consumer experience inspired by minimalist hardware design studios (*Nothing Tech*, *Teenage Engineering*, *Apple Pro*).
- **Multi-Attribute SKU Variants**: Dynamic selection matrix across finish colors, display dimensions, unified memory, and storage configurations with real-time stock availability.
- **ACID Transactional Checkout**: Atomic row-locked checkouts (`FOR UPDATE`) with automated rollback preventing overselling and race conditions.
- **Immutable Price Snapshots**: Line items and unit prices permanently snapshotted into `order_items` at the moment of checkout confirmation.
- **100% Light & Dark Mode Synchronized**: Persistent theme store with animated Sun/Moon toggle pill switch.
- **Local & WiFi Network Broadcasting**: Built-in `0.0.0.0` network binding allowing anyone on your local WiFi network to access the store at `http://<YOUR_LAN_IP>:3000`.
- **1-Click Full-Stack Launcher (`run_project.sh`)**: Starts backend (port 5000), frontend (port 3000), tests healthcheck, auto-detects local WiFi IP, and opens your browser.

---

## 🏗️ Architecture

```
CORE-DB/
├── backend/                  # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── controllers/      # REST API Controllers (Auth, Catalog, Cart, Order, Review, Address)
│   │   ├── services/         # Business Logic & ACID Transaction Orchestration
│   │   ├── repositories/     # Repository Pattern Abstraction (IRepositories & In-Memory/MySQL)
│   │   ├── middlewares/      # JWT Auth, Zod DTO Validation, Global Error Handling
│   │   ├── models/           # Domain Entities
│   │   └── server.ts         # Express App Entry (Bound to 0.0.0.0:5000)
│   └── sql/
│       ├── schema.sql        # 11 Normalized Tables (3NF/BCNF) with Foreign Key Cascades
│       ├── stored_procedures.sql # sp_execute_checkout ACID Transaction Procedure
│       └── seed.sql          # Seed Data for Products, Variants & Categories
├── frontend/                 # React 18 + Vite + Tailwind CSS + Lucide Icons + Zustand
│   ├── src/
│   │   ├── components/       # Reusable UI, Catalog, Cart & Checkout Components
│   │   ├── pages/            # Client Route Views (Home, Catalog, ProductDetail, Cart, Checkout, etc.)
│   │   ├── services/         # Axios Service Layer with JWT Interceptors
│   │   └── store/            # Zustand State Stores (Auth, Cart, Theme)
│   └── vite.config.js        # Vite dev server with proxy to backend
├── run_project.sh            # 1-Click launcher with WiFi broadcasting
├── implementation.txt        # Architecture blueprint & implementation plan
└── tracker.txt               # Chronological project execution tracker
```

---

## 🚀 Quick Start

### 1. One-Click Launch (Recommended)
Run the automated launcher script from the project root:
```bash
chmod +x run_project.sh
./run_project.sh
```

### 2. Manual Start

#### Backend API (Port 5000)
```bash
cd backend
npm install
npm run build
npm start
```

#### Frontend Dev Server (Port 3000)
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```

---

## 📱 Local WiFi Access

When started via `./run_project.sh`, you can access the application from any device connected to the same WiFi network:
- **Local Machine**: `http://localhost:3000`
- **Mobile Phones & Tablets on WiFi**: `http://<YOUR_LAN_IP>:3000`

---

## 🔑 Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Customer** | `customer@test.com` | `Pass123!` |
| **Admin** | `admin@vortex.com` | `Pass123!` |

*(Quick-login buttons are also available on the Sign In page for one-click authentication)*

---

## 📜 License
MIT License © 2026 VORTEX Hardware Labs.
