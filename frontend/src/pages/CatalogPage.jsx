import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search, RefreshCw, X, ArrowUpDown } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/common/Loader';
import { Badge } from '../components/common/Badge';

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const [selectedBrand, setSelectedBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res.data || res || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          brand: selectedBrand || undefined,
          maxPrice: maxPrice < 2000 ? maxPrice : undefined,
          sort: currentSort,
        };
        const res = await productService.getProducts(params);
        const data = res.data || res.products || res || [];
        setProducts(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentSearch, selectedBrand, maxPrice, currentSort]);

  // Handle category change
  const handleCategoryChange = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  // Handle sort change
  const handleSortChange = (sortValue) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', sortValue);
    setSearchParams(next);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedBrand('');
    setMaxPrice(2000);
    setSearchParams({});
  };

  // Extract unique brands from current products
  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 py-8 space-y-8">
      {/* Header with Search and Active Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Flagship Hardware & Creator Gear</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse high-performance laptops, reference studio monitors, and smartphones with instant shipping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="dark:bg-slate-900">Newest Arrivals</option>
              <option value="price_asc" className="dark:bg-slate-900">Price: Low to High</option>
              <option value="price_desc" className="dark:bg-slate-900">Price: High to Low</option>
              <option value="rating" className="dark:bg-slate-900">Highest Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Filters */}
        <aside
          className={`lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm ${
            isMobileFilterOpen ? 'block fixed inset-0 z-50 p-6 bg-white dark:bg-slate-900 overflow-y-auto m-4 rounded-3xl border-2' : 'hidden lg:block'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* 1. Category Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Categories</span>
              {currentCategory && (
                <button
                  onClick={() => handleCategoryChange('')}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  Clear
                </button>
              )}
            </h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  !currentCategory
                    ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>All Hardware</span>
              </button>

              {categories.map((cat) => {
                const isSelected = currentCategory === cat.slug;
                return (
                  <button
                    key={cat.categoryId || cat.category_id || cat.slug}
                    type="button"
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Brand Filter */}
          {availableBrands.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Brand
              </h3>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    !selectedBrand
                      ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  All Brands
                </button>
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedBrand === brand
                        ? 'bg-slate-900 dark:bg-slate-800 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Max Price Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Max Price
              </h3>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-slate-900 dark:accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>$100</span>
              <span>$2,000+</span>
            </div>
          </div>

          {/* Reset Filters CTA */}
          <button
            type="button"
            onClick={handleClearFilters}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>

          {isMobileFilterOpen && (
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Apply Filters ({products.length} Results)
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-9 space-y-6">
          {/* Active Filter Tags */}
          {(currentCategory || currentSearch || selectedBrand || maxPrice < 2000) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Active Filters:</span>
              {currentCategory && (
                <Badge variant="primary" size="sm">
                  Category: {currentCategory}
                  <button onClick={() => handleCategoryChange('')} className="ml-1 hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {currentSearch && (
                <Badge variant="primary" size="sm">
                  Search: "{currentSearch}"
                  <button onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('search');
                    setSearchParams(next);
                  }} className="ml-1 hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedBrand && (
                <Badge variant="primary" size="sm">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('')} className="ml-1 hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {maxPrice < 2000 && (
                <Badge variant="primary" size="sm">
                  Under ${maxPrice}
                  <button onClick={() => setMaxPrice(2000)} className="ml-1 hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No matching products found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try loosening your filter criteria, resetting price ranges, or searching with broader keywords.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.productId || prod.product_id}
                  product={prod}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
