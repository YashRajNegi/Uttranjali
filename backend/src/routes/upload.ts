import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { auth, admin } from '../middleware/auth';
import sharp from 'sharp';
import { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
const configureCloudinary = () => {
  console.log('Configuring Cloudinary with:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'missing'
  });

  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

// Configure Cloudinary immediately
try {
  configureCloudinary();
  // Test Cloudinary configuration
  console.log('Testing Cloudinary configuration...');
  cloudinary.api.ping().then(() => {
    console.log('✅ Cloudinary configuration is valid');
  }).catch((error) => {
    console.error('❌ Cloudinary configuration error:', error);
  });
} catch (error) {
  console.error('❌ Cloudinary configuration error:', error);
}

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
}).single('image');

// Error handling middleware
const handleUploadError = (err: any, req: Request, res: Response, next: Function) => {
  console.error('Upload error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Handle preflight requests
router.options('/', cors());

// Upload route
router.post('/', auth, admin, async (req: Request, res: Response) => {
  console.log('Upload request received');
  
  try {
    // Handle file upload using Promise
    await new Promise<void>((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log('File received:', req.file?.originalname);

    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log file details
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Validate file type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'Only image files are allowed' });
    }

    try {
      // Compress image
      console.log('Compressing image...');
      const compressedImageBuffer = await sharp(req.file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      console.log('Image compressed successfully');

      // Convert buffer to base64
      const b64 = Buffer.from(compressedImageBuffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      // Upload to Cloudinary with retries
      console.log('Uploading to Cloudinary...');
      let retries = 3;
      let result;
      
      while (retries > 0) {
        try {
          result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'earth-eats/products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          console.log('Cloudinary upload successful');
          break;
        } catch (error) {
          console.error(`Cloudinary upload attempt failed. Retries left: ${retries - 1}`, error);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!result) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      console.log('Upload complete. Sending response...');
      res.json({
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (error) {
      console.error('Image processing error:', error);
      res.status(500).json({
        message: 'Error processing image',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({
      message: 'Error uploading image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete image
router.delete('/:public_id', auth, admin, async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.public_id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Error deleting image' });
  }
});

export default router; 