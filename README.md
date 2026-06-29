# 🌾 **AgroChain – Agricultural Supply Chain Platform**

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=flat&logo=vercel&logoColor=white)](https://agro-chain-inky.vercel.app)
![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-121212?style=flat&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwindcss&logoColor=white)

AgroChain is a robust full-stack supply chain platform connecting Indian farmers directly with supermarkets and buyers. It incorporates secure role-based workspaces, verified escrow payment systems, location-aware marketplace discovery, and an intelligent AI voice assistant designed to simplify operations in regional languages.

---

## 🚀 **Features**

- 🎙️ **Multilingual Voice Assistant (AgroBot)** – Navigates pages, fills out product listings, and manages settings in local Indian languages (English, Hindi, Marathi, etc.) using the browser's native Web Speech API.
- 📦 **Secure Escrow Payments** – Implements a trusted transaction workflow with balance tracking, ensuring funds are verified and safely locked before cargo dispatches.
- 🚚 **Token-Secured Logistics** – Coordinates hub-to-hub tracking, warehouse drop-offs, and driver assignments using QR-style secure validation tokens.
- 🔐 **OTP Registration System** – Delivers instant, secure sign-up verification codes directly to user emails via Gmail SMTP routing.
- 🌍 **Bidirectional Location Filters** – Connects farmers and buyers via distance-based crop queries, filtering produce by category, farmer name, and logistics radius.

---

## 🤖 **Groq API & Llama-3 Integration**

AgroChain leverages the `llama-3.3-70b-versatile` model via the Groq API to power **AgroBot**:
- **Intent Parsing & Navigation:** Translates multilingual voice inputs into structured actions, auto-completing listings and triggering navigation routes (`GLOBAL_NAVIGATE`).
- **Failover Key Rotation:** Automatically rotates across multiple configured Groq API keys to prevent rate limits (`429` errors) and guarantee uninterrupted uptime.

---

## 🛠️ **Tech Stack**

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite | Component-driven, type-safe browser user interface |
| **Styling** | Tailwind CSS | Utility-first styling with custom animation extensions |
| **Backend** | Node.js, Express.js | REST APIs supporting dual-prefix production routing |
| **Database** | PostgreSQL (Supabase) | Cloud database and secure file storage buckets |
| **ORM** | Prisma ORM | Declarative schema design, type-safe queries, & database migrations |
| **AI Engine** | Groq API (`llama-3.3-70b-versatile`) | Natural language intent mapping & local crop pricing advisory |
| **Mailing** | Nodemailer | Transactional OTP email routing for security |

---

## 🌍 **Deployment & Video Explanation**

The application is deployed and accessible online:

- **User Platform:** [View Live Deployment](https://agro-chain-inky.vercel.app)
- **📺 Project Walkthrough & Demo Video:** [Google Drive Video Link](https://drive.google.com/file/d/your_google_drive_file_id/view?usp=sharing) *(Replace with your actual Google Drive video share link)*

---

## 📌 **Installation & Setup**

```bash
# 1. Clone the repository
git clone https://github.com/DoodleSquash/AgroChain.git
cd AgroChain

# 2. Install frontend and backend dependencies in one unit
cd backend && npm install && cd ../frontend && npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://your_db_username:your_db_password@your_db_host:your_db_port/your_db_name"
EMAIL_USER="your_gmail_address@gmail.com"
EMAIL_PASS="your_gmail_app_password"
JWT_SECRET="your_jwt_secret_signing_key"
SUPABASE_URL="https://your_supabase_project_ref.supabase.co"
SUPABASE_SERVICE_KEY="your_supabase_service_role_key"
FRONTEND_URL="http://localhost:5173"

GROQ_API_KEY="your_groq_api_key_1"
GROQ_API_KEY2="your_groq_api_key_2"
GROQ_API_KEY3="your_groq_api_key_3"
GROQ_API_KEY4="your_groq_api_key_4"
```

### **4. Start Local Development**
Run the following commands in separate terminals to start the development servers:
* **Backend API Server:** `cd backend && npm run dev`
* **Frontend Web App:** `cd frontend && npm run dev`

---

## 🗺️ **Pages & Routes**

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

## 🛠️ **Contributing**

Contributions are welcome! Feel free to fork the repository, create a new branch, and submit a pull request.

---

### 💡 **Feedback & Support**

For any issues or suggestions, feel free to open an issue on GitHub or contact me at [adityalotankar06@gmail.com](mailto:adityalotankar06@gmail.com).
