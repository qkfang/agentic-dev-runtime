import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ScopeList from './components/ScopeList';
import ScopeDetail from './components/ScopeDetail';
import BootstrapForm from './components/BootstrapForm';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scopes" element={<ScopeList />} />
            <Route path="/scopes/:id" element={<ScopeDetail />} />
            <Route path="/bootstrap" element={<BootstrapForm />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
