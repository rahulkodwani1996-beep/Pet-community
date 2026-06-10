/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VetTip, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  BookOpen,
  Search,
  Book,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  ArrowLeft,
  Settings,
  Sparkles,
  AlertCircle,
  FileText,
  Check,
  Flame,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

const quizQuestions = [
  {
    question: "How much exercise or play time can you provide daily?",
    options: [
      { text: "🏃 Heavy: Up to 2 hours of active running & fetching!", category: "exercise", value: "high" },
      { text: "🚶 Moderate: 30-60 minutes of casual neighborhood walks.", category: "exercise", value: "medium" },
      { text: "🛋️ Light: Indoor play, slow pacing, and maximum couch cuddling.", category: "exercise", value: "low" }
    ]
  },
  {
    question: "What best describes your home/living space?",
    options: [
      { text: "🏡 Large house with a fenced-in lawn or yard.", category: "space", value: "large" },
      { text: "🏢 Spacious apartment, flat, or cozy townhouse.", category: "space", value: "medium" },
      { text: "🛏️ Shared studio, tight room, or dense city flat.", category: "space", value: "small" }
    ]
  },
  {
    question: "How long will your pet be left alone during an average workday?",
    options: [
      { text: "👨‍💻 Almost never (I work from home, or someone is always around).", category: "alone", value: "none" },
      { text: "💼 Moderate (4-6 hours of midday alone-time).", category: "alone", value: "moderate" },
      { text: "🕰️ Long hours (8+ hours of busy professional schedule).", category: "alone", value: "long" }
    ]
  },
  {
    question: "What's your tolerance for shedding and coat grooming?",
    options: [
      { text: "✂️ High Tolerance: I don't mind heavy shedding or regular groomer visits!", category: "grooming", value: "high" },
      { text: "🧼 Low Tolerance: Low maintenance. I prefer hypoallergenic or low-shed pets.", category: "grooming", value: "low" }
    ]
  }
];

const breedMatches = [
  {
    name: "Golden Retriever 🐶",
    type: "dog",
    description: "The ultimate family companion! Golden Retrievers are joyful, highly trainable, and adore sharing long outdoor walks. Ideal for households who want an active, loving partner.",
    lifestyle: "Best with: House/Yard, high/medium activity, can stay alone moderately.",
    exercise: "high", space: "large", alone: "moderate", grooming: "high",
    vibe: "Warm, outgoing, loyal, and energetic"
  },
  {
    name: "Border Collie 🎓",
    type: "dog",
    description: "The Einstein of dogs! Collies possess endless stamina and brilliant intellect. They thrive when given agility tasks, training puzzles, and sprawling fields to run in.",
    lifestyle: "Best with: Active owners, large spaces, high mental stimulation tasks.",
    exercise: "high", space: "large", alone: "none", grooming: "high",
    vibe: "Hyper-focused, super active, and intensely smart"
  },
  {
    name: "French Bulldog 🥐",
    type: "dog",
    description: "A charming companion! Frenchies are compact, quiet, and extremely content to snooze on an apartment sofa. Ideal for urban professionals with busy schedules.",
    lifestyle: "Best with: Apartment living, light walks, can handle moderate alone-time.",
    exercise: "low", space: "medium", alone: "moderate", grooming: "low",
    vibe: "Playful, affectionate, easy-going, and adaptable"
  },
  {
    name: "Ragdoll Cat 🧸",
    type: "cat",
    description: "Living teddy bears! Ragdolls are famous for their docile, canine-like devotion. They will happily limp into your arms and companionably follow you between rooms.",
    lifestyle: "Best with: Indoor apartments, medium/low play, loves constant attention.",
    exercise: "low", space: "medium", alone: "none", grooming: "high",
    vibe: "Serene, floppy, affectionate, and peaceful"
  },
  {
    name: "Maine Coon 🦁",
    type: "cat",
    description: "The gentle giant of the feline world! Maine Coons have majestic, lynx-like tufts and a water-resistant dense coat. Extremely social, curious, and dog-like in behavior.",
    lifestyle: "Best with: Larger rooms, moderately active play, loves running and water.",
    exercise: "medium", space: "large", alone: "moderate", grooming: "high",
    vibe: "Clownish, friendly, majestic, and massive"
  },
  {
    name: "British Shorthair 🩶",
    type: "cat",
    description: "Calm, dignified, and independent. The British Shorthair is famously round-cheeked, extremely sturdy, and content to spend their day napping on a high shelf while you work.",
    lifestyle: "Best with: Busy professionals, apartments, long work schedules.",
    exercise: "low", space: "medium", alone: "long", grooming: "low",
    vibe: "Dignified, highly independent, and cozy"
  },
  {
    name: "Chihuahua 🌶️",
    type: "dog",
    description: "Tiny package with immense personality! Chihuahuas form rock-solid emotional devotions to their owners. Perfect for compact spaces and quick city strolls.",
    lifestyle: "Best with: Tiny flats/studios, loves constant closeness, low diet cost.",
    exercise: "low", space: "small", alone: "none", grooming: "low",
    vibe: "Spunky, protective, intensely loyal, and alert"
  }
];

const calculateQuizResults = (answers: Record<string, string>) => {
  return breedMatches.map((breed) => {
    let matches = 0;
    const totalFields = 4;
    
    if (answers.exercise === breed.exercise) matches++;
    if (answers.space === breed.space) matches++;
    if (answers.alone === breed.alone) matches++;
    if (answers.grooming === breed.grooming) matches++;
    
    const score = Math.round((matches / totalFields) * 100);
    return { breed, score };
  }).sort((a, b) => b.score - a.score);
};

interface PetLearnProps {
  tips: VetTip[];
  currentUser: User | null;
  activeSpecies: 'dog' | 'cat' | 'both';
  trackAnalytics: (eventName: any, params: any) => void;
  onVoteTip: (tipId: string, voteType: 'up' | 'down') => void;
  onAddTip: (tip: VetTip) => void;
  onPromptSignUp: () => void;
  initialTipId?: string | null;
  onClearInitialTipId?: () => void;
  searchQuery?: string;
  savedTipIds?: string[];
  onToggleBookmarkTip?: (tipId: string) => void;
  onCommentTip?: (tipId: string, commentBody: string) => void;
}

export default function PetLearn({
  tips,
  currentUser,
  activeSpecies,
  trackAnalytics,
  onVoteTip,
  onAddTip,
  onPromptSignUp,
  initialTipId,
  onClearInitialTipId,
  searchQuery: globalSearchQuery = '',
  savedTipIds = [],
  onToggleBookmarkTip,
  onCommentTip
}: PetLearnProps) {
  // Navigation
  const [selectedTip, setSelectedTip] = useState<VetTip | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  // Search & Filter options
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const [learnView, setLearnView] = useState<'tips' | 'qa'>('tips');
  
  // Recent Searches state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [shareToastText, setShareToastText] = useState('');
  const [newCommentBody, setNewCommentBody] = useState('');

  // PetMatch Interactive Quiz states
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<{ breed: typeof breedMatches[0], score: number }[]>([]);

  // Continue Reading & Progress States
  const [inProgressTipIds, setInProgressTipIds] = useState<string[]>([]);
  const [finishedTipIds, setFinishedTipIds] = useState<string[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Load reading progress states from localStorage
  React.useEffect(() => {
    try {
      const storedInProgress = localStorage.getItem('pawpack_in_progress_tips');
      const storedFinished = localStorage.getItem('pawpack_finished_tips');
      setInProgressTipIds(storedInProgress ? JSON.parse(storedInProgress) : []);
      setFinishedTipIds(storedFinished ? JSON.parse(storedFinished) : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleOpenTip = (tip: VetTip, origin: string = 'list_card') => {
    setSelectedTip(tip);
    trackAnalytics('tip_read', { tip_id: tip.tip_id, element: origin });

    try {
      const inProgress = JSON.parse(localStorage.getItem('pawpack_in_progress_tips') || '[]');
      const finished = JSON.parse(localStorage.getItem('pawpack_finished_tips') || '[]');
      setFinishedTipIds(finished);
      
      if (!finished.includes(tip.tip_id)) {
        const updated = [tip.tip_id, ...inProgress.filter((id: string) => id !== tip.tip_id)].slice(0, 10);
        setInProgressTipIds(updated);
        localStorage.setItem('pawpack_in_progress_tips', JSON.stringify(updated));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishTipDetail = (tipId: string) => {
    try {
      const finished = JSON.parse(localStorage.getItem('pawpack_finished_tips') || '[]');
      if (!finished.includes(tipId)) {
        const updatedFinished = [...finished, tipId];
        setFinishedTipIds(updatedFinished);
        localStorage.setItem('pawpack_finished_tips', JSON.stringify(updatedFinished));
        
        const inProgress = JSON.parse(localStorage.getItem('pawpack_in_progress_tips') || '[]');
        const updatedInProgress = inProgress.filter((id: string) => id !== tipId);
        setInProgressTipIds(updatedInProgress);
        localStorage.setItem('pawpack_in_progress_tips', JSON.stringify(updatedInProgress));
        
        trackAnalytics('vet_tip_completed_reading', { tip_id: tipId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (!selectedTip) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        const progress = (scrollTop / scrollHeight) * 100;
        setScrollProgress(progress);

        // Auto finish if scrolled past 93%
        if (progress >= 93) {
          handleFinishTipDetail(selectedTip.tip_id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [selectedTip]);

  // Load search history from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('pet_learn_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Sync recentSearches to localStorage helper
  const saveRecentSearches = (newHistory: string[]) => {
    setRecentSearches(newHistory);
    localStorage.setItem('pet_learn_recent_searches', JSON.stringify(newHistory));
  };

  // Add search query to history on debounce
  React.useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
        const combined = [trimmed, ...filtered].slice(0, 5);
        localStorage.setItem('pet_learn_recent_searches', JSON.stringify(combined));
        return combined;
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle deep-link initialTipId prop
  React.useEffect(() => {
    if (initialTipId) {
      const t = tips.find((item) => item.tip_id === initialTipId);
      if (t) {
        handleOpenTip(t, 'deep_link');
      }
    }
  }, [initialTipId, tips]);

  const handleShareClick = (t: VetTip) => {
    const simulatedUrl = `${window.location.origin}${window.location.pathname}?tip_id=${t.tip_id}`;
    const shareData = {
      title: t.title,
      text: `Learn from professional vets: "${t.title}" on PawPack`,
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
          setShareToastText('Deep link copied to clipboard!');
          setTimeout(() => setShareToastText(''), 2500);
        });
    } else {
      setShareToastText('Deep link copied to clipboard!');
      navigator.clipboard.writeText(simulatedUrl);
      setTimeout(() => setShareToastText(''), 2500);
    }
    trackAnalytics('vet_tip_shared_deep_link', { tip_id: t.tip_id, link: simulatedUrl });
  };

  // Ad-hoc new tip authoring form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newSpeciesTag, setNewSpeciesTag] = useState<'dog' | 'cat' | 'both'>('dog');
  const [newCategory, setNewCategory] = useState<'nutrition' | 'behavior' | 'grooming' | 'health' | 'training' | 'first-aid'>('nutrition');
  const [newAuthorName, setNewAuthorName] = useState('Dr. Elena Rostova');
  const [newAuthorCreds, setNewAuthorCreds] = useState('DVM, clinical specialist');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newReadMins, setNewReadMins] = useState(5);
  const [newFeatured, setNewFeatured] = useState(false);

  const categories = ['All', 'Nutrition', 'Behavior', 'Grooming', 'Health', 'Training', 'First Aid'];

  // Filter & Search Logic
  const activeSearch = (globalSearchQuery || searchQuery).trim();

  const filteredTips = tips.filter((tip) => {
    // 1. Global species filter
    if (activeSpecies !== 'both') {
      const matchesSpecies = tip.species_tag === activeSpecies || tip.species_tag === 'both';
      if (!matchesSpecies) return false;
    }

    // 2. Category chip filter
    if (activeCategory !== 'All') {
      // Map display name to tag
      const simplifiedCat = activeCategory.replace(' ', '-').toLowerCase();
      const matchesCategory = tip.category.toLowerCase() === simplifiedCat;
      if (!matchesCategory) return false;
    }

    // 3. Search query
    if (activeSearch) {
      const term = activeSearch.toLowerCase();
      const matchesSearch =
        tip.title.toLowerCase().includes(term) ||
        tip.body.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    return true;
  });

  // Calculate featured tip from matching
  const featuredTip = filteredTips.find((t) => t.is_featured) || filteredTips[0];

  // Helper parser to render text blocks safely without react-markdown bugs
  const renderRichBody = (bodyText: string) => {
    const lines = bodyText.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-sans font-extrabold text-[#3D405B] text-base mt-4 mb-2">
            {trimmed.substring(3)}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-sans font-bold text-[#3D405B] text-sm mt-3 mb-1.5 text-[#E07A5F]">
            {trimmed.substring(4)}
          </h3>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <li key={idx} className="font-body text-xs text-[#2C2C2A] list-disc ml-5 leading-relaxed mb-1">
            {trimmed.substring(2)}
          </li>
        );
      }
      return (
        <p key={idx} className="font-body text-xs text-[#2C2C2A] leading-relaxed mb-3">
          {trimmed}
        </p>
      );
    });
  };

  const handleVote = (tipId: string, voteType: 'up' | 'down') => {
    if (!currentUser) {
      onPromptSignUp();
      return;
    }
    onVoteTip(tipId, voteType);
    trackAnalytics('tip_read', { tip_id: tipId, vote: voteType });

    // Update state locally for selectedTip feedback immediately
    if (selectedTip) {
      const ups = [...selectedTip.helpful_ups];
      const downs = [...selectedTip.helpful_downs];
      const uid = currentUser.user_id;

      if (voteType === 'up') {
        const uIdx = ups.indexOf(uid);
        if (uIdx > -1) ups.splice(uIdx, 1);
        else {
          ups.push(uid);
          const dIdx = downs.indexOf(uid);
          if (dIdx > -1) downs.splice(dIdx, 1);
        }
      } else {
        const dIdx = downs.indexOf(uid);
        if (dIdx > -1) downs.splice(dIdx, 1);
        else {
          downs.push(uid);
          const uIdx = ups.indexOf(uid);
          if (uIdx > -1) ups.splice(uIdx, 1);
        }
      }

      setSelectedTip({
        ...selectedTip,
        helpful_ups: ups,
        helpful_downs: downs
      });
    }
  };

  const submitNewTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      alert('Must populate Title and Body!');
      return;
    }

    const created: VetTip = {
      tip_id: 'tip_' + Date.now(),
      species_tag: newSpeciesTag,
      category: newCategory,
      title: newTitle,
      body: newBody,
      author_name: newAuthorName,
      author_credentials: newAuthorCreds,
      thumbnail_url: newThumbnail || 'https://lh3.googleusercontent.com/aida-public/AB6AXuArGsuBNZJeVyZRb6wqvW3yNCH1JqD43bH4RJeBaRJmISarAy1SFYzViqPwy4ZNnOo6_Ak3i7I_wn7EApfP1DxuilGxNEPqtBsrlKUaamhcNb564BVh_ZB-ndyEun20vecmecMoIxfoMNAex_htQf3_Xe172zlBGFGGeN9VXOLvHkTkq6cPB42xFsdakIkd5pj7YqrZaPOf17MxpAAlih9H_nbiDzg-wiwVh-GPQ2Cz4LMn9OVYBvmUYvQQ4BEs9Jp4OiLH5ZqKU-s',
      read_time_mins: newReadMins,
      created_at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      is_featured: newFeatured,
      helpful_ups: [],
      helpful_downs: []
    };

    onAddTip(created);
    trackAnalytics('tip_read', { admin_created: created.tip_id });

    // Reset Form
    setNewTitle('');
    setNewBody('');
    setNewThumbnail('');
    setNewFeatured(false);
    setAdminOpen(false);
  };

  // Get related tips from Same category
  const getRelatedTips = (currentTip: VetTip) => {
    return tips
      .filter((t) => t.tip_id !== currentTip.tip_id && t.category === currentTip.category)
      .slice(0, 3);
  };

  // Get in-progress tips for shelf
  const inProgressTips = inProgressTipIds
    .map((id) => tips.find((t) => t.tip_id === id))
    .filter((t): t is VetTip => !!t)
    .slice(0, 3);

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 pt-4 px-2 relative">
      {shareToastText && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#3D405B] text-white text-xs font-semibold px-4 py-2.5 rounded-full z-50 shadow-sm flex items-center gap-1.5 animate-bounce">
          <Check className="w-3.5 h-3.5 text-[#81B29A]" /> {shareToastText}
        </div>
      )}
      <AnimatePresence mode="wait">
        {/* VET TIP DETAIL SCREEN VIEW */}
        {selectedTip ? (
          <motion.div
            key="tip-detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-xs"
          >
            {/* Scroll progress bar */}
            <div 
              className="fixed top-0 left-0 h-[3.5px] bg-[#E07A5F] z-50 transition-all duration-100 ease-out" 
              style={{ width: `${scrollProgress}%` }}
            />

            {/* Back button and share button */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  setSelectedTip(null);
                  try {
                    const stored = localStorage.getItem('pawpack_in_progress_tips');
                    setInProgressTipIds(stored ? JSON.parse(stored) : []);
                  } catch (e) {}
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to library
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      onPromptSignUp();
                    } else if (onToggleBookmarkTip) {
                      onToggleBookmarkTip(selectedTip.tip_id);
                      trackAnalytics('bookmark_tip_toggled', { tip_id: selectedTip.tip_id, origin: 'detail_overlay' });
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    savedTipIds.includes(selectedTip.tip_id)
                      ? 'bg-[#81B29A]/15 border-[#81B29A] text-[#81B29A]'
                      : 'bg-[#FDFAF6] border-[#D3D1C7] text-[#3D405B] hover:bg-[#E07A5F]/5'
                  }`}
                  title="Bookmark Vet Tip"
                >
                  {savedTipIds.includes(selectedTip.tip_id) ? (
                    <BookmarkCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5" />
                  )}
                  <span>{savedTipIds.includes(selectedTip.tip_id) ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={() => handleShareClick(selectedTip)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs font-bold text-[#3D405B] hover:bg-[#E07A5F]/5 transition-colors cursor-pointer animate-pulse-subtle"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#E07A5F]" /> Share Tip Deep Link
                </button>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-2xl overflow-hidden h-48 bg-[#FDFAF6] border border-[#D3D1C7] mb-4 relative">
              <img src={selectedTip.thumbnail_url} className="w-full h-full object-cover" alt="article cover" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="bg-[#3D405B] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  {selectedTip.species_tag}
                </span>
                <span className="bg-[#E07A5F]/90 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  {selectedTip.category}
                </span>
              </div>
            </div>

            {/* Context line info */}
            <div className="flex items-center gap-3 text-[10px] text-[#888780] mb-2 font-body font-bold">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#E07A5F]" /> {selectedTip.read_time_mins} min read
              </span>
              <span>•</span>
              <span>Published {selectedTip.created_at}</span>
            </div>

            {/* Title */}
            <h1 className="font-sans font-extrabold text-[#3D405B] text-xl mb-4 leading-tight">
              {selectedTip.title}
            </h1>

            {/* Author Byline credentials */}
            <div className="flex items-center gap-2.5 bg-[#FDFAF6] p-3 rounded-2xl border border-[#D3D1C7]/30 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#E07A5F]/15 flex items-center justify-center font-sans font-bold text-xs text-[#E07A5F]">
                CV
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D405B]">{selectedTip.author_name}</p>
                <p className="text-[10px] text-[#888780] font-body">{selectedTip.author_credentials}</p>
              </div>
            </div>

            {/* Main Text Content */}
            <article className="prose max-w-none text-[#2C2C2A] space-y-1 pb-6 border-b border-[#D3D1C7]/30 mb-6">
              {renderRichBody(selectedTip.body)}
            </article>

            {/* Reading completion status & manually finish indicator */}
            <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-[#E07A5F]/5 border border-[#E07A5F]/20">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${finishedTipIds.includes(selectedTip.tip_id) ? 'bg-[#81B29A] text-white' : 'bg-[#E07A5F]/20 text-[#E07A5F]'}`}>
                  {finishedTipIds.includes(selectedTip.tip_id) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#E07A5F]" />
                  )}
                </div>
                <div>
                  <h4 className="font-sans font-extrabold text-xs text-[#3D405B]">
                    {finishedTipIds.includes(selectedTip.tip_id) ? 'Completed Article' : 'Reading Progress'}
                  </h4>
                  <p className="font-body text-[10px] text-[#888780]">
                    {finishedTipIds.includes(selectedTip.tip_id) 
                      ? 'You successfully finished this vet guideline!' 
                      : `Scrolled progress: ${Math.round(scrollProgress)}% completed`}
                  </p>
                </div>
              </div>
              
              {!finishedTipIds.includes(selectedTip.tip_id) && (
                <button
                  onClick={() => handleFinishTipDetail(selectedTip.tip_id)}
                  className="px-3.5 py-1.5 bg-[#81B29A] hover:bg-[#81B29A]/90 text-white font-sans font-bold text-[11px] rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-white" /> Mark as Read
                </button>
              )}
            </div>

            {/* Was this helpful ratings footer bar */}
            <div className="flex justify-between items-center bg-[#FDFAF6] rounded-2xl p-4 border border-[#D3D1C7] mb-6">
              <div>
                <span className="block font-sans font-bold text-xs text-[#3D405B]">Was this article helpful?</span>
                <span className="text-[10px] text-[#888780] font-body">Feedback matches clinical guidelines</span>
              </div>

              {currentUser ? (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.90 }}
                    onClick={() => handleVote(selectedTip.tip_id, 'up')}
                    className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      selectedTip.helpful_ups.includes(currentUser.user_id)
                        ? 'bg-[#81B29A] text-white'
                        : 'bg-white border border-[#D3D1C7] hover:bg-neutral-50'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" /> ({selectedTip.helpful_ups.length})
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.90 }}
                    onClick={() => handleVote(selectedTip.tip_id, 'down')}
                    className={`p-2 rounded-xl flex items-center gap-1.5 text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                      selectedTip.helpful_downs.includes(currentUser.user_id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white border border-[#D3D1C7] hover:bg-neutral-50'
                    }`}
                  >
                    <ThumbsDown className="w-4 h-4" /> ({selectedTip.helpful_downs.length})
                  </motion.button>
                </div>
              ) : (
                <button
                  onClick={onPromptSignUp}
                  className="text-xs font-bold text-[#E07A5F] underline"
                >
                  Sign in to rate article
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl border border-[#D3D1C7] p-5 mb-8">
              <h3 className="font-sans font-extrabold text-[#3D405B] text-sm mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#E07A5F]" /> 
                Comments ({selectedTip.comments?.length || 0})
              </h3>
              
              {/* Comment List */}
              <div className="space-y-4 mb-5">
                {(selectedTip.comments || []).map(comment => (
                  <div key={comment.comment_id} className="bg-[#FDFAF6] p-3 rounded-xl border border-[#D3D1C7]/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#E07A5F]/20 flex items-center justify-center text-[10px] font-bold text-[#E07A5F]">
                        {comment.author_id.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold text-[#3D405B]">User {comment.author_id.substring(0,4)}</span>
                      <span className="text-[9px] text-[#888780]">{comment.created_at}</span>
                    </div>
                    <p className="text-xs text-[#2C2C2A] font-body leading-relaxed">{comment.body}</p>
                  </div>
                ))}
                {(!selectedTip.comments || selectedTip.comments.length === 0) && (
                  <p className="text-xs text-[#888780] italic">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>

              {/* Add Comment Input */}
              {currentUser ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newCommentBody}
                    onChange={(e) => setNewCommentBody(e.target.value)}
                    placeholder="Add a comment... (e.g. 'must read')"
                    className="flex-1 px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs focus:outline-none focus:border-[#888780]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCommentBody.trim() && onCommentTip) {
                        onCommentTip(selectedTip.tip_id, newCommentBody.trim());
                        setNewCommentBody('');
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      if (newCommentBody.trim() && onCommentTip) {
                        onCommentTip(selectedTip.tip_id, newCommentBody.trim());
                        setNewCommentBody('');
                      }
                    }}
                    disabled={!newCommentBody.trim()}
                    className="px-4 py-2 bg-[#E07A5F] text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-opacity"
                  >
                    Post
                  </button>
                </div>
              ) : (
                <div className="text-center p-3 bg-[#FDFAF6] rounded-xl border border-dashed border-[#D3D1C7]">
                  <p className="text-xs text-[#888780] mb-2">Sign in to join the conversation</p>
                  <button onClick={onPromptSignUp} className="text-xs font-bold text-[#E07A5F] hover:underline">
                    Sign in here
                  </button>
                </div>
              )}
            </div>

            {/* Related tips section recommendations */}
            {(() => {
              const related = getRelatedTips(selectedTip);
              if (related.length === 0) return null;
              return (
                <div>
                  <h3 className="font-sans font-bold text-sm text-[#3D405B] mb-3">Related health tips</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {related.map((t) => (
                      <div
                        key={t.tip_id}
                        onClick={() => {
                          setSelectedTip(t);
                          trackAnalytics('tip_read', { tip_id: t.tip_id, source: 'related' });
                        }}
                        className="bg-[#FDFAF6] border border-[#D3D1C7]/30 p-3 rounded-2xl cursor-pointer hover:border-[#D3D1C7]"
                      >
                        <h4 className="font-sans font-bold text-xs text-[#3D405B] line-clamp-2 h-8 leading-tight mb-1.5">
                          {t.title}
                        </h4>
                        <span className="text-[9px] font-extrabold text-[#E07A5F]">{t.category.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        ) : quizActive ? (
          <motion.div
            key="petmatch-quiz"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-3xl border-2 border-[#F2CC8F] p-5 sm:p-6 shadow-xs space-y-5"
          >
            {/* Header info */}
            <div className="flex justify-between items-center pb-3 border-b border-[#D3D1C7]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#F2CC8F]/20 flex items-center justify-center text-sm">
                  🎯
                </div>
                <div>
                  <h2 className="font-sans font-extrabold text-[#3D405B] text-sm leading-snug">
                    PetMatch Companion Analyzer
                  </h2>
                  <p className="font-body text-[10px] text-[#888780]">
                    Scientific companion personality compatibility checker
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setQuizActive(false);
                  trackAnalytics('pet_match_quiz_closed', { reason: 'user_exit' });
                }}
                className="text-xs font-bold text-[#888780] hover:text-[#3D405B] hover:underline cursor-pointer"
              >
                Quit Quiz
              </button>
            </div>

            {quizStep < quizQuestions.length ? (
              // ACTIVE ANSWER STEPPING
              <div className="space-y-4">
                {/* Visual ProgressBar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-[#888780]">
                    <span>Step {quizStep + 1} of {quizQuestions.length} ({Math.round((quizStep / quizQuestions.length) * 100)}% Done)</span>
                    <span className="text-[#E07A5F]">Match Criteria</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#FDFAF6] rounded-full overflow-hidden border border-[#D3D1C7]/30">
                    <div 
                      className="h-full bg-linear-to-r from-[#F2CC8F] to-[#E07A5F] transition-all duration-300" 
                      style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question body */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-[#E07A5F] uppercase font-bold tracking-wider">
                    Question • Lifestyle & Space
                  </span>
                  <h3 className="font-sans font-extrabold text-[#3D405B] text-xs sm:text-sm leading-snug">
                    {quizQuestions[quizStep].question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {quizQuestions[quizStep].options.map((option, oIdx) => (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        const nextAnswers = { ...quizAnswers, [quizQuestions[quizStep].options[0].category]: option.value };
                        setQuizAnswers(nextAnswers);
                        if (quizStep + 1 >= quizQuestions.length) {
                          // Calculate results and transition
                          const calculated = calculateQuizResults(nextAnswers);
                          setQuizResults(calculated);
                        }
                        setQuizStep(quizStep + 1);
                        trackAnalytics('pet_match_question_answered', { question_idx: quizStep, optionSelected: option.value });
                      }}
                      key={oIdx}
                      className="w-full p-4 text-left bg-[#FDFAF6]/60 hover:bg-[#FDFAF6] active:bg-[#F2CC8F]/10 border border-[#D3D1C7] hover:border-[#F2CC8F] rounded-2xl transition-all font-body text-xs text-[#3D405B] font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>{option.text}</span>
                      <span className="text-xs text-[#E07A5F]">Select →</span>
                    </motion.button>
                  ))}
                </div>

                {/* Simple Back button */}
                {quizStep > 0 && (
                  <button
                    onClick={() => setQuizStep(quizStep - 1)}
                    className="text-xs font-bold text-[#888780] hover:text-[#2C2C2A] flex items-center gap-1 pt-1 underline hover:no-underline"
                  >
                    ← Back to previous question
                  </button>
                )}
              </div>
            ) : (
              // COMPLETED: RESULTS VIEW
              <div className="space-y-4">
                <div className="text-center bg-[#81B29A]/10 border border-[#81B29A]/30 rounded-2xl p-4 space-y-1">
                  <span className="text-2xl">🎉</span>
                  <h3 className="font-sans font-extrabold text-[#3D405B] text-sm">
                    Clinical Match Calculations Ready!
                  </h3>
                  <p className="font-body text-[10px] text-[#888780]">
                    Here are your highest compatible breeds based on your daily lifestyle parameters:
                  </p>
                </div>

                {/* Match result cards */}
                <div className="space-y-3 pt-1">
                  {quizResults.slice(0, 3).map((match, mIdx) => (
                    <div 
                      key={mIdx}
                      className="bg-white border-2 border-[#D3D1C7]/50 rounded-2xl p-4 space-y-2 hover:border-[#F2CC8F] transition-all relative overflow-hidden"
                    >
                      {/* Percent Match Badge */}
                      <div className="absolute top-3.5 right-3.5 px-2.5 py-1 bg-[#E07A5F] text-white text-[10px] font-extrabold rounded-full">
                        🎯 {match.score}% Match
                      </div>

                      <div className="space-y-1 pr-16">
                        <span className="bg-[#E07A5F]/15 text-[#E07A5F] text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                          {match.breed.type.toUpperCase()}
                        </span>
                        <h4 className="font-sans font-extrabold text-sm text-[#3D405B] leading-none mt-1">
                          {match.breed.name}
                        </h4>
                      </div>

                      <p className="font-body text-[11px] text-[#2C2C2A] leading-relaxed">
                        {match.breed.description}
                      </p>

                      <div className="bg-[#FDFAF6] border border-[#D3D1C7]/30 rounded-xl p-2.5 text-[10px] font-body text-[#888780] space-y-1">
                        <p className="font-bold text-[#3D405B] flex items-center gap-1">
                          ⭐ Special Vibe: <span className="font-sans text-[#E07A5F]">{match.breed.vibe}</span>
                        </p>
                        <p className="leading-none mt-1 text-[9px]">{match.breed.lifestyle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setQuizStep(0);
                      setQuizAnswers({});
                      setQuizResults([]);
                      trackAnalytics('pet_match_quiz_restarted', {});
                    }}
                    className="flex-1 py-2.5 bg-white border border-[#D3D1C7] text-[#3D405B] rounded-xl text-xs font-extrabold hover:bg-[#FDFAF6] active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Retake Quiz 🔄
                  </button>
                  <button
                    onClick={() => {
                      setQuizActive(false);
                      trackAnalytics('pet_match_quiz_finished_and_exited', {});
                    }}
                    className="flex-1 py-2.5 bg-[#E07A5F] text-white rounded-xl text-xs font-extrabold hover:opacity-95 active:scale-95 transition-all text-center cursor-pointer"
                  >
                    Back to Vet Articles 📖
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          // PET LEARN ROOT MAIN DIRECTORY
          <motion.div key="learn-directory" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* Learn Sub-navigation */}
            <div className="flex gap-2 mb-4 p-1 bg-[#FDFAF6] border border-[#D3D1C7] rounded-full">
              <button 
                onClick={() => setLearnView('tips')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${learnView === 'tips' ? 'bg-[#3D405B] text-white shadow-sm' : 'text-[#888780] hover:text-[#3D405B]'}`}
              >
                Vet Tips
              </button>
              <button 
                onClick={() => setLearnView('qa')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all ${learnView === 'qa' ? 'bg-[#3D405B] text-white shadow-sm' : 'text-[#888780] hover:text-[#3D405B]'}`}
              >
                Community Q&A
              </button>
            </div>

            {learnView === 'qa' ? (
              <div className="space-y-4">
                <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-sans font-bold text-[#3D405B] text-sm mb-1">Ask the Experts</h3>
                    <p className="font-body text-[10px] text-[#888780]">Flag your pressing questions for certified vet review.</p>
                  </div>
                  <button className="px-3 py-1.5 bg-[#E07A5F] text-white rounded-xl text-xs font-bold hover:bg-[#E07A5F]/90 transition-all">
                    Ask Question
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { q: "Is it normal for my 6-month puppy to eat grass constantly?", status: "answered", author: "Dr. Elena Rostova", ans: "Occasional grass grazing is normal, often due to boredom or desire for fiber. However, if excessive or accompanied by vomiting..." },
                    { q: "What's the best way to introduce a new kitten to a senior cat?", status: "answered", author: "Dr. Marcella", ans: "Patience and scent mingling! Start by keeping them in separate rooms and let them sniff each other's bedding before face-to-face..." },
                    { q: "Can dogs safely consume small amounts of plain yogurt?", status: "pending", author: "", ans: "" }
                  ].map((qa, i) => (
                    <div key={i} className="bg-white border border-[#D3D1C7] rounded-2xl p-4 shadow-sm hover:border-[#F2CC8F] transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${qa.status === 'answered' ? 'bg-[#81B29A]/15 text-[#81B29A]' : 'bg-[#F2CC8F]/20 text-[#E07A5F]'}`}>
                          {qa.status === 'answered' ? 'Answered by Vet' : 'Pending Review'}
                        </span>
                      </div>
                      <h4 className="font-sans font-extrabold text-[#3D405B] text-xs sm:text-sm mb-2">{qa.q}</h4>
                      {qa.status === 'answered' && (
                        <div className="bg-[#FDFAF6] rounded-xl p-3 border border-[#D3D1C7]/40">
                          <p className="text-[10px] text-[#888780] font-bold mb-1">Response from {qa.author}</p>
                          <p className="font-body text-[#2C2C2A] text-[11px] leading-relaxed">{qa.ans}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
            <>
            {/* Search row with Admin Vet toggle bar */}
            <div className="flex gap-2.5 mb-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search vet titles or clinical insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FDFAF6]/60 backdrop-blur-xs border border-[#D3D1C7]/70 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]/40 shadow-xs transition-all placeholder:text-[#888780]/80 font-sans"
                />
                <Search className="w-4 h-4 text-[#888780]/80 absolute left-3.5 top-3.5" />
              </div>

              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="px-4 py-3 bg-[#3D405B] text-white rounded-full text-xs font-bold hover:bg-[#3D405B]/90 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all flex items-center shrink-0"
              >
                Publish 📝
              </button>
            </div>

            {/* Recent Searches chips row */}
            {recentSearches.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mb-4 bg-[#FDFAF6]/65 border border-[#D3D1C7]/30 px-3 py-2 rounded-2xl">
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

            {/* Continue Reading Horizontal Scroll Shelf */}
            {inProgressTips.length > 0 && (
              <div className="mb-5 bg-[#FAF9F5] border border-[#D3D1C7] rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#E07A5F]" />
                    <h3 className="font-sans font-extrabold text-xs text-[#3D405B]">Continue Reading</h3>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] animate-pulse">
                    Saved progress
                  </span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                  {inProgressTips.map((tip) => {
                    return (
                      <div
                        key={`resume-${tip.tip_id}`}
                        onClick={() => handleOpenTip(tip, 'continue_reading_shelf')}
                        className="min-w-[195px] w-[195px] bg-white rounded-2xl border border-[#D3D1C7]/70 p-3 hover:border-[#E07A5F]/50 transition-all duration-300 relative group cursor-pointer flex flex-col justify-between shrink-0 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[8px] font-extrabold uppercase tracking-wider text-[#888780] mb-1.5">
                            <span className="text-[#81B29A]">{tip.category}</span>
                            <span className="flex items-center gap-0.5 text-[#E07A5F]">
                              <Clock className="w-2.5 h-2.5" /> {tip.read_time_mins}m left
                            </span>
                          </div>
                          <h4 className="font-sans font-extrabold text-[11px] text-[#3D405B] leading-snug line-clamp-2 mb-2 group-hover:text-[#E07A5F] transition-all">
                            {tip.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#D3D1C7]/20 mt-1">
                          <span className="text-[9px] font-medium text-[#888780] truncate max-w-[100px]">By {tip.author_name}</span>
                          <span className="text-[9px] font-sans font-bold text-[#E07A5F] flex items-center gap-0.5 group-hover:underline">
                            Resume →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PetMatch Quiz Hero Card Promo */}
            <div className="bg-linear-to-r from-[#F2CC8F]/20 via-[#FDFAF6] to-[#E07A5F]/10 border-2 border-[#F2CC8F]/40 rounded-3xl p-4 sm:p-5 mb-5 shadow-[0_8px_20px_rgba(242,204,143,0.1)] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F2CC8F]/15 rounded-full translate-x-8 -translate-y-8" />
              <div className="space-y-1 relative z-10 max-w-sm">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#F2CC8F]/30 text-[#E07A5F] rounded-full text-[9px] font-extrabold uppercase tracking-wider leading-none">
                  🎯 Interactive Matcher
                </div>
                <h3 className="font-sans font-extrabold text-xs sm:text-sm text-[#3D405B] mt-1.5 leading-none">
                  Find Your Perfect Breed Companion!
                </h3>
                <p className="font-body text-[10px] text-[#888780] leading-normal">
                  Answer a few quick questions about your home space, workload, and exercise schedule. Let our diagnostic algorithm determine your perfect pet matches.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuizActive(true);
                  setQuizStep(0);
                  setQuizAnswers({});
                  trackAnalytics('pet_match_quiz_started', { entrypoint: 'learn_promo_banner' });
                }}
                className="px-4 py-2.5 bg-[#E07A5F] hover:bg-[#E07A5F]/95 text-white text-[11px] font-extrabold rounded-full shadow-[0_4px_14px_rgba(224,122,95,0.25)] hover:scale-[1.02] active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1"
              >
                Start PetMatch! 🐶🐾
              </button>
            </div>

            {/* Admin Publishing form toggled */}
            {adminOpen && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border-2 border-[#E07A5F] p-5 mb-5 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-[#D3D1C7]">
                  <h3 className="font-sans font-extrabold text-[#3D405B] text-sm flex items-center gap-1">
                    <FileText className="w-4 h-4 text-[#E07A5F]" /> Author Vet Curated Article
                  </h3>
                  <button onClick={() => setAdminOpen(false)} className="text-[#888780] hover:text-black text-xs font-bold">
                    Close
                  </button>
                </div>

                <form onSubmit={submitNewTip} className="space-y-3 font-body text-xs">
                  <div>
                    <label className="block font-bold text-[#3D405B] mb-1">Article Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] focus:outline-none"
                      placeholder="e.g., Safe chewing treats for kittens"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#3D405B] mb-1">Rich Text Story Body</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] font-mono text-[10px]"
                      placeholder="## Introduction&#10;Write content paragraphs here. Add bullet rows with:&#10;- Bullet point one&#10;- Bullet point two"
                      value={newBody}
                      onChange={(e) => setNewBody(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#3D405B] mb-1">Target Species</label>
                      <select
                        className="w-full px-2 py-1.5 rounded-lg border border-[#D3D1C7]"
                        value={newSpeciesTag}
                        onChange={(e: any) => setNewSpeciesTag(e.target.value)}
                      >
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-[#3D405B] mb-1">Health Category</label>
                      <select
                        className="w-full px-2 py-1.5 rounded-lg border border-[#D3D1C7]"
                        value={newCategory}
                        onChange={(e: any) => setNewCategory(e.target.value)}
                      >
                        <option value="nutrition">Nutrition</option>
                        <option value="behavior">Behavior</option>
                        <option value="grooming">Grooming</option>
                        <option value="health">Health</option>
                        <option value="training">Training</option>
                        <option value="first-aid">First Aid</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#3D405B] mb-1">Optional Thumbnail URL</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                      placeholder="https://..."
                      value={newThumbnail}
                      onChange={(e) => setNewThumbnail(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-8">
                    <label className="flex items-center gap-2 font-bold text-[#3D405B]">
                      <input
                        type="checkbox"
                        checked={newFeatured}
                        onChange={(e) => setNewFeatured(e.target.checked)}
                      />
                      Feature this Tip
                    </label>

                    <label className="flex items-center gap-1.5 font-bold text-[#3D405B]">
                      Read time (mins)
                      <input
                        type="number"
                        className="w-14 px-2 py-1 rounded border border-[#D3D1C7]"
                        value={newReadMins}
                        onChange={(e) => setNewReadMins(parseInt(e.target.value) || 5)}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#E07A5F] text-white rounded-xl font-bold hover:opacity-95"
                  >
                    Publish Curated Article
                  </button>
                </form>
              </motion.div>
            )}

            {/* Category Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-5 no-scrollbar">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 shrink-0 cursor-pointer hover:-translate-y-0.5 active:scale-95 ${
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

            {/* Trending Now Horizontal Scroll */}
            {!activeSearch && activeCategory === 'All' && (
              <div className="mb-6">
                <div className="flex items-center gap-1.5 mb-3 px-1">
                  <Flame className="w-4 h-4 text-[#E07A5F] animate-pulse" />
                  <h3 className="font-sans font-bold text-xs text-[#3D405B]">Trending Now (Last 24h Engagement)</h3>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 scroll-smooth">
                  {[...tips]
                    .sort((a, b) => b.helpful_ups.length - a.helpful_ups.length)
                    .slice(0, 4)
                    .map((tip, idx) => {
                      const isUpvoted = currentUser && tip.helpful_ups.includes(currentUser.user_id);
                      return (
                        <div
                          key={`trending-${tip.tip_id}`}
                          className="min-w-[250px] w-[250px] bg-white rounded-3xl border border-[#D3D1C7]/60 p-3.5 flex flex-col justify-between shrink-0 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:border-[#E07A5F]/40 hover:-translate-y-0.5 transition-all duration-300 relative group cursor-pointer"
                          onClick={() => {
                            handleOpenTip(tip, 'trending_scroll');
                          }}
                        >
                          {/* Rank Badge */}
                          <div className="absolute top-2.5 right-2.5 bg-[#E07A5F] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 z-10">
                            <span>🔥 #{idx + 1}</span>
                          </div>
 
                          <div className="flex gap-3">
                            {/* Small image */}
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#FDFAF6] border border-[#D3D1C7]/30 shrink-0">
                              <img src={tip.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="trending thumbnail" />
                            </div>
 
                            {/* Title & category */}
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] font-extrabold uppercase text-[#E07A5F] tracking-wider block mb-0.5">{tip.category}</span>
                              <h4 className="font-sans font-extrabold text-[#3D405B] text-xs leading-snug line-clamp-2 hover:text-[#E07A5F] transition-colors">{tip.title}</h4>
                            </div>
                          </div>
 
                          {/* Footer engagement */}
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#D3D1C7]/15 text-[10px] text-[#888780]">
                            <span className="font-sans font-medium">By {tip.author_name}</span>
                            <div className="flex items-center gap-2">
                              {/* Direct Helpfulness metric */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onVoteTip(tip.tip_id, 'up');
                                  trackAnalytics('vet_tip_upvoted_trending', { tip_id: tip.tip_id });
                                }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all shrink-0 cursor-pointer ${
                                  isUpvoted 
                                    ? 'bg-[#E07A5F]/10 text-[#E07A5F]' 
                                    : 'bg-black/5 text-[#888780] hover:bg-black/10'
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{tip.helpful_ups.length}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
 
            {/* Hero Card Featured Tip */}
            {featuredTip && !activeSearch && activeCategory === 'All' && (
              <div
                onClick={() => {
                  handleOpenTip(featuredTip, 'hero');
                }}
                className="bg-[#3D405B] rounded-3xl overflow-hidden p-5 mb-6 text-white border border-[#D3D1C7] shadow-xs cursor-pointer relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-10" />
                <img
                  src={featuredTip.thumbnail_url}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-101 transition-transform duration-500 opacity-35"
                  alt="Featured tip background"
                />

                <div className="relative z-20 flex flex-col justify-end min-h-[170px] mt-6">
                  <div className="flex gap-1.5 mb-3">
                    <span className="bg-[#E07A5F] text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                    <span className="bg-white/20 backdrop-blur-xs text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {featuredTip.read_time_mins} mins
                    </span>
                  </div>

                  <h3 className="font-sans font-extrabold text-base mb-1.5 leading-snug hover:text-[#F2CC8F] transition-colors line-clamp-2">
                    {featuredTip.title}
                  </h3>

                  <p className="font-body text-[11px] text-[#D3D1C7] line-clamp-2 leading-relaxed mb-3">
                    {featuredTip.body.replace(/[#*\-]/g, '').slice(0, 150)}...
                  </p>

                  <p className="text-[10px] text-white/95 font-body font-bold mt-1.5">
                    Written by {featuredTip.author_name}
                  </p>
                </div>
              </div>
            )}

            {/* Vertical list of tips */}
            <div className="space-y-3.5">
              <h3 className="font-sans font-extrabold text-[#3D405B] text-sm mb-1.5">Clinical Index Articles</h3>

              {filteredTips.length === 0 ? (
                <div className="text-center py-10 bg-white border border-[#D3D1C7] rounded-3xl p-5">
                  <AlertCircle className="w-10 h-10 text-[#888780] mx-auto mb-2" />
                  <p className="font-body text-xs text-[#888780]">No clinical guidelines match current parameters.</p>
                </div>
              ) : (
                filteredTips.map((tip) => (
                  <article
                    key={tip.tip_id}
                    onClick={() => {
                      handleOpenTip(tip, 'list_card');
                    }}
                    className="bg-white rounded-[2rem] border border-[#D3D1C7]/70 p-4 flex gap-4 cursor-pointer bento-card shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:border-[#E07A5F]/45 transition-all duration-300 group font-sans"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-[1.25rem] overflow-hidden bg-[#FDFAF6] border border-[#D3D1C7]/30 shrink-0">
                      <img src={tip.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="tip illustration" />
                    </div>

                    {/* Content body */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex gap-1.5 items-center text-[8px] font-extrabold uppercase text-[#888780] mb-1 tracking-wider">
                          <span className="text-[#E07A5F]">{tip.category}</span>
                          <span>•</span>
                          <span className="font-sans font-extrabold">{tip.species_tag === 'both' ? '🐶🐱' : tip.species_tag === 'dog' ? '🐶 Only' : '🐱 Only'}</span>
                        </div>

                        <h4 className="font-display font-bold text-[#3D405B] text-xs leading-snug line-clamp-2 h-9 group-hover:text-[#E07A5F] transition-colors">
                          {tip.title}
                        </h4>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-[#888780] font-sans font-medium">
                        <span>By {tip.author_name}</span>
                        <div className="flex items-center gap-2">
                          {/* Bookmark trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!currentUser) {
                                onPromptSignUp();
                              } else if (onToggleBookmarkTip) {
                                onToggleBookmarkTip(tip.tip_id);
                                trackAnalytics('bookmark_tip_toggled', { tip_id: tip.tip_id, origin: 'learn_list' });
                              }
                            }}
                            className={`p-1 hover:text-[#81B29A] hover:bg-black/5 rounded transition-all shrink-0 cursor-pointer ${
                              savedTipIds.includes(tip.tip_id) ? 'text-[#81B29A]' : 'text-[#888780]'
                            }`}
                            title="Bookmark Vet Tip"
                          >
                            {savedTipIds.includes(tip.tip_id) ? (
                              <BookmarkCheck className="w-4 h-4 text-[#81B29A]" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>
                          <span className="font-bold flex items-center gap-1 text-[#E07A5F] bg-[#E07A5F]/5 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3 text-[#E07A5F]" /> {tip.read_time_mins} min</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
            </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
