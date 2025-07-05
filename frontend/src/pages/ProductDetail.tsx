import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const prod = await res.json();
        setProduct(prod);

        // Fetch recommended products by category
        const recRes = await fetch(`${apiUrl}/api/products?category=${encodeURIComponent(prod.category)}`);
        const recData = await recRes.json();
        setRecommended(recData.filter((p: any) => p._id !== prod._id).slice(0, 8));
      } catch (err) {
        setError('Product not found');
      }
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (loading) return <div><Navbar /><div className="container-custom py-8">Loading...</div></div>;
  if (error || !product) return (
    <div>
      <Navbar />
      <div className="container-custom flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-semibold text-gray-600">{error}</h2>
        <Button onClick={() => navigate('/products')} className="mt-4 bg-organic-primary hover:bg-organic-dark text-white">
          Back to Products
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background pt-20 md:pt-24 px-2 md:px-0">
        <div className="container-custom">
          {/* Product Detail Section */}
          <div className="bg-white p-8 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Product Image */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-center overflow-hidden rounded-lg mb-4 max-h-72 bg-white">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-contain w-full h-auto max-h-72"
                />
              </div>
            </div>
            {/* Product Info */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg text-gray-500">{product.brand || 'Brand'}</span>
                  <span className="ml-2 text-yellow-500 font-bold">{'★'.repeat(Math.round(product.rating || 4))}</span>
                  <span className="text-sm text-gray-400">({product.numReviews || 100} reviews)</span>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-2">₹{product.price}</div>
                <div className="mb-4 text-gray-600">{product.description}</div>
                <div className="mb-4">
                  {product.countInStock > 0 ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">In Stock</span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Out of Stock</span>
                  )}
                </div>
                <hr className="my-6 border-gray-200" />
                {/* Features Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Key Features</h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>100% Organic and naturally grown</li>
                    <li>Rich in nutrients and minerals</li>
                    <li>Sourced directly from local farmers</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button className="bg-organic-primary text-white w-1/2 py-4 text-lg">Add to Cart</Button>
                <Button variant="outline" className="w-1/2 py-4 text-lg">Buy Now</Button>
              </div>
            </div>
          </div>
          {/* Recommended Products */}
          {recommended.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">You may also like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {recommended.map((rec) => (
                  <Link key={rec._id} to={`/product/${rec._id}`}>
                    <ProductCard product={rec} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
