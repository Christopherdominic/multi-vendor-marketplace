# MarketHub — Multi-Vendor Marketplace Platform

A full-stack marketplace connecting multiple vendors with customers, built around category-first product discovery, a persistent shopping cart, and dedicated vendor and admin dashboards.

Capstone project — Group 11.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Overview](#api-overview)
- [Team & Ownership](#team--ownership)
- [Contributing](#contributing)

## Overview

MarketHub lets customers browse products across categories from multiple independent vendors, add items to a persistent cart, check out, and track orders. Vendors manage their own shop, products, and incoming orders through a vendor dashboard, while admins oversee vendors, customers, and platform-wide analytics.

Key product features:

- Category-first browsing with a horizontal category switcher and search/filter/sort/pagination
- Persistent cart that stays visible while browsing
- Multi-step checkout (address → payment → review → confirm)
- Order history with status tracking and post-delivery reviews
- Vendor dashboard for product and order management
- Admin panel for vendor/customer oversight and platform analytics

## Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Context API / custom hooks for state management

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcrypt for password hashing
- express-validator for input validation
- Cloudinary for image uploads (via Multer)

## Repository Structure

```
multi-vendor-marketplace/
├── backend/
│   └── src/
│       ├── config/        # DB and Cloudinary configuration
│       ├── controllers/   # Route handlers / business logic
│       ├── middlewares/   # Auth, validation, upload, error handling
│       ├── models/        # Mongoose schemas
│       ├── routes/        # Express route definitions
│       ├── scripts/       # One-off scripts (e.g. seeding)
│       ├── utils/         # Shared helpers (response shaping, errors, uploads)
│       └── app.js         # Express app entrypoint
└── frontend/
    └── src/
        ├── components/    # Reusable UI components
        ├── pages/         # Route-level pages
        ├── hooks/         # Custom hooks (cart, filters, etc.)
        ├── data/          # Static/mock data
        └── utils/         # Shared frontend helpers
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)
- A Cloudinary account (for product image uploads)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, Cloudinary credentials, etc.
npm run dev             # starts the API with nodemon on the port set in .env (default 5000)
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev             # starts the Vite dev server
```

## API Overview

All backend routes are namespaced under `/api/v1`. Each domain area is owned by a different backend developer and mounted independently in [backend/src/app.js](backend/src/app.js):

| Base Path            | Domain                          | Owner            |
|-----------------------|----------------------------------|-------------------|
| `/api/v1/auth`         | Authentication & users           | Backend Dev 1     |
| `/api/v1/categories`   | Product categories               | Backend Dev 2     |
| `/api/v1/products`     | Products, search, filter         | Backend Dev 2     |
| `/api/v1/cart`         | Shopping cart                    | Backend Dev 3     |
| `/api/v1/orders`       | Orders & order items             | Backend Dev 3     |
| `/api/v1/shops`        | Vendor/shop, addresses, reviews  | Backend Dev 4     |
| `/api/v1/admin`        | Admin analytics & management     | Backend Dev 4     |

## Team & Ownership

**Backend**

| Developer | Focus Area | Main Models | Endpoints |
|---|---|---|---|
| Backend Dev 1 | Authentication & Users | User | 5 |
| Backend Dev 2 | Products & Discovery | Product, Category | 7 |
| Backend Dev 3 | Cart & Orders | Cart, Order, OrderItems | 8 |
| Backend Dev 4 | Vendors, Shop & Admin | Shop, Address, Review | 10 |

**Frontend**

| Developer | Focus Area | Pages | Components |
|---|---|---|---|
| Frontend Dev 1 | Auth & Account | 4 | 7 |
| Frontend Dev 2 | Product Discovery | 3 | 12 |
| Frontend Dev 3 | Cart & Checkout | 2 | 8 |
| Frontend Dev 4 | Orders & Tracking | 2 | 7 |
| Frontend Dev 5 | Vendor & Admin | 6 | 8 |

See [.github/CODEOWNERS](.github/CODEOWNERS) for directory-level ownership.

## Contributing

- Work on feature branches, never commit directly to `main`.
- Validate input on both the frontend and backend.
- Handle errors gracefully — never surface raw API errors in the UI.
- Do not commit `.env` files or `node_modules`.
- Keep the MVP scope in mind: build what's needed, avoid over-engineering.
