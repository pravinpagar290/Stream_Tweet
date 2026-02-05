import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import gsap from "gsap";
import { CiMenuBurger } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";

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
        duration: 0.3,
        opacity: 1,
        pointerEvents: "auto",
        ease: "power2.out",
      })
        .to(
          sidebar,
          {
            duration: 0.6,
            x: "0%",
            ease: "power4.out",
          },
          "-=0.2",
        )
        .fromTo(
          links,
          {
            x: 50,
            opacity: 0,
          },
          {
            duration: 0.5,
            x: 0,
            opacity: 1,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.4",
        );
    } else {
      const tl = gsap.timeline();

      tl.to(sidebar, {
        duration: 0.5,
        x: "100%",
        ease: "power3.in",
      }).to(
        overlay,
        {
          duration: 0.3,
          opacity: 0,
          pointerEvents: "none",
          ease: "power2.in",
        },
        "-=0.3",
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 opacity-0 pointer-events-none"
      />

      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-64 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 transform translate-x-full"
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-xl font-bold bg-gradient-to-r bg-white bg-clip-text text-transparent">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose} // Close menu when link is clicked
              ref={(el) => (linksRef.current[index] = el)}
              className={({ isActive }) =>
                `relative px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 overflow-hidden group ${
                  isActive
                    ? " border border-gray-500"
                    : "text-gray-400 hover:text-white"
                }`
              }
            >
              {link.text}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-0 group-hover:w-full 
                           transition-all duration-500 ease-out origin-center"
                style={{
                  background:
                    "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000)",
                  backgroundSize: "200% 100%",
                  animation: "rgb-gradient 3s linear infinite",
                  boxShadow:
                    "0 0 8px rgba(255, 0, 255, 0.8), 0 0 15px rgba(0, 255, 255, 0.6), 0 0 25px rgba(138, 43, 226, 0.5)",
                  filter: "brightness(1.2)",
                }}
              />
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SideBar;
