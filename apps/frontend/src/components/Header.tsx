import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">⚙</span>
        <span className="header-title">Control Plane</span>
      </div>
      <nav className="header-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/scopes"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Scopes
        </NavLink>
        <NavLink
          to="/bootstrap"
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          Bootstrap
        </NavLink>
      </nav>
    </header>
  );
};

export default Header;
