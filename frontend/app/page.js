
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <div className="container-custom py-16">
          <h1 className="text-4xl font-bold text-center mb-4">
            Welcome to Uttaranjali Organics
          </h1>
          <p className="text-center text-lg mb-8">
            Your trusted source for premium organic products
          </p>
          
          {/* Add more content here */}
        </div>
      </main>
      <Footer />
    </>
  );
}
