import React from "react";

function Footer() {
  return (
    <footer
      className="py-6 mt-8 animate-fade-in"
      style={{
        borderTop: "1px solid var(--border-primary)",
        color: "var(--text-tertiary)",
      }}
    >
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            StreamTweet
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
