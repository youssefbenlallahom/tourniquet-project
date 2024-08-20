import React from 'react';
import Header from './components/dashboard/Header'; // Import your Header component
import './App.css'
const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

export default Layout;