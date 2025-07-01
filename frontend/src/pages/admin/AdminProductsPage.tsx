import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService, Product } from '@/services/adminAPI';
import { Plus, Search, Edit, Trash2, ImagePlus, X as XIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  discountedPrice: z.number().min(0, 'Discounted price must be positive')
    .refine(val => val >= 0, 'Discounted price must be positive')
    .optional(),
  discountAmount: z.number().min(0, 'Discount amount must be positive')
    .optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  image: z.string(),
  countInStock: z.number().min(0, 'Stock count must be positive'),
  isOrganic: z.boolean(),
  unit: z.string().min(1, 'Unit is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Utility function to capitalize the first letter
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [processingProduct, setProcessingProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discountedPrice: 0,
      discountAmount: 0,
      category: '',
      brand: '',
      image: '',
      countInStock: 0,
      isOrganic: false,
      unit: '',
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await adminService.getProducts();
      setProducts(productsData);
    } catch (err) {
      setError('Failed to fetch products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const productData = {
        ...data,
        image: imageUrl || data.image
      };
      await adminService.createProduct(productData);
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      await fetchProducts();
      setIsAddingProduct(false);
      form.reset();
      setImageUrl('');
      setImagePreview('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setProcessingProduct(productId);
      await adminService.deleteProduct(productId);
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      fetchProducts();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setProcessingProduct(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Please log in to upload images',
          variant: 'destructive',
        });
        return;
      }

      // Get the backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_API_URL;
      console.log('Uploading to:', `${backendUrl}/api/upload`);
      console.log('Token present:', !!token); // Debug log

      const response = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);
      setImageUrl(data.url);
      setImagePreview(data.url);
      form.setValue('image', data.url);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUrlChange = async (url: string) => {
    try {
      setImageUrl(url);
      if (url) {
        setImagePreview(url);
        form.setValue('image', url);
      }
    } catch (error) {
      console.error('Error handling image URL:', error);
      toast({
        title: 'Error',
        description: 'Failed to process image URL',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'organic') return matchesSearch && product.isOrganic;
    if (activeTab === 'low-stock') return matchesSearch && product.countInStock < 10;
    return matchesSearch;
  });

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tea">Teas</SelectItem>
                            <SelectItem value="spices">Spices & Condiments</SelectItem>
                            <SelectItem value="pulses">Pulses</SelectItem>
                            <SelectItem value="seeds-oils">Seeds & Oils</SelectItem>
                            <SelectItem value="millets">Millets</SelectItem>
                            <SelectItem value="rice-flour">Rice & Flour</SelectItem>
                            <SelectItem value="preserved">Preserved Food</SelectItem>
                            <SelectItem value="combos">Combos</SelectItem>
                            <SelectItem value="specialties">Other Specialties</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field} 
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              field.onChange(value);
                              
                              // Update discounted price based on discount type and amount
                              if (value > 0) {
                                if (discountType === 'percentage' && discountPercentage > 0) {
                                  const discounted = value * (1 - discountPercentage / 100);
                                  form.setValue('discountedPrice', Number(discounted.toFixed(2)));
                                } else if (discountType === 'amount' && discountAmount > 0) {
                                  const discounted = Math.max(0, value - discountAmount);
                                  form.setValue('discountedPrice', Number(discounted.toFixed(2)));
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={discountType === 'percentage' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('percentage')}
                        className="flex-1"
                      >
                        Percentage
                      </Button>
                      <Button
                        type="button"
                        variant={discountType === 'amount' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('amount')}
                        className="flex-1"
                      >
                        Amount
                      </Button>
                    </div>

                    {discountType === 'percentage' ? (
                      <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex justify-between">
                              <span>Discount Percentage</span>
                              {discountPercentage > 0 && (
                                <span className="text-green-600 text-sm">
                                  Save ₹{(form.getValues('price') * (discountPercentage / 100)).toFixed(2)}
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  step="1"
                                  value={discountPercentage}
                                  onChange={e => {
                                    const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                    setDiscountPercentage(percentage);
                                    
                                    const regularPrice = form.getValues('price');
                                    if (regularPrice > 0 && percentage > 0) {
                                      const discounted = regularPrice * (1 - percentage / 100);
                                      field.onChange(Number(discounted.toFixed(2)));
                                    } else {
                                      field.onChange(undefined);
                                    }
                                  }}
                                  className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter percentage between 0-100
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex justify-between">
                              <span>Discount Amount</span>
                              {discountAmount > 0 && (
                                <span className="text-green-600 text-sm">
                                  {Math.round((discountAmount / form.getValues('price')) * 100)}% off
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  min="0"
                                  step="0.01"
                                  value={discountAmount}
                                  onChange={e => {
                                    const amount = Math.max(0, parseFloat(e.target.value) || 0);
                                    setDiscountAmount(amount);
                                    
                                    const regularPrice = form.getValues('price');
                                    if (regularPrice > 0 && amount > 0) {
                                      const discounted = Math.max(0, regularPrice - amount);
                                      field.onChange(Number(discounted.toFixed(2)));
                                      
                                      // Update percentage for display
                                      const percentage = (amount / regularPrice) * 100;
                                      setDiscountPercentage(Math.round(percentage));
                                    } else {
                                      field.onChange(undefined);
                                      setDiscountPercentage(0);
                                    }
                                  }}
                                  className="pl-6"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter discount amount
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex-1 space-y-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                              />
                              <Input
                                placeholder="Or enter image URL"
                                value={imageUrl}
                                onChange={(e) => handleImageUrlChange(e.target.value)}
                                disabled={isUploading}
                              />
                            </div>
                            {imagePreview && (
                              <div className="relative w-32 h-32 flex-shrink-0">
                                <img
                                  src={imagePreview}
                                  alt="Product preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2"
                                  onClick={() => {
                                    setImagePreview('');
                                    setImageUrl('');
                                    form.setValue('image', '');
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {isUploading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading image...
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="countInStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Count</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="lb">Pound (lb)</SelectItem>
                            <SelectItem value="oz">Ounce (oz)</SelectItem>
                            <SelectItem value="l">Liter (l)</SelectItem>
                            <SelectItem value="ml">Milliliter (ml)</SelectItem>
                            <SelectItem value="pc">Piece (pc)</SelectItem>
                            <SelectItem value="dozen">Dozen</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isOrganic"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Organic Product</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="sticky bottom-0 pt-4 bg-white border-t mt-6">
                  <Button type="submit" className="w-full" disabled={loading || isUploading}>
                    {(loading || isUploading) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isUploading ? 'Uploading...' : 'Creating...'}
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="organic">Organic</TabsTrigger>
              <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{capitalize(product.category)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.discountedPrice ? (
                          <>
                            <span className="font-medium text-green-600">
                              ₹{product.discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.price.toFixed(2)}
                            </span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% off
                            </Badge>
                          </>
                        ) : (
                          <span className="font-medium">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={product.countInStock < 10 ? 'text-red-500' : ''}>
                        {product.countInStock} {product.unit}
                      </span>
                    </TableCell>
                    <TableCell>
                      {product.isOrganic && (
                        <Badge variant="secondary">Organic</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingProduct(product);
                            form.reset({
                              ...product,
                              discountedPrice: product.discountedPrice || 0,
                              discountAmount: (product as any).discountAmount || 0,
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(product._id)}
                          disabled={processingProduct === product._id}
                        >
                          {processingProduct === product._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditModalOpen} onOpenChange={(open) => {
        setIsEditModalOpen(open);
        if (!open) setEditingProduct(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (data) => {
                  try {
                    setLoading(true);
                    await adminService.updateProduct(editingProduct._id, data);
                    toast({ title: 'Success', description: 'Product updated successfully' });
                    await fetchProducts();
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                  } catch (error) {
                    toast({
                      title: 'Error',
                      description: error instanceof Error ? error.message : 'Failed to update product',
                      variant: 'destructive',
                    });
                  } finally {
                    setLoading(false);
                  }
                })}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tea">Teas</SelectItem>
                            <SelectItem value="spices">Spices & Condiments</SelectItem>
                            <SelectItem value="pulses">Pulses</SelectItem>
                            <SelectItem value="seeds-oils">Seeds & Oils</SelectItem>
                            <SelectItem value="millets">Millets</SelectItem>
                            <SelectItem value="rice-flour">Rice & Flour</SelectItem>
                            <SelectItem value="preserved">Preserved Food</SelectItem>
                            <SelectItem value="combos">Combos</SelectItem>
                            <SelectItem value="specialties">Other Specialties</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Price (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            {...field} 
                            onChange={e => {
                              const value = parseFloat(e.target.value);
                              field.onChange(value);
                              
                              // Update discounted price based on discount type and amount
                              if (value > 0) {
                                if (discountType === 'percentage' && discountPercentage > 0) {
                                  const discounted = value * (1 - discountPercentage / 100);
                                  form.setValue('discountedPrice', Number(discounted.toFixed(2)));
                                } else if (discountType === 'amount' && discountAmount > 0) {
                                  const discounted = Math.max(0, value - discountAmount);
                                  form.setValue('discountedPrice', Number(discounted.toFixed(2)));
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={discountType === 'percentage' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('percentage')}
                        className="flex-1"
                      >
                        Percentage
                      </Button>
                      <Button
                        type="button"
                        variant={discountType === 'amount' ? 'default' : 'outline'}
                        onClick={() => setDiscountType('amount')}
                        className="flex-1"
                      >
                        Amount
                      </Button>
                    </div>

                    {discountType === 'percentage' ? (
                      <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex justify-between">
                              <span>Discount Percentage</span>
                              {discountPercentage > 0 && (
                                <span className="text-green-600 text-sm">
                                  Save ₹{(form.getValues('price') * (discountPercentage / 100)).toFixed(2)}
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  min="0" 
                                  max="100" 
                                  step="1"
                                  value={discountPercentage}
                                  onChange={e => {
                                    const percentage = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                    setDiscountPercentage(percentage);
                                    
                                    const regularPrice = form.getValues('price');
                                    if (regularPrice > 0 && percentage > 0) {
                                      const discounted = regularPrice * (1 - percentage / 100);
                                      field.onChange(Number(discounted.toFixed(2)));
                                    } else {
                                      field.onChange(undefined);
                                    }
                                  }}
                                  className="pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  %
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter percentage between 0-100
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex justify-between">
                              <span>Discount Amount</span>
                              {discountAmount > 0 && (
                                <span className="text-green-600 text-sm">
                                  {Math.round((discountAmount / form.getValues('price')) * 100)}% off
                                </span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type="number" 
                                  min="0"
                                  step="0.01"
                                  value={discountAmount}
                                  onChange={e => {
                                    const amount = Math.max(0, parseFloat(e.target.value) || 0);
                                    setDiscountAmount(amount);
                                    
                                    const regularPrice = form.getValues('price');
                                    if (regularPrice > 0 && amount > 0) {
                                      const discounted = Math.max(0, regularPrice - amount);
                                      field.onChange(Number(discounted.toFixed(2)));
                                      
                                      // Update percentage for display
                                      const percentage = (amount / regularPrice) * 100;
                                      setDiscountPercentage(Math.round(percentage));
                                    } else {
                                      field.onChange(undefined);
                                      setDiscountPercentage(0);
                                    }
                                  }}
                                  className="pl-6"
                                />
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Enter discount amount
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="flex-1 space-y-4">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                              />
                              <Input
                                placeholder="Or enter image URL"
                                value={imageUrl}
                                onChange={(e) => handleImageUrlChange(e.target.value)}
                                disabled={isUploading}
                              />
                            </div>
                            {imagePreview && (
                              <div className="relative w-32 h-32 flex-shrink-0">
                                <img
                                  src={imagePreview}
                                  alt="Product preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2"
                                  onClick={() => {
                                    setImagePreview('');
                                    setImageUrl('');
                                    form.setValue('image', '');
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {isUploading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Uploading image...
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="countInStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Count</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="g">Gram (g)</SelectItem>
                            <SelectItem value="lb">Pound (lb)</SelectItem>
                            <SelectItem value="oz">Ounce (oz)</SelectItem>
                            <SelectItem value="l">Liter (l)</SelectItem>
                            <SelectItem value="ml">Milliliter (ml)</SelectItem>
                            <SelectItem value="pc">Piece (pc)</SelectItem>
                            <SelectItem value="dozen">Dozen</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isOrganic"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Organic Product</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="sticky bottom-0 pt-4 bg-white border-t mt-6">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Product'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductsPage; 