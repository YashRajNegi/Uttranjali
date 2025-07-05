import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Banner from '@/components/Banner';
import ProductCard from '@/components/ProductCard';
import FloatingActionButton from '@/components/ui/floating-action-button';
import ScrollToTop from '@/components/ui/scroll-to-top';
import Loading from '@/components/ui/loading';
import { productAPI } from '@/services/api';
import type { Product } from '@/services/api';

const Index = () => {
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts();
        const allProducts = response.data;

        // Sort products by rating and get top 8
        const bestSelling = [...allProducts]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);

        setBestSellingProducts(bestSelling);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-background py-8 pt-24">
          <div className="container-custom">
            <div className="flex items-center justify-center h-64">
              <Loading size="lg" text="Loading products..." />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Navbar />
      
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <Banner />
        
        {/* Best Selling Products Section */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <motion.div 
              className="flex flex-col md:flex-row justify-between items-center mb-10"
              variants={itemVariants}
            >
              <div>
                <span className="text-organic-primary font-medium">Our Most Popular Products</span>
                <h2 className="text-3xl font-bold mt-2">Best Selling Products</h2>
              </div>
              <motion.div
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  to="/products"
                  className="group flex items-center gap-2 text-organic-primary hover:text-organic-dark transition-colors mt-4 md:mt-0"
                >
                  View All Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>
            
            {error ? (
              <motion.div 
                className="text-center py-12"
                variants={itemVariants}
              >
                <h3 className="text-xl font-medium text-red-600 mb-2">{error}</h3>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={itemVariants}
              >
                {bestSellingProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      y: -5,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                  >
                    <ProductCard product={product} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <motion.section 
          className="py-16 bg-organic-primary text-white"
          variants={itemVariants}
        >
          <div className="container-custom text-center">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Ready to Eat Healthy & Feel Great?
            </motion.h2>
            <motion.p 
              className="text-lg max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Join thousands of happy customers who have made the switch to organic, sustainable food.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Button 
                className="bg-white text-organic-primary hover:bg-organic-light px-8 py-6 text-lg"
                asChild
              >
                <Link to="/products">Shop Now</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>
      </main>
      
      <Footer />
      <FloatingActionButton />
      <ScrollToTop />
    </motion.div>
  );
};

export default Index;
