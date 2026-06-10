/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Review, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { filterProfanity } from '../data';
import {
  Search,
  ChevronDown,
  Star,
  ExternalLink,
  Plus,
  ArrowLeft,
  X,
  FileText,
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  Check,
  ShoppingBag
} from 'lucide-react';

interface PetShopProps {
  products: Product[];
  currentUser: User | null;
  activeSpecies: 'dog' | 'cat' | 'both';
  onAddReview: (productId: string, review: Review) => void;
  onBulkImportProducts: (imported: Product[]) => void;
  trackAnalytics: (eventName: any, params: any) => void;
  onPromptSignUp: () => void;
  searchQuery?: string;
}

export default function PetShop({
  products,
  currentUser,
  activeSpecies,
  onAddReview,
  onBulkImportProducts,
  trackAnalytics,
  onPromptSignUp,
  searchQuery: globalSearchQuery = ''
}: PetShopProps) {
  // Navigation
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSort, setActiveSort] = useState<'Top Rated' | 'Price Low-High' | 'Price High-Low' | 'Most Reviewed'>('Top Rated');
  const [currency, setCurrency] = useState('INR');

  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Review creation form
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewBody, setReviewBody] = useState<string>('');
  const [reviewInputOpen, setReviewInputOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewDraftToast, setReviewDraftToast] = useState('');

  // Load search history from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('pet_shop_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Sync recentSearches to localStorage helper
  const saveRecentSearches = (newHistory: string[]) => {
    setRecentSearches(newHistory);
    localStorage.setItem('pet_shop_recent_searches', JSON.stringify(newHistory));
  };

  // Add search query to history on debounce
  React.useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
        const combined = [trimmed, ...filtered].slice(0, 5);
        localStorage.setItem('pet_shop_recent_searches', JSON.stringify(combined));
        return combined;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load review draft on product select
  React.useEffect(() => {
    const saved = localStorage.getItem('pet_shop_review_draft');
    if (saved && selectedProduct) {
      try {
        const draft = JSON.parse(saved);
        if (draft.productId === selectedProduct.product_id && draft.body) {
          setReviewBody(draft.body);
          setReviewRating(draft.rating || 5);
          setEditingReviewId(draft.editingReviewId || null);
          setReviewInputOpen(true);
          setReviewDraftToast('Unsaved review draft recovered!');
          setTimeout(() => setReviewDraftToast(''), 3000);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedProduct]);

  // Save review draft
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedProduct && reviewInputOpen && reviewBody.trim()) {
        const draft = {
          productId: selectedProduct.product_id,
          body: reviewBody,
          rating: reviewRating,
          editingReviewId: editingReviewId
        };
        localStorage.setItem('pet_shop_review_draft', JSON.stringify(draft));
      } else if (selectedProduct && !reviewBody.trim()) {
        // Clear if input becomes empty
        localStorage.removeItem('pet_shop_review_draft');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [reviewBody, reviewRating, selectedProduct, reviewInputOpen, editingReviewId]);

  // Bulk CSV Import states
  const [csvContent, setCsvContent] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvSuccess, setCsvSuccess] = useState('');

  // Category values map
  const categories = ['All', 'Food', 'Grooming', 'Toys', 'Health', 'Accessories', 'Training'];

  // Sorting parser helper
  const getMinPrice = (priceStr: string): number => {
    // Extract numbers from "₹299–₹599" or "₹1,249"
    const cleaned = priceStr.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  };

  const getAvgRating = (p: Product) => {
    if (p.reviews.length === 0) return 0;
    const sum = p.reviews.reduce((acc, r) => acc + r.rating, 0);
    return parseFloat((sum / p.reviews.length).toFixed(1));
  };

  const formatPrice = (priceStr: string, targetCurrency: string) => {
    if (targetCurrency === 'INR') return priceStr;
    const conversionRates: Record<string, number> = { USD: 0.012, EUR: 0.011, GBP: 0.0094, CAD: 0.016 };
    const currencySymbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$' };
    const rate = conversionRates[targetCurrency] || 1;
    const symbol = currencySymbols[targetCurrency] || '₹';
    
    return priceStr.replace(/₹?[\d,]+/g, (match) => {
      const num = parseFloat(match.replace(/[^\d]/g, ''));
      if (isNaN(num)) return match;
      const converted = (num * rate).toFixed(2);
      return `${symbol}${converted}`;
    });
  };

  // Filter & Sort Logic
  const activeSearch = (globalSearchQuery || searchQuery).trim();

  const filteredProducts = products
    .filter((p) => {
      // 1. Global species filter
      if (activeSpecies !== 'both') {
        const matchesSpecies = p.species_tag === activeSpecies || p.species_tag === 'both';
        if (!matchesSpecies) return false;
      }

      // 2. Category filter
      if (activeCategory !== 'All') {
        const matchesCategory = p.category.toLowerCase() === activeCategory.toLowerCase();
        if (!matchesCategory) return false;
      }

      // 3. Search query
      if (activeSearch) {
        const term = activeSearch.toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const ratingA = getAvgRating(a);
      const ratingB = getAvgRating(b);

      if (activeSort === 'Top Rated') {
        return ratingB - ratingA;
      }
      if (activeSort === 'Most Reviewed') {
        return b.reviews.length - a.reviews.length;
      }
      if (activeSort === 'Price Low-High') {
        return getMinPrice(a.price_range) - getMinPrice(b.price_range);
      }
      if (activeSort === 'Price High-Low') {
        return getMinPrice(b.price_range) - getMinPrice(a.price_range);
      }
      return 0;
    });

  // Check if current user already reviewed
  const getUserExistingReview = (p: Product): Review | undefined => {
    if (!currentUser) return undefined;
    return p.reviews.find((r) => r.author_id === currentUser.user_id);
  };

  // Open review editor
  const handleOpenReviewEditor = (p: Product) => {
    if (!currentUser) {
      onPromptSignUp();
      return;
    }
    const existing = getUserExistingReview(p);
    if (existing) {
      setReviewRating(existing.rating);
      setReviewBody(existing.body);
      setEditingReviewId(existing.review_id);
    } else {
      setReviewRating(5);
      setReviewBody('');
      setEditingReviewId(null);
    }
    setReviewInputOpen(true);
  };

  // Submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct) return;
    if (!reviewBody.trim()) {
      alert('Review content cannot be left blank!');
      return;
    }

    // Clean review body with profanity wash
    const cleanBody = filterProfanity(reviewBody);

    const reviewObj: Review = {
      review_id: editingReviewId || 'rev_' + Date.now(),
      product_id: selectedProduct.product_id,
      author_id: currentUser.user_id,
      rating: reviewRating,
      body: cleanBody,
      created_at: '09 Jun 2026',
      helpful_count: 0,
      helpful_by: []
    };

    onAddReview(selectedProduct.product_id, reviewObj);
    trackAnalytics('review_submitted', { product_id: selectedProduct.product_id, rating: reviewRating });

    // Update locally displayed product
    const updatedReviews = editingReviewId
      ? selectedProduct.reviews.map((r) => (r.review_id === editingReviewId ? reviewObj : r))
      : [reviewObj, ...selectedProduct.reviews];

    setSelectedProduct({
      ...selectedProduct,
      reviews: updatedReviews
    });

    setReviewBody('');
    setReviewInputOpen(false);
    setEditingReviewId(null);
    localStorage.removeItem('pet_shop_review_draft');
  };

  const toggleReviewHelpful = (reviewId: string) => {
    if (!currentUser || !selectedProduct) {
      onPromptSignUp();
      return;
    }
    const updatedReviews = selectedProduct.reviews.map((r) => {
      if (r.review_id === reviewId) {
        const helpful_by = [...r.helpful_by];
        let helpful_count = r.helpful_count;
        if (helpful_by.includes(currentUser.user_id)) {
          // Remove vote
          const index = helpful_by.indexOf(currentUser.user_id);
          helpful_by.splice(index, 1);
          helpful_count = Math.max(0, helpful_count - 1);
        } else {
          // Add vote
          helpful_by.push(currentUser.user_id);
          helpful_count += 1;
        }
        return { ...r, helpful_count, helpful_by };
      }
      return r;
    });

    setSelectedProduct({ ...selectedProduct, reviews: updatedReviews });
  };

  // Admin bulk CSV process function
  const handleCSVImport = () => {
    setCsvError('');
    setCsvSuccess('');

    if (!csvContent.trim()) {
      setCsvError('Please paste some valid CSV rows to start.');
      return;
    }

    try {
      const lines = csvContent.split('\n');
      const parsedProducts: Product[] = [];

      // Expected columns: name, brand, species_tag, category, description, price_range, image_url, affiliate_link
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip potential header row
        if (i === 0 && line.toLowerCase().includes('species_tag')) {
          continue;
        }

        const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // handle quoted values safely
        if (cols.length < 7) {
          throw new Error(`Row ${i + 1} has insufficient columns. Needs at least 7 values.`);
        }

        const name = cols[0].replace(/^"|"$/g, '').trim();
        const brand = cols[1].replace(/^"|"$/g, '').trim();
        const species_tag = cols[2].replace(/^"|"$/g, '').trim().toLowerCase() as 'dog' | 'cat' | 'both';
        const category = cols[3].replace(/^"|"$/g, '').trim().toLowerCase() as any;
        const description = cols[4].replace(/^"|"$/g, '').trim();
        const price_range = cols[5].replace(/^"|"$/g, '').trim();
        const image_url = cols[6].replace(/^"|"$/g, '').trim() || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiKfrqIg5TJ_bZzA31T-GJhePU6zLwtSww3YKO4ouZNPfmbsqpNRKQyEkxTCP8w58Nczm90dkUmGu97k6fQ2AW6e5kjNOBc0rWS2YIVMdvyxBHn1sS3ZmhAmYSIWCClBZ59P_mKl81qeslfOJwy-PSzuogNUTKxbC-DpsTQtwDFCGeT54dbpWEpso-J7SpaluXC7hdaC2Hu-IuCA6VPGLRUTlYBYPRb61gMBCbP87SWkTbrA3VWn1ntKitVgcXh2gIcucnP4-l8gk';
        const affiliate_link = cols[7] ? cols[7].replace(/^"|"$/g, '').trim() : '';

        // Validation
        if (!['dog', 'cat', 'both'].includes(species_tag)) {
          throw new Error(`Row ${i + 1} has invalid species_tag: ${species_tag}`);
        }

        parsedProducts.push({
          product_id: 'prod_imported_' + Date.now() + '_' + i,
          name,
          brand,
          species_tag,
          category,
          description,
          price_range,
          image_url,
          affiliate_link,
          reviews: []
        });
      }

      if (parsedProducts.length === 0) {
        throw new Error('No valid products parsed from CSV blocks.');
      }

      onBulkImportProducts(parsedProducts);
      setCsvSuccess(`Successfully loaded ${parsedProducts.length} new products into catalog!`);
      setCsvContent('');
      setTimeout(() => setAdminOpen(false), 2000);
    } catch (e: any) {
      setCsvError(e.message || 'Error parsing columns. Verify values format.');
    }
  };

  // Load preset sample csv
  const loadPresetCSV = () => {
    setCsvContent(
      `"TheraCoat Salmon Oil","NurturePro","dog","health","Organic high-potency Arctic Salmon oil to protect skin follicle integrity and clear shedding flakes","₹1,299","https://lh3.googleusercontent.com/aida-public/AB6AXuCGa8-7-yxaV0wLonrY8DtJwGDFdUccIAy5oS17U3DVgTsta83sN_J8pIclU5LLRGCRNKEKOPfm2RGXVeOMOo3srH8aMv9mQRSWfRD3pF94lg0_V3JV4ay27sveauD9FUX2K7IxwSPEBh3udX4P9-_eGdCXFThmTD5neZ_0CUT4HJ5o-EWkrzi3fjiKM1Tg65Xs_2VRjL6he9Oar3c1b0dJDm12D-ZWu-gJHOWPan9zVNAQ9cMIRoB8OLrrcdWL8akQ0Xzg58Yy--o"\n"FeatherChase Laser","TechOasis","cat","toys","Automated random trajectory safety low-heat laser point teaser to trigger felines","₹899","https://lh3.googleusercontent.com/aida-public/AB6AXuBiKfrqIg5TJ_bZzA31T-GJhePU6zLwtSww3YKO4ouZNPfmbsqpNRKQyEkxTCP8w58Nczm90dkUmGu97k6fQ2AW6e5kjNOBc0rWS2YIVMdvyxBHn1sS3ZmhAmYSIWCClBZ59P_mKl81qeslfOJwy-PSzuogNUTKxbC-DpsTQtwDFCGeT54dbpWEpso-J7SpaluXC7hdaC2Hu-IuCA6VPGLRUTlYBYPRb61gMBCbP87SWkTbrA3VWn1ntKitVgcXh2gIcucnP4-l8gk"`
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 pt-4 px-2">
      <AnimatePresence mode="wait">
        {/* PRODUCT DETAIL SCREEN VIEW */}
        {selectedProduct ? (
          <motion.div
            key="product-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-xs"
          >
            {/* Upper row header */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="mb-4 flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to directory
            </button>

            {/* Product artwork / photo */}
            <div className="rounded-2xl overflow-hidden bg-[#FDFAF6] border border-[#D3D1C7]/60 mb-5 relative">
              <img
                src={selectedProduct.image_url}
                className="w-full h-56 object-cover"
                alt="Product catalog photography"
              />
              <span className="absolute top-3 left-3 bg-[#3D405B] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full">
                {selectedProduct.species_tag} preference
              </span>
            </div>

            {/* Crucial identifiers */}
            <div className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-sans font-extrabold text-[#3D405B] text-lg leading-tight">
                    {selectedProduct.name}
                  </h1>
                  <p className="font-body text-xs text-[#888780] font-medium">brand: {selectedProduct.brand}</p>
                </div>
                <div className="text-right">
                  <span className="block font-sans font-extrabold text-[#E07A5F] text-base">
                    {formatPrice(selectedProduct.price_range, currency)}
                  </span>
                  <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#81B29A]/15 text-[#81B29A] rounded-md mt-1">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Full description */}
            <div className="mb-6 pb-5 border-b border-[#D3D1C7]/30">
              <h3 className="font-sans font-bold text-[#3D405B] text-sm mb-1.5">Overview</h3>
              <p className="font-body text-xs text-[#2C2C2A] leading-relaxed">
                {selectedProduct.description}
              </p>
            </div>

            {/* Order Button */}
            <div className="mb-6">
              <button
                onClick={() => {
                  trackAnalytics('product_viewed', { product_id: selectedProduct.product_id, target: 'order' });
                  alert("Order placed successfully! Your pet will love it.");
                }}
                className="w-full py-3 bg-[#E07A5F] hover:opacity-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-opacity cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Place Order
              </button>
            </div>

            {/* Rating distribution panel */}
            <div className="bg-[#FDFAF6] rounded-2xl p-4 border border-[#D3D1C7] mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <span className="block font-sans font-extrabold text-3xl text-[#3D405B]">
                    {getAvgRating(selectedProduct)}
                  </span>
                  <div className="flex justify-center text-xs text-[#F2CC8F]">
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <span className="text-[10px] text-[#888780] font-body mt-1 block">
                    {selectedProduct.reviews.length} total reviews
                  </span>
                </div>

                {/* Star rating distribution bar chart */}
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = selectedProduct.reviews.filter((r) => r.rating === stars).length;
                    const percent = selectedProduct.reviews.length > 0 ? (count / selectedProduct.reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-[10px] text-[#888780] font-bold">
                        <span className="w-3">{stars}★</span>
                        <div className="flex-1 h-2 bg-[#D3D1C7]/30 rounded-full overflow-hidden">
                          <div className="h-full bg-[#F2CC8F] rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-3 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Write a review action */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-sans font-extrabold text-[#3D405B] text-sm">Community Feedback</h3>
              <button
                onClick={() => handleOpenReviewEditor(selectedProduct)}
                className="px-3 py-1.5 border border-[#E07A5F] text-[#E07A5F] rounded-xl text-xs font-bold hover:bg-[#E07A5F]/5 transition-colors"
              >
                {getUserExistingReview(selectedProduct) ? 'Edit Review ✏️' : 'Write a Review'}
              </button>
            </div>

            {/* Write review editor form box */}
            {reviewInputOpen && (
              <form onSubmit={handleSubmitReview} className="bg-[#FDFAF6] border border-[#D3D1C7] rounded-2xl p-4 mb-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#D3D1C7]/30">
                  <h4 className="text-xs font-extrabold text-[#3D405B]">
                    {editingReviewId ? 'Modify your review' : 'Submit product review'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewInputOpen(false);
                      setEditingReviewId(null);
                      setReviewBody('');
                      localStorage.removeItem('pet_shop_review_draft');
                    }}
                    className="text-xs text-[#888780] hover:text-red-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {reviewDraftToast && (
                  <div className="bg-[#81B29A]/15 border border-[#81B29A]/30 text-[#81B29A] text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" /> {reviewDraftToast}
                  </div>
                )}

                {/* Stars select */}
                <div>
                  <span className="block text-xs font-bold text-[#3D405B] mb-1">Your Rating</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 stroke-1 ${
                            star <= reviewRating ? 'text-[#F2CC8F] fill-current' : 'text-[#D3D1C7]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review field */}
                <div>
                  <label className="block text-xs font-bold text-[#3D405B] mb-1">Review Body (Max 500 characters)</label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Provide your helpful details about sizing, digestion safety, or tactile responsiveness..."
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] bg-white text-xs focus:ring-1 focus:ring-[#E07A5F]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#E07A5F] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
                >
                  Save Review
                </button>
              </form>
            )}

            {/* List of Reviews */}
            {selectedProduct.reviews.length === 0 ? (
              <div className="text-center py-6 bg-[#FDFAF6] border border-dashed border-[#D3D1C7] rounded-2xl text-xs text-[#888780]">
                No community reviews submitted yet. Be the first to let us know your thoughts!
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProduct.reviews.map((r) => {
                  const hasVotedHelpful = currentUser && r.helpful_by.includes(currentUser.user_id);
                  return (
                    <div key={r.review_id} className="bg-[#FDFAF6] p-3 rounded-2xl border border-[#D3D1C7]/30 text-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`w-3.5 h-3.5 ${
                                index < r.rating ? 'text-[#F2CC8F] fill-current' : 'text-[#D3D1C7]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#888780]">{r.created_at}</span>
                      </div>

                      <p className="text-[#2C2C2A] font-body text-[11px] leading-relaxed whitespace-pre-wrap mb-2.5">{r.body}</p>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[#888780]">By verified pet parent</span>

                        <button
                          onClick={() => toggleReviewHelpful(r.review_id)}
                          className={`flex items-center gap-1 font-bold ${
                            hasVotedHelpful ? 'text-[#81B29A]' : 'text-[#888780] hover:text-[#2C2C2A]'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({r.helpful_count})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          // PRODUCT CATALOG DIRECTORY LIST
          <motion.div key="catalog-directory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search row with Admin toggle bar */}
            <div className="flex gap-2.5 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Query names, brands, descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FDFAF6]/60 backdrop-blur-xs border border-[#D3D1C7]/70 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]/40 shadow-xs transition-all placeholder:text-[#888780]/80 font-sans"
                />
                <Search className="w-4 h-4 text-[#888780]/80 absolute left-3.5 top-3.5" />
              </div>

              {/* Admin Portal selector */}
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="px-4 py-3 bg-[#3D405B] text-white rounded-full text-xs font-bold transition-all hover:bg-[#3D405B]/90 focus:outline-none cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center gap-1 shrink-0"
              >
                Panel 🔒
              </button>
            </div>

            {/* Recent Searches chips row */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-[#FDFAF6]/60 border border-[#D3D1C7]/30 px-3 py-2 rounded-2xl">
                <span className="text-[9px] uppercase font-bold text-[#888780] tracking-wider mr-1">Recent:</span>
                {recentSearches.map((term, i) => (
                  <div key={i} className="inline-flex items-center gap-1 bg-white border border-[#D3D1C7]/40 rounded-lg px-2 py-0.5 text-[10px] shadow-2xs hover:border-[#E07A5F]/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery(term);
                        trackAnalytics('recent_search_clicked', { query: term });
                      }}
                      className="text-[#3D405B] hover:text-[#E07A5F] font-semibold cursor-pointer"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const filtered = recentSearches.filter((_, idx) => idx !== i);
                        saveRecentSearches(filtered);
                      }}
                      className="text-[#888780] hover:text-red-500 font-bold ml-1 text-[9px] hover:scale-110 shrink-0 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => saveRecentSearches([])}
                  className="text-[9px] font-bold text-[#E07A5F] hover:underline ml-auto cursor-pointer"
                >
                  Clear history
                </button>
              </div>
            )}

            {/* Admin bulk importer overlay form panel */}
            {adminOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-[#E07A5F] rounded-3xl p-5 mb-5 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-[#D3D1C7]">
                  <h3 className="font-sans font-extrabold text-[#3D405B] text-sm flex items-center gap-1">
                    <FileText className="w-4 h-4 text-[#E07A5F]" /> Admin Product CSV Importer
                  </h3>
                  <button onClick={() => setAdminOpen(false)} className="text-[#888780] hover:text-black">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-[10px] text-[#888780] font-body leading-relaxed">
                  Bulk import products instantly by copying-and-pasting rows in CSV format.<br />
                  <strong>Format rows as:</strong> <code>name, brand, species_tag, category, description, price_range, image_url, affiliate_link</code>
                </p>

                {csvError && (
                  <div className="p-2 bg-red-100 border border-red-200 text-red-500 rounded-lg text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {csvError}
                  </div>
                )}

                {csvSuccess && (
                  <div className="p-2 bg-[#81B29A]/10 border border-[#81B29A]/20 text-[#81B29A] rounded-lg text-xs font-bold">
                    {csvSuccess}
                  </div>
                )}

                <div>
                  <textarea
                    rows={4}
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    placeholder="&quot;Bark Chew Toy&quot;,&quot;PetZen&quot;,&quot;dog&quot;,&quot;toys&quot;,&quot;Extreme rubber toy&quot;,&quot;₹399&quot;,&quot;&quot;,&quot;&quot;"
                    className="w-full px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-[11px] font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={loadPresetCSV}
                    className="px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs font-bold"
                  >
                    Load Sample CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleCSVImport}
                    className="flex-1 py-2 bg-[#E07A5F] text-white rounded-xl text-xs font-bold"
                  >
                    Execute Import Rows
                  </button>
                </div>
              </motion.div>
            )}

            {/* Category filter chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-5 no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-205 shrink-0 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
                      isActive
                        ? 'bg-[#E07A5F] text-white shadow-[0_4px_14px_rgba(224,122,95,0.25)]'
                        : 'bg-white text-[#888780] border border-[#D3D1C7]/80 hover:text-[#2C2C2A] hover:border-[#888780]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Sort toolbar option */}
            <div className="flex justify-between items-center mb-5 bg-[#FDFAF6]/60 backdrop-blur-xs p-3 px-3.5 rounded-2xl border border-[#D3D1C7]/60 text-xs font-sans flex-wrap gap-2">
              <span className="text-[#888780] font-semibold">
                Matches found: <strong className="text-[#3D405B] font-extrabold">{filteredProducts.length}</strong> items
              </span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-[#D3D1C7]/60 px-2.5 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[#888780] font-bold text-[10px] uppercase tracking-wider mr-1">Currency:</span>
                  <select
                    value={currency}
                    onChange={(e: any) => setCurrency(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-extrabold text-[#3D405B] focus:outline-none cursor-pointer"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-white border border-[#D3D1C7]/60 px-2.5 py-1.5 rounded-xl shadow-2xs">
                  <span className="text-[#888780] font-bold text-[10px] uppercase tracking-wider mr-1">Sort:</span>
                  <select
                    value={activeSort}
                    onChange={(e: any) => setActiveSort(e.target.value)}
                    className="bg-transparent border-none text-[11px] font-extrabold text-[#3D405B] focus:outline-none cursor-pointer"
                  >
                    <option value="Top Rated">Top Rated</option>
                    <option value="Most Reviewed">Most Discussed</option>
                    <option value="Price Low-High">Price Low-High</option>
                    <option value="Price High-Low">Price High-Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product 2 Column Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-[#D3D1C7] p-6">
                <AlertCircle className="w-12 h-12 text-[#E07A5F] mx-auto mb-2" />
                <h3 className="font-sans font-extrabold text-[#3D405B] text-base mb-1">No products found</h3>
                <p className="font-body text-xs text-[#888780] max-w-xs mx-auto">
                  Try adjusting your species tags or select a different category option.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((p) => {
                  const rating = getAvgRating(p);
                  return (
                    <article
                      key={p.product_id}
                      onClick={() => {
                        setSelectedProduct(p);
                        trackAnalytics('product_viewed', { product_id: p.product_id, name: p.name });
                      }}
                      className="bg-white rounded-[2rem] border border-[#D3D1C7]/70 p-4 cursor-pointer flex flex-col justify-between bento-card shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-[#E07A5F]/45 transition-all duration-300 group"
                    >
                      {/* Thumbnail wrapper */}
                      <div className="rounded-[1.25rem] overflow-hidden h-28 bg-[#FDFAF6] border border-[#D3D1C7]/30 mb-3.5 relative shrink-0">
                        <img
                          src={p.image_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt="Product thumbnail"
                        />
                        <span className="absolute bottom-2 left-2 bg-white/95 text-[#3D405B] text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-[#D3D1C7]/60 shadow-xs">
                          {p.species_tag === 'both' ? '🐶🐱' : p.species_tag === 'dog' ? '🐶' : '🐱'}
                        </span>
                      </div>

                      {/* Content panel */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#F2CC8F] mb-1">
                            <Star className="w-3.5 h-3.5 fill-current text-[#F2CC8F]" />
                            <span className="text-[#3D405B]">{rating > 0 ? rating : 'No ratings'}</span>
                            <span className="text-[#888780] font-normal font-sans text-[9px]">({p.reviews.length})</span>
                          </div>

                          <h3 className="font-display font-bold text-[#3D405B] text-xs leading-snug line-clamp-2 h-8 group-hover:text-[#E07A5F] transition-colors">
                            {p.name}
                          </h3>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#D3D1C7]/20">
                          <span className="font-sans font-extrabold text-[#E07A5F] text-[11px]">{formatPrice(p.price_range, currency)}</span>
                          <span className="text-[9px] font-extrabold uppercase bg-black/5 text-[#888780] px-1.5 py-0.5 rounded-md">{p.category}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
