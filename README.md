# 🚗 Wash Bay Payment Management System

A full-stack application for managing car wash bay operations, including vehicle entry/exit, payment based on size and package, and report generation.

Built with:

- **Backend**: Node.js + Express + MySQL
- **Frontend**: React + Tailwind CSS

---

## 📁 Project Structure

wash-bay-payment/
├── backend/ # Node.js + Express server
├── frontend/ # React + Tailwind CSS UI
└── README.md


---

## ⚙️ Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
npm install

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=washbaydb
SESSION_SECRET=your_secret_key

node server.js // or set nodemon

## ⚙️ Frontend Setup
cd ../frontend

npm install

npm start

This runs the app at: http://localhost:3000 in your browser


##🧾 System Features
##🚙 Vehicle entry registration

##🧼 Cleaning packages: Basic, Special, VIP

##📏 Vehicle sizes: Small, Medium, Large

##💰 Payment calculation based on package + size + time

##🔐 Login/logout with session management

##📊 Daily/weekly/monthly report generation





