/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Pet, Post, Product, VetTip, Notification, AnalyticsEvent } from './types';
import {
  INITIAL_USERS,
  INITIAL_PETS,
  INITIAL_POSTS,
  INITIAL_PRODUCTS,
  INITIAL_TIPS
} from './data';
import Onboarding from './components/Onboarding';
import Navigation from './components/Navigation';
import PetTalk from './components/PetTalk';
import PetShop from './components/PetShop';
import PetLearn from './components/PetLearn';
import Profile from './components/Profile';
import {
  Wifi,
  WifiOff,
  Bell,
  X,
  LineChart,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  Download,
  Copy,
  Trash2,
  Search,
  Check
} from 'lucide-react';

export default function App() {
  // Onboarding & Authentication state
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  // Shell State
  const [activeSpecies, setActiveSpecies] = useState<'dog' | 'cat' | 'both'>('both');
  const [activeTab, setActiveTab] = useState<'talk' | 'shop' | 'learn' | 'profile'>('talk');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // Entities stored globally
  const [users, setUsers] = useState<User[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tips, setTips] = useState<VetTip[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Navigation overlays
  const [viewingUserProfile, setViewingUserProfile] = useState<User | null>(null);
  const [softSignUpOpen, setSoftSignUpOpen] = useState<boolean>(false);
  const [softSignUpContext, setSoftSignUpContext] = useState<string>('');

  // Offline Simulation States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineDrafts, setOfflineDrafts] = useState<Post[]>([]);
  const [savedToastVisible, setSavedToastVisible] = useState<boolean>(false);

  // Interactive Live Analytics Logger
  const [analyticsLogs, setAnalyticsLogs] = useState<AnalyticsEvent[]>([]);
  const [showTelemetryCenter, setShowTelemetryCenter] = useState<boolean>(false);
  const [enableRotation, setEnableRotationState] = useState<boolean>(true);
  const enableRotationRef = React.useRef(true);
  const setEnableRotation = (val: boolean) => {
    enableRotationRef.current = val;
    setEnableRotationState(val);
  };
  const [telemetrySearch, setTelemetrySearch] = useState<string>('');
  const [copiedLogs, setCopiedLogs] = useState<boolean>(false);

  // Global search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bookmarking arrays
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pawpack_saved_posts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedTipIds, setSavedTipIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pawpack_saved_tips');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dark mode theme preference
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pawpack_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem('pawpack_dark_mode', String(newVal));
      return newVal;
    });
  };

  const handleToggleBookmarkPost = (postId: string) => {
    setSavedPostIds((prev) => {
      const updated = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem('pawpack_saved_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleToggleBookmarkTip = (tipId: string) => {
    setSavedTipIds((prev) => {
      const updated = prev.includes(tipId)
        ? prev.filter((id) => id !== tipId)
        : [...prev, tipId];
      localStorage.setItem('pawpack_saved_tips', JSON.stringify(updated));
      return updated;
    });
  };

  // Load from local storage or defaults on startup
  useEffect(() => {
    // 1. Users
    const storedUsers = localStorage.getItem('pawpack_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem('pawpack_users', JSON.stringify(INITIAL_USERS));
      setUsers(INITIAL_USERS);
    }

    // 2. Pets
    const storedPets = localStorage.getItem('pawpack_pets');
    if (storedPets) {
      setPets(JSON.parse(storedPets));
    } else {
      localStorage.setItem('pawpack_pets', JSON.stringify(INITIAL_PETS));
      setPets(INITIAL_PETS);
    }

    // 3. Posts
    const storedPosts = localStorage.getItem('pawpack_posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      localStorage.setItem('pawpack_posts', JSON.stringify(INITIAL_POSTS));
      setPosts(INITIAL_POSTS);
    }

    // 4. Products
    const storedProducts = localStorage.getItem('pawpack_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      localStorage.setItem('pawpack_products', JSON.stringify(INITIAL_PRODUCTS));
      setProducts(INITIAL_PRODUCTS);
    }

    // 5. Tips
    const storedTips = localStorage.getItem('pawpack_tips');
    if (storedTips) {
      setTips(JSON.parse(storedTips));
    } else {
      localStorage.setItem('pawpack_tips', JSON.stringify(INITIAL_TIPS));
      setTips(INITIAL_TIPS);
    }

    // Auth profile loading
    const storedAuthUser = localStorage.getItem('pawpack_current_user');
    const storedGuest = localStorage.getItem('pawpack_is_guest');
    const onboarded = localStorage.getItem('pawpack_onboarded');

    if (onboarded === 'true') {
      setHasOnboarded(true);
      if (storedGuest === 'true') {
        setIsGuest(true);
        setCurrentUser(null);
      } else if (storedAuthUser) {
        const parsed = JSON.parse(storedAuthUser);
        setCurrentUser(parsed);
        // Sync filter preference
        setActiveSpecies(parsed.species_preference);
      }
    }

    // Seed preset notification center triggers
    const sampleNotifications: Notification[] = [
      {
        id: 'not_milestone_1',
        title: '🎉 Pet Milestone Alert!',
        body: 'Happy Adoption Anniversary Milestone! Barnaby is celebrating 3 healthy & playful years with you today. Check out his wellness radar! 🐾🎂',
        type: 'tip',
        created_at: 'Just now',
        read: false
      },
      {
        id: 'not_1',
        title: 'Community Like Matcher',
        body: 'Priya Sharma linked a Heart to your Morning disc catch story!',
        type: 'like',
        created_at: '2 hours ago',
        read: false
      },
      {
        id: 'not_2',
        title: 'Expert Vet Response',
        body: 'Dr. Elena Rostova replied: Create silent nests around urban storms.',
        type: 'comment',
        created_at: '1 day ago',
        read: false
      },
      {
        id: 'not_3',
        title: 'Weekly Curated digest',
        body: 'New Vet Tip: Decoding premium ingredient charts has been published',
        type: 'tip',
        created_at: '2 days ago',
        read: true
      }
    ];
    setNotifications(sampleNotifications);

    // Trigger initial open event
    trackAnalytics('app_open', { timestamp: '09 Jun 2026' });

    // Handle physical connection state listener
    const handleOnline = () => {
      setIsOnline(true);
      // Synchronize cached local drafts if they exist
      const storedDrafts = localStorage.getItem('pawpack_offline_drafts');
      if (storedDrafts) {
        const parsed: Post[] = JSON.parse(storedDrafts);
        if (parsed.length > 0) {
          setPosts((prev) => {
            const joined = [...parsed, ...prev];
            localStorage.setItem('pawpack_posts', JSON.stringify(joined));
            return joined;
          });
          trackAnalytics('post_created', { count: parsed.length, synced: 'offline_return' });
          alert(`Connection returned! Automatically synchronized ${parsed.length} cached story drafts to server timeline.`);
          localStorage.setItem('pawpack_offline_drafts', '[]');
          setOfflineDrafts([]);
        }
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Deep-linking state
  const [initialPostId, setInitialPostId] = useState<string | null>(null);
  const [initialTipId, setInitialTipId] = useState<string | null>(null);

  // Parse deep-link query parameters on mount/load
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post_id');
    const tipId = params.get('tip_id');

    if (postId) {
      setInitialPostId(postId);
      setActiveTab('talk');
      trackAnalytics('deep_link_parsed', { type: 'post', id: postId });
    } else if (tipId) {
      setInitialTipId(tipId);
      setActiveTab('learn');
      trackAnalytics('deep_link_parsed', { type: 'tip', id: tipId });
    }
  }, []);

  // Telemetry logger
  const trackAnalytics = (eventName: any, params: any) => {
    const freshLog: AnalyticsEvent = {
      event_name: eventName,
      parameters: params,
      timestamp: new Date().toLocaleTimeString()
    };
    setAnalyticsLogs((prev) => {
      return enableRotationRef.current ? [freshLog, ...prev.slice(0, 19)] : [freshLog, ...prev];
    });
  };

  // Setup completion in onboarding
  const handleOnboardingComplete = (user: User | null, initialPref: 'dog' | 'cat' | 'both') => {
    localStorage.setItem('pawpack_onboarded', 'true');
    setHasOnboarded(true);

    if (user) {
      user.species_preference = initialPref;
      setCurrentUser(user);
      setIsGuest(false);
      localStorage.setItem('pawpack_current_user', JSON.stringify(user));
      localStorage.setItem('pawpack_is_guest', 'false');

      // Update users database list
      setUsers((prev) => {
        const updated = [user, ...prev.filter((u) => u.user_id !== user.user_id)];
        localStorage.setItem('pawpack_users', JSON.stringify(updated));
        return updated;
      });
    } else {
      setIsGuest(true);
      setCurrentUser(null);
      localStorage.setItem('pawpack_is_guest', 'true');
    }

    setActiveSpecies(initialPref);
    trackAnalytics('app_open', { preference_mode: initialPref });
  };

  // Add Community post Form submit with offline local caching
  const handleAddPost = (p: Post) => {
    if (!isOnline) {
      // Local draft persistence block
      const updatedDrafts = [p, ...offlineDrafts];
      setOfflineDrafts(updatedDrafts);
      localStorage.setItem('pawpack_offline_drafts', JSON.stringify(updatedDrafts));
      trackAnalytics('post_created', { title: p.title, status: 'offline_cached' });
      
      setSavedToastVisible(true);
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setSavedToastVisible(false);
      }, 5000);
      return;
    }

    const updated = [p, ...posts];
    setPosts(updated);
    localStorage.setItem('pawpack_posts', JSON.stringify(updated));
  };

  // Toggle liking
  const handleLikePost = (postId: string) => {
    if (!currentUser) {
      triggerSoftSignUp('like community posts');
      return;
    }

    const updated = posts.map((post) => {
      if (post.post_id === postId) {
        const liked_by = [...post.liked_by];
        let likes_count = post.likes_count;

        if (liked_by.includes(currentUser.user_id)) {
          // Unlike
          const index = liked_by.indexOf(currentUser.user_id);
          liked_by.splice(index, 1);
          likes_count = Math.max(0, likes_count - 1);
        } else {
          // Like
          liked_by.push(currentUser.user_id);
          likes_count += 1;
        }

        return { ...post, likes_count, liked_by };
      }
      return post;
    });

    setPosts(updated);
    localStorage.setItem('pawpack_posts', JSON.stringify(updated));
  };

  // Add Comment on Detail timeline
  const handleAddComment = (postId: string, commentBody: string) => {
    if (!currentUser) {
      triggerSoftSignUp('add commentary threads');
      return;
    }

    // Trigger local Comment object
    const freshComment = {
      comment_id: 'comment_' + Date.now(),
      post_id: postId,
      author_id: currentUser.user_id,
      body: commentBody,
      created_at: 'Just now'
    };

    const updated = posts.map((post) => {
      if (post.post_id === postId) {
        return {
          ...post,
          comments: [...post.comments, freshComment]
        };
      }
      return post;
    });

    setPosts(updated);
    localStorage.setItem('pawpack_posts', JSON.stringify(updated));
  };

  // Report post handler flagging item
  const handleReportPost = (postId: string) => {
    const updated = posts.map((post) => {
      if (post.post_id === postId) {
        return { ...post, is_reported: true };
      }
      return post;
    });
    setPosts(updated);
    localStorage.setItem('pawpack_posts', JSON.stringify(updated));
  };

  // Add review to products directory
  const handleAddReview = (productId: string, freshReview: any) => {
    if (!currentUser) {
      triggerSoftSignUp('express star reviews');
      return;
    }

    const updated = products.map((prod) => {
      if (prod.product_id === productId) {
        // Remove existing if double review exists
        const reviews = prod.reviews.filter((r) => r.author_id !== currentUser.user_id);
        return {
          ...prod,
          reviews: [freshReview, ...reviews]
        };
      }
      return prod;
    });

    setProducts(updated);
    localStorage.setItem('pawpack_products', JSON.stringify(updated));
  };

  // Import rows pasted from copy-pasta CSV
  const handleBulkImportProducts = (importedList: Product[]) => {
    const updated = [...importedList, ...products];
    setProducts(updated);
    localStorage.setItem('pawpack_products', JSON.stringify(updated));
  };

  // Add vet article
  const handleAddTip = (freshTip: VetTip) => {
    const updated = [freshTip, ...tips];
    setTips(updated);
    localStorage.setItem('pawpack_tips', JSON.stringify(updated));
  };

  // Helpfulness upvotes on vet tip
  const handleVoteTip = (tipId: string, type: 'up' | 'down') => {
    if (!currentUser) {
      triggerSoftSignUp('rate clinical handbooks');
      return;
    }
    const updated = tips.map((t) => {
      if (t.tip_id === tipId) {
        const helpful_ups = [...t.helpful_ups];
        const helpful_downs = [...t.helpful_downs];
        const uid = currentUser.user_id;

        if (type === 'up') {
          const index = helpful_ups.indexOf(uid);
          if (index > -1) helpful_ups.splice(index, 1);
          else {
            helpful_ups.push(uid);
            const dIdx = helpful_downs.indexOf(uid);
            if (dIdx > -1) helpful_downs.splice(dIdx, 1);
          }
        } else {
          const index = helpful_downs.indexOf(uid);
          if (index > -1) helpful_downs.splice(index, 1);
          else {
            helpful_downs.push(uid);
            const uIdx = helpful_ups.indexOf(uid);
            if (uIdx > -1) helpful_ups.splice(uIdx, 1);
          }
        }

        return { ...t, helpful_ups, helpful_downs };
      }
      return t;
    });

    setTips(updated);
    localStorage.setItem('pawpack_tips', JSON.stringify(updated));
  };

  // Update profile states
  const handleUpdateProfile = (userObj: User) => {
    setCurrentUser(userObj);
    localStorage.setItem('pawpack_current_user', JSON.stringify(userObj));

    // Update global list
    const updated = users.map((u) => (u.user_id === userObj.user_id ? userObj : u));
    setUsers(updated);
    localStorage.setItem('pawpack_users', JSON.stringify(updated));
  };

  // Add pet profile
  const handleAddPet = (p: Pet) => {
    const updated = [p, ...pets];
    setPets(updated);
    localStorage.setItem('pawpack_pets', JSON.stringify(updated));
    trackAnalytics('profile_viewed', { action: 'add_pet', pet: p.name });
  };

  // Edit pet details
  const handleUpdatePet = (p: Pet) => {
    const updated = pets.map((existing) => (existing.pet_id === p.pet_id ? p : existing));
    setPets(updated);
    localStorage.setItem('pawpack_pets', JSON.stringify(updated));
  };

  // Delete pet details
  const handleDeletePet = (petId: string) => {
    const updated = pets.filter((p) => p.pet_id !== petId);
    setPets(updated);
    localStorage.setItem('pawpack_pets', JSON.stringify(updated));
  };

  // Clear session to log out
  const handleLogActiveUserOut = () => {
    localStorage.removeItem('pawpack_current_user');
    localStorage.setItem('pawpack_is_guest', 'true');
    setCurrentUser(null);
    setIsGuest(true);
    setHasOnboarded(false);
    setViewingUserProfile(null);
    setActiveTab('talk');
  };

  // Deletion confirming account eradication
  const handleDeleteActiveAccount = () => {
    if (currentUser) {
      // Clear corresponding pets from target
      const remainingPets = pets.filter((p) => p.owner_id !== currentUser.user_id);
      setPets(remainingPets);
      localStorage.setItem('pawpack_pets', JSON.stringify(remainingPets));

      const remainingUsers = users.filter((u) => u.user_id !== currentUser.user_id);
      setUsers(remainingUsers);
      localStorage.setItem('pawpack_users', JSON.stringify(remainingUsers));
    }

    handleLogActiveUserOut();
  };

  // Global toggle species with instant notification triggers
  const handleUpdateGlobalSpecies = (opt: 'dog' | 'cat' | 'both') => {
    setActiveSpecies(opt);

    if (currentUser) {
      const updatedUserObj = {
        ...currentUser,
        species_preference: opt
      };
      setCurrentUser(updatedUserObj);
      localStorage.setItem('pawpack_current_user', JSON.stringify(updatedUserObj));

      // Sync active preference list
      setUsers((prev) => prev.map((u) => (u.user_id === currentUser.user_id ? updatedUserObj : u)));
    }

    trackAnalytics('species_toggle_switched', { mode: opt, user_auth: currentUser ? 'logged_in' : 'guest' });
  };

  const triggerSoftSignUp = (contextPhrase: string) => {
    setSoftSignUpContext(contextPhrase);
    setSoftSignUpOpen(true);
  };

  const handleSoftSignUpConversion = () => {
    setSoftSignUpOpen(false);
    setHasOnboarded(false); // Restart onboarding/auth workflow
  };

  // Bell click clears notification counts beautifully
  const handleBellNotificationOpen = () => {
    setNotificationsOpen(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Copy logs as formatted JSON string to user clipboard
  const handleCopyTelemetryLogs = async () => {
    try {
      const logsJson = JSON.stringify(analyticsLogs, null, 2);
      await navigator.clipboard.writeText(logsJson);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    } catch (err) {
      console.error('Failed to copy telemetry logs to clipboard:', err);
    }
  };

  // Download logs as .json file
  const handleDownloadTelemetryLogs = () => {
    try {
      const logsJson = JSON.stringify(analyticsLogs, null, 2);
      const blob = new Blob([logsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pawpack_telemetry_logs_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download telemetry logs:', err);
    }
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        backgroundColor: isDarkMode ? '#141416' : '#FDFAF6',
        color: isDarkMode ? '#F4F4F5' : '#2C2C2A'
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={`min-h-screen font-sans antialiased pb-20 ${isDarkMode ? 'dark' : ''}`}
    >
      
      {/* Dynamic Offline / Cached Indicator Banner */}
      {!isOnline && (
        <div className="bg-[#E07A5F] text-white py-2 px-4 shadow-md text-xs font-semibold flex items-center justify-between z-50 sticky top-0">
          <div className="flex items-center gap-1.5 leading-none">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are offline — Showing last-cached profile files.</span>
          </div>
          {offlineDrafts.length > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase">
              {offlineDrafts.length} Local post drafts pending sync
            </span>
          )}
        </div>
      )}

      {/* Main app loader */}
      {!hasOnboarded ? (
        <Onboarding onComplete={handleOnboardingComplete} trackAnalytics={trackAnalytics} />
      ) : (
        <div className="pt-16">
          {/* Top of App Navigation */}
          <Navigation
            activeSpecies={activeSpecies}
            setActiveSpecies={handleUpdateGlobalSpecies}
            activeTab={activeTab}
            setActiveTab={(t) => {
              setActiveTab(t);
              setViewingUserProfile(null);
              trackAnalytics('profile_viewed', { tab: t });
            }}
            notifications={notifications}
            onMarkNotificationsRead={handleBellNotificationOpen}
            unreadCount={notifications.filter((n) => !n.read).length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Core Content Canvas Swapper */}
          <main className="px-4 py-2">
            {activeTab === 'talk' && (
              <PetTalk
                posts={posts}
                users={users}
                allPets={pets}
                currentUser={currentUser}
                activeSpecies={activeSpecies}
                trackAnalytics={trackAnalytics}
                onAddPost={handleAddPost}
                onLikePost={handleLikePost}
                onAddComment={handleAddComment}
                onReportPost={handleReportPost}
                onViewUserProfile={(u) => {
                  setViewingUserProfile(u);
                  setActiveTab('profile');
                  trackAnalytics('profile_viewed', { target_user_id: u.user_id });
                }}
                onPromptSignUp={() => triggerSoftSignUp('interact on community feeds')}
                initialPostId={initialPostId}
                onClearInitialPostId={() => setInitialPostId(null)}
                searchQuery={searchQuery}
                savedPostIds={savedPostIds}
                onToggleBookmarkPost={handleToggleBookmarkPost}
                tips={tips}
              />
            )}

            {activeTab === 'shop' && (
              <PetShop
                products={products}
                currentUser={currentUser}
                activeSpecies={activeSpecies}
                onAddReview={handleAddReview}
                onBulkImportProducts={handleBulkImportProducts}
                trackAnalytics={trackAnalytics}
                onPromptSignUp={() => triggerSoftSignUp('publish product reviews')}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'learn' && (
              <PetLearn
                tips={tips}
                currentUser={currentUser}
                activeSpecies={activeSpecies}
                trackAnalytics={trackAnalytics}
                onVoteTip={handleVoteTip}
                onAddTip={handleAddTip}
                onPromptSignUp={() => triggerSoftSignUp('downvote or upvote veterinary handbooks')}
                initialTipId={initialTipId}
                onClearInitialTipId={() => setInitialTipId(null)}
                searchQuery={searchQuery}
                savedTipIds={savedTipIds}
                onToggleBookmarkTip={handleToggleBookmarkTip}
              />
            )}

            {activeTab === 'profile' && (
              <Profile
                currentUser={currentUser}
                allPets={pets}
                posts={posts}
                products={products}
                activeSpecies={activeSpecies}
                trackAnalytics={trackAnalytics}
                onUpdateProfile={handleUpdateProfile}
                onAddPet={handleAddPet}
                onUpdatePet={handleUpdatePet}
                onDeletePet={handleDeletePet}
                onLogOut={handleLogActiveUserOut}
                onDeleteAccount={handleDeleteActiveAccount}
                viewingPublicUser={viewingUserProfile}
                onBackToMyProfile={() => setViewingUserProfile(null)}
                tips={tips}
                savedPostIds={savedPostIds}
                savedTipIds={savedTipIds}
                onToggleBookmarkPost={handleToggleBookmarkPost}
                onToggleBookmarkTip={handleToggleBookmarkTip}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onNavigateToTab={(tab, id) => {
                  setActiveTab(tab);
                  setViewingUserProfile(null);
                  if (tab === 'talk' && id) {
                    setInitialPostId(id);
                  } else if (tab === 'learn' && id) {
                    setInitialTipId(id);
                  }
                }}
              />
            )}
          </main>
        </div>
      )}

      {/* FLOAT THERAPEUTIC TELEMETRY DRAWER TOGGLE */}
      <button
        onClick={() => setShowTelemetryCenter(!showTelemetryCenter)}
        className="fixed bottom-20 left-4 z-40 bg-[#3D405B] text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
        title="Telemetry Live Logging Center"
      >
        <LineChart className="w-5 h-5" />
      </button>

      {/* LIVE TELEMETRY OVERLAY FLOATING CAPSULE */}
      {showTelemetryCenter && (() => {
        const filteredLogs = analyticsLogs.filter((log) =>
          log.event_name.toLowerCase().includes(telemetrySearch.toLowerCase())
        );
        return (
          <aside className="fixed bottom-36 left-4 right-4 z-50 bg-[#3D405B] text-white p-4 rounded-3xl border border-[#D3D1C7]/30 max-w-sm shadow-xl font-body text-[10px] sm:left-6">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-3">
              <h4 className="font-sans font-bold flex items-center gap-1.5 text-xs">
                <LineChart className="w-3.5 h-3.5 text-[#E07A5F]" /> Live Telemetry Analytics Logging
              </h4>
              <button 
                onClick={() => setShowTelemetryCenter(false)} 
                className="text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Search Field */}
            <div className="relative mb-2 shrink-0">
              <Search className="w-3 h-3 text-white/40 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search event name..."
                value={telemetrySearch}
                onChange={(e) => setTelemetrySearch(e.target.value)}
                className="w-full pl-7 pr-7 py-1.5 bg-black/25 border border-white/10 rounded-xl text-[9px] font-mono text-white placeholder-white/40 focus:outline-hidden focus:border-[#E07A5F]"
              />
              {telemetrySearch && (
                <button 
                  onClick={() => setTelemetrySearch('')} 
                  className="absolute right-2 top-2 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex gap-2 mb-3 shrink-0">
              <button
                onClick={handleCopyTelemetryLogs}
                className="flex-1 py-1.5 px-2 bg-white/10 hover:bg-white/15 active:bg-white/5 rounded-xl text-[9px] font-sans font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Copy formatted logs to clipboard"
              >
                {copiedLogs ? (
                  <>
                    <Check className="w-3 h-3 text-[#81B29A]" />
                    <span className="text-[#81B29A]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-300" />
                    <span>Share Logs</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadTelemetryLogs}
                className="flex-1 py-1.5 px-2 bg-[#E07A5F]/20 hover:bg-[#E07A5F]/30 active:bg-[#E07A5F]/10 text-white rounded-xl text-[9px] font-sans font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Download log session as .json file"
              >
                <Download className="w-3 h-3 text-[#E07A5F]" />
                <span>Download</span>
              </button>

              <button
                onClick={() => setAnalyticsLogs([])}
                className="py-1.5 px-2.5 bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/10 text-red-200 hover:text-white rounded-xl text-[9px] font-sans font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Clear all logs"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Clear</span>
              </button>
            </div>

            {/* Config Box: Log rotation toggle */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-black/15 rounded-xl text-[8px] text-zinc-400 font-mono mb-3 leading-none select-none">
              <span className="text-zinc-500">ROTATION EXCEEDING 20 ITEMS</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableRotation}
                  onChange={(e) => setEnableRotation(e.target.checked)}
                  className="accent-[#E07A5F] w-2.5 h-2.5 cursor-pointer rounded-xs"
                />
                <span className={enableRotation ? 'text-[#E07A5F] font-bold' : ''}>
                  {enableRotation ? 'ON' : 'OFF'}
                </span>
              </label>
            </div>

            {/* Logs Window */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar font-mono text-[9px] text-zinc-300 pb-1">
              {filteredLogs.length === 0 ? (
                <p className="text-white/40 text-center py-4 bg-black/10 rounded-xl">
                  {analyticsLogs.length === 0 
                    ? 'No analytics captured yet this session.' 
                    : 'No matching event records found.'}
                </p>
              ) : (
                filteredLogs.map((log, i) => (
                  <div key={i} className="p-2 bg-black/25 rounded-xl border border-white/5 space-y-0.5">
                    <div className="flex justify-between items-center leading-none">
                      <span className="text-[#81B29A] font-extrabold">&#123;event: {log.event_name}&#125;</span>
                      <span className="text-[8px] text-white/40">{log.timestamp}</span>
                    </div>
                    <div className="text-white/80 text-[8px] leading-relaxed truncate" title={JSON.stringify(log.parameters)}>
                      params: <span className="text-zinc-400">{JSON.stringify(log.parameters)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        );
      })()}

      {/* SLIDE OUT ALIGNED NOTIFICATIONS DRAWER OVERLAY */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-[#3D405B]/30 backdrop-blur-xs flex justify-end">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white h-full shadow-xl border-l border-[#D3D1C7] p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-[#D3D1C7] mb-4">
                <h3 className="font-sans font-extrabold text-[#3D405B] text-base flex items-center gap-1">
                  <Bell className="w-4.5 h-4.5" /> Notification Inbox
                </h3>
                <button onClick={() => setNotificationsOpen(false)} className="text-[#888780] hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                      n.read ? 'bg-[#FDFAF6] border-[#D3D1C7]/30 text-[#888780]' : 'bg-[#E07A5F]/5 border-[#E07A5F]/20 text-[#2C2C2A]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1 leading-none font-bold">
                      <span className={n.read ? 'text-[#3D405B]' : 'text-[#E07A5F]'}>{n.title}</span>
                      <span className="text-[8px] font-body text-[#888780]">{n.created_at}</span>
                    </div>
                    <p className="font-body text-[11px]">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center text-[10px] text-[#888780] font-body border-t border-[#D3D1C7]/30 pt-3">
              Push Notification Permissions Enabled
            </div>
          </motion.div>
        </div>
      )}

      {/* SOFT LOGIN PROMPT SIGN-UP GUEST DIALOG MODAL */}
      {softSignUpOpen && (
        <div className="fixed inset-0 z-50 bg-[#3D405B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-5 rounded-3xl border border-[#D3D1C7] max-w-sm w-full text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#E07A5F]/15 text-[#E07A5F] flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-sans font-extrabold text-[#3D405B] text-base leading-tight">
                Establish PawPack Profile
              </h3>
              <p className="font-body text-xs text-[#888780] mt-1.5 leading-relaxed">
                Oops! Guests are only allowed to read articles. To <strong>{softSignUpContext}</strong>, create a quick, secure profile!
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setSoftSignUpOpen(false)}
                className="flex-1 py-2 bg-[#FDFAF6] border border-[#D3D1C7] text-[#3D405B] rounded-xl text-xs font-bold"
              >
                Close Prompt
              </button>
              <button
                onClick={handleSoftSignUpConversion}
                className="flex-1 py-2 bg-[#E07A5F] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
              >
                Sign Up Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ANIMATED OFFLINE TOAST NOTIFICATION */}
      <AnimatePresence>
        {savedToastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-white border-2 border-[#81B29A] rounded-3xl p-4 shadow-xl flex gap-3.5 items-start"
          >
            <div className="w-9 h-9 rounded-full bg-[#81B29A]/10 text-[#81B29A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 animate-bounce" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-sans font-extrabold text-[#3D405B] text-xs leading-tight mb-0.5">
                Draft Saved Successfully! 📝
              </h4>
              <p className="font-body text-[10px] text-[#888780] leading-relaxed mb-1.5">
                Your story has been securely cached in offline draft persistence! It will automatically synchronize and publish to the live community list once your internet connection is restored.
              </p>
              
              <div className="flex justify-between items-center bg-[#81B29A]/10 text-[#81B29A] text-[9px] font-bold px-2.5 py-1 rounded-lg">
                <span className="flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Offline Mode Active
                </span>
                <button 
                  onClick={() => setSavedToastVisible(false)} 
                  className="hover:underline tracking-wide uppercase text-[8px] font-extrabold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
