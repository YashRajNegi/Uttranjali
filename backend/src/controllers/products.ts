import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product, { IProduct, IReview } from '../models/Product';
import { IUser } from '../models/User';
import { AuthRequest } from '../types/AuthRequest';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const brand = req.query.brand as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sortBy = req.query.sortBy as string || 'rating';
    const sortOrder = req.query.sortOrder as string === 'asc' ? 1 : -1;
    const search = req.query.search as string;
    
    // Build optimized query using indexes
    const query: any = {};
    
    // Category filter (uses category_price_rating index)
    if (category) query.category = category;
    
    // Brand filter (uses brand_filter index)
    if (brand) query.brand = brand;
    
    // Price range filter (uses price_range index) - only if specified
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }
    
    // Stock availability filter (uses stock_availability index)
    const inStock = req.query.inStock === 'true';
    if (inStock) query.countInStock = { $gt: 0 };
    
    // Text search (uses weighted_product_search index)
    if (search) {
      query.$text = { $search: search };
    }
    
    // Build sort object using appropriate indexes
    let sort: any = {};
    switch (sortBy) {
      case 'price':
        sort.price = sortOrder;
        break;
      case 'createdAt':
        sort.createdAt = sortOrder;
        break;
      case 'rating':
      default:
        // Use popularity_sort index for rating
        sort.rating = sortOrder;
        sort.numReviews = -1;
        break;
    }
    
    // If category is specified, use compound index for better performance
    if (category && sortBy === 'rating') {
      sort = { category: 1, rating: -1 };
    }
    
    // Execute query with lean() for better performance
    const products = await Product.find(query)
      .select('name price image brand category countInStock rating numReviews createdAt')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Faster than full documents
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      currentPage: page,
      pages: Math.ceil(total / limit),
      total,
      hasMore: page < Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      user: req.user!._id as unknown as mongoose.Types.ObjectId,
      image: req.body.image,
      brand: req.body.brand,
      category: req.body.category,
      countInStock: req.body.stock,
      numReviews: 0,
      description: req.body.description,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.price = req.body.price || product.price;
      product.description = req.body.description || product.description;
      product.image = req.body.image || product.image;
      product.brand = req.body.brand || product.brand;
      product.category = req.body.category || product.category;
      product.countInStock = req.body.stock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user!._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      user: req.user!._id as unknown as mongoose.Types.ObjectId,
      name: req.user!.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
export const getTopProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 3;
    
    // Use popularity_sort index (rating: -1, numReviews: -1)
    const products = await Product.find({ countInStock: { $gt: 0 } })
      .select('name price image brand category rating numReviews')
      .sort({ rating: -1, numReviews: -1 }) // Uses popularity_sort index
      .limit(limit)
      .lean(); // Faster performance
    
    res.json(products);
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};