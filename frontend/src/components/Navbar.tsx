import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]' : 'bg-white'
      }`}
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="container-custom py-2 px-2 md:py-4 md:px-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div variants={itemVariants}>
          <Link to="/" className="flex items-center space-x-2 min-w-0">
              <motion.img 
              src="/uttranjali-logo.png" 
              alt="Uttranjali Logo" 
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-organic-primary shadow-sm"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
            />
            <span className="text-organic-primary text-lg md:text-xl font-bold truncate">UTTRANJALI</span>
          </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div 
            className="hidden md:flex items-center space-x-4 lg:space-x-8"
            variants={itemVariants}
          >
            {[
              { to: "/", label: "Home" },
              { to: "/products", label: "Shop" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" }
            ].map((link, index) => (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={link.to} 
                  className="text-foreground hover:text-organic-primary transition-colors relative group"
                >
                  {link.label}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-organic-primary group-hover:w-full transition-all duration-300"
                    whileHover={{ width: "100%" }}
                  />
            </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Search, Cart, Auth and Mobile Menu */}
          <motion.div 
            className="flex items-center space-x-2 md:space-x-4"
            variants={itemVariants}
          >
            <motion.form 
              onSubmit={handleSearch} 
              className="hidden md:flex relative w-40 lg:w-60"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full pr-10 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
              </motion.div>
            </motion.form>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-organic-primary transition-colors" />
                <AnimatePresence>
              {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                <Badge className="absolute -top-2 -right-2 bg-organic-primary text-white text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                  {itemCount}
                </Badge>
                    </motion.div>
              )}
                </AnimatePresence>
            </Link>
            </motion.div>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-medium">
                      {user?.name}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-foreground hover:text-organic-primary"
                  >
                    Login
                  </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-organic-primary hover:bg-organic-dark text-white"
                  >
                    Register
                  </Button>
                  </motion.div>
                </div>
              )}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMenu}
            >
                <AnimatePresence mode="wait">
              {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                <Menu className="h-6 w-6" />
                    </motion.div>
              )}
                </AnimatePresence>
            </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
        {isMenuOpen && (
            <motion.div 
              className="md:hidden pt-4 pb-3 border-t mt-4 bg-white/95 backdrop-blur-lg fixed top-16 left-0 w-full z-50 px-2"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
            <div className="flex flex-col space-y-3">
                {[
                  { to: "/", label: "Home" },
                  { to: "/products", label: "Shop" },
                  { to: "/about", label: "About" },
                  { to: "/contact", label: "Contact" }
                ].map((link, index) => (
                  <motion.div
                    key={link.to}
                    variants={mobileItemVariants}
                  >
              <Link 
                      to={link.to} 
                      className="text-foreground hover:text-organic-primary transition-colors py-2 block"
                onClick={() => setIsMenuOpen(false)}
              >
                      {link.label}
              </Link>
                  </motion.div>
                ))}
                <motion.div variants={mobileItemVariants}>
              <form onSubmit={handleSearch} className="flex mt-2 w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                      className="w-full pr-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                    <Button 
                      type="submit" 
                      size="icon" 
                      variant="ghost" 
                      className="absolute right-2"
                    >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
                </motion.div>
                {isAuthenticated ? (
                  <>
                    <motion.div variants={mobileItemVariants}>
                      <Link 
                        to="/profile" 
                        className="text-foreground hover:text-organic-primary transition-colors py-2 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
                      <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                        className="text-foreground hover:text-organic-primary transition-colors py-2 block w-full text-left"
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div variants={mobileItemVariants}>
                      <Link 
                        to="/login" 
                        className="text-foreground hover:text-organic-primary transition-colors py-2 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileItemVariants}>
                      <Link 
                        to="/register" 
                        className="text-foreground hover:text-organic-primary transition-colors py-2 block"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </motion.div>
                  </>
              )}
            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
