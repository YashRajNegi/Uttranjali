import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Banner from '@/components/Banner';
import ProductCard from '@/components/ProductCard';
import FloatingActionButton from '@/components/ui/floating-action-button';
import ScrollToTop from '@/components/ui/scroll-to-top';
import Loading from '@/components/ui/loading';
import { useTopProducts } from '@/hooks/useProducts';
import type { Product } from '@/services/api';

const Index = () => {
  const { data: topProducts, isLoading, error } = useTopProducts(8); // Get top 8 products

  if (isLoading) {
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <Banner />
        
        {/* Best Selling Products Section */}
        <section className="py-16 bg-background">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10">
              <div>
                <span className="text-organic-primary font-medium">Our Most Popular Products</span>
                <h2 className="text-3xl font-bold mt-2">Best Selling Products</h2>
              </div>
              <div className="mt-4 md:mt-0">
                <Link 
                  to="/products"
                  className="group flex items-center gap-2 text-organic-primary hover:text-organic-dark transition-colors"
                >
                  View All Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            
            {error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-red-600 mb-2">
                  {error.message || 'Failed to load products'}
                </h3>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topProducts?.map((product, index) => (
                  <div key={product._id}>
                    <ProductCard product={product} index={index} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-organic-primary text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Eat Healthy & Feel Great?
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-8">
              Join thousands of happy customers who have made the switch to organic, sustainable food.
            </p>
            <Button 
              className="bg-white text-organic-primary hover:bg-organic-light px-8 py-6 text-lg"
              asChild
            >
              <Link to="/products">Shop Now</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
      <FloatingActionButton />
      <ScrollToTop />
    </div>
  );
};

export default Index;
