# 🛒 E-Commerce Full Stack Project

A full-stack e-commerce application built with **React**, **Node.js/Express**, and **Firebase Realtime Database**.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express.js |
| Database | Firebase Realtime Database |
| HTTP Client | Axios |
| State Management | React Context API + localStorage |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- Firebase project with Realtime Database enabled
- Firebase Service Account Key

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd project
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file:
```env
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
PORT=5000
```

Place your `serviceAccountKey.json` (from Firebase Console → Project Settings → Service Accounts) in the `backend/` folder.

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev        # development (nodemon)
npm start          # production
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`  
Backend API runs at: `http://localhost:5000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products |
| `GET` | `/api/products?search=query` | Search by name/category/description |
| `GET` | `/api/products?category=Electronics` | Filter by category |
| `GET` | `/api/products/featured` | Get featured products |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

---

## 📦 Product Schema

```json
{
  "id": "string (Firebase auto-key)",
  "name": "string",
  "price": "number",
  "oldPrice": "number | null",
  "image": "string (URL)",
  "description": "string",
  "category": "Electronics | Clothing | Home & Outdoor | Sports | Accessories",
  "stock": "number",
  "rating": "number (0–10)",
  "featured": "boolean",
  "createdAt": "timestamp"
}
```

---

## ✅ Features

- 🏠 **Home Page** — Featured products, category sections, countdown deals, recommended items
- 📋 **Product Listing** — Grid/list view, search, category filter, sort, pagination
- 🔍 **Product Detail** — Full product info, quantity selector, related products, Add to Cart
- 🛒 **Cart** — Persistent cart (localStorage), qty update, remove, subtotal + tax + total
- 🔎 **Search Bar** — Navbar search navigates to `/products?search=query`
- 📱 **Responsive** — Mobile-first design with breakpoints at 768px and 1024px

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── routes/
│   │   └── products.js       # CRUD API routes
│   ├── scripts/
│   │   └── seed.js           # Database seeding script
│   ├── server.js             # Express entry point
│   ├── .env                  # Environment variables (not committed)
│   ├── serviceAccountKey.json# Firebase credentials (not committed)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/       # Navbar, Footer
    │   ├── context/
    │   │   └── CartContext.jsx  # Global cart state
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── ProductList.jsx
    │   │   ├── ProductDetail.jsx
    │   │   └── Cart.jsx
    │   ├── services/
    │   │   └── api.js        # Axios API layer
    │   └── App.jsx
    └── package.json
```
