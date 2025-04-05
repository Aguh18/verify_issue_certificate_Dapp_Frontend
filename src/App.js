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
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path="/login" element={<Login />} />

        </Routes>

      </Router>
    </main>
  );
}


export default App;
