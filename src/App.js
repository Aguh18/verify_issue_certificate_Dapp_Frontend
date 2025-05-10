import React, { useEffect } from 'react';
import AOS from 'aos';
import "aos/dist/aos.css";
import './index.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
// All pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Root from './pages/Root';
import IssueCertificate from './pages/IssueCertificate';
import Submit from './pages/Submit';
import VerifyCertificate from './pages/VerifyCertificate';



function App() {
  useEffect(() => {
    const aos_init = () => {
      AOS.init({
        once: true,
        duration: 1000,
        easing: 'ease-out-cubic',
      });
    }

    window.addEventListener('load', () => {
      aos_init();
    });
  }, []);


  return (
    <main className=' '>
      <Router>

        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Root />}>

            <Route path="/dashboard" index element={<Dashboard />} />
            <Route path="certificates" />
            <Route path="issue-certificate" element={<IssueCertificate />} />
            <Route path="issue-certificate/submit" element={<Submit />} />
            <Route path="upload-template" />
            <Route path="verify-certificate" element={<VerifyCertificate />} />
            <Route path="activity-log" />
            <Route path="settings" />
          </Route>

        </Routes>

      </Router>
    </main>
  );
}


export default App;
