# Customer Management App

A full-stack web application for managing customers and their addresses. Built with React (Vite), Express, and SQLite.

---

## Features

- **Customer CRUD:** Create, read, update, and delete customers.
- **Address Management:** Add, edit, and delete addresses for each customer.
- **Search & Filter:** Search customers and filter by city/state.
- **Pagination:** Paginated customer list.
- **Toast Notifications:** User feedback for actions.
- **Modern UI:** Responsive design using Radix UI, Shadcn UI, and Tailwind CSS.

---

## Tech Stack

- **Frontend:** React, Vite, Radix UI, Shadcn UI, Tailwind CSS
- **Backend:** Express.js, SQLite
- **API:** RESTful endpoints
- **Other:** Axios, Zod, React Router

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/customer-management-app.git
cd customer-management-app
```

### 2. Install dependencies

#### Backend

```sh
cd server
npm install
```

#### Frontend

```sh
cd ../client
npm install
```

### 3. Start the backend server

```sh
cd ../server
npm start
# or
node index.js
```

### 4. Start the frontend dev server

```sh
cd ../client
npm run dev
```

### 5. (Optional) Seed the database

```sh
cd ../server
node seeder.js
```

---

## Project Structure

```
customer-management-app/
│
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (CustomerList, CustomerDetail, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── api/           # Axios API setup
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   └── ...            # Other frontend files
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express backend
│   ├── index.js           # Main server file
│   ├── seeder.js          # Database seeder script
│   ├── mockData.js        # Mock data for seeding
│   ├── database.db        # SQLite database file
│   └── package.json
│
└── README.md
```

---

## API Endpoints

- `GET /api/customers` — List customers
- `POST /api/customers` — Create customer
- `GET /api/customers/:id` — Get customer details
- `PUT /api/customers/:id` — Update customer
- `DELETE /api/customers/:id` — Delete customer
- `GET /api/customers/:id/addresses` — List addresses for customer
- `POST /api/customers/:id/addresses` — Add address to customer
- `PUT /api/addresses/:addressId` — Update address
- `DELETE /api/addresses/:addressId` — Delete address

---

## Troubleshooting

- **Module not found errors:** Run `npm install` in both `client` and `server` folders.
- **Permission errors on Windows:** Close editors/terminals, run as administrator, and retry.
- **Backend connection errors:** Make sure the Express server is running before using the frontend or seeder.

