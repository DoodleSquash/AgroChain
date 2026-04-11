# AgroChain 🌾

AgroChain is a complete, full-stack digital agricultural supply chain platform. It bridges the gap between farmers and buyers (supermarkets/wholesalers) by offering an integrated marketplace, intelligent AI-driven logistics, multilingual support, and escrow-based smart payments.

## Features ✨

### Core Capabilities
- **Multimodal AI Assistant ("AgroBot")**: A smart voice and text assistant that helps farmers navigate the platform, apply for jobs, and set up listings using natural language.
- **Hybrid Authentication**: Secure authentication marrying password-based sessions with OTP verification.
- **Escrow Payment Infrastructure**: 
  - 40% initial release upon logistics pickup.
  - 60% final release upon verified delivery at the destination warehouse.
- **Logistics Control Tower**:
  - Assign transporters and destination warehouses.
  - End-to-end event traceability using JWT-backed tokens for QR/link-based verification.
- **Dynamic AI Price Advisor**: Real-time market insights tailored to the user's location and preferred language.

### Tech Stack 🛠️
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, i18next (for multi-language support).
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL with Prisma ORM.

---

## Setup Instructions 🚀

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/) database running locally or remotely (or an existing Prisma-compatible DB).

### 1. Clone the Source
```bash
git clone <repository_url>
cd AgroChain
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the `backend/` directory with the following variables:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/agrochain?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   FRONTEND_URL="http://localhost:5174"
   PORT=5000
   ```
4. Initialize the Database Schema (Prisma):
   ```bash
   npx prisma generate
   npx prisma db push
   # Alternatively, if you have migration files: npx prisma migrate dev
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will now be running on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal tab and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the frontend API URL (if required, otherwise defaults to localhost:5000):
   Create a `.env.local` inside `frontend/` (Optional):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will boot up and be accessible (typically at `http://localhost:5174` or `5173`).*

---

## Navigating the Application 🗺️

AgroChain features Role-Based Access Control (RBAC):
- **Supermarket/Buyer Path**: Access the Marketplace, view available batches, manage Warehouse infrastructure, and orchestrate logistics. Navigate to `/market`.
- **Farmer Path**: Access the Farmer Dashboard, view local weather/soil metrics, list crops, manage harvest batches, and apply for contract work. Navigate to `/farmer`.

## Troubleshooting
- **EADDRINUSE (Port 5000)**: If your backend fails to start, ensure no lingering node instances are holding port 5000. In PowerShell, you can run: `Get-Process node | Stop-Process -Force`.
- **TypeScript Compilation Limits**: If Prisma imports fail, ensure Prisma client has been generated via `npx prisma generate`.
