import React from "react";

function Footer() {
  return (
    <footer className="glass-effect text-gray-400 p-6 mt-8 border-t border-gray-800 animate-fade-in relative z-10">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()}{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-bold">
            StreamTweet
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
