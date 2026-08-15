import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, Product } from '@/services/api';

// Optimized products query with caching
export const useProducts = (page: number = 1, limit: number = 20, category?: string, brand?: string, minPrice?: number, maxPrice?: number, sortBy?: string, sortOrder?: number, search?: string) => {
  return useQuery({
    queryKey: ['products', page, limit, category, brand, minPrice, maxPrice, sortBy, sortOrder, search],
    queryFn: () => productAPI.getProducts(page, limit, category, brand, minPrice, maxPrice, sortBy, sortOrder, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (new name for cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
    select: (response) => response.data, // Extract the data from Axios response
  });
};

// Single product query with caching
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productAPI.getProductById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (new name for cacheTime)
    enabled: !!id,
    retry: 2,
  });
};

// Top products query with caching
export const useTopProducts = (limit: number = 3) => {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: () => productAPI.getTopProducts(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (new name for cacheTime)
    refetchOnWindowFocus: false,
    select: (data) => data.data.slice(0, limit), // Get only the requested number of products
  });
};

// Product review mutation with cache invalidation
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, review }: { id: string; review: { rating: number; comment: string } }) =>
      productAPI.createReview(id, review),
    onSuccess: (_, variables) => {
      // Invalidate product query to refresh data
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Product mutations with cache management
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productAPI.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productAPI.updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productAPI.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
