// src/components/AccessRequest.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';

const AccessRequest = ({ onAccessGranted }) => {
  const [email, setEmail] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [granted, setGranted] = useState(false);

  const navigate = useNavigate();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.endsWith('@avocarbon.com');


  const requestApproval = async () => {
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email avocarbon address.');
      return;
    }

    try {
      await axios.post('https://compt-back.azurewebsites.net/companies/request-approval', {
        userEmail: email,
        type: 'access',
      });
      localStorage.setItem('email', email);
      setWaiting(true);
    } catch (err) {
      console.error('Error requesting approval:', err);
      setError('Error sending approval request.');
    }
  };

  useEffect(() => {
    let interval;

    if (waiting) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`https://compt-back.azurewebsites.net/companies/approval-status/${email}/access`);
          if (res.data.status === 'approved') {
            clearInterval(interval);
            setWaiting(false);
            setGranted(true);
            onAccessGranted(email); // ✅ This is the missing piece
          }
        } catch (err) {
          console.error('Error checking status:', err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [waiting, email, onAccessGranted]);

return (
  <div style={{ padding: 30, textAlign: 'center' }}>
    <h2>Request Access to Competitor Portal</h2>

    <Input
      placeholder="Enter your email"
      value={email}
      onChange={(e) => {
        setEmail(e.target.value);
        setError('');
      }}
      style={{ maxWidth: 400, marginBottom: 10 }}
    />
    <br />

    {/* Buttons in the same row */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: 10 }}>
       {!granted && (
      <Button type="primary" onClick={requestApproval} disabled={waiting}>
        Request Access
      </Button>
       )}
      {granted && (
        <Button type="primary" onClick={() => navigate('/form')}>
          Go to Details
        </Button>
      )}
    </div>

    {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

    {waiting && (
      <div style={{ marginTop: 20 }}>
        <Spin /> Waiting for admin approval...
      </div>
    )}
  </div>
);

};

export default AccessRequest;
