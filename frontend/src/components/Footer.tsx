import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  return (
    <footer className="bg-organic-light pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-organic-dark">Uttaranjali Organics</h3>
            <p className="text-organic-secondary">Your trusted source for fresh, organic, and sustainable products.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-organic-primary hover:text-organic-dark transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-organic-primary hover:text-organic-dark transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-organic-primary hover:text-organic-dark transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-organic-dark">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-organic-dark">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=fruits" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Fresh Fruits
                </Link>
              </li>
              <li>
                <Link to="/products?category=vegetables" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=pantry" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Pantry Essentials
                </Link>
              </li>
              <li>
                <Link to="/products?category=grains" className="text-organic-secondary hover:text-organic-primary transition-colors">
                  Grains & Cereals
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-organic-dark">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="text-organic-primary flex-shrink-0 mt-0.5" />
                <span className="text-organic-secondary">123 Organic Lane, Green Valley, CA 94123</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="text-organic-primary" />
                <span className="text-organic-secondary">(555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="text-organic-primary" />
                <span className="text-organic-secondary">hello@uttaranjaliorganics.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6 bg-organic-secondary/20" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-organic-secondary">
          <p>© {new Date().getFullYear()} Uttaranjali Organics. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <Link to="/privacy" className="hover:text-organic-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-organic-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;