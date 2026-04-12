# AgroChain 🌾

AgroChain is a robust, full-stack digital agricultural supply chain platform connecting farmers and buyers with intelligent AI-driven logistics, multilingual support, and escrow-based smart payments.

---

## 🚀 Setup Instructions

### 1. Clone the Source
```bash
git clone <repository_url>
cd AgroChain
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment variables (Example syntax)
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/agrochain?schema=public"' > .env
echo 'JWT_SECRET="your-super-secret-jwt-key"' >> .env
echo 'FRONTEND_URL="http://localhost:5174"' >> .env
echo 'PORT=5000' >> .env

# Initialize the Database Schema (Prisma)
npx prisma generate
npx prisma db push

# Start the backend development server (Runs on Port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up the frontend API URL
echo 'VITE_API_URL=http://localhost:5000/api' > .env.local

# Start the Vite development server (Usually runs on Port 5174)
npm run dev
```

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
| `/market/warehouses` | `Warehouses` | Manage physical storage infrastructure and authorize hub staff |
| `/market/transporters` | `Transporters` | Register transport logistics, drivers, and vehicles |

---

## 🛠️ Features Summary

* **Multimodal AI Assistant ("AgroBot")**: A smart voice and text assistant that helps farmers navigate the platform and list crops using natural language.
* **Hybrid Authentication**: Secure authentication marrying password-based sessions with OTP verification.
* **Escrow Logistics Contract**: Funds are locked upon order. 40% releases on pickup, 60% releases on verified warehouse delivery.
* **Dynamic AI Price Advisor**: Real-time market insights tailored to the user's location and language.
