import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserInfo } from '../../service/auth.service';
import { createLocalAccessToken } from '../../helpers/local/localAuth';

export default function SimpleSignIn() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('patient');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a minimal payload — adjust fields as needed by the app
    const roleUserIds = {
      patient: 'patient-1',
      doctor: 'doctor-1',
      admin: 'admin-1',
    };

    const payload = {
      userId: roleUserIds[role] || 'patient-1',
      email,
      role,
      name: email.split('@')[0],
      firstName: email.split('@')[0],
      lastName: 'User',
      isDemo: false,
    };

    const fakeToken = createLocalAccessToken(payload);
    setUserInfo({ accessToken: fakeToken });
    const destination = role === 'doctor' ? '/dashboard' : role === 'admin' ? '/admin/dashboard' : '/';
    navigate(destination, { replace: true });
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, border: '1px solid #eee', borderRadius: 6 }}>
      <h3>Simple Sign In (Local only)</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Role</label>
          <select
            value={role}
            onChange={(e) => {
              const nextRole = e.target.value;
              setRole(nextRole);
              const defaults = {
                patient: 'patient@example.com',
                doctor: 'doctor@example.com',
                admin: 'admin@example.com',
              };
              setEmail(defaults[nextRole] || 'user@example.com');
            }}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px' }}>Sign in (local)</button>
        </div>
      </form>
      <p style={{ marginTop: 12, color: '#666' }}>This signs you in locally without contacting any API.</p>
    </div>
  );
}
