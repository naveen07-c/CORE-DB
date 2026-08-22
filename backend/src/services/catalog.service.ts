import { catalogRepository } from '../repositories';
import { Category, ProductDetailResponse, ProductVariant } from '../types';
import { ProductFilterParams } from '../repositories/interfaces';

export class CatalogService {
  async getCategories(): Promise<Category[]> {
    return catalogRepository.getCategories();
  }

  async getProducts(filters: ProductFilterParams) {
    return catalogRepository.getProducts(filters);
  }

  async getProductBySlugOrId(slugOrId: string | number): Promise<ProductDetailResponse> {
    const product = await catalogRepository.getProductBySlugOrId(slugOrId);
    if (!product) {
      const err: any = new Error('Product not found.');
      err.statusCode = 404;
      err.code = 'ERR_PRODUCT_NOT_FOUND';
      throw err;
    }
    return product;
  }

  async updateVariantPrice(variantId: number, newPrice: number): Promise<boolean> {
    return catalogRepository.updateVariantPrice(variantId, newPrice);
  }

  async updateVariantStock(variantId: number, newStock: number): Promise<boolean> {
    return catalogRepository.updateVariantStock(variantId, newStock);
  }
}

export const catalogService = new CatalogService();
