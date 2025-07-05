import React from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    toast({
      title: "Message sent!",
      description: "We've received your message and will get back to you soon.",
    });
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom">
          {/* Hero Section */}
          <section className="bg-organic-light py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have questions, suggestions, or feedback? We'd love to hear from you! 
                Get in touch with our team using any of the methods below.
              </p>
            </div>
          </section>
          
          {/* Contact Info & Form Section */}
          <section className="py-16 bg-white">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-organic-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="text-organic-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">(555) 123-4567</p>
                      <p className="text-sm text-muted-foreground">Mon-Fri, 9am-6pm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-organic-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="text-organic-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">hello@eartheatsmarket.com</p>
                      <p className="text-sm text-muted-foreground">We'll respond as soon as possible</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-organic-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="text-organic-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Address</h3>
                      <p className="text-muted-foreground">123 Organic Lane</p>
                      <p className="text-muted-foreground">Green Valley, CA 94123</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-organic-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="text-organic-primary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Store Hours</h3>
                      <div className="text-muted-foreground">
                        <p>Monday - Friday: 9am - 8pm</p>
                        <p>Saturday: 9am - 6pm</p>
                        <p>Sunday: 10am - 5pm</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-organic-light rounded-lg">
                  <h3 className="font-semibold mb-2">Connect With Us</h3>
                  <p className="text-muted-foreground mb-4">
                    Follow us on social media for the latest updates, promotions, and organic living tips.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-organic-primary hover:text-organic-dark transition-colors">
                      Facebook
                    </a>
                    <a href="#" className="text-organic-primary hover:text-organic-dark transition-colors">
                      Instagram
                    </a>
                    <a href="#" className="text-organic-primary hover:text-organic-dark transition-colors">
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div>
                <div className="organic-card p-8">
                  <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" required />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={5} required />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-organic-primary hover:bg-organic-dark"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
          
          {/* Map Section - Placeholder */}
          <section className="py-8 bg-background">
            <div className="rounded-lg overflow-hidden h-[400px] flex items-center justify-center bg-muted/50 border">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Store Location</h3>
                <p className="text-muted-foreground">Map integration would be displayed here</p>
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section className="py-16 bg-white">
            <div className="container-custom">
              <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
              
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="organic-card p-6">
                  <h3 className="text-lg font-semibold mb-2">Do you offer delivery?</h3>
                  <p className="text-muted-foreground">
                    Yes, we offer delivery to all areas within a 15-mile radius of our store. 
                    Free delivery is available on orders over $50. For more details, please visit our delivery page.
                  </p>
                </div>
                
                <div className="organic-card p-6">
                  <h3 className="text-lg font-semibold mb-2">Are all your products organic?</h3>
                  <p className="text-muted-foreground">
                    Yes, all products we sell are certified organic. We work directly with farmers and producers 
                    who follow strict organic and sustainable practices.
                  </p>
                </div>
                
                <div className="organic-card p-6">
                  <h3 className="text-lg font-semibold mb-2">What is your return policy?</h3>
                  <p className="text-muted-foreground">
                    We stand by the quality of our products. If you're not satisfied with your purchase for any reason, 
                    you can return it within 7 days for a full refund or exchange.
                  </p>
                </div>
                
                <div className="organic-card p-6">
                  <h3 className="text-lg font-semibold mb-2">How do I know if a product is in stock?</h3>
                  <p className="text-muted-foreground">
                    Product availability is displayed on each product page. If an item is out of stock, 
                    you can sign up for notifications to be alerted when it's back in stock.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Contact;
