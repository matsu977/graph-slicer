// components/Header.jsx
import React from 'react';

const Header = () => {


  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/dashboard" className="flex items-center">
              <img 
                src="/images/bunchi-logo.png" 
                alt="バンチカンリ" 
                className="h-10 w-auto mr-2"
              />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

// components/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; GraphSlicer. All rights reserved.</p>
    </footer>
  );
};

// components/Layout.jsx
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export { Header, Footer, Layout };