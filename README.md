# Doctor Appointment System

**Hackathon Submission Statement**
This project was developed in compliance with the hackathon Problem Statement. It addresses the critical issues of finding doctors, booking appointments securely under high concurrency, and centralizing medical records digitally. 

## Key Technical Implementations
1. **Concurrency Control:** Strict backend-level concurrency protection using a composite unique constraint (`@@unique([doctorId, scheduleDate, scheduleTime])`) and MongoDB's atomic index constraints. This completely eliminates race conditions and double-booking.
2. **Personal Health Summary:** Patients can log their Blood Group, Medical Conditions, and Medications seamlessly during the booking flow.
3. **Diagnosis Notes:** Doctors can securely record unstructured diagnosis notes alongside structured prescriptions.
4. **Slot Management:** Doctors can proactively block dates/times for leaves, dynamically filtering these out of the patient's view.
5. **Real Database Backend:** Migrated from a mock `localStorage` interface to a production-ready Node.js, Express, and MongoDB architecture.

---

## Tech Stack

| Layer | Tools |
|-------|--------|
| **Frontend** | React 18, Redux Toolkit, RTK Query, Ant Design, Bootstrap |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Prisma ORM |

---

## Local Setup Instructions

Follow these steps to run the complete platform (Backend + Frontend) locally on your machine.

### Prerequisites
1. **Node.js** (v18+ recommended)
2. **MongoDB** database running via a cloud provider (e.g., MongoDB Atlas).

### 1. Database Configuration
1. Navigate to the `api` directory:
   ```bash
   cd api
   ```
2. Copy the example environment variables:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and set your `DATABASE_URL` to point to your MongoDB instance:
   ```env
   DATABASE_URL="mongodb+srv://USER:PASSWORD@CLUSTER_URL/DATABASE?retryWrites=true&w=majority"
   ```

### 2. Backend Setup
1. Inside the `api` directory, install dependencies:
   ```bash
   npm install
   ```
2. Push the Prisma schema to your database to create the necessary tables:
   ```bash
   npx prisma db push
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
   *(The backend server will run on `http://localhost:5050` by default)*

### 3. Frontend Setup
1. Open a new terminal window and navigate to the project root directory:
   ```bash
   cd Doctor-Appointment-master
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Submission Details
- **Thought Process Document:** Please refer to `ThoughtProcess.md` in the root directory for a deep dive into the concurrency logic and architectural decisions.
- **Mobile Responsive:** The frontend UI is built using Bootstrap and Ant Design, ensuring the "under 2 minutes" mobile booking requirement is fully supported.

---
*Note: This project is a hackathon submission aimed at modernizing clinic management and patient experiences.*
