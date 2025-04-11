import React from 'react';
import './App.css'
const Layout = ({ children }) => {
  return (
    <>
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

export default Layout;