# 🌾 AgroChain – Agent.md (Detailed Product & Engineering Spec)

---

# 🧠 1. Product Overview

**AgroChain** is a **trust-first agri commerce platform** connecting:

👉 **Farmers (Supply)** ↔ **Supermarkets / Retail Chains (Demand)**

Core system:

* **Escrow Payment Layer** (trust)
* **QR-based Batch Identity** (traceability)
* **Link-based Logistics Execution** (usability)

---

## 🎯 Core Value Proposition

* Farmers get **guaranteed payments**
* Buyers get **verified delivery**
* Logistics works **without apps or logins**
* Every batch has a **digital identity (QR)**

---

# 👥 2. User Roles

## Primary (Authenticated)

* Farmer
* Supermarket / Retail Buyer

## Secondary (No Login)

* Transporter (link-based)
* Warehouse / Mandi (link-based)

---

# 🔁 3. End-to-End System Flow

## Phase 1: Supply Creation

* Farmer creates batch
* QR generated
* Listing goes live

## Phase 2: Demand & Payment

* Supermarket places order
* Pays 100% → Escrow

## Phase 3: Logistics Execution

* System generates transport + warehouse links
* Supermarket shares links

## Phase 4: Pickup Event

* Transporter scans QR + uploads proof
* 20–30% payment released

## Phase 5: Validation (Optional)

* Warehouse logs quality

## Phase 6: Delivery Event

* Buyer confirms OR system verifies

## Phase 7: Final Settlement

* Remaining payment released

---

# 💰 4. Escrow System (Detailed)

## States:

* INITIATED
* FUNDED
* PARTIAL_RELEASED
* COMPLETED
* DISPUTED
* REFUNDED

## Release Rules:

* Pickup verified → partial release
* Delivery verified → final release
* Dispute → hold

## Auto Rules:

* Auto release after X hours
* Auto dispute if mismatch detected

---

# 🚀 5. Feature Breakdown

## 🧾 Marketplace

* Farmer listing CRUD
* Supermarket browsing + filters
* Trust score (future)

## 📦 QR Batch System

* Unique batch identity
* Scan at each stage
* Public trace

## 💰 Escrow

* Deposit, partial release, final settlement
* Refund + dispute

## 🔗 Link Logistics

* Token-based transport + warehouse links
* No login required

## 🛡️ Trust Layer

* Proof uploads
* Timestamp + logs

---

# 📱 6. Page-Level Breakdown (VERY DETAILED)

---

# 🌱 FARMER APP

## 1. Onboarding

* Name, email (OTP login)
* Location selection
* Crop preferences

---

## 2. Dashboard

Sections:

* Active listings
* Pending orders
* Earnings summary
* Notifications

---

## 3. Create Listing Page

Fields:

* Crop name (dropdown/manual)
* Quantity
* Price (optional AI suggestion)
* Harvest date
* Location (auto/manual)
* Estimated expiry date
* Crop images

Actions:

* Generate QR
* Publish listing

---

## 4. My Listings

* List view
* Status:

  * Active
  * Sold
  * Expired

Actions:

* Edit
* Pause
* Delete

---

## 5. Orders Page

* Incoming orders
* Order history
* Order status:

  * Pending
  * In Transit
  * Delivered
  * Completed

Details:

* Buyer info
* Payment status
* Timeline

---

## 6. Payments Dashboard

* Total earnings
* Pending payments
* Released payments
* Transaction history

---

## 7. QR Viewer

* View QR
* Download / share QR

---

# 🏪 SUPERMARKET DASHBOARD

## 1. Dashboard

* Active orders
* Pending deliveries
* Spend analytics
* Notifications

---

## 2. Marketplace Page

Sections:

* Search bar
* Filters
* Listing cards

Listing Card:

* Crop
* Farmer name
* Price
* Location
* Trust badge
* images slideshow

---

## 3. Listing Detail Page

* Full batch info
* Crop images
* QR preview (opens this listing details page)
* Farmer details
* Order button
* Harvest date
* Estimated expiry date

---

## 4. Order Placement Page

* Quantity selection
* Total price
* Payment button

---

## 5. Payment Page (Mock payment with custom ui)

* Razorpay / Stripe integration (future scope)
* Payment confirmation

---

## 6. Orders Management

* Order list
* Status tracking

Order Detail:

* Timeline
* Payment status
* Logistics actions

---

## 7. Logistics Control Panel

Actions:

* Generate transport link (requires entering transporter details such as name, email, and vehicle info, select order)
* Generate warehouse link 
* Share links (copy/WhatsApp)

---

# 🔗 LINK-BASED PAGES (NO AUTH)

## 🚚 Transport Page

Sections:

* Job details
* Pickup location
* Delivery location

Actions:

* Scan QR
* Upload image
* Mark pickup
* Mark delivery

---

## 🏢 Warehouse Page

Sections:

* Batch details

Inputs:

* Weight
* Quality grade
* Storage condition (this refers to how the produce is being stored at the warehouse, such as temperature level, humidity, ventilation, and whether it is kept in cold storage, dry storage, or open storage. This helps track freshness and quality over time)

---

# 🔍 PUBLIC QR TRACE PAGE

Sections:

* Product overview
* Farmer info
* Timeline:

  * Created
  * Picked up
  * Stored
  * Delivered
* Quality logs
* Freshness indicator


---

# 🗺️ 7. Route Mapping

### Public & Common
- `/` → **Landing Page**
- `/auth` → **Authentication** (Login/Signup)

### Farmer Routes
- `/farmer/dashboard` → **Dashboard Overview**
- `/farmer/listings` → **My Listings**
- `/farmer/listings/new` → **Create Listing**
- `/farmer/orders` → **Orders Management**
- `/farmer/payments` → **Payments Dashboard**

### Supermarket Routes
- `/market/dashboard` → **Dashboard Overview**
- `/market/browse` → **Marketplace**
- `/market/batch/:id` → **Batch Details**
- `/market/checkout` → **Order Placement**
- `/market/logistics` → **Log istics Control**

### Link-Based (Unauthenticated)
- `/delivery/:token` → **Transport Job Page**
- `/warehouse/:token` → **Warehouse Quality Page**
- `/trace/:batchId` → **Public Product Traceability**

---

# 🧱 8. Technical Architecture

## 🖥️ Stack

* Frontend: React (Vite)
* Backend: Node.js + Express
* Database: PostgreSQL
* Mobile: CapacitorJS

---

## 🗄️ Database Schema (Production-Ready)

### users

* id (uuid)
* role
* name
* phone
* email
* is_verified
* created_at

### batches

* id
* farmer_id
* crop
* quantity
* price_per_unit
* total_price
* harvest_date
* expiry_date
* qr_code_url
* status

### batch_images

* id
* batch_id
* image_url

### orders

* id
* batch_id
* buyer_id
* quantity
* total_amount
* status

### escrow_accounts

* id
* order_id
* total_amount
* released_amount
* remaining_amount
* status

### escrow_transactions

* id
* escrow_id
* type
* amount

### jobs

* id
* order_id
* type
* token
* status

### tracking_logs

* id
* batch_id
* event_type
* image_url
* timestamp
* metadata

### disputes

* id
* order_id
* reason
* status

### payments

* id
* order_id
* provider
* status

---

# 🔐 9. Security

* JWT auth
* Token-based links
* Expiry links

---

# 🎨 10. UI Theme & Design System

## 🌿 Theme: Modern Agri + Trust

### Colors

* Primary Green: #16A34A

### Why

* Green = agriculture + growth
* Blue = trust + payments
* Clean UI = usability

### UX Principles

* Mobile-first
* Large touch targets
* Minimal input
* Clear actions

---

# 🧠 Final Positioning

> AgroChain = Trust infrastructure for agriculture
