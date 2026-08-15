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
            <h3 className="text-xl font-bold text-organic-dark">
              Uttaranjali Organics
            </h3>
            <p className="text-organic-secondary">
              Your trusted source for fresh, organic, and sustainable products.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-organic-primary hover:text-organic-dark transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-organic-dark">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Shop All" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-organic-secondary hover:text-organic-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-organic-dark">
              Categories
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/products?category=fruits", label: "Fresh Fruits" },
                { href: "/products?category=vegetables", label: "Vegetables" },
                { href: "/products?category=pantry", label: "Pantry Essentials" },
                { href: "/products?category=grains", label: "Grains & Cereals" }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-organic-secondary hover:text-organic-primary transition-colors inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-organic-dark">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {[
                { icon: MapPin, text: "123 Organic Lane, Green Valley, CA 94123", className: "flex items-start space-x-2" },
                { icon: Phone, text: "(555) 123-4567", className: "flex items-center space-x-2" },
                { icon: Mail, text: "hello@uttaranjaliorganics.com", className: "flex items-center space-x-2" }
              ].map((contact) => (
                <li key={contact.text} className={contact.className}>
                  <contact.icon
                    size={18}
                    className="text-organic-primary flex-shrink-0 mt-0.5"
                  />
                  <span className="text-organic-secondary">{contact.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-6 bg-organic-secondary/20" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-organic-secondary">
          <p>
            © {new Date().getFullYear()} Uttaranjali Organics. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" }
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="hover:text-organic-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;