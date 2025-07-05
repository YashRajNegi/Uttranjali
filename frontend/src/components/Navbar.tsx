import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, User, LogOut } from 'lucide-react';
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
import { motion } from 'framer-motion';

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

  return (
    <motion.nav
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)]' : 'bg-white'
      }`}
    >
      <div className="container-custom py-2 px-2 md:py-4 md:px-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-w-0">
            <motion.img
              src="/uttranjali-logo.png"
              alt="Uttranjali Logo"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-organic-primary shadow-sm"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <span className="text-organic-primary text-lg md:text-xl font-bold truncate">UTTRANJALI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="text-foreground hover:text-organic-primary transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-foreground hover:text-organic-primary transition-colors">
              Shop
            </Link>
            <Link to="/about" className="text-foreground hover:text-organic-primary transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-foreground hover:text-organic-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Search, Cart, Auth and Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <form onSubmit={handleSearch} className="hidden md:flex relative w-40 lg:w-60">
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
                className="absolute right-0 top-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <Link to="/cart" className="relative">
              <ShoppingCart className="h-6 w-6 text-foreground hover:text-organic-primary transition-colors" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-organic-primary text-white text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                  {itemCount}
                </Badge>
              )}
            </Link>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
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
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-foreground hover:text-organic-primary"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    className="bg-organic-primary hover:bg-organic-dark text-white"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-4 animate-fade-in bg-white/95 backdrop-blur-lg fixed top-16 left-0 w-full z-50 px-2">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-foreground hover:text-organic-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="text-foreground hover:text-organic-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-organic-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-foreground hover:text-organic-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <form onSubmit={handleSearch} className="flex mt-2 w-full">
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="sm" className="ml-2 bg-organic-primary hover:bg-organic-dark">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-organic-primary hover:bg-organic-dark"
                  >
                    Register
                  </Button>
                </div>
              )}
              
              {/* Mobile User Menu */}
              {isAuthenticated && (
                <div className="border-t mt-4 pt-4">
                  <div className="text-sm font-medium mb-2">{user?.name}</div>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
