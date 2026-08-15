import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import type { Product } from '../services/api';
import ProductCard from '@/components/ProductCard';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getProducts();
        let filteredProducts = response.data;

        // Apply filters
        if (category) {
          filteredProducts = filteredProducts.filter(
            (product) => product.category.toLowerCase() === category.toLowerCase()
          );
        }
        if (search) {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(search.toLowerCase()) ||
              product.description.toLowerCase().includes(search.toLowerCase())
          );
        }

        // Apply sorting
        filteredProducts.sort((a, b) => {
          if (sortBy === 'price') {
            return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
          }
          if (sortBy === 'rating') {
            return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
          }
          return sortOrder === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        });

        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, sortBy, sortOrder]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-semibold text-organic-primary mb-4">Loading...</div>
          <div className="w-16 h-16 border-4 border-organic-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">
            {category ? `${category} Products` : 'All Products'}
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="border rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-organic-primary focus:border-organic-primary"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Rating (High to Low)</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No products found</h2>
            <p className="text-gray-500">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div key={product._id}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ProductList;
