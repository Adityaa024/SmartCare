import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Avatar, Button, Empty, Spin, Tag, message } from 'antd';
import { FaUserMd, FaBriefcaseMedical } from 'react-icons/fa';
import { useGetDoctorsQuery } from '../../redux/api/doctorApi';
import { createLocalAccessToken } from '../../helpers/local/localAuth';
import { setUserInfo } from '../../service/auth.service';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetDoctorsQuery({ limit: 100 });
  const doctors = data?.doctors || [];

  const handleDoctorLogin = (doctor) => {
    const payload = {
      userId: doctor.id,
      role: 'doctor',
      email: doctor.email,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      isDemo: Boolean(doctor.isDemo),
    };

    setUserInfo({ accessToken: createLocalAccessToken(payload) });
    message.success(`Logged in as Dr. ${doctor.firstName} ${doctor.lastName}`);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ marginBottom: 8 }}>Doctor Login</h2>
          <p style={{ marginBottom: 0, color: '#666' }}>
            Choose your doctor account to sign in and view only your own patients and appointments.
          </p>
        </div>
        <Link to="/login">
          <Button>Back to login</Button>
        </Link>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Empty description="Unable to load doctor accounts" />
      ) : doctors.length === 0 ? (
        <Empty description="No doctors available yet" />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              bordered={false}
              style={{ borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              actions={[
                <Button type="primary" onClick={() => handleDoctorLogin(doctor)} key="login">
                  Login as doctor
                </Button>,
              ]}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Avatar size={72} src={doctor.img} icon={<FaUserMd />} />
                <div>
                  <h4 style={{ marginBottom: 4 }}>Dr. {doctor.firstName} {doctor.lastName}</h4>
                  <Tag color="blue" icon={<FaBriefcaseMedical />}>
                    {doctor.specialization || 'Doctor'}
                  </Tag>
                  <div style={{ marginTop: 8, color: '#666' }}>{doctor.email}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorLogin;
