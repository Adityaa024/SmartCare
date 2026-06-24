# Advanced Test Cases (QA Protocol)

This document outlines the advanced, end-to-end testing protocol for the Doctor Appointment System, ensuring all critical hackathon requirements and edge cases are validated.

## 1. Concurrency & Double-Booking Tests (CRITICAL)
**Goal:** Verify that two users cannot book the same doctor for the exact same slot.
* **Test Case 1.1: Simultaneous Booking Request**
  * **Setup:** Create two separate browser sessions (or use two different devices) logged in as two different patients.
  * **Action:** Navigate to the same doctor, select the same date and time slot. Both users click "Confirm" at the exact same millisecond (or as close as possible).
  * **Expected Result:** The backend `Serializable` transaction and `@@unique` constraint lock the row. One request succeeds (HTTP 200), and the other fails with HTTP 409 Conflict. The failed user sees a graceful error message: "This slot was just booked by someone else."
* **Test Case 1.2: Database Integrity Check**
  * **Setup:** Post-execution of Test 1.1.
  * **Action:** Query the PostgreSQL database `Appointments` table for the specific `doctorId`, `scheduleDate`, and `scheduleTime`.
  * **Expected Result:** Exactly 1 record should exist.

## 2. Slot Management & Leave Blocking
**Goal:** Ensure doctors can block slots and patients cannot see or book them.
* **Test Case 2.1: Doctor Blocks a Slot**
  * **Setup:** Log in as a Doctor. Navigate to Schedule.
  * **Action:** Select a specific date (e.g., Nov 25th) and time (e.g., 10:00 AM) and block it for "Leave".
  * **Expected Result:** The blocked slot is saved in the `BlockedSlot` table.
* **Test Case 2.2: Patient Booking View**
  * **Setup:** Log in as a Patient. Search for the doctor from Test 2.1.
  * **Action:** Open the booking calendar and select Nov 25th.
  * **Expected Result:** The 10:00 AM slot is completely hidden from the available time chips.
* **Test Case 2.3: API Bypass Attempt**
  * **Setup:** Use Postman or cURL with a valid Patient JWT token.
  * **Action:** Send a POST request to `/appointment/create` with the doctor ID and the exact date/time that was blocked.
  * **Expected Result:** The backend should reject the request (HTTP 400/409), as the slot is blocked, even if the frontend UI didn't show it.

## 3. Patient Flow & Health Summary
**Goal:** Validate the injection of the Personal Health Summary and complete booking flow.
* **Test Case 3.1: Submitting Health Summary**
  * **Setup:** Log in as Patient. Start booking flow.
  * **Action:** Fill in Blood Group (e.g., "O+"), Known Medical Conditions ("Asthma"), and Current Medications ("Albuterol"). Confirm booking.
  * **Expected Result:** Appointment is successfully created. The database reflects the exact string values in the patient's record or appointment metadata.
* **Test Case 3.2: Mobile "Under 2 Minutes" Booking Challenge**
  * **Setup:** Open the application on a mobile device (or use Chrome DevTools Mobile View).
  * **Action:** Time the process from the Homepage -> Search -> Select Doctor -> Select Time -> Fill Summary -> Checkout.
  * **Expected Result:** The responsive UI should allow seamless navigation without horizontal scrolling, and the flow must be completed in under 120 seconds.

## 4. Doctor Post-Consultation (Diagnosis Notes)
**Goal:** Verify the doctor's ability to append unstructured diagnosis notes.
* **Test Case 4.1: Writing Diagnosis Notes**
  * **Setup:** Log in as Doctor. Go to "Appointments" and click "Start Treatment" on an approved appointment.
  * **Action:** Fill out structured medicines and type a detailed paragraph into the new "Diagnosis Notes" text area. Submit.
  * **Expected Result:** The prescription is generated. The database `Prescription` table successfully stores the `diagnosisNotes` string.
* **Test Case 4.2: Patient Viewing Notes**
  * **Setup:** Log in as the Patient who received the prescription in Test 4.1.
  * **Action:** Navigate to "My Prescriptions" and view details.
  * **Expected Result:** The Diagnosis Notes are visible alongside the structured medication list.

## 5. Location-Based Search Filter
**Goal:** Ensure patients can filter doctors by Location/City.
* **Test Case 5.1: Valid City Search**
  * **Setup:** Ensure at least one doctor has "New York" in their address/city field.
  * **Action:** Go to the Search page. Type "New York" in the Location/City filter on the sidebar.
  * **Expected Result:** The grid re-renders to show ONLY doctors located in New York.
* **Test Case 5.2: Combined Filters**
  * **Setup:** Same as above.
  * **Action:** Apply "New York" in Location AND "Cardiologist" in Specialty.
  * **Expected Result:** The backend query uses an `AND` condition, returning only Cardiologists in New York.
