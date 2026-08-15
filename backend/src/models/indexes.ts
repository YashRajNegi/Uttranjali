import Product from './Product';
import Order from './Order';
import User from './User';

// Create database indexes for better performance
export const createIndexes = async () => {
  try {
    console.log('🔍 Creating database indexes...');
    
    // Product indexes - using createIndex instead of createIndexes
    await Product.collection.createIndex(
      { category: 1, price: 1, rating: -1 }, 
      { name: 'category_price_rating' }
    );
    
    // (Text index 'product_search' removed to avoid conflict with 'weighted_product_search')
    
    await Product.collection.createIndex(
      { brand: 1 }, 
      { name: 'brand_filter' }
    );
    
    await Product.collection.createIndex(
      { rating: -1, numReviews: -1 }, 
      { name: 'popularity_sort' }
    );
    
    await Product.collection.createIndex(
      { createdAt: -1 }, 
      { name: 'newest_products' }
    );
    
    await Product.collection.createIndex(
      { countInStock: 1 }, 
      { name: 'stock_availability' }
    );
    
    await Product.collection.createIndex(
      { price: 1 }, 
      { name: 'price_range' }
    );
    
    await Product.collection.createIndex(
      { category: 1, rating: -1 }, 
      { name: 'category_rating' }
    );
    
    await Product.collection.createIndex(
      { user: 1, createdAt: -1 }, 
      { name: 'user_products' }
    );

    // Order indexes
    await Order.collection.createIndex(
      { user: 1, createdAt: -1 }, 
      { name: 'user_order_history' }
    );
    
    await Order.collection.createIndex(
      { status: 1, createdAt: -1 }, 
      { name: 'status_tracking' }
    );
    
    await Order.collection.createIndex(
      { 'orderItems.product': 1, createdAt: -1 }, 
      { name: 'product_popularity' }
    );
    
    await Order.collection.createIndex(
      { isPaid: 1, paidAt: -1 }, 
      { name: 'payment_tracking' }
    );
    
    await Order.collection.createIndex(
      { isDelivered: 1, deliveredAt: -1 }, 
      { name: 'delivery_tracking' }
    );
    
    await Order.collection.createIndex(
      { totalPrice: 1 }, 
      { name: 'order_amount' }
    );
    
    await Order.collection.createIndex(
      { 'shippingAddress.country': 1, 'shippingAddress.city': 1 }, 
      { name: 'shipping_region' }
    );

    // User indexes
    // (email index is automatically created by Mongoose schema)
    
    await User.collection.createIndex(
      { name: 'text' }, 
      { name: 'name_search' }
    );
    
    await User.collection.createIndex(
      { isAdmin: 1 }, 
      { name: 'admin_filter' }
    );
    
    await User.collection.createIndex(
      { createdAt: -1 }, 
      { name: 'user_creation' }
    );

    // Drop the old product_search text index if it exists
    try {
      await Product.collection.dropIndex('product_search');
    } catch (e) {
      // Ignore error if it doesn't exist
    }

    // Create weighted text search index
    await Product.collection.createIndex(
      {
        name: 'text',
        description: 'text',
        brand: 'text',
        category: 'text'
      },
      {
        weights: {
          name: 10,
          brand: 8,
          category: 5,
          description: 3
        },
        name: 'weighted_product_search'
      }
    );

    console.log('✅ Database indexes created successfully');
    
  } catch (error) {
    console.error('❌ Error creating indexes (Non-fatal):', error);
    // Removed throw error; so the server can still start
  }
};

// Function to check existing indexes
export const checkIndexes = async () => {
  try {
    const productIndexes = await Product.collection.listIndexes().toArray();
    const orderIndexes = await Order.collection.listIndexes().toArray();
    const userIndexes = await User.collection.listIndexes().toArray();
    

    
    return {
      products: productIndexes,
      orders: orderIndexes,
      users: userIndexes
    };
  } catch (error) {
    console.error('❌ Error checking indexes:', error);
    return null;
  }
};
