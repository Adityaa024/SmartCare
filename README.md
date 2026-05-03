# Doctor Appointment System — Local-Only Version

**A React web app where patients book appointments, doctors manage their own schedules and prescriptions, and admins oversee the system — all running locally in your browser with zero backend required.**

---

## What is this?

This is a **fully functional clinic appointment system** that runs entirely in your browser with no backend server or database needed:

- **Patients** can browse doctors, book appointments, track bookings with a **tracking ID**, view invoices, and see prescriptions.
- **Doctors** can log in and see **only their own patients and appointments**, manage appointment status (pending → approved → completed), write prescriptions, and view their invoices.
- **Admins** get a complete overview: all appointments, doctors, patients, specialties, reviews, and transactions — plus the ability to manage appointment status globally.

All data is stored locally in your browser's localStorage, so **no setup, no database, no API server needed**. Perfect for demos, prototypes, and testing.

---

## Features

| For… | What they can do |
|------|------------------|
| **Visitors** | Home, about, services, blog, contact, search and filter doctors, book appointments. |
| **Patients** | Sign up / sign in, dashboard, favorites, appointments, invoices, prescriptions, **track appointment with ID**. |
| **Doctors** | Log in (demo doctors provided), see **only their own appointments**, approve/complete appointments, manage prescriptions, view invoices. |
| **Admins** | Separate admin area: dashboard stats, manage all appointments, doctors, patients, specialties, reviews, transactions. |

**Key differences from traditional setup:**
- ✅ All data persists in browser localStorage
- ✅ No email verification needed (local only)
- ✅ Doctors can only see appointments assigned to them
- ✅ Admin can manage appointment status globally (pending → scheduled → confirmed → completed, etc.)
- ✅ Multiple login methods: patient signup, doctor login (choose from list), admin login

---

## Tech Stack

| Layer | Tools |
|-------|--------|
| **Frontend** | React 18, Redux Toolkit, RTK Query, Ant Design, React Router, Moment.js, Recharts |
| **Storage** | Browser localStorage (no backend or database required) |
| **Build** | Create React App, React Scripts |

**This is a client-only app** — all data lives in your browser. When you refresh, the app re-reads from localStorage. No API calls, no server needed.

---

## Prerequisites

1. **[Node.js](https://nodejs.org/)** (LTS version recommended) — includes `npm`.
2. A text editor or IDE (VS Code is popular and free).
3. **That's it!** No database, no API server, no external services needed.

---

## Project Structure

```
Doctor-Appointment-master/
├── src/
│   ├── components/
│   │   ├── Login/                    ← Sign in pages (patient, doctor, simple)
│   │   ├── Booking/                  ← Appointment booking flow
│   │   ├── Doctor/                   ← Doctor dashboard & features
│   │   ├── Admin/                    ← Admin panel & management
│   │   └── Shared/                   ← Common components
│   ├── helpers/
│   │   ├── local/
│   │   │   ├── localDb.js            ← Seed data & localStorage storage
│   │   │   ├── localBaseQuery.js     ← Fake API router (all endpoints)
│   │   │   └── localAuth.js          ← Local token creation
│   ├── redux/
│   │   ├── api/                      ← RTK Query endpoints (using localBaseQuery)
│   │   ├── feature/                  ← Redux slices
│   │   └── hooks/                    ← useAuthCheck, etc.
│   ├── utils/
│   │   ├── jwt.js                    ← Token decode
│   │   └── local-storage.js          ← Storage helpers
│   └── App.jsx                       ← Main router
├── public/
├── package.json
└── README.md

**Note:** The `api/` folder is the old backend and is not needed for this version. Everything runs in React.

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/adityaraj/Doctor-Appointment.git
cd Doctor-Appointment-master
npm install
```

### 2. Start the app

```bash
npm start
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Login Options

The app comes with **pre-loaded demo data** in localStorage. Choose how you want to explore:

### 👥 Patient Login
- **URL:** [http://localhost:3000/login](http://localhost:3000/login)
- Sign up as a new patient or use the simple login form
- Browse doctors, book appointments, track status

### 👨‍⚕️ Doctor Login
- **URL:** [http://localhost:3000/doctor-login](http://localhost:3000/doctor-login)
- **8 demo doctors** are available (Dr. Smith, Dr. Johnson, etc.)
- Click "Login as doctor" to see only that doctor's appointments
- Approve pending appointments or mark as completed

### 🔐 Admin Login
- **URL:** [http://localhost:3000/simple-login](http://localhost:3000/simple-login)
- Role dropdown: select **"admin"**
- Email: `admin@example.com`
- Access `/admin/dashboard` after login
- Manage all appointments, doctors, patients, and specialties

---

## Demo Data

The app starts with **8 pre-loaded doctors** and **5 patients** in browser storage:

| Name | Email | Role |
|------|-------|------|
| Dr. Ahmed Smith | ahmed.smith@example.com | Doctor |
| Dr. Sarah Johnson | sarah.johnson@example.com | Doctor |
| Dr. Emily Davis | emily.davis@example.com | Doctor |
| Dr. Michael Brown | michael.brown@example.com | Doctor |
| Dr. Jessica Wilson | jessica.wilson@example.com | Doctor |
| Dr. Robert Garcia | robert.garcia@example.com | Doctor |
| Dr. Lisa Martinez | lisa.martinez@example.com | Doctor |
| Dr. James Anderson | james.anderson@example.com | Doctor |
| admin@example.com | admin@example.com | Admin |

Also includes **5 patients** with pre-made appointments, reviews, and invoices.

---

## How Data is Stored

✅ **All data is local to your browser** — stored in browser `localStorage` under the key `doctor-appointment-local-db`

- Refreshing the page keeps your data (same session)
- Clearing browser cache/cookies **erases all data**
- Each browser/device has **separate data**
- Opening DevTools → Application/Storage → localStorage to view raw data

To **reset the app**, open the browser console and run:
```javascript
localStorage.removeItem('doctor-appointment-local-db');
location.reload();
```

---

## Contributing & Support

For contributions, fork the repo, create a feature branch, test with `npm start`, and open a Pull Request.

---

## Original Author

**Aditya Raj** 

---

## License

This repository is shared for learning and portfolio use. Thank you for using the local-only version!
