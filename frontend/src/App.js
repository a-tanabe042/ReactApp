import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import CodingInterface from './CodingInterface.jsx';
import './App.css';

function Selector() {
  const [selectedSandbox, setSelectedSandbox] = useState('javascript'); 
  const navigate = useNavigate();

  const handleButtonClick = (sandbox) => {
    setSelectedSandbox(sandbox);
    navigate('/coding-interface');
  }

  return (
    <div>
      <nav>
        <ul>
          <li>
            <button onClick={() => handleButtonClick('javascript')}>javascript Coding</button>
          </li>
          <li>
            <button onClick={() => handleButtonClick('react')}>react Coding</button>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/coding-interface" element={<CodingInterface sandbox={selectedSandbox} />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

function Home() {
  return <h2>Home Page</h2>;
  
}

function App() {
  return (
    <Router>
      <Selector />
    </Router>
  );
}

export default App;
