import { Request, Response, NextFunction } from 'express';
import { catalogService } from '../services/catalog.service';

export class CatalogController {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await catalogService.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, search, brand, maxPrice, sort, page, limit } = req.query;
      const result = await catalogService.getProducts({
        categoryId: category ? parseInt(String(category), 10) : undefined,
        search: search ? String(search) : undefined,
        brand: brand ? String(brand) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
        sort: sort ? String(sort) : undefined,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 12,
      });
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = parseInt(String(req.params.productId), 10);
      const product = await catalogService.getProductById(productId);
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin endpoint for price update testing (Section 5.2 Test 1)
  async updateVariantPrice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const variantId = parseInt(String(req.params.variantId), 10);
      const { price } = req.body;
      await catalogService.updateVariantPrice(variantId, parseFloat(String(price)));
      res.status(200).json({
        success: true,
        message: `Variant #${variantId} price updated to $${price}.`,
      });
    } catch (err) {
      next(err);
    }
  }

  // Admin endpoint for stock quantity update testing (Section 5.2 Test 2)
  async updateVariantStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const variantId = parseInt(String(req.params.variantId), 10);
      const { stock } = req.body;
      await catalogService.updateVariantStock(variantId, parseInt(String(stock), 10));
      res.status(200).json({
        success: true,
        message: `Variant #${variantId} stock updated to ${stock}.`,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const catalogController = new CatalogController();