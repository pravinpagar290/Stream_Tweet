import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import UploadProgress from "./UploadProgress";

function Layout() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Header />

      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <Footer />
      <UploadProgress />
    </div>
  );
}

export default Layout;
