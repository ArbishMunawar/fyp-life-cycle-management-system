# FYP Nexus — Final Year Project Lifecycle Management System

A web-based platform that digitizes and streamlines the entire Final Year Project (FYP) workflow — from proposal submission to final report archiving — for students, supervisors, and admins.

## The Problem

Most universities still manage FYPs manually: students email proposals, supervisors track them without any organized dashboard, and there's no centralized way to see proposal status or archive past reports. This leads to lost submissions, delays, and no transparency for students on where their proposal stands.

## What It Does

- **Role-based authentication** — separate login and dashboards for students, supervisors, and admins
- **Proposal submission** — students submit proposals with details and file attachments
- **Proposal review** — supervisors can view assigned proposals, accept/reject, and leave feedback
- **Progress tracking** — students see real-time status (Pending / Accepted / Rejected)
- **Final report submission** — students upload final reports for supervisor review
- **Notifications** — automatic updates on proposal decisions and deadlines
- **Admin panel** — monitor overall progress, assign supervisors, and generate reports

## Tech Stack

**Frontend:** React.js, Tailwind CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose ODM)
**Authentication:** JWT (JSON Web Tokens)
**File Handling:** Multer (PDF/DOC uploads)
**Deployment:** Vercel (frontend) / cloud server (backend)

## Project Structure

```
fyp-life-cycle-management-system/
├── client/          # React frontend
└── backend/         # Express backend + REST API
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Create a .env file — see .env.example for required variables
npm start
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Environment Variables (backend/.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

