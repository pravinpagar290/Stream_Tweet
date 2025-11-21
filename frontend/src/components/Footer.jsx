import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-400 p-4 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} StreamTweet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;