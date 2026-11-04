# Research Agro Vet — Express API Backend

Standalone Express.js + TypeScript REST API backend for Research Agro Vet.

## Tech Stack
- **Express.js** with TypeScript
- **Prisma ORM** connecting to PostgreSQL
- **Cloudinary** for medicine image uploads
- **CORS** enabled for Next.js frontend (`http://localhost:3000`)
- **Multer** for multipart file uploads

## Getting Started

### 1. Setup Environment
```bash
cp .env.example .env
```
Fill in your database URL and Cloudinary credentials in `.env` (same credentials as in the Next.js `.env`).

### 2. Install Dependencies
```bash
npm install
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Development Server
```bash
npm run dev
```
The server will run on `http://localhost:4000`.

## Endpoints

### Public Endpoints
- `GET /api/products` — Filterable products list
- `GET /api/products/:id` — Single product details
- `PATCH /api/products/:id` — Quick patch (featured, etc.)
- `GET /api/products/:id/reviews` — Product reviews
- `POST /api/products/:id/reviews` — Submit review
- `POST /api/orders` — Checkout order placement
- `GET /api/orders/lookup?phone=...` — Phone lookup
- `GET /api/orders/:orderNumber` — Order confirmation details

### Admin Endpoints
- `GET /api/admin/orders` — Admin orders list + statistics
- `POST /api/admin/orders/manual` — Manual order entry (offline/phone sales)
- `GET /api/admin/orders/:id` — Order details
- `PUT /api/admin/orders/:id` — Update status, payments, courier
- `GET /api/admin/products` — Admin products with margin stats
- `POST /api/admin/products` — Create product
- `GET /api/admin/products/:id` — Product details
- `PUT /api/admin/products/:id` — Update product + variants
- `DELETE /api/admin/products/:id` — Delete product
- `PATCH /api/admin/products/:id/clinical` — Clinical data update
- `GET /api/admin/categories` — Categories with product counts
- `POST /api/admin/categories` — Create category
- `GET /api/admin/categories/:id` — Category details
- `PUT /api/admin/categories/:id` — Update category
- `DELETE /api/admin/categories/:id` — Delete category
- `PATCH /api/admin/variants/:id` — Inline variant pricing update
- `POST /api/admin/upload` — Multi-image upload to Cloudinary

