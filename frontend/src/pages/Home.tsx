import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import aboutImg from '@/assets/about.jpg'; // Use a local image or update path as needed

const Home = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom">
          {/* Hero Section */}
          <section className="bg-organic-primary text-white py-12 md:py-20 overflow-hidden relative">
            <div className="container mx-auto px-4 max-w-2xl md:max-w-4xl">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center ">
                Welcome to Uttranjali
              </h1>
              <p className="text-base sm:text-lg md:text-2xl mb-8 text-center ">
                Discover the finest organic products
              </p>
              <div className=" ">
                <Link
                  to="/products"
                  className="block w-full sm:w-auto bg-white text-organic-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg text-center"
                >
                  Shop Now
                </Link>
              </div>
            </div>
            {/* Floating leaf (decorative) */}
            <div className="absolute left-0 top-0 w-32 h-32 opacity-20 pointer-events-none ">
              <Leaf className="w-full h-full text-white" />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-10 md:py-16 bg-white">
            <div className="container mx-auto px-2 sm:px-4 max-w-2xl md:max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12 ">
                Why Shop With Us?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    icon: <Leaf className="text-organic-primary h-7 w-7" />, title: "100% Organic", desc: "All our products are certified organic, free from harmful pesticides and chemicals."
                  },
                  {
                    icon: <Truck className="text-organic-primary h-7 w-7" />, title: "Free Delivery", desc: "Free shipping on all orders over â‚¹500. Fast and reliable delivery to your doorstep."
                  },
                  {
                    icon: <ShieldCheck className="text-organic-primary h-7 w-7" />, title: "Quality Guarantee", desc: "We stand by the quality of our products. Not satisfied? We'll make it right."
                  }
                ].map((feature, i) => (
                  <div
                    key={feature.title}
                    className="flex flex-col items-center text-center p-4 sm:p-6 organic-card "
                  >
                    <div className="w-14 h-14 rounded-full bg-organic-primary/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About Section (Sample) */}
          <section className="py-10 md:py-20 bg-gray-50">
            <div className="container mx-auto px-2 sm:px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12 max-w-2xl md:max-w-4xl">
              <div className="md:w-1/2 w-full mb-6 md:mb-0 ">
                <img src={aboutImg} alt="About Uttranjali" className="rounded-xl shadow-lg w-full object-cover max-h-60 sm:max-h-80 md:max-h-96" />
              </div>
              <div className="md:w-1/2 w-full ">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Story</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-4">
                  At Uttranjali, we are passionate about bringing you the best organic products directly from local farmers and artisans. Our mission is to make healthy, sustainable living accessible to everyone.
                </p>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Join us on our journey to a greener, healthier planetâ€”one product at a time.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer className=" " />
    </div>
  );
};

export default Home;