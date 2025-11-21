import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Adjust path if needed
import Footer from './Footer'; // Adjust path if needed

function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />
      
      {/* This <main> tag will grow to fill the space */}
      <main className="flex-grow container mx-auto p-4">
        {/* The <Outlet /> is where your pages (Home, VideoDetail, etc.) will be rendered */}
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}

export default Layout;