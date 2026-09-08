import React, { useState, useEffect } from 'react';
import { RatingStars } from '../common/RatingStars';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ShieldCheck, MessageSquare, Plus, UserCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { productService } from '../../services/productService';

export const ReviewList = ({ productId, reviews: reviewsProp = null, onReviewAdded }) => {
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const [fetchedReviews, setFetchedReviews] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch reviews from the API when no server data was passed in
  useEffect(() => {
    if (reviewsProp) return undefined;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getProductReviews(productId);
        const payload = res.data || res;
        if (!cancelled) setFetchedReviews(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error('Failed to load reviews:', err);
        if (!cancelled) setFetchedReviews([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [productId, reviewsProp]);

  const source = reviewsProp || fetchedReviews;
  const reviewItems = Array.isArray(source)
    ? source
    : source?.items || [];
  const averageRating =
    (reviewsProp && (reviewsProp.averageRating || (reviewItems.length ? reviewItems.reduce((a, b) => a + (b.rating || 0), 0) / reviewItems.length : 5.0))) ||
    (reviewItems.length ? reviewItems.reduce((a, b) => a + (b.rating || 0), 0) / reviewItems.length : 5.0);
  const totalReviews = (reviewsProp && reviewsProp.totalReviews) ?? reviewItems.length;

  const refreshReviews = async () => {
    try {
      const res = await productService.getProductReviews(productId);
      const payload = res.data || res;
      setFetchedReviews(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to refresh reviews:', err);
    }
    if (onReviewAdded) onReviewAdded();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !reviewText.trim()) {
      setErrorMessage('Please provide a rating and a few words about the product.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await productService.addReview(productId, {
        rating,
        reviewText: title.trim() ? `${title.trim()} — ${reviewText.trim()}` : reviewText.trim(),
      });
      toast.success('Thanks! Your review is live.');
      setIsModalOpen(false);
      setTitle('');
      setReviewText('');
      setRating(5);
      await refreshReviews();
    } catch (err) {
      setErrorMessage(err.message || 'Could not submit review — you may have already reviewed this product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Review Header & Summary Card */}
      <div className="bg-cream rounded-3xl p-6 border-2 border-ink/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-4xl font-black text-ink font-mono">{Number(averageRating).toFixed(1)}</span>
            <div className="mt-1">
              <RatingStars rating={averageRating} size="sm" />
            </div>
            <p className="text-xs text-ink/50 mt-1">Based on {totalReviews} reviews</p>
          </div>
          <div className="h-16 w-[1px] bg-ink/10 hidden sm:block" />
          <div className="text-xs text-ink/60 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-mint-600" />
              <span className="font-bold text-ink">100% verified ratings</span>
            </div>
            <p className="text-ink/40">Genuine feedback from real Iron &amp; Ivy orders.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-pop relative !py-2.5 !px-5 text-xs shrink-0"
        >
          <span className="pop-circle tl" /><span className="pop-circle tr" />
          <span className="pop-circle bl" /><span className="pop-circle br" />
          <Plus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-ink/40 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
          </div>
        ) : reviewItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-ink/15">
            <MessageSquare className="w-10 h-10 text-ink/20 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-ink/70">No reviews yet</h4>
            <p className="text-xs text-ink/40 mt-1">Be the first to review this product.</p>
          </div>
        ) : (
          reviewItems.map((rev) => (
            <div
              key={rev.reviewId || rev.review_id || Math.random()}
              className="bg-white p-5 rounded-3xl border-2 border-ink/10 shadow-card space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <RatingStars rating={rev.rating} size="sm" showCount={false} />
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-ink/40">
                    <span className="font-semibold text-ink/70">
                      {rev.userName || rev.user_name || rev.user?.fullName || 'Verified Customer'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(rev.reviewDate || rev.review_date || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {(rev.isVerified || rev.is_verified) && (
                  <Badge variant="success" size="sm">
                    <UserCheck className="w-3 h-3" />
                    Verified Purchaser
                  </Badge>
                )}
              </div>

              <p className="text-xs text-ink/70 leading-relaxed whitespace-pre-wrap">
                {rev.reviewText || rev.review_text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write a Review">
        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-ink/60">Please sign in to submit a verified product review.</p>
            <a href="/login" className="btn-primary !py-2.5 inline-flex text-xs">
              Sign In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-2">
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`w-10 h-10 rounded-full font-black text-sm flex items-center justify-center transition-all ${
                      rating >= s
                        ? 'bg-lemon-400 text-ink shadow-md'
                        : 'bg-cream text-ink/30 hover:bg-lemon-300/50'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                Headline (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best pair of headphones I've owned"
                className="input !rounded-2xl !py-2.5 !text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/70 uppercase tracking-wider mb-1">
                Your Review *
              </label>
              <textarea
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you love? What could be better?"
                className="input !rounded-2xl !text-xs !py-3 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-ink/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary !py-2 !px-5 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary !py-2 !px-6 text-xs disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ReviewList;
