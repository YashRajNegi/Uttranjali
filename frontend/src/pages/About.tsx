import React from 'react';
import { Leaf, Users, ShieldCheck, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 bg-background py-8">
        {/* Hero Section */}
        <section className="bg-organic-light py-16 md:py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
              <p className="text-lg text-muted-foreground">
                At Uttranjali, we're passionate about providing the highest quality organic products 
                that nourish both people and the planet.
              </p>
            </div>
          </div>
        </section>
        
        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800" 
                  alt="Organic farm"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Our Mission</h2>
                <p className="text-muted-foreground">
                  Founded in 2015 by a group of passionate organic farmers, Uttranjali began with a simple mission: 
                  to make organic, sustainably-produced food accessible to everyone while supporting local farmers and 
                  producers who prioritize environmental stewardship.
                </p>
                <p className="text-muted-foreground">
                  We believe that what we eat matters – not just for our personal health, but for the health of our 
                  communities, farmworkers, and the planet. Every product in our store is carefully selected to meet 
                  our rigorous standards for quality, sustainability, and ethical production.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <section className="py-16 bg-background">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-12">Our Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="organic-card p-6">
                <div className="w-14 h-14 rounded-full bg-organic-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="text-organic-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
                <p className="text-muted-foreground">
                  We're committed to environmentally responsible practices in everything we do, from the farms we work with to our packaging.
                </p>
              </div>
              
              <div className="organic-card p-6">
                <div className="w-14 h-14 rounded-full bg-organic-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="text-organic-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community</h3>
                <p className="text-muted-foreground">
                  We foster strong relationships with our farmers, producers, customers, and the communities in which we operate.
                </p>
              </div>
              
              <div className="organic-card p-6">
                <div className="w-14 h-14 rounded-full bg-organic-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="text-organic-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Quality</h3>
                <p className="text-muted-foreground">
                  We never compromise on the quality of our products. Everything we sell meets the highest standards for organic certification.
                </p>
              </div>
              
              <div className="organic-card p-6">
                <div className="w-14 h-14 rounded-full bg-organic-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-organic-primary h-7 w-7" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Health</h3>
                <p className="text-muted-foreground">
                  We believe that good food is the foundation of good health, and we're dedicated to helping people eat better.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="organic-card overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400" 
                  alt="John Doe - Founder"
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">John Doe</h3>
                  <p className="text-organic-primary mb-3">Founder & CEO</p>
                  <p className="text-muted-foreground">
                    John's passion for organic farming began on his family's farm. He founded Uttranjali to share his love for sustainable agriculture.
                  </p>
                </div>
              </div>
              
              <div className="organic-card overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400" 
                  alt="Jane Smith - Head of Sourcing"
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">Jane Smith</h3>
                  <p className="text-organic-primary mb-3">Head of Sourcing</p>
                  <p className="text-muted-foreground">
                    With 15 years of experience in sustainable agriculture, Jane ensures all our products meet our rigorous quality standards.
                  </p>
                </div>
              </div>
              
              <div className="organic-card overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400" 
                  alt="Michael Johnson - Community Manager"
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">Michael Johnson</h3>
                  <p className="text-organic-primary mb-3">Community Manager</p>
                  <p className="text-muted-foreground">
                    Michael builds relationships with local farmers and producers, ensuring our supply chain remains ethical and sustainable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-organic-primary text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Organic Movement</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Discover the difference that organic, sustainably-produced food can make in your life and for our planet.
            </p>
            <a 
              href="/products" 
              className="inline-block bg-white text-organic-primary hover:bg-organic-light px-8 py-3 rounded-md font-medium transition-colors"
            >
              Shop Now
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
