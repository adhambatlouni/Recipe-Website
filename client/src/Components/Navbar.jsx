import React from 'react';
import { Link } from 'react-router-dom';

// Navbar component
const Navbar = ({ links }) => {
  return (
    <nav className="main-nav">
      <ul className="main-nav-list flex">
        {links.map((link, index) => (
          <Link key={index} to={link.to} className={`link main-nav-link ${link.active ? 'active' : ''}`}>
            {link.label}
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
