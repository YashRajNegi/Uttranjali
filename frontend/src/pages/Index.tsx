import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Banner from '@/components/Banner';
import ProductCard from '@/components/ProductCard';
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-background py-8 pt-24">
          <div className="container-custom">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
              <Link 
                to="/products"
                className="group flex items-center gap-2 text-organic-primary hover:text-organic-dark transition-colors mt-4 md:mt-0"
              >
                View All Products
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {error ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-red-600 mb-2">{error}</h3>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellingProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-organic-primary text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Eat Healthy & Feel Great?</h2>
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
    </div>
  );
};

export default Index;
