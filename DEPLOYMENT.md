# Deployment Guide

Since we successfully migrated the project to use a real Node.js backend and a MongoDB Atlas database, the application now needs to be deployed in **two separate parts**: the Frontend (React) and the Backend (Node.js/Express).

Here is the easiest, completely free deployment path for your hackathon submission.

---

## 1. Deploying the Backend (Render or Railway)
Because the backend runs continuously to handle API requests and connect to MongoDB, a service like [Render.com](https://render.com/) or [Railway.app](https://railway.app/) is highly recommended.

**Steps for Render:**
1. Push your entire codebase to a GitHub repository.
2. Create an account on Render and click **New > Web Service**.
3. Connect your GitHub repository.
4. **Root Directory:** Set this to `api`.
5. **Build Command:** `npm install && npx prisma generate && npm run build`
6. **Start Command:** `npm run compile` (or `node dist/server.js`)
7. **Environment Variables:** You MUST add the following variables in the Render dashboard:
   - `DATABASE_URL`: Your exact MongoDB Atlas Connection string.
   - `JWT`: Your secret key (from your `.env`).
   - `JWT_SCRET`: Your secret key.
   - `PORT`: `5050`
   - *Any other Cloudinary/Email secrets you have in your local `.env`.*
8. Click **Deploy Web Service**. Once deployed, Render will give you a live URL (e.g., `https://doctor-backend-xyz.onrender.com`).

---

## 2. Connect the Frontend to the Live Backend
Before deploying the frontend, you must tell it to talk to your new live backend URL instead of `localhost`.

**Steps:**
1. Open the frontend code. Navigate to your RTK Query setup, usually found in `src/redux/api/baseApi.js` or `localBaseQuery.js`.
2. Find the `baseUrl` configuration (which currently points to `http://localhost:5050/api/v1`).
3. Change it to point to your new Render URL: `https://doctor-backend-xyz.onrender.com/api/v1`.
4. Commit and push this change to GitHub.

---

## 3. Deploying the Frontend (Vercel)
React frontends are completely static once built, making [Vercel](https://vercel.com/) the perfect (and fastest) hosting platform.

**Steps:**
1. Log in to Vercel and click **Add New Project**.
2. Import your GitHub repository.
3. **Framework Preset:** Vercel should auto-detect "Create React App".
4. **Root Directory:** If your React code is in the root directory (`Doctor-Appointment-master`), leave it as `./`. If it's in a subfolder, select that subfolder.
5. Click **Deploy**. Vercel will run `npm run build` and publish your site globally.

---

## Final Verification
1. Visit your live Vercel frontend link.
2. Attempt to register a test patient. 
3. Try booking a doctor to verify that the frontend successfully reaches the backend, which in turn successfully writes to MongoDB Atlas.
4. **Submit your live Vercel link for the hackathon!**
