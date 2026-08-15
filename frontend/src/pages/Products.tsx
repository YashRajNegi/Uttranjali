import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
import { useProducts } from '@/hooks/useProducts';
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

// Debounce utility function
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Products = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial values from URL params
  const initialCategory = searchParams.get('category')?.toLowerCase() || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialPriceRange = searchParams.get('price') || 'all';
  const initialSort = searchParams.get('sort') || 'rating';
  const initialPage = parseInt(searchParams.get('page') || '1');
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState(initialPriceRange);
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
    const [showOrganic, setShowOrganic] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  
  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Parse price range
  const getPriceRange = (range: string) => {
    if (range === 'all') return { min: 0, max: Number.MAX_SAFE_INTEGER };
    const parts = range.split('-');
    if (range === '5000+') return { min: 5000, max: Number.MAX_SAFE_INTEGER };
    return { min: parseInt(parts[0]), max: parseInt(parts[1]) };
  };
  
  // Convert sort option to API parameters
  const getSortParams = (sort: string) => {
    switch (sort) {
      case 'price-low': return { sortBy: 'price', sortOrder: 'asc' };
      case 'price-high': return { sortBy: 'price', sortOrder: 'desc' };
      case 'rating-high': return { sortBy: 'rating', sortOrder: 'desc' };
      case 'newest': return { sortBy: 'createdAt', sortOrder: 'desc' };
      default: return { sortBy: 'rating', sortOrder: 'desc' };
    }
  };
  
  const priceRange = getPriceRange(selectedPriceRange);
  const sortParams = getSortParams(sortOrder);
  
  // Use optimized useProducts hook
  const { data: productsData, isLoading, error, refetch } = useProducts(
    1, // page
    20 // limit
  );
  
  // Temporary fallback - direct API call
  const [fallbackProducts, setFallbackProducts] = useState([]);
  const [fallbackLoading, setFallbackLoading] = useState(true);
  
  useEffect(() => {
    const fetchProductsDirectly = async () => {
      try {
        setFallbackLoading(true);
        
        // Test both endpoints
        const topResponse = await fetch('http://localhost:5000/api/products/top?limit=20');
        const topData = await topResponse.json();
        
        const response = await fetch('http://localhost:5000/api/products?page=1&limit=20');
        const data = await response.json();
        
        // Use top products if regular products endpoint fails
        if (data.products && data.products.length > 0) {
          setFallbackProducts(data.products);
        } else if (topData && topData.length > 0) {
          setFallbackProducts(topData);
        } else {
          setFallbackProducts([]);
        }
      } catch (err) {
        console.error('API Error:', err);
      } finally {
        setFallbackLoading(false);
      }
    };
    
    fetchProductsDirectly();
  }, []);
  
  // Use products from either source
  const products = productsData?.products || fallbackProducts || [];
  const totalPages = productsData?.pages || 1;
  const hasMore = productsData?.hasMore || false;
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    if (selectedPriceRange !== 'all') params.set('price', selectedPriceRange);
    if (sortOrder !== 'featured') params.set('sort', sortOrder);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }, [selectedCategory, debouncedSearchQuery, selectedPriceRange, sortOrder, currentPage]);

  // Sync search query with URL parameters when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams, searchQuery]);
  
  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };
  
  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRange(range);
    setCurrentPage(1);
  };
  
  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
    const matchesSearch = (product.name && product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
                         (product.description && product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'organic' ? product.isOrganic : product.category.toLowerCase() === selectedCategory);
    const matchesPrice = filterByPrice(product, selectedPriceRange);
    const matchesOrganic = !showOrganic || product.isOrganic;
    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic;
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
        setShowDiscount(false);
    
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  if (isLoading || fallbackLoading) {
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
      
      <main className="flex-grow bg-background py-4 pt-20 md:py-8 md:pt-24">
        <div className="container-custom px-2 md:px-0">
          {/* Categories Bar */}
          <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm mb-4 md:mb-6 overflow-x-auto">
            <div className="flex flex-wrap gap-2 md:gap-4">
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
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Filters Sidebar */}
            <div className="md:col-span-3 mb-4 md:mb-0">
              <div className="bg-white p-2 md:p-4 rounded-lg shadow-sm">
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
                  
                                  </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="md:col-span-9">
              {/* Sort */}
              <div className="flex justify-end mb-4 md:mb-6">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full md:w-[200px] text-base">
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
                  <h3 className="text-xl font-medium text-red-600 mb-2">{error?.message || 'Failed to load products'}</h3>
                  <Button onClick={() => refetch()} className="mt-4">
                    Try Again
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
                  <Button onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedPriceRange('all');
                    setSortOrder('rating');
                    setCurrentPage(1);
                  }} className="bg-organic-primary hover:bg-organic-dark">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground mb-4">
                    Showing {products.length} products
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {products.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
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
