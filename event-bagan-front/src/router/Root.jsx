import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

const Root = () => {
  return (
    <div>
      <div className="sticky top-0 z-50"><Navbar></Navbar></div>
      <div className="min-h-[calc(100vh-493px)]">
        <Outlet />
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Root;