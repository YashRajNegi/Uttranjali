import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import aboutImg from '@/assets/about.jpg'; // Use a local image or update path as needed

const Home = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const { scrollY } = useScroll();
  // Parallax for the floating leaf: moves slower than scroll
  const leafY = useTransform(scrollY, [0, 400], [0, 80]);
  // Parallax for feature cards
  const card1Y = useTransform(scrollY, [0, 400], [0, 0]);
  const card2Y = useTransform(scrollY, [0, 400], [0, 30]);
  const card3Y = useTransform(scrollY, [0, 400], [0, 60]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section ref={heroRef} className="bg-organic-primary text-white py-20 overflow-hidden relative">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl font-bold mb-4"
          >
            Welcome to Earth Eats Market
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-xl md:text-2xl mb-8"
          >
            Discover the finest organic products
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            <Link
              to="/products"
              className="bg-white text-organic-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
        {/* Parallax floating leaf (decorative) */}
        <motion.div
          className="absolute left-0 top-0 w-32 h-32 opacity-20 pointer-events-none"
          style={{ y: leafY }}
          initial={{ x: -60, rotate: -10 }}
          animate={{ x: 40, rotate: 10 }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <Leaf className="w-full h-full text-white" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl font-bold text-center mb-12"
          >
            Why Shop With Us?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
              icon: <Leaf className="text-organic-primary h-7 w-7" />, title: "100% Organic", desc: "All our products are certified organic, free from harmful pesticides and chemicals."
            }, {
              icon: <Truck className="text-organic-primary h-7 w-7" />, title: "Free Delivery", desc: "Free shipping on all orders over ₹500. Fast and reliable delivery to your doorstep."
            }, {
              icon: <ShieldCheck className="text-organic-primary h-7 w-7" />, title: "Quality Guarantee", desc: "We stand by the quality of our products. Not satisfied? We'll make it right."
            }].map((feature, i) => {
              const cardY = i === 0 ? card1Y : i === 1 ? card2Y : card3Y;
              return (
                <motion.div
                  key={feature.title}
                  className="flex flex-col items-center text-center p-6 organic-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, delay: i * 0.2, ease: "easeOut" }}
                  style={{ y: cardY }}
                >
                  <div className="w-14 h-14 rounded-full bg-organic-primary/10 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section (Sample) */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="md:w-1/2 w-full"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img src={aboutImg} alt="About Earth Eats Market" className="rounded-xl shadow-lg w-full object-cover" />
          </motion.div>
          <motion.div
            className="md:w-1/2 w-full"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-4">
              At Earth Eats Market, we are passionate about bringing you the best organic products directly from local farmers and artisans. Our mission is to make healthy, sustainable living accessible to everyone.
            </p>
            <p className="text-lg text-muted-foreground">
              Join us on our journey to a greener, healthier planet—one product at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer with animation */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Footer />
      </motion.div>
    </div>
  );
};

export default Home; 