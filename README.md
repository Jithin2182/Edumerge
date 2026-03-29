# EduMerge CRM — Admissions Management Platform

This project is a simple full-stack admissions CRM built to manage student applications across different quotas like KCET, COMEDK, and Management.

The goal was to keep things minimal but functional — covering the core admission workflow like applicant creation, seat allocation, document tracking, and final admission confirmation.

---

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Recharts (for dashboard)

**Backend**
- Node.js
- Express
- MongoDB with Mongoose

**Authentication**
- JWT (stored in localStorage)
- bcrypt for password hashing

---

## Project Structure

```
Edumerge/
├── crm/          # Frontend (React + Vite)
│   └── src/
│       ├── api/           # API calls
│       ├── components/    # Reusable components
│       ├── context/       # Auth handling
│       └── pages/         # Screens/pages
│
└── server/       # Backend (Express)
    ├── index.js
    └── src/
        ├── config/        # DB connection
        ├── controllers/   # Business logic
        ├── middleware/    # Auth middleware
        ├── models/        # Schemas
        └── routes/        # API routes
```

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd Edumerge
```

---

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/edumerge
JWT_SECRET=your_secret_key
```

Start server:

```bash
node index.js
```

Backend will run on:  
http://localhost:5000

---

### 3. Frontend setup

```bash
cd crm
npm install
npm run dev
```

Frontend will run on:  
http://localhost:5173

---

## Creating Demo Users

You can create users using Postman or curl.

Example:

```bash
POST /api/auth/register
```

```json
{
  "name": "Admin",
  "email": "admin@edumerge.com",
  "password": "123456",
  "role": "ADMIN"
}
```

Create similar users for:
- ADMISSION_OFFICER
- MANAGEMENT

---

## Demo Credentials

    NAME | Email | Password

    Admin | admin@edumerge.com | 123456
    Admission Officer | officer@edumerge.com | 123456
    Management | management@edumerge.com | 123456

---

## Role Permissions (Basic)

- **Admin**
  - Full access (programs, applicants, dashboard)

- **Admission Officer**
  - Manage applicants
  - Allocate seats
  - Update status

- **Management**
  - View dashboard only

---

## Core Features

- Program setup with quota validation  
- Applicant creation & tracking  
- Seat allocation with quota checks (no overbooking)  
- Document status tracking  
- Fee status validation  
- Admission confirmation with unique admission number  
- Basic dashboard for insights  

---

## Admission Flow

**Government (KCET / COMEDK)**  
Applicant → Seat Allocated → Documents Verified → Fee Paid → Confirmed  

**Management**  
Applicant → Manual Allocation → Documents → Fee → Confirmed  

---

## Admission Number Format

```
INST/2026/UG/CSE/KCET/0001
```

- Unique for every student  
- Generated only after confirmation  

---

## Environment Variables

    PORT=5000
    MONGO_URI=mongodb+srv://****user****:Edumerge_****pwd***@edumerge-cluster.yau**.mongodb.net/
    JWT_SECRET=ap3*******r4CGop**************XyEk2YJmLC2
    DB_NAME=edumerge_db

---

## AI Usage Disclosure

AI tools (ChatGPT) were used for:
- UI Enhancements
- Writing some boilerplate code

All logic, flow decisions, schema and implementation understanding were done manually.

---

## Notes

This project focuses on core backend logic and workflow, not UI polish.  
The main emphasis was on:
- Data integrity  
- Quota validation  
- Clean and understandable structure  

---

## Future Improvements (if extended)

- Better dashboard analytics  
- Pagination & filters  
- Improved UI/UX  
- Deployment setup  
