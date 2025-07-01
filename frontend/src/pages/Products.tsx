import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, Star, ChevronDown, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { productAPI } from '@/services/api';
import type { Product } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categories = [
  { id: 'all', name: 'All Products' },
  { id: 'tea', name: 'Teas' },
  { id: 'spices', name: 'Spices & Condiments' },
  { id: 'pulses', name: 'Pulses' },
  { id: 'seeds-oils', name: 'Seeds & Oils' },
  { id: 'millets', name: 'Millets' },
  { id: 'rice-flour', name: 'Rice & Flour' },
  { id: 'preserved', name: 'Preserved Food' },
  { id: 'combos', name: 'Combos' },
  { id: 'specialties', name: 'Other Specialties' }
];

const priceRanges = [
  { id: 'all', name: 'All Prices' },
  { id: '0-500', name: 'Under ₹500' },
  { id: '500-1000', name: '₹500 to ₹1,000' },
  { id: '1000-2000', name: '₹1,000 to ₹2,000' },
  { id: '2000-5000', name: '₹2,000 to ₹5,000' },
  { id: '5000+', name: 'Over ₹5,000' }
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating-high', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest Arrivals' }
];

const Products = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const initialCategory = queryParams.get('category')?.toLowerCase() || 'all';
  const initialSearch = queryParams.get('search') || '';
  const initialPriceRange = queryParams.get('price') || 'all';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialPriceRange);
  const [sortOrder, setSortOrder] = useState('featured');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrganic, setShowOrganic] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts();
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filterByPrice = (product: Product, range: string) => {
    if (range === 'all') return true;
    const [min, max] = range.split('-').map(Number);
    const price = product.price;
    if (max) {
      return price >= min && price <= max;
    }
    return price >= min;
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'organic' ? product.isOrganic : product.category.toLowerCase() === selectedCategory);
    const matchesPrice = filterByPrice(product, selectedPriceRange);
    const matchesOrganic = !showOrganic || product.isOrganic;
    const matchesStock = !showInStock || product.countInStock > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOrder) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating-high':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const updateFilters = (type: string, value: string) => {
    const url = new URL(window.location.href);
    if (value === 'all') {
      url.searchParams.delete(type);
    } else {
      url.searchParams.set(type, value);
    }
    window.history.pushState({}, '', url);

    switch (type) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'price':
        setSelectedPriceRange(value);
        break;
      case 'search':
        setSearchQuery(value);
        break;
    }
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSortOrder('featured');
    setShowOrganic(false);
    setShowInStock(false);
    setShowDiscount(false);
    
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-background py-8">
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
      
      <main className="flex-grow bg-background py-8 pt-24">
        <div className="container-custom">
          {/* Categories Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-wrap gap-4">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => updateFilters('category', category.id)}
                  className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-organic-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {category.icon && <span className="mr-2">{category.icon}</span>}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <div className="md:col-span-3">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </h3>
                  <Button 
                    variant="link" 
                    className="text-sm text-organic-primary p-0 h-auto"
                    onClick={clearFilters}
                  >
                    Clear all
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {priceRanges.map(range => (
                      <label key={range.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          checked={selectedPriceRange === range.id}
                          onChange={() => updateFilters('price', range.id)}
                          className="rounded-full"
                        />
                        <span>{range.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Additional Filters */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={showOrganic}
                      onCheckedChange={(checked) => setShowOrganic(checked as boolean)}
                    />
                    <span>Organic Products</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={showInStock}
                      onCheckedChange={(checked) => setShowInStock(checked as boolean)}
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="md:col-span-9">
              {/* Search and Sort */}
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
                <form onSubmit={(e) => { e.preventDefault(); updateFilters('search', searchQuery); }} className="flex w-full md:w-1/2">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none bg-organic-primary hover:bg-organic-dark">
                    Search
                  </Button>
                </form>
                
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium text-red-600 mb-2">{error}</h3>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                  <Button onClick={clearFilters} className="bg-organic-primary hover:bg-organic-dark">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    Showing {sortedProducts.length} products
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedProducts.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Products;
