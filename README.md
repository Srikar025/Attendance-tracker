# 📊 Attendance Tracker (AttTracker)

A full-stack modern web application designed for students and professionals to track, monitor, and manage their class or work attendance, compute target thresholds, log daily attendance histories, and optimize attendance goals.

---

## ✨ Features

- 🔐 **User Authentication**: Secure JWT-based registration and login with password hashing via `bcryptjs`.
- 📈 **Dashboard & Analytics**: Real-time summary of overall attendance percentage, classes attended, missed classes, and target percentage metrics.
- 🎯 **Target Percentage Calculator**: Dynamically calculates how many future classes you must attend (or can afford to miss) to maintain your desired attendance threshold (e.g., 75%).
- 📅 **Daily Record Logging**: Log status (Present, Absent, Cancelled, Holiday) per subject/slot for any specific date.
- 📜 **Attendance History**: View past attendance logs, filter by date ranges, and make corrections when needed.
- 👤 **Profile & Customization**: Update user details, overall attendance totals, target thresholds, and personal preferences.
- ⚙️ **Customizable Settings**: Manage notification thresholds, theme preferences, and data sync options.
- 📱 **Progressive Web App (PWA)**: Desktop & mobile friendly interface with install prompt support.
- ⚡ **Optimized Performance**: Code-splitting with React `lazy` & `Suspense`, Tailwind CSS v4 styling, and dark theme UI (`#0a0d14`).

---

## 🛠️ Tech Stack

### **Frontend (`Tracker-app`)**
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Deployment**: Vercel (`vercel.json`)

### **Backend (`backend`)**
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/) + TypeScript
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/)
- **Auth & Security**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS, `dotenv`
- **Validation**: `express-validator`
- **Dev Execution**: `tsx` watch mode
- **Deployment**: Render

---

## 📂 Project Structure

```
Attendance-tracker/
├── Tracker-app/              # React Frontend App
│   ├── public/               # Static assets & PWA manifest
│   ├── src/
│   │   ├── components/       # Reusable UI components & ProtectedRoute
│   │   ├── context/          # React Auth Context & State Management
│   │   ├── icons/            # SVG Icon components
│   │   ├── pages/            # Application routes (Home, Track, Profile, Settings, Login, Signup)
│   │   ├── services/         # Axios API client integrations
│   │   ├── types/            # TypeScript interfaces & types
│   │   ├── App.tsx           # Route declarations & lazy components
│   │   └── main.tsx          # Application entrypoint
│   ├── .env                  # Frontend Environment variables
│   ├── package.json
│   ├── tailwind.config.js / index.css
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── backend/                  # Express TypeScript API Backend
    ├── src/
    │   ├── controllers/      # Route controllers (auth, attendance, user)
    │   ├── middleware/       # Authentication & validation middleware
    │   ├── models/           # Mongoose Data Schemas (User, DailyRecord)
    │   ├── routes/           # Express router definitions
    │   └── server.ts         # Server entrypoint & DB connection setup
    ├── .env                  # Backend Environment variables
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Account / URI](https://www.mongodb.com/cloud/atlas) or a local MongoDB database instance

---

## ⚙️ Environment Variables Setup

### 1. Backend (`backend/.env`)

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/attendance-tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173,http://localhost:3000,http://localhost:3001

# Brevo (Sendinblue) Email Service Configuration
BREVO_API_KEY=xkeysib-your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender@domain.com
BREVO_SENDER_NAME=Attendance Tracker
```

### 2. Frontend (`Tracker-app/.env`)

Create a `.env` file in the `Tracker-app` directory:

```env
VITE_API_URL=http://localhost:5000
```
*(For production, set `VITE_API_URL` to your live backend endpoint).*

---

## 💻 Installation & Running Locally

### Step 1: Clone & Navigate
```bash
cd Attendance-tracker
```

### Step 2: Run the Backend
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:5000` and connect to MongoDB.

### Step 3: Run the Frontend
In a new terminal window:
```bash
cd Attendance-tracker/Tracker-app
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Endpoints Summary

### **Authentication (`/api/auth`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register a new user with Name, Email, Username, & Password | No |
| `POST` | `/api/auth/login` | Authenticate user (Username or Email) & return JWT | No |
| `POST` | `/api/auth/forgot-password` | Generate & send 6-digit OTP code to user email via Brevo | No |
| `POST` | `/api/auth/verify-otp` | Validate 6-digit OTP code expiration & correctness | No |
| `POST` | `/api/auth/reset-password` | Verify OTP code & set new hashed password | No |
| `GET`  | `/api/auth/me` | Fetch active user profile | Yes |

### **Attendance Management (`/api/attendance`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/attendance/daily` | Create daily attendance entry | Yes |
| `GET`  | `/api/attendance/daily` | Get daily record by date query | Yes |
| `PUT`  | `/api/attendance/daily/:id` | Update attendance record | Yes |
| `GET`  | `/api/attendance/history` | Retrieve full history logs | Yes |
| `GET`  | `/api/attendance/stats` | Compute attendance metrics & stats | Yes |

### **User Profile (`/api/user`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `PUT`  | `/api/user/profile` | Update profile information & target % | Yes |
| `PUT`  | `/api/user/totals` | Update overall attendance totals | Yes |

### **System (`/api`)**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET`  | `/api/health` | Service health status check | No |

---

## 🔒 Security & Best Practices

- Passwords are salted and hashed using `bcryptjs` before storage.
- Routes are protected via Bearer Token authorization headers in JWT middleware.
- Input requests are validated to prevent malicious payloads or invalid data formats.
- Strict CORS validation restricts API access to authorized frontend domains.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
