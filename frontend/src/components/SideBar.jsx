import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import gsap from "gsap";

const SideBar = ({ isOpen, onClose }) => {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);
  const linksRef = useRef([]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const overlay = overlayRef.current;
    const links = linksRef.current;

    if (isOpen) {
      const tl = gsap.timeline();
      tl.to(overlay, {
        duration: 0.2,
        opacity: 1,
        pointerEvents: "auto",
        ease: "power2.out",
      })
        .to(sidebar, { duration: 0.3, x: "0%", ease: "power3.out" }, "-=0.1")
        .fromTo(
          links,
          { x: 30, opacity: 0 },
          { duration: 0.3, x: 0, opacity: 1, stagger: 0.04, ease: "power2.out" },
          "-=0.2",
        );
    } else {
      const tl = gsap.timeline();
      tl.to(sidebar, { duration: 0.25, x: "100%", ease: "power2.in" }).to(
        overlay,
        { duration: 0.2, opacity: 0, pointerEvents: "none", ease: "power2.in" },
        "-=0.15",
      );
    }
  }, [isOpen]);

  const navLinks = [
    { to: "/", text: "Home" },
    { to: "/upload", text: "Upload" },
    { to: "/history", text: "History" },
    { to: "/subscriptions", text: "Subscriptions" },
    { to: "/likedvideos", text: "Liked Videos" },
    { to: "/tweets", text: "Tweets" },
  ];

  return (
    <>
      <div
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-40 opacity-0 pointer-events-none"
        style={{ backgroundColor: "var(--bg-overlay)" }}
      />

      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-64 z-50 transform translate-x-full"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderLeft: "1px solid var(--border-primary)",
        }}
      >
        <div
          className="p-4 flex justify-between items-center"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Menu
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col p-3 gap-1">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              ref={(el) => (linksRef.current[index] = el)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "font-semibold" : ""
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              })}
            >
              {link.text}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SideBar;
