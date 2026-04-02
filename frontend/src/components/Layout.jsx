import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 font-sans antialiased">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; 2026 Web3 Voting - Built with React & Hardhat
      </footer>
    </div>
  );
};

export default Layout;
