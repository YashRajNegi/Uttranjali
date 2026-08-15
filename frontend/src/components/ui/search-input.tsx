import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useNavigate } from 'react-router-dom';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search products...",
  className = "",
  onSearch,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounced search with API
  const { data: searchResults } = useProducts(
    1,
    5, // Show only 5 results in dropdown
    undefined,
    undefined,
    0,
    Number.MAX_SAFE_INTEGER,
    'rating',
    -1,
    query.length > 2 ? query : undefined
  );

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
    setIsSearching(true);
    
    // Debounce search
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch?.(finalQuery);
      navigate(`/products?search=${encodeURIComponent(finalQuery.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(query.length > 0)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : searchResults?.products && searchResults.products.length > 0 ? (
            <>
              <div className="p-2 border-b">
                <p className="text-sm text-gray-600 font-medium">
                  {searchResults.products.length} results found
                </p>
              </div>
              {searchResults.products.map((product) => (
                <div
                  key={product._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSearch(product.name)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{product.price}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="text-xs text-gray-600 ml-1">
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};
