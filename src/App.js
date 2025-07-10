import React, { useState, useEffect } from 'react';
import './App.css';
import Form from './Component/form';
import Homepage from './Homepage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Map from './Component/map';
import AccessRequest from './Component/AccessRequest'; // Ce composant doit exister
import Navbar from './Components/Navbar';

function App() {
  const [accessGranted, setAccessGranted] = useState(null); // null = chargement en cours
  const [userEmail, setUserEmail] = useState('');

useEffect(() => {
  const granted = localStorage.getItem('accessGranted');
  const email = localStorage.getItem('userEmail');
  const grantedAt = localStorage.getItem('accessGrantedAt');

  if (granted === 'true' && email && grantedAt) {
    const now = Date.now();
    const grantedTime = parseInt(grantedAt, 10);

    const hoursPassed = (now - grantedTime) / (1000 * 60 * 60);

    if (hoursPassed < 24) {
      setAccessGranted(true);
      setUserEmail(email);
    } else {
      // ❌ Access expired — clean up
      localStorage.removeItem('accessGranted');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('accessGrantedAt');
      setAccessGranted(false);
    }
  } else {
    setAccessGranted(false);
  }
}, []);



const handleAccessGranted = (email) => {
  const now = Date.now(); // ✅ store timestamp
  setAccessGranted(true);
  setUserEmail(email);
  localStorage.setItem('accessGranted', 'true');
  localStorage.setItem('userEmail', email);
  localStorage.setItem('accessGrantedAt', now.toString()); // For 24h expiry
};


  // Pendant chargement de localStorage, ne rien afficher
  if (accessGranted === null) {
    return <div style={{ textAlign: 'center', marginTop: '40px' }}>Loading...</div>;
  }

  return (
    <div className="App">
      <Router>
          <Navbar accessGranted={accessGranted} userEmail={userEmail} />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/map" element={<Map />} />
          <Route
           path="/form"
           element={
           accessGranted ? (
           <Form onAccessGranted={handleAccessGranted} />
           ) : (
          <Navigate to="/access" replace />
            )
           }
          />
          <Route
            path="/access"
            element={<AccessRequest onAccessGranted={handleAccessGranted} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
