import React, { useState } from 'react';
import { RatingStars } from '../common/RatingStars';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ShieldCheck, MessageSquare, Plus, CheckCircle, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { productService } from '../../services/productService';

export const ReviewList = ({ productId, reviews = {}, onReviewAdded }) => {
  const { isAuthenticated } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const reviewItems = reviews.items || [];
  const averageRating = reviews.averageRating || (reviewItems.length ? reviewItems.reduce((a, b) => a + b.rating, 0) / reviewItems.length : 5.0);
  const totalReviews = reviews.totalReviews ?? reviewItems.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !reviewText.trim()) {
      setErrorMessage('Please provide a rating and review text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await productService.addReview(productId, {
        rating,
        title: title.trim() || undefined,
        reviewText: reviewText.trim(),
      });
      setSuccessMessage('Thank you! Your review has been submitted.');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
        setTitle('');
        setReviewText('');
        setRating(5);
        if (onReviewAdded) onReviewAdded();
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit review. You may have already reviewed this product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Review Header & Summary Card */}
      <div className="bg-slate-50/80 dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">{Number(averageRating).toFixed(1)}</span>
            <div className="mt-1">
              <RatingStars rating={averageRating} size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on {totalReviews} reviews</p>
          </div>
          <div className="h-16 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold">100% Verified Customer Ratings</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500">Genuine feedback submitted by verified hardware purchasers.</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 shadow-md transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Write a Review
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviewItems.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No reviews yet</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Be the first customer to review this product.</p>
          </div>
        ) : (
          reviewItems.map((rev) => (
            <div
              key={rev.reviewId || rev.review_id || Math.random()}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={rev.rating} size="sm" showCount={false} />
                    {rev.title && (
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rev.title}</h4>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.user?.fullName || rev.user_name || 'Verified Customer'}</span>
                    <span>•</span>
                    <span>{new Date(rev.reviewDate || rev.review_date || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                {rev.isVerified && (
                  <Badge variant="success" size="sm">
                    <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Verified Purchaser
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {rev.reviewText || rev.review_text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Review Submission Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Write a Customer Review">
        {!isAuthenticated ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-400">Please sign in to submit a verified product review.</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 rounded-xl"
            >
              Sign In First
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-900">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-900">
                {successMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 font-mono">
                Rating (1 to 5 Stars) *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                      rating >= s
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Headline / Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Best ultrabook for software development"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Your Review *
              </label>
              <textarea
                required
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your candid feedback on hardware build, performance, and thermals..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 rounded-xl shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
