import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import UploadProgress from "./UploadProgress";

function Layout() {
  return (
    <div className="flex flex-col min-h-screen text-white">
      <Header />

      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      <Footer />
      <UploadProgress />
    </div>
  );
}

export default Layout;
