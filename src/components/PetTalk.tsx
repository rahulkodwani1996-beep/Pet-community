/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Post, Comment, User, Pet } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { PRESET_TAG_LIST, filterProfanity } from '../data';
import ImageUploader from './ImageUploader';
import CutePetIllustration from './CutePetIllustration';
import PetStories from './PetStories';
import RichTextEditor from './RichTextEditor';
import { VetTip } from '../types';
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  MoreVertical,
  Plus,
  ArrowLeft,
  Send,
  Flag,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Award,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PetTalkProps {
  posts: Post[];
  users: User[];
  allPets: Pet[];
  currentUser: User | null;
  activeSpecies: 'dog' | 'cat' | 'both';
  trackAnalytics: (eventName: any, params: any) => void;
  onAddPost: (post: Post) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentBody: string) => void;
  onReportPost: (postId: string) => void;
  onViewUserProfile: (user: User) => void;
  onPromptSignUp: () => void;
  initialPostId?: string | null;
  onClearInitialPostId?: () => void;
  searchQuery?: string;
  savedPostIds?: string[];
  onToggleBookmarkPost?: (postId: string) => void;
  tips?: VetTip[];
}

export default function PetTalk({
  posts,
  users,
  allPets,
  currentUser,
  activeSpecies,
  trackAnalytics,
  onAddPost,
  onLikePost,
  onAddComment,
  onReportPost,
  onViewUserProfile,
  onPromptSignUp,
  initialPostId,
  onClearInitialPostId,
  searchQuery = '',
  savedPostIds = [],
  onToggleBookmarkPost,
  tips = []
}: PetTalkProps) {
  // Navigation states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Gallery swipe states
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = React.useRef<HTMLDivElement>(null);

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== galleryIndex && index >= 0 && selectedPost && index < selectedPost.images.length) {
      setGalleryIndex(index);
    }
  };

  const scrollToImage = (idx: number) => {
    if (galleryRef.current) {
      galleryRef.current.scrollTo({
        left: galleryRef.current.clientWidth * idx,
        behavior: 'smooth'
      });
      setGalleryIndex(idx);
    }
  };

  React.useEffect(() => {
    setGalleryIndex(0);
  }, [selectedPost?.post_id]);

  // Filter and Sorting states
  const [activeSort, setActiveSort] = useState<'Recent' | 'Most Liked' | 'Most Discussed'>('Recent');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Create post form states
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSpeciesTag, setNewSpeciesTag] = useState<'dog' | 'cat' | 'both'>('both');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [addedImages, setAddedImages] = useState<string[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // New comment state
  const [commentText, setCommentText] = useState('');

  // Native share simulation state
  const [shareToastText, setShareToastText] = useState('');

  // Local Species filtering toggles (persisted)
  const [showDogPosts, setShowDogPosts] = useState(() => {
    try {
      const stored = localStorage.getItem('pawpack_show_dog_posts');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [showCatPosts, setShowCatPosts] = useState(() => {
    try {
      const stored = localStorage.getItem('pawpack_show_cat_posts');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const handleToggleDogPosts = () => {
    const next = !showDogPosts;
    setShowDogPosts(next);
    localStorage.setItem('pawpack_show_dog_posts', JSON.stringify(next));
    trackAnalytics('talk_species_filter_toggled', { species: 'dog', visible: next });
  };

  const handleToggleCatPosts = () => {
    const next = !showCatPosts;
    setShowCatPosts(next);
    localStorage.setItem('pawpack_show_cat_posts', JSON.stringify(next));
    trackAnalytics('talk_species_filter_toggled', { species: 'cat', visible: next });
  };

  // Scroll Progress and Reaction States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; symbol: string; left: number }[]>([]);
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const stored = localStorage.getItem('pawpack_post_reactions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const triggerCelebration = (symbol: string) => {
    const id = Date.now() + Math.random();
    const left = Math.random() * 120 - 60;
    setFloatingEmojis((prev) => [...prev, { id, symbol, left }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  };

  const handleReact = (postId: string, symbol: string) => {
    setReactions((prev) => {
      const postReacts = prev[postId] || { '🐾': 0, '❤️': 0, '🔥': 0, '🎉': 0, '🐶': 0, '🐱': 0 };
      const updatedPostReacts = {
        ...postReacts,
        [symbol]: (postReacts[symbol] || 0) + 1
      };
      const next = { ...prev, [postId]: updatedPostReacts };
      localStorage.setItem('pawpack_post_reactions', JSON.stringify(next));
      return next;
    });
    triggerCelebration(symbol);
    trackAnalytics('post_emoji_reacted', { post_id: postId, r_emoji: symbol });
  };

  // Tracking Scroll Progress on Post Details
  React.useEffect(() => {
    if (!selectedPost) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setScrollProgress((scrollTop / scrollHeight) * 100);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedPost]);

  // Calculate dynamic Top Paw-rents leaderboard
  const topPawrents = React.useMemo(() => {
    return users.map(user => {
      // 1. Posts count & engagement of this user
      const userPosts = posts.filter(p => p.author_id === user.user_id);
      const postCount = userPosts.length;
      const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
      const totalComments = userPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

      // 2. Vet tip count & upvotes (authors matched by name)
      const userTips = tips.filter(t => t.author_name.toLowerCase() === user.display_name.toLowerCase());
      const tipCount = userTips.length;
      const totalTipUpvotes = userTips.reduce((sum, t) => sum + (t.helpful_ups?.length || 0), 0);

      // Compute engagement score
      const engagementScore = (postCount * 15) + (totalLikes * 10) + (totalComments * 15) + (tipCount * 40) + (totalTipUpvotes * 20);

      // Create a caregiver ranking status badge
      let rankBadge = "Adoring Parent 🐾";
      let rankEmoji = "💫";
      if (engagementScore >= 180) { rankBadge = "Alpha Caregiver Guardian 🏆"; rankEmoji = "👑"; }
      else if (user.display_name.includes('Dr.')) { rankBadge = "Respected Medical Expert 📋"; rankEmoji = "🩺"; }
      else if (engagementScore >= 90) { rankBadge = "Elite Care Companion ⭐"; rankEmoji = "🌟"; }
      else if (engagementScore >= 30) { rankBadge = "Helpful Pack Parent"; rankEmoji = "❤️"; }

      return {
        ...user,
        engagementScore,
        rankBadge,
        rankEmoji,
        stats: {
          posts: postCount,
          likes: totalLikes,
          comments: totalComments,
          tips: tipCount,
          tipUpvotes: totalTipUpvotes
        }
      };
    })
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, 5); // top 5
  }, [users, posts, tips]);

  // Recover Drafts on Monuting
  React.useEffect(() => {
    const saved = localStorage.getItem('pet_talk_draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.title || draft.body || (draft.addedImages && draft.addedImages.length > 0)) {
          setNewTitle(draft.title || '');
          setNewBody(draft.body || '');
          setNewSpeciesTag(draft.speciesTag || 'both');
          setNewTags(draft.tags || []);
          setAddedImages(draft.addedImages || []);
          setIsCreating(true);
          setShareToastText('Restored your unsaved post draft!');
          setTimeout(() => setShareToastText(''), 3000);
        }
      } catch (e) {
        console.error('Error recovering draft', e);
      }
    }
  }, []);

  // Set up auto-saving interval / debounce for form inputs
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (isCreating && (newTitle.trim() || newBody.trim() || addedImages.length > 0)) {
        const draftObj = {
          title: newTitle,
          body: newBody,
          speciesTag: newSpeciesTag,
          tags: newTags,
          addedImages: addedImages
        };
        localStorage.setItem('pet_talk_draft', JSON.stringify(draftObj));
      }
    }, 2000);

    return () => clearTimeout(handler);
  }, [newTitle, newBody, newSpeciesTag, newTags, addedImages, isCreating]);

  // Handle deep-link initialPostId prop
  React.useEffect(() => {
    if (initialPostId) {
      const p = posts.find((item) => item.post_id === initialPostId);
      if (p) {
        setSelectedPost(p);
      }
    }
  }, [initialPostId, posts]);

  // Report confirmation modal states
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Double tap state helper variables
  const [lastTap, setLastTap] = useState<{ id: string; time: number } | null>(null);

  // Helpers
  const getAuthor = (authorId: string): User | undefined => {
    return users.find((u) => u.user_id === authorId);
  };

  const getAuthorPets = (authorId: string): Pet[] => {
    return allPets.filter((p) => p.owner_id === authorId);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleToggleFormTag = (tag: string) => {
    if (newTags.includes(tag)) {
      setNewTags(newTags.filter((t) => t !== tag));
    } else {
      if (newTags.length < 3) {
        setNewTags([...newTags, tag]);
      }
    }
  };

  const handleAddImageUrl = () => {
    if (imageInput && addedImages.length < 4) {
      if (!imageInput.startsWith('http')) {
        alert('Please specify a valid http format address');
        return;
      }
      setAddedImages([...addedImages, imageInput]);
      setImageInput('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setAddedImages(addedImages.filter((_, i) => i !== index));
  };

  // Double tap handler for instant liking
  const handleImageDoubleTap = (event: React.MouseEvent, postId: string) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap && lastTap.id === postId && now - lastTap.time < DOUBLE_PRESS_DELAY) {
      handleLikeAction(postId);
    } else {
      setLastTap({ id: postId, time: now });
    }
  };

  const handleLikeAction = (postId: string) => {
    if (!currentUser) {
      onPromptSignUp();
      return;
    }
    onLikePost(postId);
    trackAnalytics('post_liked', { post_id: postId });
  };

  const handleShareClick = (p: Post) => {
    // Elegant native Navigator.share mockup with generated simulated deep link URL
    const simulatedUrl = `${window.location.origin}${window.location.pathname}?post_id=${p.post_id}`;
    
    const shareData = {
      title: p.title,
      text: `Check out this amazing pet story on PawPack: "${p.title}"`,
      url: simulatedUrl
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          setShareToastText('Shared successfully!');
          setTimeout(() => setShareToastText(''), 2500);
        })
        .catch(() => {
          navigator.clipboard.writeText(simulatedUrl);
          setShareToastText('URL deep-link copied to clipboard!');
          setTimeout(() => setShareToastText(''), 2500);
        });
    } else {
      setShareToastText('Deep link copied to clipboard!');
      navigator.clipboard.writeText(simulatedUrl);
      setTimeout(() => setShareToastText(''), 2500);
    }
    trackAnalytics('post_shared_deep_link', { post_id: p.post_id, link: simulatedUrl });
  };

  const submitComment = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!currentUser) {
      onPromptSignUp();
      return;
    }
    if (!commentText.trim()) return;

    // Run custom profanity wash
    const cleanComment = filterProfanity(commentText);

    onAddComment(postId, cleanComment);
    trackAnalytics('comment_added', { post_id: postId });
    setCommentText('');

    // After posting dynamic comment, if viewing detail, update detail display locally
    if (selectedPost) {
      const updatedComments: Comment[] = [
        ...selectedPost.comments,
        {
          comment_id: 'comment_' + Date.now(),
          post_id: postId,
          author_id: currentUser.user_id,
          body: cleanComment,
          created_at: 'Just now'
        }
      ];
      setSelectedPost({ ...selectedPost, comments: updatedComments });
    }
  };

  const submitPost = () => {
    if (!currentUser) {
      onPromptSignUp();
      return;
    }
    if (!newTitle.trim() || !newBody.trim()) {
      alert('Please fill out the Title and Body!');
      return;
    }

    // Apply profanity filter
    const cleanTitle = filterProfanity(newTitle);
    const cleanBody = filterProfanity(newBody);

    const created: Post = {
      post_id: 'post_created_' + Date.now(),
      author_id: currentUser.user_id,
      species_tag: newSpeciesTag,
      title: cleanTitle,
      body: cleanBody,
      images: addedImages.length > 0 ? addedImages : [],
      tags: newTags,
      likes_count: 0,
      liked_by: [],
      comments: [],
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    onAddPost(created);
    trackAnalytics('post_created', { post_id: created.post_id, tags_count: newTags.length });

    // Reset Form
    setNewTitle('');
    setNewBody('');
    setNewSpeciesTag('both');
    setNewTags([]);
    setAddedImages([]);
    setImageInput('');
    setIsCreating(false);
    setIsPreviewing(false);
    localStorage.removeItem('pet_talk_draft');
  };

  // Filters logic: activeSpecies is global filter (Dog/Cat/Both).
  // Tag filter is local multi-select.
  const filteredPosts = posts
    .filter((post) => {
      // Local dynamic species visibility toggles
      if (post.species_tag === 'dog' && !showDogPosts) return false;
      if (post.species_tag === 'cat' && !showCatPosts) return false;
      if (post.species_tag === 'both' && !showDogPosts && !showCatPosts) return false;

      // 1. Species global filter
      if (activeSpecies !== 'both') {
        const match = post.species_tag === activeSpecies || post.species_tag === 'both';
        if (!match) return false;
      }

      // Hide reported post
      if (post.is_reported) return false;

      // 2. Local Tag Chip Filter
      if (selectedTags.length > 0) {
        const matchesTag = post.tags.some((t) => selectedTags.includes(t));
        if (!matchesTag) return false;
      }

      // 3. Global persistent search filter (by keyword)
      if (searchQuery && searchQuery.trim()) {
        const term = searchQuery.toLowerCase().trim();
        const matchesSearch =
          post.title.toLowerCase().includes(term) ||
          post.body.toLowerCase().includes(term) ||
          post.tags.some((t) => t.toLowerCase().includes(term));
        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (activeSort === 'Most Liked') {
        return b.likes_count - a.likes_count;
      }
      if (activeSort === 'Most Discussed') {
        return b.comments.length - a.comments.length;
      }
      // Default: Recent.
      return b.post_id.localeCompare(a.post_id);
    });

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 pt-4">
      {/* Dynamic Share Toast */}
      {shareToastText && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#3D405B] text-white text-xs font-semibold px-4 py-2.5 rounded-full z-50 shadow-sm flex items-center gap-1.5 animate-bounce">
          <Check className="w-3.5 h-3.5 text-[#81B29A]" /> {shareToastText}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* CREATE POST MODAL VIEW */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-sm mb-6"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#D3D1C7]/30 mb-4">
              <h2 className="font-sans font-extrabold text-[#3D405B] text-lg">Share your pet story</h2>
              <button
                onClick={() => {
                  setNewTitle('');
                  setNewBody('');
                  setNewSpeciesTag('both');
                  setNewTags([]);
                  setAddedImages([]);
                  setImageInput('');
                  setIsCreating(false);
                  setIsPreviewing(false);
                  localStorage.removeItem('pet_talk_draft');
                }}
                className="text-xs text-[#888780] hover:text-[#E07A5F] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {!isPreviewing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#3D405B] mb-1">Title (Max 100 char)</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Describe the occasion beautifully..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3D1C7] bg-[#FDFAF6] text-sm focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D405B] mb-1">Story (Rich Text Formatting & Mentions)</label>
                  <RichTextEditor
                    value={newBody}
                    onChange={setNewBody}
                    users={users}
                    placeholder="We went to the beach today and Barnaby was adorable..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#3D405B] mb-1">Who is this for?</label>
                    <select
                      value={newSpeciesTag}
                      onChange={(e: any) => setNewSpeciesTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] bg-[#FDFAF6] text-xs focus:outline-none"
                    >
                      <option value="both">Both Dogs & Cats</option>
                      <option value="dog">Dogs Only</option>
                      <option value="cat">Cats Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3D405B] mb-1">Tags (Max 3)</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {PRESET_TAG_LIST.map((tag) => {
                        const included = newTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleFormTag(tag)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              included ? 'bg-[#E07A5F] text-white' : 'bg-[#FDFAF6] text-[#888780] border border-[#D3D1C7]'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-[#D3D1C7]/20">
                  <ImageUploader
                    label="Story Photos"
                    subLabel="Supports JPG, PNG, WEBP (Max 4 images)"
                    maxFiles={4}
                    multiple={true}
                    styleType="full"
                    existingImages={addedImages}
                    onImageUploaded={(url) => {
                      if (addedImages.length < 4) {
                        setAddedImages([...addedImages, url]);
                      } else {
                        alert("Hold on! You can only post up to 4 photos per story.");
                      }
                    }}
                    onRemoveImage={(idx) => handleRemoveImage(idx)}
                  />

                  <div className="pt-2 border-t border-[#D3D1C7]/30">
                    <label className="block text-[10px] font-bold text-[#888780] uppercase tracking-wider mb-1">Or import via web link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        placeholder="Paste image web link (https://...)"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#D3D1C7] bg-[#FDFAF6] text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3 py-1 bg-[#3D405B] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add URL
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewing(true)}
                  className="w-full py-2.5 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white rounded-xl text-xs font-bold transition-all mt-4"
                >
                  Generate Story Preview
                </button>
              </div>
            ) : (
              // SUBMIT PREVIEW
              <div className="space-y-4">
                <div className="bg-[#FDFAF6] rounded-2xl p-4 border border-dashed border-[#D3D1C7]">
                  <p className="text-[10px] font-extrabold text-[#888780] uppercase tracking-wider mb-2">PUBLICATION PREVIEW</p>
                  <h3 className="font-sans font-extrabold text-[#3D405B] text-base mb-1">{newTitle || 'Untitled Story'}</h3>
                  <p className="text-xs text-[#81B29A] font-semibold mb-2">Species: {newSpeciesTag.toUpperCase()}</p>
                  <p className="font-body text-[#2C2C2A] text-xs leading-relaxed line-clamp-4 whitespace-pre-wrap">{newBody || 'Write your story text above...'}</p>

                  <div className="flex gap-1.5 mt-3">
                    {newTags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#FAF2EE] text-[#E07A5F] font-bold text-[9px]">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {addedImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {addedImages.map((img, idx) => (
                        <img key={idx} src={img} className="rounded-lg h-24 w-full object-cover" alt="preview gallery" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsPreviewing(false)}
                    className="flex-1 py-2.5 bg-[#FDFAF6] border border-[#D3D1C7] text-[#3D405B] rounded-xl text-xs font-bold hover:bg-[#FDFAF6]/90 transition-all"
                  >
                    Edit Draft
                  </button>
                  <button
                    type="button"
                    onClick={submitPost}
                    className="flex-1 py-2.5 bg-[#E07A5F] text-white rounded-xl text-xs font-bold hover:bg-[#E07A5F]/90 transition-all"
                  >
                    Publish to Feed
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* POST DETAIL VIEW SCREEN */}
        {selectedPost ? (
          <motion.div
            key="post-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-sm relative"
          >
            {/* Scroll progress bar */}
            <div 
              className="fixed top-0 left-0 h-[3.5px] bg-[#E07A5F] z-50 transition-all duration-100 ease-out" 
              style={{ width: `${scrollProgress}%` }}
            />

            {/* Floating Reaction Dock */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-[#E07A5F]/20 px-4 py-2 rounded-full shadow-[0_12px_30px_rgba(224,122,95,0.15)] flex items-center justify-center gap-4 z-40">
              {/* Show celebratory floating anims */}
              <AnimatePresence>
                {floatingEmojis.map((item) => (
                  <motion.span
                    key={item.id}
                    initial={{ opacity: 1, y: 0, x: item.left, scale: 0.8 }}
                    animate={{ opacity: 0, y: -160, x: item.left + (Math.random() * 40 - 20), scale: 1.6, rotate: Math.random() * 60 - 30 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute pointer-events-none text-2xl z-50"
                    style={{ bottom: '40px', left: '50%', transform: 'translateX(-50%)' }}
                  >
                    {item.symbol}
                  </motion.span>
                ))}
              </AnimatePresence>

              {/* Reaction Buttons */}
              {(['🐾', '❤️', '🔥', '🎉', '🐶', '🐱'] as const).map((sym) => (
                <motion.button
                  key={sym}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleReact(selectedPost.post_id, sym)}
                  className="relative flex flex-col items-center cursor-pointer group px-1"
                >
                  <span className="text-lg filter drop-shadow-xs transition-transform group-hover:scale-110">{sym}</span>
                  <span className="text-[9px] font-sans font-extrabold text-[#E07A5F] -mt-0.5 min-w-[12px] text-center">
                    {reactions[selectedPost.post_id]?.[sym] || 0}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Back to feed */}
            <button
              onClick={() => setSelectedPost(null)}
              className="mb-4 flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to timeline
            </button>

            {/* Author */}
            {(() => {
              const writer = getAuthor(selectedPost.author_id);
              const writerPets = getAuthorPets(selectedPost.author_id);
              const topPet = writerPets[0];
              return (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={writer?.avatar_url}
                      className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 border-2 border-[#E07A5F]/10"
                      onClick={() => {
                        if (writer) onViewUserProfile(writer);
                      }}
                      alt="author pic"
                    />
                    <div>
                      <p
                        className="font-sans font-bold text-sm text-[#3D405B] cursor-pointer hover:underline"
                        onClick={() => {
                          if (writer) onViewUserProfile(writer);
                        }}
                      >
                        {writer?.display_name}
                      </p>
                      {topPet ? (
                        <p className="font-body text-[10px] text-[#E07A5F] font-bold">
                          Pet: {topPet.name} ({topPet.breed})
                        </p>
                      ) : (
                        <p className="font-body text-[10px] text-[#888780]">Community Explorer</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#FDFAF6] text-[#81B29A] rounded-full border border-[#D3D1C7]">
                    {selectedPost.species_tag}
                  </span>
                </div>
              );
            })()}

            {/* Content info */}
            <h1 className="font-sans font-extrabold text-[#3D405B] text-xl mb-3 leading-tight">
              {selectedPost.title}
            </h1>

            <p 
              className="font-body text-sm text-[#2C2C2A] leading-relaxed mb-4 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: selectedPost.body }}
            />

             {/* Image Gallery */}
             <div className="mb-4">
               {selectedPost.images.length > 0 ? (
                 <>
                   <p className="text-[9px] font-bold text-[#888780] mb-1">IMAGE GALLERY (Double-tap to like, swipe or click to navigate)</p>
                   <div className="relative group rounded-2xl overflow-hidden bg-[#FDFAF6] border border-[#D3D1C7]">
                     {/* Swipeable Container */}
                     <div
                       ref={galleryRef}
                       onScroll={handleGalleryScroll}
                       className="relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth cursor-pointer scrollbar-none"
                       style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                       onClick={(e) => handleImageDoubleTap(e, selectedPost.post_id)}
                     >
                       {selectedPost.images.map((img, idx) => (
                         <div
                           key={`detail-img-${idx}`}
                           className="w-full flex-shrink-0 snap-center flex items-center justify-center bg-black/5"
                         >
                           <img
                             src={img}
                             className="w-full max-h-[350px] object-cover"
                             alt={`post asset ${idx + 1}`}
                           />
                         </div>
                       ))}
                     </div>

                     {/* Left Chevron Button */}
                     {selectedPost.images.length > 1 && galleryIndex > 0 && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           scrollToImage(galleryIndex - 1);
                         }}
                         className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white p-1.5 rounded-full z-10 transition-colors active:scale-90"
                       >
                         <ChevronLeft className="w-4 h-4" />
                       </button>
                     )}

                     {/* Right Chevron Button */}
                     {selectedPost.images.length > 1 && galleryIndex < selectedPost.images.length - 1 && (
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           scrollToImage(galleryIndex + 1);
                         }}
                         className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white p-1.5 rounded-full z-10 transition-colors active:scale-90"
                       >
                         <ChevronRight className="w-4 h-4" />
                       </button>
                     )}

                     {/* Page Indicators (Dots) */}
                     {selectedPost.images.length > 1 && (
                       <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/45 backdrop-blur-xs px-2.5 py-1 rounded-full pointer-events-none">
                         {selectedPost.images.map((_, idx) => (
                           <div
                             key={`indicator-${idx}`}
                             onClick={(e) => {
                               e.stopPropagation();
                               scrollToImage(idx);
                             }}
                             className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer pointer-events-auto ${
                               galleryIndex === idx ? 'bg-white scale-125' : 'bg-white/45'
                             }`}
                           />
                         ))}
                       </div>
                     )}

                     {/* Extra Badge counter */}
                     {selectedPost.images.length > 1 && (
                       <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                         {galleryIndex + 1} / {selectedPost.images.length}
                       </div>
                     )}
                   </div>
                 </>
               ) : (
                 <>
                   <p className="text-[9px] font-bold text-[#888780] mb-1">AI GENERATED CUTE PET ILLUSTRATION 🎨</p>
                   <div className="relative rounded-2xl overflow-hidden bg-[#FDFAF6] border border-[#D3D1C7] h-64">
                     <CutePetIllustration postId={selectedPost.post_id} speciesTag={selectedPost.species_tag} tags={selectedPost.tags} />
                   </div>
                 </>
               )}
             </div>

            {/* Tags */}
            {selectedPost.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5 pb-4 border-b border-[#D3D1C7]/30">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-[#FDFAF6] text-[#3D405B] font-bold text-[10px] border border-[#D3D1C7]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Timeline Action footer */}
            <div className="flex justify-between items-center py-2.5 border-b border-[#D3D1C7]/30 mb-5">
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.90, y: 0.5 }}
                  onClick={() => handleLikeAction(selectedPost.post_id)}
                  className={`flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer ${
                    currentUser && selectedPost.liked_by.includes(currentUser.user_id)
                      ? 'text-[#E07A5F]'
                      : 'text-[#888780] hover:text-[#2C2C2A]'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" /> {selectedPost.likes_count} Likes
                </motion.button>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#888780]">
                  <MessageSquare className="w-4 h-4" /> {selectedPost.comments.length} Comments
                </div>

                {/* Bookmark button */}
                <motion.button
                  whileTap={{ scale: 0.90 }}
                  onClick={() => {
                    if (!currentUser) {
                      onPromptSignUp();
                    } else if (onToggleBookmarkPost) {
                      onToggleBookmarkPost(selectedPost.post_id);
                      trackAnalytics('bookmark_toggled', { post_id: selectedPost.post_id, origin: 'detail_modal' });
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer ${
                    savedPostIds.includes(selectedPost.post_id)
                      ? 'text-[#81B29A]'
                      : 'text-[#888780] hover:text-[#2C2C2A]'
                  }`}
                  title="Bookmark Story"
                >
                  {savedPostIds.includes(selectedPost.post_id) ? (
                    <BookmarkCheck className="w-4 h-4 text-[#81B29A]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  <span>{savedPostIds.includes(selectedPost.post_id) ? 'Saved' : 'Save'}</span>
                </motion.button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShareClick(selectedPost)}
                  className="p-1 px-3 text-xs text-[#888780] hover:text-[#2C2C2A] flex items-center gap-1 border border-[#D3D1C7] rounded-lg transition-all"
                  title="Share Post Link"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>

                <button
                  onClick={() => {
                    if (!currentUser) {
                      onPromptSignUp();
                      return;
                    }
                    setReportingPostId(selectedPost.post_id);
                  }}
                  className="p-1.5 text-[#888780] hover:text-[#E07A5F]"
                  title="Report Post Content"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comment Thread */}
            <div>
              <h3 className="font-sans font-bold text-[#3D405B] text-sm mb-3">Therapeutic Conversation</h3>
              {selectedPost.comments.length === 0 ? (
                <div className="text-center py-6 bg-[#FDFAF6] border border-dashed border-[#D3D1C7] rounded-2xl mb-4">
                  <p className="text-[11px] text-[#888780] font-body">No thoughts typed yet on this story. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3 mb-5">
                  {selectedPost.comments.map((comment) => {
                    const cAuthor = getAuthor(comment.author_id);
                    return (
                      <div key={comment.comment_id} className="bg-[#FDFAF6] p-3 rounded-2xl text-xs border border-[#D3D1C7]/40">
                        <div className="flex items-center justify-between mb-1.5 leading-none">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-bold text-[#3D405B] cursor-pointer hover:underline"
                              onClick={() => {
                                if (cAuthor) onViewUserProfile(cAuthor);
                              }}
                            >
                              {cAuthor ? cAuthor.display_name : 'Unknown User'}
                            </span>
                            {cAuthor?.user_id === selectedPost.author_id && (
                              <span className="text-[8px] bg-[#E07A5F]/15 text-[#E07A5F] px-1.5 py-0.5 rounded font-extrabold uppercase">Author</span>
                            )}
                          </div>
                          <span className="text-[9px] text-[#888780]">{comment.created_at}</span>
                        </div>
                        <p className="text-[#2C2C2A] font-body text-[11px] leading-relaxed whitespace-pre-wrap">{comment.body}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add comment form */}
              <form onSubmit={(e) => submitComment(e, selectedPost.post_id)} className="flex gap-2">
                <input
                  type="text"
                  maxLength={500}
                  placeholder={currentUser ? "Write a polite reply (Max 500 chars)..." : "Sign in to add a community comment..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!currentUser}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#D3D1C7] text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                />
                <button
                  type="submit"
                  disabled={!currentUser || !commentText.trim()}
                  className="w-10 h-10 rounded-xl bg-[#E07A5F] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          // FEED OVERVIEW SCREEN
          <motion.div
            key="feed-overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PetStories currentUser={currentUser} users={users} onPromptSignUp={onPromptSignUp} />

            {/* Tag chip lists */}
            <div className="flex flex-wrap gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
              {PRESET_TAG_LIST.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition-all duration-200 active:scale-95 cursor-pointer hover:-translate-y-0.5 ${
                      isActive
                        ? 'bg-[#E07A5F] text-white border border-[#E07A5F] shadow-[0_4px_14px_rgba(224,122,95,0.25)]'
                        : 'bg-white text-[#888780] border border-[#D3D1C7]/80 hover:border-[#888780] hover:text-[#2C2C2A]'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Local Breed/Species Visibility Filter */}
            <div className="bg-white border border-[#D3D1C7]/70 rounded-[1.5rem] p-4 mb-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
              <div>
                <h4 className="font-sans font-extrabold text-xs text-[#3D405B]">Species Feed Preferences</h4>
                <p className="font-body text-[10px] text-[#888780] leading-normal">Toggle canine 🐶 or feline 🐱 timelines instantly</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleDogPosts}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all duration-250 cursor-pointer active:scale-95 ${
                    showDogPosts 
                      ? 'bg-[#F2CC8F]/25 text-[#3D405B] border border-[#F2CC8F] shadow-xs' 
                      : 'bg-[#FDFAF6] text-[#888780]/60 border border-[#D3D1C7]/40 line-through opacity-60'
                  }`}
                >
                  <span className="text-xs">🐶</span> Dogs {showDogPosts ? '• On' : '• Off'}
                </button>
                <button
                  onClick={handleToggleCatPosts}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all duration-250 cursor-pointer active:scale-95 ${
                    showCatPosts 
                      ? 'bg-[#81B29A]/15 text-[#3D405B] border border-[#81B29A]/80 shadow-xs' 
                      : 'bg-[#FDFAF6] text-[#888780]/60 border border-[#D3D1C7]/40 line-through opacity-60'
                  }`}
                >
                  <span className="text-xs">🐱</span> Cats {showCatPosts ? '• On' : '• Off'}
                </button>
              </div>
            </div>

            {/* Sort options bar */}
            <div className="flex justify-between items-center mb-5 bg-[#FDFAF6]/60 backdrop-blur-xs p-3.5 rounded-2xl border border-[#D3D1C7]/60 text-xs">
              <span className="font-sans font-semibold text-[#888780]">
                Showing <strong className="text-[#3D405B] font-extrabold">{filteredPosts.length}</strong> cute activities
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[#888780] font-bold text-[10px] uppercase tracking-wider">Sort:</span>
                {(['Recent', 'Most Liked', 'Most Discussed'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setActiveSort(opt)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] cursor-pointer active:scale-95 ${
                      activeSort === opt
                        ? 'bg-[#3D405B] text-white shadow-[0_3px_10px_rgba(61,64,91,0.25)]'
                        : 'text-[#888780] hover:text-[#2C2C2A] hover:bg-black/5'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid for Feed Articles and Top Paw-rents Sidebar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-4">

              {/* Left Column (Posts feed) */}
              <div className="md:col-span-2 space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-[#D3D1C7] rounded-3xl p-6">
                    <AlertTriangle className="w-12 h-12 text-[#F2CC8F] mx-auto mb-3" />
                    <h3 className="font-sans font-extrabold text-[#3D405B] text-base mb-1">No stories yet</h3>
                    <p className="font-body text-xs text-[#888780] max-w-xs mx-auto mb-4">
                      Be the first to share an adorable update of your canine or feline companion!
                    </p>
                    <button
                      onClick={() => {
                        if (!currentUser) onPromptSignUp();
                        else setIsCreating(true);
                      }}
                      className="px-4 py-2 bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Share your Story
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPosts.map((post) => {
                      const author = getAuthor(post.author_id);
                      const postPets = getAuthorPets(post.author_id);
                      const isLiked = currentUser && post.liked_by.includes(currentUser.user_id);

                      return (
                        <article
                          key={post.post_id}
                          className="bg-white rounded-[2rem] border border-[#D3D1C7]/70 overflow-hidden bento-card shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-[#E07A5F]/45 transition-all duration-350"
                        >
                          {/* Top bio row */}
                          <div className="p-5 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={author?.avatar_url}
                                className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-[#E07A5F]/15 hover:border-[#E07A5F]/40 hover:scale-105 active:scale-95 transition-all duration-200"
                                onClick={() => {
                                  if (author) onViewUserProfile(author);
                                }}
                                alt="author avatar"
                              />
                              <div>
                                <p
                                  className="font-display font-bold text-xs text-[#3D405B] hover:text-[#E07A5F] cursor-pointer"
                                  onClick={() => {
                                    if (author) onViewUserProfile(author);
                                  }}
                                >
                                  {author?.display_name}
                                </p>
                                {postPets.length > 0 ? (
                                  <p className="font-sans text-[9px] text-[#E07A5F] font-bold">
                                    Parent to {postPets[0].name} 🐾
                                  </p>
                                ) : (
                                  <p className="font-sans text-[9px] text-[#888780] font-semibold">Pet Lover Era</p>
                                )}
                              </div>
                            </div>

                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-[#FDFAF6] border border-[#D3D1C7]/60 text-[#888780] rounded-full">
                              {post.species_tag === 'both' ? 'Both 🐶🐱' : post.species_tag === 'dog' ? 'Dog 🐶' : 'Cat 🐱'}
                            </span>
                          </div>

                          {/* Main card tap area for details */}
                          <div
                            className="px-4 cursor-pointer"
                            onClick={() => {
                              setSelectedPost(post);
                              trackAnalytics('product_viewed', { post_id: post.post_id, origin: 'feed' });
                            }}
                          >
                            <h3 className="font-sans font-extrabold text-[#3D405B] text-sm mb-1 leading-tight hover:text-[#E07A5F] transition-colors">
                              {post.title}
                            </h3>
                            <p 
                              className="font-body text-xs text-[#888780] leading-relaxed line-clamp-3 mb-3"
                              dangerouslySetInnerHTML={{ __html: post.body }}
                            />
                          </div>

                          {/* Card Thumbnail */}
                          <div
                            className="px-4 cursor-pointer"
                            onClick={() => {
                              setSelectedPost(post);
                              trackAnalytics('product_viewed', { post_id: post.post_id, origin: 'feed_img' });
                            }}
                          >
                            <div className="rounded-2xl overflow-hidden h-40 relative border border-[#D3D1C7]/30">
                              {post.images.length > 0 ? (
                                <img src={post.images[0]} className="w-full h-full object-cover" alt="feed post assets" />
                              ) : (
                                <CutePetIllustration postId={post.post_id} speciesTag={post.species_tag} tags={post.tags} />
                              )}
                            </div>
                          </div>

                          {/* Bottom metrics panel */}
                          <div className="p-4 pt-3 flex justify-between items-center text-xs border-t border-[#D3D1C7]/20 mt-3">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3">
                                {(['❤️', '😂', '💡', '🐾'] as const).map((sym) => (
                                  <motion.button
                                    key={sym}
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.88, rotate: -5 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReact(post.post_id, sym);
                                    }}
                                    className="flex items-center gap-0.5 shrink-0 cursor-pointer group"
                                  >
                                    <span className="text-sm filter drop-shadow-xs transition-transform group-hover:scale-110">{sym}</span>
                                    <span className="text-[10px] font-sans font-extrabold text-[#E07A5F] w-3 text-left">
                                      {reactions[post.post_id]?.[sym] || 0}
                                    </span>
                                  </motion.button>
                                ))}
                              </div>

                              <button
                                onClick={() => setSelectedPost(post)}
                                className="flex items-center gap-1 font-bold text-[#888780] hover:text-[#2C2C2A]"
                              >
                                <MessageSquare className="w-3.5 h-3.5" /> {post.comments.length}
                              </button>

                              {/* Bookmark action inside list card */}
                              <motion.button
                                whileTap={{ scale: 0.90 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!currentUser) {
                                    onPromptSignUp();
                                  } else if (onToggleBookmarkPost) {
                                    onToggleBookmarkPost(post.post_id);
                                    trackAnalytics('bookmark_toggled', { post_id: post.post_id, origin: 'feed_list_card' });
                                  }
                                }}
                                className={`flex items-center gap-1 font-bold shrink-0 cursor-pointer ${
                                  savedPostIds.includes(post.post_id)
                                    ? 'text-[#81B29A]'
                                    : 'text-[#888780] hover:text-[#2C2C2A]'
                                }`}
                                title="Save to profile"
                              >
                                {savedPostIds.includes(post.post_id) ? (
                                  <BookmarkCheck className="w-3.5 h-3.5 text-[#81B29A]" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">{savedPostIds.includes(post.post_id) ? 'Saved' : 'Save'}</span>
                              </motion.button>

                              {/* Share action inside list card */}
                              <motion.button
                                whileTap={{ scale: 0.90 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareClick(post);
                                }}
                                className="flex items-center gap-1 font-bold text-[#888780] hover:text-[#2C2C2A] cursor-pointer"
                                title="Share post link"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Share</span>
                              </motion.button>
                            </div>

                            <span className="text-[10px] text-[#888780] font-body font-medium">
                              Published June 2026
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column (Top Paw-rents Leaderboard) */}
              <aside className="sticky top-20 space-y-4">
                <div className="bg-white border border-[#D3D1C7]/70 rounded-[2.2rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.015)] bento-card">
                  <div className="flex items-center gap-2 mb-4 border-b border-[#D3D1C7]/20 pb-3">
                    <div className="w-8 h-8 rounded-full bg-[#F2CC8F]/30 text-[#D29E3C] flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="font-sans font-extrabold text-[#3D405B] text-xs">Top Paw-rents 🏆</h3>
                      <p className="font-body text-[9px] text-[#888780]">Our community's most helpful pack caretakers</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {topPawrents.map((user, idx) => (
                      <div key={user.user_id} className="flex gap-2.5 pb-3 border-b border-[#D3D1C7]/30 last:border-0 last:pb-0 items-start">
                        <div className="relative shrink-0">
                          <img
                            src={user.avatar_url}
                            className="w-9 h-9 rounded-full object-cover border-2 border-[#E07A5F]/20 cursor-pointer hover:scale-105 transition-all"
                            onClick={() => onViewUserProfile(user)}
                            alt="avatar"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-[#3D405B] text-white font-extrabold rounded-full w-4 h-4 flex items-center justify-center text-[8px] border-2 border-white">
                            {idx + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between mb-0.5">
                            <span
                              className="font-display font-extrabold text-[11px] text-[#3D405B] hover:text-[#E07A5F] cursor-pointer truncate"
                              onClick={() => onViewUserProfile(user)}
                            >
                              {user.display_name}
                            </span>
                            <span className="font-mono text-[9px] font-extrabold text-[#E07A5F] shrink-0 bg-[#E07A5F]/10 px-1.5 py-0.5 rounded-md">
                              {user.engagementScore} pts
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[9px] text-[#888780] font-bold">
                            <span>{user.rankEmoji}</span>
                            <span className="truncate">{user.rankBadge}</span>
                          </div>

                          <div className="flex flex-wrap gap-x-2 text-[8px] text-[#888780]/90 font-semibold mt-1">
                            {user.stats.posts > 0 && <span>📝 {user.stats.posts} post{user.stats.posts > 1 && 's'}</span>}
                            {user.stats.likes > 0 && <span>❤️ {user.stats.likes} like{user.stats.likes > 1 && 's'}</span>}
                            {user.stats.tips > 0 && <span className="text-[#81B29A]">👩‍⚕️ {user.stats.tips} Vet Tip{user.stats.tips > 1 && 's'}</span>}
                            {user.stats.tipUpvotes > 0 && <span className="text-[#81B29A]">👍 {user.stats.tipUpvotes} Upvote{user.stats.tipUpvotes > 1 && 's'}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTON (New Post Form toggle) */}
      {!isCreating && !selectedPost && (
        <button
          onClick={() => {
            if (!currentUser) onPromptSignUp();
            else setIsCreating(true);
          }}
          className="fixed bottom-20 right-4 w-12 h-12 rounded-full bg-[#E07A5F] text-white flex items-center justify-center shadow-lg hover:scale-115 active:scale-90 transition-transform duration-200 z-30 group cursor-pointer"
          title="Share your story"
        >
          <Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500 ease-in-out" />
        </button>
      )}

      {/* CONFIRMATION REPORT OVERLAY */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-[#3D405B]/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-3xl border border-[#D3D1C7] max-w-sm w-full">
            <h3 className="font-sans font-extrabold text-[#3D405B] text-base mb-2">Report this Content?</h3>
            <p className="font-body text-xs text-[#888780] mb-4 leading-relaxed">
              Flagged items go to the admin moderation queue for review against our profanity guidelines.
            </p>
            <input
              type="text"
              placeholder="e.g. Inappropriate language or spam..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] text-xs focus:outline-none mb-4"
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setReportingPostId(null);
                  setReportReason('');
                }}
                className="flex-1 py-2 bg-[#FDFAF6] border border-[#D3D1C7] text-[#3D405B] rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reportingPostId) {
                    onReportPost(reportingPostId);
                    setReportingPostId(null);
                    setReportReason('');
                    setSelectedPost(null);
                    alert('Story has been successfully reported to PawPack Admins.');
                  }
                }}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-bold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
