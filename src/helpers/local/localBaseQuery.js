import { authKey } from '../../constant/storageKey';
import { getFromLocalStorage } from '../../utils/local-storage';
import { decodeToken } from '../../utils/jwt';
import { createLocalAccessToken } from './localAuth';
import { getLocalDb, makeId, updateLocalDb } from './localDb';

const nowIso = () => new Date().toISOString();

const clone = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const normalizeData = (value) => {
  if (!value) return value;
  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    return Object.fromEntries(value.entries());
  }
  return value;
};

const ok = (data, meta = {}) => ({ data, meta });

const getAuthUser = (headers = {}) => {
  const token = headers.Authorization || headers.authorization;
  if (!token) return null;
  try {
    return decodeToken(token);
  } catch {
    return null;
  }
};

const withPagination = (items, params = {}) => {
  const page = Number(params.page || 1);
  const limit = Number(params.limit || items.length || 10);
  const start = (page - 1) * limit;
  const end = start + limit;
  return ok(items.slice(start, end), {
    page,
    limit,
    total: items.length,
    totalPage: Math.max(1, Math.ceil(items.length / limit)),
  });
};

const filterBySearch = (items, params = {}) => {
  const searchTerm = String(params.searchTerm || params.search || '').trim().toLowerCase();
  const gender = String(params.gender || '').toLowerCase();
  const specialist = String(params.specialist || params.specialization || '').toLowerCase();
  const min = params.min != null ? Number(params.min) : null;
  const max = params.max != null ? Number(params.max) : null;

  return items.filter((item) => {
    const haystack = [
      item.firstName,
      item.lastName,
      item.email,
      item.specialization,
      item.designation,
      item.clinicName,
      item.city,
      item.state,
      item.country,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    const matchesGender = !gender || String(item.gender || '').toLowerCase() === gender;
    const matchesSpecialist = !specialist || String(item.specialization || '').toLowerCase().includes(specialist);
    const price = Number(item.price || 0);
    const matchesMin = min == null || Number.isNaN(min) || price >= min;
    const matchesMax = max == null || Number.isNaN(max) || price <= max;

    return matchesSearch && matchesGender && matchesSpecialist && matchesMin && matchesMax;
  });
};

const buildAppointment = (appointment, db) => ({
  ...appointment,
  patient: appointment.patient || db.patients.find((item) => item.id === appointment.patientId) || null,
  doctor: appointment.doctor || db.doctors.find((item) => item.id === appointment.doctorId) || null,
});

const buildInvoice = (appointment) => ({
  id: appointment.id,
  createdAt: appointment.createdAt,
  paymentMethod: appointment.paymentMethod || 'cash',
  paymentType: appointment.paymentType || 'local',
  DoctorFee: Number(appointment.DoctorFee || 500),
  bookingFee: Number(appointment.bookingFee || 0),
  vat: Number(appointment.vat || 0),
  totalAmount: Number(appointment.totalAmount || 500),
  appointment,
});

const buildPrescription = (prescription, db) => ({
  ...prescription,
  doctor: prescription.doctor || db.doctors.find((item) => item.id === prescription.doctorId) || null,
  patient: prescription.patient || db.patients.find((item) => item.id === prescription.patientId) || null,
  appointment:
    prescription.appointment ||
    buildAppointment(db.appointments.find((item) => item.id === prescription.appointmentId) || {}, db),
  medicines: prescription.medicines || [],
});

const ensureUserFromEmail = (db, email) => {
  const existing = db.users.find((item) => item.email?.toLowerCase() === String(email).toLowerCase());
  if (existing) return existing;
  return {
    id: makeId('user'),
    role: 'patient',
    firstName: String(email || 'local').split('@')[0],
    lastName: 'User',
    email,
  };
};

const findUserRole = (db, email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = db.users.find((item) => item.email?.toLowerCase() === normalizedEmail);
  if (user) return user;

  const doctor = db.doctors.find((item) => item.email?.toLowerCase() === normalizedEmail);
  if (doctor) {
    return {
      id: doctor.id,
      role: 'doctor',
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      isDemo: Boolean(doctor.isDemo),
    };
  }

  if (normalizedEmail === 'admin@example.com') {
    return {
      id: 'admin-1',
      role: 'admin',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@example.com',
      isDemo: true,
    };
  }

  return {
    id: makeId('user'),
    role: 'patient',
    firstName: normalizedEmail.split('@')[0] || 'Local',
    lastName: 'User',
    email: normalizedEmail || email,
    isDemo: false,
  };
};

const findOne = (collection, id) => collection.find((item) => item.id === id) || null;

const handleDoctorRoutes = ({ segments, method, data, params }) => {
  const db = getLocalDb();
  const payload = normalizeData(data);

  if (method === 'GET' && segments.length === 1) {
    const doctors = filterBySearch(db.doctors, params);
    return withPagination(doctors, params);
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') {
      return ok(findOne(db.doctors, id));
    }

    if (method === 'PATCH') {
      const updated = updateLocalDb((next) => {
        const index = next.doctors.findIndex((item) => item.id === id);
        if (index >= 0) next.doctors[index] = { ...next.doctors[index], ...payload, updatedAt: nowIso() };
        return next;
      });
      return ok(findOne(updated.doctors, id));
    }
  }

  if (method === 'POST') {
    const created = updateLocalDb((next) => {
      const id = makeId('doctor');
      const record = {
        id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        verified: String(payload?.verified ?? 'false') === 'true',
        ...payload,
      };
      record.verified = String(payload?.verified ?? record.verified) === 'true';
      next.doctors.unshift(record);
      next.users.unshift({
        id,
        role: 'doctor',
        firstName: record.firstName,
        lastName: record.lastName,
        email: record.email,
        specialization: record.specialization,
        verified: record.verified,
      });
      return next;
    });
    return ok(created.doctors[0]);
  }

  return ok(null);
};

const handlePatientRoutes = ({ segments, method, data, params }) => {
  const db = getLocalDb();

  if (method === 'GET' && segments.length === 1) {
    const patients = filterBySearch(db.patients, params);
    return withPagination(patients, params);
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(findOne(db.patients, id));
    if (method === 'PATCH') {
      updateLocalDb((next) => {
        const index = next.patients.findIndex((item) => item.id === id);
        if (index >= 0) next.patients[index] = { ...next.patients[index], ...data, updatedAt: nowIso() };
        return next;
      });
      const nextDb = getLocalDb();
      return ok(findOne(nextDb.patients, id));
    }
  }

  if (method === 'POST') {
    const created = updateLocalDb((next) => {
      const id = makeId('patient');
      const record = { id, createdAt: nowIso(), updatedAt: nowIso(), ...data };
      next.patients.unshift(record);
      next.users.unshift({ id, role: 'patient', firstName: record.firstName, lastName: record.lastName, email: record.email });
      return next;
    });
    return ok(created.patients[0]);
  }

  return ok(null);
};

const handleBlogRoutes = ({ segments, method, data, params }) => {
  if (method === 'GET' && segments.length === 1) {
    const db = getLocalDb();
    return withPagination(db.blogs, params);
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(findOne(getLocalDb().blogs, id));
    if (method === 'PATCH') {
      updateLocalDb((next) => {
        const index = next.blogs.findIndex((item) => item.id === id);
        if (index >= 0) next.blogs[index] = { ...next.blogs[index], ...data, updatedAt: nowIso() };
        return next;
      });
      return ok(findOne(getLocalDb().blogs, id));
    }
    if (method === 'DELETE') {
      updateLocalDb((next) => {
        next.blogs = next.blogs.filter((item) => item.id !== id);
        return next;
      });
      return ok({ deleted: true });
    }
  }

  if (method === 'POST') {
    const created = updateLocalDb((next) => {
      const record = { id: makeId('blog'), createdAt: nowIso(), updatedAt: nowIso(), ...data };
      next.blogs.unshift(record);
      return next;
    });
    return ok(created.blogs[0]);
  }

  return ok(null);
};

const handleFavouriteRoutes = ({ segments, method, data, headers }) => {
  const auth = getAuthUser(headers);
  const userId = auth?.userId || auth?.id || 'patient-1';
  const db = getLocalDb();

  if (method === 'GET') {
    const favs = db.favourites.filter((item) => item.patientId === userId).map((item) => ({ ...item, doctor: findOne(db.doctors, item.doctorId) }));
    return ok(favs);
  }

  if (segments[1] === 'add' && method === 'POST') {
    updateLocalDb((next) => {
      const doctorId = data.doctorId;
      const exists = next.favourites.some((item) => item.patientId === userId && item.doctorId === doctorId);
      if (!exists) {
        next.favourites.unshift({ id: makeId('favourite'), patientId: userId, doctorId });
      }
      return next;
    });
    return ok({ success: true });
  }

  if (segments[1] === 'remove' && method === 'POST') {
    updateLocalDb((next) => {
      next.favourites = next.favourites.filter((item) => !(item.patientId === userId && item.doctorId === data.doctorId));
      return next;
    });
    return ok({ success: true });
  }

  return ok(null);
};

const handleTimeSlotRoutes = ({ segments, method, data, params, headers }) => {
  const db = getLocalDb();
  const auth = getAuthUser(headers);
  const doctorId = auth?.role === 'doctor' ? auth?.userId : params?.id || data?.doctorId || auth?.userId;

  if (method === 'GET' && segments.length === 1) {
    return ok(db.timeSlots);
  }

  if (segments[1] === 'appointment-time' && method === 'GET') {
    const targetDoctorId = segments[2] || doctorId;
    const day = String(params?.day || '').toLowerCase();
    const slots = db.timeSlots.filter((slot) => slot.doctorId === targetDoctorId && String(slot.day || '').toLowerCase() === day)
      .map((slot) => ({ slot: { time: slot.startTime, endTime: slot.endTime }, ...slot }));
    return ok(slots);
  }

  if (segments[1] === 'my-slot' && method === 'GET') {
    return ok(db.timeSlots.filter((slot) => slot.doctorId === doctorId));
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(findOne(db.timeSlots, id));
    if (method === 'PATCH') {
      updateLocalDb((next) => {
        const index = next.timeSlots.findIndex((item) => item.id === id);
        if (index >= 0) next.timeSlots[index] = { ...next.timeSlots[index], ...data, updatedAt: nowIso() };
        return next;
      });
      return ok(findOne(getLocalDb().timeSlots, id));
    }
    if (method === 'DELETE') {
      updateLocalDb((next) => {
        next.timeSlots = next.timeSlots.filter((item) => item.id !== id);
        return next;
      });
      return ok({ deleted: true });
    }
  }

  if (segments[1] === 'create' && method === 'POST') {
    const created = updateLocalDb((next) => {
      const record = { id: makeId('timeslot'), createdAt: nowIso(), updatedAt: nowIso(), ...data };
      next.timeSlots.unshift(record);
      return next;
    });
    return ok(created.timeSlots[0]);
  }

  return ok(null);
};

const handleReviewRoutes = ({ segments, method, data, params, headers }) => {
  const db = getLocalDb();
  const auth = getAuthUser(headers);
  const userId = auth?.userId || auth?.id || 'patient-1';

  if (method === 'GET' && segments.length === 1) {
    return withPagination(db.reviews, params);
  }

  if (segments[1] === 'doctor-review' && method === 'GET') {
    const doctorId = segments[2];
    return ok(db.reviews.filter((review) => review.doctorId === doctorId));
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(findOne(db.reviews, id));
    if (method === 'PATCH') {
      updateLocalDb((next) => {
        const index = next.reviews.findIndex((item) => item.id === id);
        if (index >= 0) next.reviews[index] = { ...next.reviews[index], ...data, updatedAt: nowIso() };
        return next;
      });
      return ok(findOne(getLocalDb().reviews, id));
    }
    if (method === 'DELETE') {
      updateLocalDb((next) => {
        next.reviews = next.reviews.filter((item) => item.id !== id);
        return next;
      });
      return ok({ deleted: true });
    }
    if (segments[2] === 'reply' && method === 'PATCH') {
      updateLocalDb((next) => {
        const index = next.reviews.findIndex((item) => item.id === id);
        if (index >= 0) next.reviews[index] = { ...next.reviews[index], response: data.response || data.reply || '', updatedAt: nowIso() };
        return next;
      });
      return ok(findOne(getLocalDb().reviews, id));
    }
  }

  if (method === 'POST') {
    const created = updateLocalDb((next) => {
      const doctor = next.doctors[0] || null;
      const patient = next.patients.find((item) => item.id === userId) || next.patients[0] || null;
      const record = {
        id: makeId('review'),
        doctorId: data.doctorId || doctor?.id,
        patientId: userId,
        description: data.description || '',
        star: data.star || '5',
        isRecommended: data.isRecommended ?? true,
        response: '',
        createdAt: nowIso(),
        updatedAt: nowIso(),
        doctor,
        patient,
      };
      next.reviews.unshift(record);
      return next;
    });
    return ok(created.reviews[0]);
  }

  return ok(null);
};

const handlePrescriptionRoutes = ({ segments, method, data, headers }) => {
  const db = getLocalDb();
  const auth = getAuthUser(headers);
  const userId = auth?.userId || auth?.id || 'patient-1';
  const role = auth?.role || 'patient';

  if (method === 'GET' && segments.length === 1) {
    return ok(db.prescriptions.map((item) => buildPrescription(item, db)));
  }

  if (segments[1] === 'doctor' && segments[2] === 'prescription' && method === 'GET') {
    const doctorId = role === 'doctor' ? userId : db.doctors[0]?.id;
    return ok(db.prescriptions.filter((item) => item.doctorId === doctorId).map((item) => buildPrescription(item, db)));
  }

  if (segments[1] === 'patient' && segments[2] === 'prescription' && method === 'GET') {
    const patientId = role === 'patient' ? userId : db.patients[0]?.id;
    return ok(db.prescriptions.filter((item) => item.patientId === patientId).map((item) => buildPrescription(item, db)));
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(buildPrescription(findOne(db.prescriptions, id), db));
    if (method === 'PATCH' && segments[2] !== 'update-prescription-appointment') {
      updateLocalDb((next) => {
        const index = next.prescriptions.findIndex((item) => item.id === id);
        if (index >= 0) next.prescriptions[index] = { ...next.prescriptions[index], ...data, updatedAt: nowIso() };
        return next;
      });
      return ok(buildPrescription(findOne(getLocalDb().prescriptions, id), getLocalDb()));
    }
    if (method === 'DELETE') {
      updateLocalDb((next) => {
        next.prescriptions = next.prescriptions.filter((item) => item.id !== id);
        return next;
      });
      return ok({ deleted: true });
    }
  }

  if (segments[1] === 'create' && method === 'POST') {
    const created = updateLocalDb((next) => {
      const appointment = buildAppointment(findOne(next.appointments, data.appointmentId) || {}, next);
      const record = {
        id: makeId('prescription'),
        doctorId: data.doctorId || appointment.doctorId || next.doctors[0]?.id,
        patientId: data.patientId || appointment.patientId || userId,
        appointmentId: data.appointmentId,
        followUpdate: data.followUpdate || null,
        instruction: data.instruction || '',
        isFullfilled: false,
        isArchived: false,
        daignosis: data.daignosis || data.diagnosis || '',
        disease: data.disease || '',
        medicines: data.medicines || [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
        doctor: findOne(next.doctors, data.doctorId || appointment.doctorId),
        patient: findOne(next.patients, data.patientId || appointment.patientId),
        appointment,
      };
      next.prescriptions.unshift(record);
      return next;
    });
    return ok(buildPrescription(created.prescriptions[0], created));
  }

  if (segments[1] === 'update-prescription-appointment' && method === 'PATCH') {
    return ok({ success: true });
  }

  return ok(null);
};

const handleAppointmentRoutes = ({ segments, method, data, params, headers }) => {
  const db = getLocalDb();
  const auth = getAuthUser(headers);
  const currentDoctorId = auth?.role === 'doctor' ? auth?.userId : db.doctors[0]?.id;
  const currentPatientId = auth?.role === 'patient' ? auth?.userId : db.patients[0]?.id;

  const listAppointments = (items) => items.map((item) => buildAppointment(item, db));

  if (method === 'GET' && segments.length === 1) {
    return ok(listAppointments(db.appointments));
  }

  if (segments[1] === 'patient' && segments[2] === 'appointments' && method === 'GET') {
    return ok(listAppointments(db.appointments.filter((item) => item.patientId === currentPatientId)));
  }

  if (segments[1] === 'doctor' && segments[2] === 'appointments' && method === 'GET') {
    const appointments = db.appointments.filter((item) => item.doctorId === currentDoctorId);
    const sortBy = params?.sortBy;
    if (sortBy === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      return ok(listAppointments(appointments.filter((item) => String(item.scheduleDate).startsWith(today))));
    }
    if (sortBy === 'upcoming') {
      const today = new Date().toISOString();
      return ok(listAppointments(appointments.filter((item) => new Date(item.scheduleDate).toISOString() >= today)));
    }
    return ok(listAppointments(appointments));
  }

  if (segments[1] === 'doctor' && segments[2] === 'patients' && method === 'GET') {
    const patientIds = [...new Set(db.appointments.filter((item) => item.doctorId === currentDoctorId).map((item) => item.patientId))];
    return ok(db.patients.filter((item) => patientIds.includes(item.id)));
  }

  if (segments[1] === 'patient' && segments[2] === 'invoices' && method === 'GET') {
    return ok(db.appointments.filter((item) => item.patientId === currentPatientId).map((item) => buildInvoice(buildAppointment(item, db))));
  }

  if (segments[1] === 'doctor' && segments[2] === 'invoices' && method === 'GET') {
    return ok(db.appointments.filter((item) => item.doctorId === currentDoctorId).map((item) => buildInvoice(buildAppointment(item, db))));
  }

  if (segments[1] === 'patient-payment-info' && method === 'GET') {
    const appointmentId = segments[2];
    const appointment = buildAppointment(findOne(db.appointments, appointmentId), db);
    if (!appointment?.id) return ok(null);
    return ok(buildInvoice(appointment));
  }

  if (segments[1] === 'tracking' && method === 'POST') {
    const lookupValue = String(data?.trackingId || data?.id || '').trim();
    const appointment = db.appointments.find(
      (item) => item.trackingId === lookupValue || item.id === lookupValue
    );
    return ok(appointment ? buildAppointment(appointment, db) : null);
  }

  if (segments[1] === 'create' && method === 'POST') {
    const created = updateLocalDb((next) => {
      const doctor = next.doctors.find((item) => item.id === data.patientInfo?.doctorId) || next.doctors[0] || null;
      const patient =
        data.patientInfo?.patientId && next.patients.find((item) => item.id === data.patientInfo.patientId)
          ? next.patients.find((item) => item.id === data.patientInfo.patientId)
          : next.patients[0] || null;
      const appointment = {
        id: makeId('appointment'),
        trackingId: `TRK-${String(Date.now()).slice(-6)}`,
        doctorId: doctor?.id,
        patientId: patient?.id,
        firstName: data.patientInfo?.firstName || patient?.firstName || '',
        lastName: data.patientInfo?.lastName || patient?.lastName || '',
        email: data.patientInfo?.email || patient?.email || '',
        phone: data.patientInfo?.phone || patient?.mobile || '',
        address: data.patientInfo?.address || patient?.address || '',
        description: data.patientInfo?.description || '',
        scheduleDate: data.patientInfo?.scheduleDate || nowIso().slice(0, 10),
        scheduleTime: data.patientInfo?.scheduleTime || '10:00 AM',
        reasonForVisit: data.patientInfo?.reasonForVisit || '',
        status: 'pending',
        paymentStatus: 'unpaid',
        prescriptionStatus: 'notIssued',
        patientType: 'patient',
        paymentMethod: data.payment?.paymentMethod || 'paypal',
        paymentType: data.payment?.paymentType || 'creditCard',
        DoctorFee: 500,
        bookingFee: 0,
        vat: 0,
        totalAmount: 500,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        doctor,
        patient,
        prescription: [],
        payment: [],
      };
      next.appointments.unshift(appointment);
      return next;
    });
    return ok(buildAppointment(created.appointments[0], created));
  }

  if (segments[1] === 'create-un-authenticate' && method === 'POST') {
    return handleAppointmentRoutes({ segments: ['appointment', 'create'], method: 'POST', data, params, headers });
  }

  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(buildAppointment(findOne(db.appointments, id), db));
    if (method === 'PATCH') {
      const patchData = { ...data };
      if (patchData.status === 'approved') {
        patchData.status = 'scheduled';
      }
      updateLocalDb((next) => {
        const index = next.appointments.findIndex((item) => item.id === id);
        if (index >= 0) next.appointments[index] = { ...next.appointments[index], ...patchData, updatedAt: nowIso() };
        return next;
      });
      return ok(buildAppointment(findOne(getLocalDb().appointments, id), getLocalDb()));
    }
  }

  return ok(null);
};

const handleAdminRoutes = ({ segments }) => {
  if (segments[1] === 'stats') {
    const db = getLocalDb();
    return ok({
      totalDoctors: db.doctors.length,
      totalPatients: db.patients.length,
      totalAppointments: db.appointments.length,
      totalBlogs: db.blogs.length,
      totalReviews: db.reviews.length,
    });
  }
  return ok(null);
};

const handleAuthRoutes = ({ segments, method, data }) => {
  if (segments[1] === 'login' && method === 'POST') {
    const db = getLocalDb();
    const user = findUserRole(db, data?.email || 'patient@example.com');
    const payload = {
      userId: user.id,
      role: user.role || 'patient',
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isDemo: Boolean(user.isDemo),
    };
    return ok({ accessToken: createLocalAccessToken(payload), ...payload });
  }

  if (segments[1] === 'reset-password' && method === 'POST') {
    return ok({ message: 'Password reset email is not needed in local mode.' });
  }

  if (segments[1] === 'reset-password' && segments[2] === 'confirm' && method === 'POST') {
    return ok({ message: 'Password updated locally.' });
  }

  return ok(null);
};

const handleContactRoutes = ({ method }) => (method === 'POST' ? ok({ success: true }) : ok(null));

const handleMedicineRoutes = ({ segments, method, data }) => {
  const db = getLocalDb();
  if (method === 'POST') {
    updateLocalDb((next) => {
      next.medicines.unshift({ id: makeId('medicine'), ...data, createdAt: nowIso() });
      return next;
    });
    return ok({ success: true });
  }
  if (method === 'PATCH') return ok({ success: true });
  if (method === 'DELETE') return ok({ success: true });
  return ok(db.medicines);
};

const handleGenericCollection = ({ name, method, segments, data, params }) => {
  const db = getLocalDb();
  const collection = db[name];
  if (!Array.isArray(collection)) return ok(null);
  if (method === 'GET' && segments.length === 1) return ok(collection);
  if (segments.length >= 2) {
    const id = segments[1];
    if (method === 'GET') return ok(findOne(collection, id));
    if (method === 'PATCH') {
      updateLocalDb((next) => {
        const index = next[name].findIndex((item) => item.id === id);
        if (index >= 0) next[name][index] = { ...next[name][index], ...data, updatedAt: nowIso() };
        return next;
      });
      return ok(findOne(getLocalDb()[name], id));
    }
    if (method === 'DELETE') {
      updateLocalDb((next) => {
        next[name] = next[name].filter((item) => item.id !== id);
        return next;
      });
      return ok({ deleted: true });
    }
  }
  if (method === 'POST') {
    updateLocalDb((next) => {
      next[name].unshift({ id: makeId(name.slice(0, -1)), createdAt: nowIso(), updatedAt: nowIso(), ...data });
      return next;
    });
    return ok(getLocalDb()[name][0]);
  }
  return ok(collection);
};

export const localBaseQuery = () => async ({ url, method = 'GET', data, params, headers }) => {
  const path = String(url || '').replace(/^https?:\/\/[^/]+/i, '').replace(/^\/+/g, '');
  const cleaned = path.replace(/^api\/v1\/?/i, '').replace(/^v1\/?/i, '');
  const segments = cleaned.split('?')[0].split('/').filter(Boolean);
  const root = segments[0] || '';
  const methodName = String(method || 'GET').toUpperCase();
  const requestHeaders = { ...(headers || {}) };
  const accessToken = getFromLocalStorage(authKey);

  if (accessToken && !requestHeaders.Authorization && !requestHeaders.authorization) {
    requestHeaders.Authorization = accessToken;
  }

  try {
    if (!root) return ok(null);
    if (root === 'auth') return handleAuthRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'doctor') return handleDoctorRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'patient') return handlePatientRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'blogs') return handleBlogRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'favourite') return handleFavouriteRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'timeslot') return handleTimeSlotRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'review') return handleReviewRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'prescription') return handlePrescriptionRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'appointment') return handleAppointmentRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'admin') return handleAdminRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'contact') return handleContactRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'medicine') return handleMedicineRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    if (root === 'patient') return handlePatientRoutes({ segments, method: methodName, data, params, headers: requestHeaders });
    return handleGenericCollection({ name: root, method: methodName, segments, data, params, headers: requestHeaders });
  } catch (error) {
    return { error: { status: 500, data: error?.message || 'Local request failed' } };
  }
};
