# Doctor Appointment System

**Hackathon Submission Statement**
This project was developed in compliance with the hackathon Problem Statement. It addresses the critical issues of finding doctors, booking appointments securely under high concurrency, and centralizing medical records digitally. 

## Comprehensive Features

### 🧑‍⚕️ For Doctors
- **Profile Management**: Build a comprehensive professional profile including clinic details, education, experience, services offered, pricing, and awards.
- **Dynamic Scheduling**: Create customized working schedules by setting availability for specific days and time slots.
- **Slot Blocking (Leave Management)**: Proactively block specific dates and times with reasons to prevent bookings during leaves or emergencies.
- **Digital Prescriptions**: Issue detailed, structured digital prescriptions to patients, including disease diagnosis, recommended tests, specific medicines (dosage, frequency, duration), and diagnosis notes.
- **Appointment Management**: View and manage incoming patient appointments, track patient history, and manage follow-ups.
- **Blogging Platform**: Publish medical blogs and articles to educate patients and build a professional brand.
- **Review Management**: Track and respond to patient reviews and ratings.

### 🏥 For Patients
- **Smart Booking System**: Find doctors by specialty or location and book appointments seamlessly.
- **Personal Health Records**: Maintain a centralized digital health profile, including blood group, known medical conditions, and current medications during the booking flow.
- **Track Appointments**: Real-time tracking of appointment status (pending, confirmed, etc.) with a unique tracking ID.
- **Favorites List**: Save and manage a list of preferred doctors for quick access in the future.
- **Ratings & Reviews**: Share experiences by leaving reviews, star ratings, and recommendations for doctors.
- **Digital Prescriptions Access**: Access and download digital prescriptions issued by doctors at any time.

### 💻 Admin & Platform Capabilities
- **Role-Based Access Control**: Distinct dashboards and access levels for Patients, Doctors, and Administrators.
- **Concurrency Control**: Strict backend-level concurrency protection using a composite unique constraint to eliminate race conditions and double-booking.
- **Secure Authentication**: Robust authentication system with JWT, user verification, and secure password recovery mechanisms.
- **Payment Processing**: Integrated system for handling doctor fees, booking fees, VAT, and overall transaction tracking.

---

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
