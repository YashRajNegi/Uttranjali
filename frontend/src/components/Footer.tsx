import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
        delayChildren: 0.1
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

  const socialVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.2,
      rotate: 5,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const linkVariants = {
    rest: { x: 0 },
    hover: { 
      x: 5,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.footer 
      className="bg-organic-light pt-12 pb-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h3 
              className="text-xl font-bold text-organic-dark"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Uttaranjali Organics
            </motion.h3>
            <motion.p 
              className="text-organic-secondary"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your trusted source for fresh, organic, and sustainable products.
            </motion.p>
            <motion.div 
              className="flex space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" }
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="text-organic-primary hover:text-organic-dark transition-colors"
                  aria-label={social.label}
                  variants={socialVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap={{ scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold text-organic-dark"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Quick Links
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {[
                { href: "/", label: "Home" },
                { href: "/products", label: "Shop All" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" }
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <motion.div
                    variants={linkVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <Link 
                      to={link.href} 
                      className="text-organic-secondary hover:text-organic-primary transition-colors inline-block"
                    >
                      {link.label}
                </Link>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Categories */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold text-organic-dark"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Categories
            </motion.h3>
            <motion.ul 
              className="space-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { href: "/products?category=fruits", label: "Fresh Fruits" },
                { href: "/products?category=vegetables", label: "Vegetables" },
                { href: "/products?category=pantry", label: "Pantry Essentials" },
                { href: "/products?category=grains", label: "Grains & Cereals" }
              ].map((link, index) => (
                <motion.li
                  key={link.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <motion.div
                    variants={linkVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <Link 
                      to={link.href} 
                      className="text-organic-secondary hover:text-organic-primary transition-colors inline-block"
                    >
                      {link.label}
                </Link>
                  </motion.div>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Contact */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h3 
              className="text-lg font-semibold text-organic-dark"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Contact Us
            </motion.h3>
            <motion.ul 
              className="space-y-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { icon: MapPin, text: "123 Organic Lane, Green Valley, CA 94123", className: "flex items-start space-x-2" },
                { icon: Phone, text: "(555) 123-4567", className: "flex items-center space-x-2" },
                { icon: Mail, text: "hello@uttaranjaliorganics.com", className: "flex items-center space-x-2" }
              ].map((contact, index) => (
                <motion.li
                  key={contact.text}
                  className={contact.className}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <contact.icon 
                    size={18} 
                    className="text-organic-primary flex-shrink-0 mt-0.5" 
                  />
                  <span className="text-organic-secondary">{contact.text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
        <Separator className="my-6 bg-organic-secondary/20" />
        </motion.div>

        {/* Bottom Footer */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center text-sm text-organic-secondary"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            © {new Date().getFullYear()} Uttaranjali Organics. All rights reserved.
          </motion.p>
          <motion.div 
            className="flex space-x-4 mt-3 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" }
            ].map((link, index) => (
              <motion.div
                key={link.label}
                variants={linkVariants}
                initial="rest"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={link.href} 
                  className="hover:text-organic-primary transition-colors"
                >
                  {link.label}
            </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;