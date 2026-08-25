import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, SearchX, RotateCcw, X } from 'lucide-react';
import { productService } from '../services/productService';
import { ProductCard, ProductCardSkeleton } from '../components/catalog/ProductCard';
import { Reveal } from '../components/common/Reveal';

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 – ₹5,000', min: 2500, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 & above', min: 10000, max: 50000 },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'rating', label: 'Top rated' },
];

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          brand: selectedBrand || undefined,
          sort: currentSort,
        };
        const res = await productService.getProducts(params);
        const data = res.data || res.products || res || [];
        let list = Array.isArray(data) ? data : data.data || [];

        if (priceRange) {
          list = list.filter((p) => {
            const minP = p.minPrice ?? p.basePrice ?? 0;
            return minP >= priceRange.min && minP <= priceRange.max;
          });
        }
        setProducts(list);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentCategory, currentSearch, selectedBrand, priceRange, currentSort]);

  const handleCategoryChange = (id) => {
    setSelectedBrand('');
    setPriceRange(null);
    const next = new URLSearchParams(searchParams);
    if (id) next.set('category', id);
    else next.delete('category');
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSelectedBrand('');
    setPriceRange(null);
    setSearchParams(currentSearch ? { search: currentSearch } : {});
  };

  const availableBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  const activeCategoryName =
    categories.find((c) => String(c.categoryId) === currentCategory)?.name || '';

  const FilterPanel = (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-gray-400 mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
              !currentCategory
                ? 'bg-ink text-white border-ink shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.categoryId}
              onClick={() => handleCategoryChange(cat.categoryId)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                currentCategory === String(cat.categoryId)
                  ? 'bg-brand-500 text-ink border-transparent shadow-lift'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-gray-400 mb-3">Price</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => setPriceRange(priceRange?.label === range.label ? null : range)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 ${
                priceRange?.label === range.label
                  ? 'bg-brand-50 text-brand-700 border-brand-300 ring-2 ring-brand-500/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      {availableBrands.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-gray-400 mb-3">Brand</h3>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="input !py-2.5 cursor-pointer"
          >
            <option value="">All brands</option>
            {availableBrands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      )}

      {(selectedBrand || priceRange || currentCategory) && (
        <button onClick={handleClearFilters} className="btn-secondary w-full !rounded-full text-sm">
          <RotateCcw className="w-3.5 h-3.5" /> Reset filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header row */}
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">
              {activeCategoryName || (currentSearch ? `Search results` : 'Full collection')}
            </p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mt-1.5">
              {activeCategoryName || (currentSearch ? `"${currentSearch}"` : 'All products')}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {loading ? 'Loading…' : `${products.length} item${products.length === 1 ? '' : 's'} found`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden btn-secondary !py-2.5 text-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Sort pills */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-gray-200 rounded-full p-1 shadow-sm">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('sort', opt.value);
                    setSearchParams(next);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    currentSort === opt.value
                      ? 'bg-brand-500 text-ink shadow-md'
                      : 'text-gray-500 hover:text-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Desktop inline filters card */}
      <Reveal delay={80} className="hidden lg:block">
        <div className="card-modern p-6 mb-8">{FilterPanel}</div>
      </Reveal>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Reveal variant="scale">
          <div className="card-modern p-16 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-peach flex items-center justify-center">
              <SearchX className="w-7 h-7 text-brand-500" />
            </div>
            <h3 className="font-display font-bold text-xl">Nothing matched that vibe</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Try a different keyword or loosen your filters a little.
            </p>
            <button onClick={handleClearFilters} className="btn-primary mx-auto">Reset everything</button>
          </div>
        </Reveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((prod, i) => (
            <Reveal key={prod.productId} delay={(i % 4) * 70}>
              <ProductCard product={prod} />
            </Reveal>
          ))}
        </div>
      )}

      {/* Mobile filter sheet */}
      {isMobileFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative ml-auto w-[88%] max-w-sm bg-white h-full overflow-y-auto shadow-2xl animate-popin rounded-l-3xl">
            <div className="sticky top-0 bg-white/90 backdrop-blur flex justify-between items-center px-5 py-4 border-b border-gray-100 z-10">
              <h3 className="font-display font-bold text-lg">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {FilterPanel}
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-primary w-full mt-6"
              >
                Show {loading ? '…' : products.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

