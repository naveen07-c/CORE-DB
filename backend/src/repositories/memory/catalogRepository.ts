import { ICatalogRepository, ProductFilterParams } from '../interfaces';
import { Category, Product, ProductVariant, ProductDetailResponse } from '../../types';
import { memoryStorage } from './memoryStorage';

export class MemoryCatalogRepository implements ICatalogRepository {
  async getCategories(): Promise<Category[]> {
    return memoryStorage.categories
      .filter((c) => c.isActive)
      .map((c) => ({ ...c }));
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cat = memoryStorage.categories.find((c) => c.slug === slug && c.isActive);
    return cat ? { ...cat } : null;
  }

  async getProducts(filters: ProductFilterParams): Promise<{ total: number; page: number; totalPages: number; data: any[] }> {
    let filtered = memoryStorage.products.filter((p) => p.isActive);

    // 1. Filter by category
    if (filters.categorySlug) {
      const category = memoryStorage.categories.find((c) => c.slug === filters.categorySlug);
      if (category) {
        filtered = filtered.filter((p) => p.categoryId === category.categoryId);
      } else {
        return { total: 0, page: 1, totalPages: 0, data: [] };
      }
    }

    // 2. Filter by search (name, brand, description, sku)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const brandMatch = p.brand.toLowerCase().includes(q);
        const descMatch = p.description.toLowerCase().includes(q);
        const skuMatch = memoryStorage.productVariants.some(
          (v) => v.productId === p.productId && v.sku.toLowerCase().includes(q)
        );
        return nameMatch || brandMatch || descMatch || skuMatch;
      });
    }

    // 3. Filter by brand
    if (filters.brand) {
      filtered = filtered.filter((p) => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }

    // 4. Max Price filter (using min variant price or base price)
    if (filters.maxPrice) {
      filtered = filtered.filter((p) => {
        const variants = memoryStorage.productVariants.filter((v) => v.productId === p.productId && v.isActive);
        const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : p.basePrice;
        return minPrice <= filters.maxPrice!;
      });
    }

    // Map each product with category name, variant counts, and min/max prices
    let mapped = filtered.map((p) => {
      const category = memoryStorage.categories.find((c) => c.categoryId === p.categoryId);
      const variants = memoryStorage.productVariants.filter((v) => v.productId === p.productId && v.isActive);
      const reviews = memoryStorage.reviews.filter((r) => r.productId === p.productId);
      const avgRating = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 5.0;

      const prices = variants.map((v) => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : p.basePrice;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : p.basePrice;

      return {
        productId: p.productId,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        description: p.description,
        basePrice: p.basePrice,
        categoryId: p.categoryId,
        categoryName: category?.name || 'Electronics',
        variantCount: variants.length,
        minPrice,
        maxPrice,
        imageUrl: variants[0]?.imageUrl || null,
        rating: avgRating,
        totalReviews: reviews.length,
      };
    });

    // 5. Sorting
    if (filters.sort === 'price_asc') {
      mapped.sort((a, b) => a.minPrice - b.minPrice);
    } else if (filters.sort === 'price_desc') {
      mapped.sort((a, b) => b.minPrice - a.minPrice);
    } else if (filters.sort === 'rating') {
      mapped.sort((a, b) => b.rating - a.rating);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const total = mapped.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = mapped.slice((page - 1) * limit, page * limit);

    return {
      total,
      page,
      totalPages,
      data: paginated,
    };
  }

  async getProductBySlugOrId(slugOrId: string | number): Promise<ProductDetailResponse | null> {
    const product = memoryStorage.products.find(
      (p) => p.isActive && (p.slug === slugOrId || p.productId === Number(slugOrId))
    );
    if (!product) return null;

    const category = memoryStorage.categories.find((c) => c.categoryId === product.categoryId);
    const variants = memoryStorage.productVariants
      .filter((v) => v.productId === product.productId && v.isActive)
      .map((v) => ({ ...v }));

    const reviews = memoryStorage.reviews
      .filter((r) => r.productId === product.productId)
      .map((r) => {
        const user = memoryStorage.users.find((u) => u.userId === r.userId);
        return {
          ...r,
          userName: user?.fullName || 'Verified Customer',
        };
      });

    const averageRating = reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : 5.0;

    return {
      ...product,
      category: {
        categoryId: category?.categoryId || product.categoryId,
        name: category?.name || 'Electronics',
        slug: category?.slug,
      },
      variants,
      reviews: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: reviews.length,
        items: reviews,
      },
    };
  }

  async getVariantById(variantId: number): Promise<ProductVariant | null> {
    const variant = memoryStorage.productVariants.find((v) => v.variantId === variantId && v.isActive);
    return variant ? { ...variant } : null;
  }

  async updateVariantPrice(variantId: number, newPrice: number): Promise<boolean> {
    const variant = memoryStorage.productVariants.find((v) => v.variantId === variantId);
    if (!variant) return false;
    variant.price = newPrice;
    return true;
  }

  async updateVariantStock(variantId: number, newStock: number): Promise<boolean> {
    const variant = memoryStorage.productVariants.find((v) => v.variantId === variantId);
    if (!variant) return false;
    variant.stockQuantity = newStock;
    return true;
  }
}
