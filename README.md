# AgroChain 🌾

AgroChain is a robust, full-stack digital agricultural supply chain platform connecting farmers and buyers with intelligent AI-driven logistics, multilingual support, and escrow-based smart payments.

---

## 🚀 Setup & Local Development

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** or **pnpm** installed.

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.vkmiapkwpkmbfqaksyol:adityaagrochain@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
   SUPABASE_URL="https://vkmiapkwpkmbfqaksyol.supabase.co"
   SUPABASE_SERVICE_KEY="your-supabase-service-key"
   JWT_SECRET="agrochain-ultra-secure-key-2026"
   FRONTEND_URL="http://localhost:5173"
   
   # Optional Email SMTP setup (fails gracefully if omitted)
   EMAIL_USER="agro.chain.offical@gmail.com"
   EMAIL_PASS="your-email-app-password"
   
   # AI Integration
   GROQ_API_KEY="your-groq-api-key"
   ```
4. Push the schema to your Supabase instance:
   ```bash
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
   *The backend server runs at `http://localhost:5000`.*

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs at `http://localhost:5173`.*

---

## 🛠️ Testing & Verification

### Static Verification
To check compiler sanity and code quality before deployment:
* **Backend compilation**: `npm run build` in `/backend` (verifies TypeScript compilation and generates Prisma clients).
* **Frontend compilation & lint**: `npm run lint` and `npm run build` in `/frontend`.

### Database Connection Check
Verify the active database connection using the utility script:
```bash
cd backend
node check_db.js
```

### API Testing
We provide 4 Postman collections under `/backend` for running API route tests:
* `farmerApp.json` (Farmer endpoints)
* `supermarket.json` (Buyer/Market endpoints)
* `logistics.json` (Transporter & warehouse actions)
* `public.json` (Landing and common trace routes)

---

## 🌐 Production Deployment Guide (Vercel)

Both the frontend and backend are preconfigured with `vercel.json` configurations to support serverless deployment on Vercel.

### Project 1: Frontend Deployment
1. Import the project on the Vercel Dashboard.
2. Set the **Root Directory** to `frontend`.
3. Select **Vite** as the framework preset.
4. Add the environment variable:
   * `VITE_API_URL` = `https://your-backend-vercel-url.vercel.app/api`
5. Click **Deploy**. Vercel will handle the build outputs and apply the route rewrites defined in `vercel.json` for React Router.

### Project 2: Backend Deployment
1. Import the project on the Vercel Dashboard.
2. Set the **Root Directory** to `backend`.
3. Select **Other** as the framework preset.
4. Add the required environment variables:
   * `DATABASE_URL`
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_KEY`
   * `JWT_SECRET`
5. Click **Deploy**. Vercel will build your TypeScript files and serve the backend serverless.

> [!WARNING]
> **Vercel Serverless & Socket.io WebSockets**:
> Vercel Serverless Functions do not support long-lived TCP connection streams. Therefore, real-time messaging (Socket.io) will not maintain active connections.
> * **Recommendation**: If real-time chat is crucial, deploy the **backend** to a persistent hosting platform such as **Render.com**, **Railway.app**, or a VPS, while keeping the **frontend** on Vercel.

---

## 🗺️ Pages & Routes

AgroChain features a dual-dashboard architecture secured by Role-Based Access Control (RBAC).

### Farmer Routes
| Route | Page | Description |
|---|---|---|
| `/farmer/dashboard` | `Dashboard` | Farm overview with Live Weather, Soil metrics, and AI Price Advisor |
| `/farmer/listings` | `Listings` | Voice-assisted crop listing creation and management |
| `/farmer/orders` | `Orders` | Monitor buyer orders, track logistics, and generate QR code batches |
| `/farmer/payments` | `Payments` | View wallet balance and Escrow smart-contract releases |

### Buyer / Supermarket Routes
| Route | Page | Description |
|---|---|---|
| `/market/browse` | `Marketplace` | Live produce shopping with bidirectional location-based filtering |
| `/market/dashboard` | `My Orders` | Track pending purchases and order history |
| `/market/logistics` | `Logistics Control` | Orchestrate supply chains, assign transporters, and issue QR tokens |
| `/market/warehouses` | `Warehouses` | Manage storage infrastructure and authorize hub staff |
| `/market/transporters` | `Transporters` | Register transport logistics, drivers, and vehicles |
