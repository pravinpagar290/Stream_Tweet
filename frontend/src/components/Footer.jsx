import React from "react";

function Footer() {
  return (
    <footer className="glass-effect text-gray-400 p-6 mt-8 border-t border-gray-800 animate-fade-in">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()}{" "}
          <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent font-semibold">
            StreamTweet
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
