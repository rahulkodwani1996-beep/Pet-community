/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Pet, Post, Review, Product, VetTip } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploader from './ImageUploader';
import Reminders from './Reminders';
import HealthRadarChart from './HealthRadarChart';
import ActivityTrendChart from './ActivityTrendChart';
import WeightTrendChart from './WeightTrendChart';
import AgeMilestones from './AgeMilestones';
import PetBirthdayBanner from './PetBirthdayBanner';
import {
  Settings as SettingsIcon,
  Plus,
  Camera,
  MapPin,
  Calendar,
  Lock,
  LogOut,
  Trash2,
  Check,
  ChevronRight,
  Shield,
  Heart,
  FileText,
  Star,
  Settings as GearIcon,
  Activity,
  Apple,
  Droplets,
  Moon,
  Sun,
  Bookmark,
  BookmarkCheck,
  BookOpen
} from 'lucide-react';

interface ProfileProps {
  currentUser: User | null;
  allPets: Pet[];
  posts: Post[];
  products: Product[];
  activeSpecies: 'dog' | 'cat' | 'both';
  trackAnalytics: (eventName: any, params: any) => void;
  onUpdateProfile: (updated: User) => void;
  onAddPet: (pet: Pet) => void;
  onUpdatePet: (pet: Pet) => void;
  onDeletePet: (petId: string) => void;
  onLogOut: () => void;
  onDeleteAccount: () => void;
  viewingPublicUser?: User | null; // Set when looking at other users
  onBackToMyProfile?: () => void;
  tips?: VetTip[];
  savedPostIds?: string[];
  savedTipIds?: string[];
  onToggleBookmarkPost?: (id: string) => void;
  onToggleBookmarkTip?: (id: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onNavigateToTab?: (tab: 'talk' | 'shop' | 'learn' | 'profile', initialId?: string) => void;
}

export default function Profile({
  currentUser,
  allPets,
  posts,
  products,
  activeSpecies,
  trackAnalytics,
  onUpdateProfile,
  onAddPet,
  onUpdatePet,
  onDeletePet,
  onLogOut,
  onDeleteAccount,
  viewingPublicUser = null,
  onBackToMyProfile,
  tips = [],
  savedPostIds = [],
  savedTipIds = [],
  onToggleBookmarkPost,
  onToggleBookmarkTip,
  isDarkMode = false,
  onToggleDarkMode,
  onNavigateToTab
}: ProfileProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'pets' | 'posts' | 'reviews' | 'reminders' | 'wellness' | 'saved'>('pets');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [selectedPetToEdit, setSelectedPetToEdit] = useState<Pet | null>(null);

  // Profile Edit fields
  const [editName, setEditName] = useState(currentUser?.display_name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar_url || '');

  // Pet Form fields
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat'>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petPhoto, setPetPhoto] = useState('');
  const [petBio, setPetBio] = useState('');

  // Settings states
  const [optComments, setOptComments] = useState(true);
  const [optLikes, setOptLikes] = useState(true);
  const [optDigest, setOptDigest] = useState(false);
  const [deleteConfOpen, setDeleteConfOpen] = useState(false);

  // Wellness / Health Radar states
  const [selectedWellnessPetId, setSelectedWellnessPetId] = useState<string>('');
  const [logActivity, setLogActivity] = useState<number>(7);
  const [logNutrition, setLogNutrition] = useState<number>(6);
  const [logMood, setLogMood] = useState<number>(8);
  const [logHydration, setLogHydration] = useState<number>(7);
  const [logSleep, setLogSleep] = useState<number>(8);
  const [logWeight, setLogWeight] = useState<number>(0);

  const [checkinDoneToday, setCheckinDoneToday] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const checkinQuestions = React.useMemo(() => [
    {
      id: 'q_activity',
      question: "How active and playful was your pet today?",
      metric: 'activity',
      options: [
        { text: "⚡ Bursting with energy! Playful and ran around.", value: 10 },
        { text: "🏃 Normal level of daily activity.", value: 7 },
        { text: "🐢 A bit slow or sleepy/tired today.", value: 4 },
        { text: "⚠️ Lethargic - refused to play.", value: 2 },
      ]
    },
    {
      id: 'q_nutrition',
      question: "Did your pet show a healthy appetite and finish their meals?",
      metric: 'nutrition',
      options: [
        { text: "😋 Polished the bowl instantly!", value: 10 },
        { text: "🍗 Finished meals eventually at normal pace.", value: 7 },
        { text: "🤢 Showed mild appetite hesitation.", value: 4 },
        { text: "❌ Left food completely untouched.", value: 1 },
      ]
    },
    {
      id: 'q_mood',
      question: "How has your pet's emotional mood and energy been today?",
      metric: 'mood',
      options: [
        { text: "🥰 Super happy, loving, and cuddling!", value: 10 },
        { text: "😊 Calm, relaxed, and fully content.", value: 8 },
        { text: "🥺 Slightly anxious or clingy.", value: 5 },
        { text: "😢 Hiding or visibly uncomfortable.", value: 2 },
      ]
    },
    {
      id: 'q_hydration',
      question: "How was your pet's water intake today?",
      metric: 'hydration',
      options: [
        { text: "💧 Great! Drank plenty and stayed hydrated.", value: 9 },
        { text: "🥛 Average - drank their normal amount.", value: 7 },
        { text: "🥣 Barely touched their water bowl.", value: 3 },
      ]
    },
    {
      id: 'q_sleep',
      question: "How would you describe your pet's sleep quality last night?",
      metric: 'sleep',
      options: [
        { text: "🌙 Slept deeply and peacefully all night.", value: 10 },
        { text: "💤 Mostly good, but woke up once or twice.", value: 7 },
        { text: "🐾 Extremely restless, pacing, or crying.", value: 3 },
      ]
    }
  ], []);

  const [healthLogs, setHealthLogs] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('pawpack_health_logs');
      return stored ? JSON.parse(stored) : [
        { id: 'log_seed_1', pet_id: 'pet_1', date: '09 Jun 2026', activity: 8, nutrition: 7, mood: 9, hydration: 6, sleep: 8 },
        { id: 'log_seed_2', pet_id: 'pet_2', date: '08 Jun 2026', activity: 6, nutrition: 8, mood: 7, hydration: 5, sleep: 7 },
      ];
    } catch {
      return [];
    }
  });

  const saveLogsToStorage = (updated: any[]) => {
    setHealthLogs(updated);
    localStorage.setItem('pawpack_health_logs', JSON.stringify(updated));
  };

  const handleDeleteLog = (logId: string) => {
    const filtered = healthLogs.filter(l => l.id !== logId);
    saveLogsToStorage(filtered);
  };

  // Avatar selector options
  const defaultAvatars = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0bMbMUrZzCaBUvWky7XIfPRMfS0AV8yUD30DNLtzJXLwlElPX8_Crgg23Q_Xryn3tJp7QvO1_7rSRk8VrAOVns0dU7-t5AHrusvQJDEeSg06CgyMTDexeYLrSFlDHeEqh7RUtNMymNtcnf5qVB6lhyHAR6Krv0uI9vFqOtt206PtNJMdN1_t8sP55fpuG94m_K-guz2Hi6grEnsOM29J1VdzfUXMU9HaO9MMYl9CxLCeW95-PoVo1VnxljsDeTzzO0W0WogykAA',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YTvrRlliVcmc9LDj7-lx8TF_fejlAQP9uW0LJnEvZGci7nHKWA3nvtGdZTOg978ycXHiDXM4LZJFp4ta3m5fQVp05CGgxplI4UklKdQ6gmj3Mz2nCT8wIm0eEf2-PgAK7kQPfIPO7t74GuoMvpPl8JjjZo3cTt7p8vH7fBv3e9iLc-yVjMvlsyTvtZeuuonuMmN4s1WpDubn88uZhyZHazuqN6pw2jfaXLPsMUx48_L-G2azYxIsX7jRQqY7mhmGfNLSuHO1yLk'
  ];

  const targetUserObj = viewingPublicUser || currentUser;

  if (!targetUserObj) {
    return (
      <div className="text-center py-16 bg-white border border-[#D3D1C7] rounded-3xl p-6 w-full max-w-sm mx-auto mt-12 shadow-xs">
        <Shield className="w-12 h-12 text-[#E07A5F] mx-auto mb-3" />
        <h3 className="font-sans font-extrabold text-[#3D405B] text-base mb-1">Authenticated Account Required</h3>
        <p className="font-body text-xs text-[#888780] mb-4">
          Establish or log into your PawPack account to view personalized pet registries and historical metrics.
        </p>
      </div>
    );
  }

  // Get user pets
  const userPets = allPets.filter((p) => p.owner_id === targetUserObj.user_id);

  // Active pet context for wellness checks
  const activePetId = selectedWellnessPetId || (userPets[0]?.pet_id || '');
  const activePet = userPets.find(p => p.pet_id === activePetId);

  // Health Daily Checkin states
  React.useEffect(() => {
    if (activePetId) {
      const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const done = localStorage.getItem(`pawpack_checkin_done_${activePetId}_${todayStr}`) === 'true';
      setCheckinDoneToday(done);

      // Rotate question based on day of month + pet_id numeric hash sum
      const dayOfMonth = new Date().getDate();
      const petIdNumeric = activePetId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const questionIdx = (dayOfMonth + petIdNumeric) % checkinQuestions.length;
      setCurrentQuestionIndex(questionIdx);
    } else {
      setCheckinDoneToday(false);
    }
  }, [activePetId, healthLogs, checkinQuestions]);

  const handleDailyCheckInSubmit = (optionValue: number, questionObj: typeof checkinQuestions[0]) => {
    if (!activePetId || !activePet) return;
    
    // Find last log if exists to inherit other metrics
    const lastLogForPet = healthLogs.find(l => l.pet_id === activePetId);
    const baseActivity = lastLogForPet?.activity ?? 7;
    const baseNutrition = lastLogForPet?.nutrition ?? 7;
    const baseMood = lastLogForPet?.mood ?? 7;
    const baseHydration = lastLogForPet?.hydration ?? 7;
    const baseSleep = lastLogForPet?.sleep ?? 7;

    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newLog = {
      id: 'hlog_checkin_' + Date.now(),
      pet_id: activePetId,
      date: todayStr,
      activity: questionObj.metric === 'activity' ? optionValue : baseActivity,
      nutrition: questionObj.metric === 'nutrition' ? optionValue : baseNutrition,
      mood: questionObj.metric === 'mood' ? optionValue : baseMood,
      hydration: questionObj.metric === 'hydration' ? optionValue : baseHydration,
      sleep: questionObj.metric === 'sleep' ? optionValue : baseSleep,
      note: `Daily Vet Check-in: ${questionObj.question}`
    };

    const updated = [newLog, ...healthLogs];
    saveLogsToStorage(updated);
    
    // Save completion check
    localStorage.setItem(`pawpack_checkin_done_${activePetId}_${todayStr}`, 'true');
    setCheckinDoneToday(true);
    
    trackAnalytics('daily_vet_checkin_completed', { pet_id: activePetId, label: questionObj.question, rating: optionValue });
  };

  // Get user posts
  const userPosts = posts.filter((post) => post.author_id === targetUserObj.user_id);

  // Get user Reviews across products
  const userReviews: { review: Review; product: Product }[] = [];
  products.forEach((p) => {
    p.reviews.forEach((r) => {
      if (r.author_id === targetUserObj.user_id) {
        userReviews.push({ review: r, product: p });
      }
    });
  });

  const handleOpenEditProfile = () => {
    if (!currentUser) return;
    setEditName(currentUser.display_name);
    setEditBio(currentUser.bio);
    setEditLocation(currentUser.location || '');
    setEditAvatar(currentUser.avatar_url);
    setEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      display_name: editName,
      bio: editBio,
      location: editLocation,
      avatar_url: editAvatar
    };

    onUpdateProfile(updatedUser);
    trackAnalytics('profile_viewed', { action: 'edited' });
    setEditProfileOpen(false);
  };

  const handleOpenPetForm = (pet?: Pet) => {
    if (pet) {
      setSelectedPetToEdit(pet);
      setPetName(pet.name);
      setPetSpecies(pet.species);
      setPetBreed(pet.breed);
      setPetAge(pet.age);
      setPetPhoto(pet.photo_url);
      setPetBio(pet.bio || '');
    } else {
      setSelectedPetToEdit(null);
      setPetName('');
      setPetSpecies('dog');
      setPetBreed('');
      setPetAge('');
      setPetPhoto('');
      setPetBio('');
    }
    setPetFormOpen(true);
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!petName || !petBreed) {
      alert('Must fill out Name and Breed!');
      return;
    }

    // Default stock photos if empty
    let finalPhoto = petPhoto.trim();
    if (!finalPhoto) {
      finalPhoto =
        petSpecies === 'dog'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtsZ0fs1D_1DRThWNRu369z_soo0PTrdhGIMQFZr311Xs_jPupRF41D8HkiHKIvLPuPv6o1fzZYGN10MeCO2kXSUBwUzF98p0hscUHKR-iG0QHlkXKTmAEJ6-ILBbyFFwct5BIuqIap4pqwlgiobo3MKJNRArNLbZ9uEE3Dr82DhEqaiG2U0y4MVmAQMbwD_hQx7rgx89-BumyIqtctK_mh2fP7mCsf8JsSLsRqa6xNSvpRCLYRcbIGsgMO6qy5ygBnRWQw33Lipc'
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuBto9jw44CgOYFBEnUOvQY-mZj9hOpDN-J3-taprr3jO_4qntoZmjo2Sx5AlT3BTVg5WZwPQnAhqQyOGGiEeRuDNVZ3NGjhvEvKjZ83y7gSIzano9sYDp0VZjfXjb6dHOpwzRIPCzD7CJ34YVSEyx5C-qSKtNRuzZrTX0FuwumrK3IXtNlAn6PmsKsqrNzh4yLQ4fm4ONGsem74a_P0PPtITA7Pwb7G5QZ_NyA-tzhpfyU2dfVXxNQ7L8G-haeZaRZ7tNtDkxXkVTg';
    }

    if (selectedPetToEdit) {
      // Edit
      const updated: Pet = {
        ...selectedPetToEdit,
        name: petName,
        species: petSpecies,
        breed: petBreed,
        age: petAge,
        photo_url: finalPhoto,
        bio: petBio
      };
      onUpdatePet(updated);
    } else {
      // Add
      const created: Pet = {
        pet_id: 'pet_' + Date.now(),
        owner_id: currentUser.user_id,
        name: petName,
        species: petSpecies,
        breed: petBreed,
        age: petAge,
        photo_url: finalPhoto,
        bio: petBio
      };
      onAddPet(created);
    }

    setPetFormOpen(false);
    setSelectedPetToEdit(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-20 pt-4 px-2">
      <AnimatePresence mode="wait">
        {/* EDIT PROFILE DIALOG */}
        {editProfileOpen && (
          <motion.div
            key="edit-profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-sm mb-6"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-[#D3D1C7] mb-4">
              <h3 className="font-sans font-extrabold text-[#3D405B] text-base">Edit Profile Form</h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-xs text-[#888780] font-bold">
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-body text-xs">
              <div>
                <label className="block font-bold text-[#3D405B] mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D405B] mb-1">Location City</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad, India"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D405B] mb-1">Bio (Max 160 characters)</label>
                <textarea
                  maxLength={160}
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                />
              </div>

              <div className="space-y-3">
                <label className="block font-bold text-[#3D405B] mb-0.5">Profile Avatar Photo</label>
                
                <ImageUploader
                  label="Upload Profile Photo"
                  subLabel="Drag & drop your file or browse (PNG, JPG)"
                  styleType="avatar"
                  maxFiles={1}
                  multiple={false}
                  existingImages={editAvatar ? [editAvatar] : []}
                  onImageUploaded={(url) => setEditAvatar(url)}
                  onRemoveImage={() => setEditAvatar('')}
                />

                <div className="pt-2 border-t border-[#D3D1C7]/30">
                  <label className="block text-[10px] font-bold text-[#888780] uppercase tracking-wider mb-2">Or choose a preset avatar</label>
                  <div className="flex gap-3">
                    {defaultAvatars.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(av)}
                        className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${
                          editAvatar === av ? 'border-[#E07A5F] ring-2 ring-[#E07A5F]/20 scale-105' : 'border-[#D3D1C7] opacity-80 hover:opacity-100 hover:scale-102'
                        }`}
                      >
                        <img src={av} alt="avatar option" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold text-[#888780] uppercase tracking-wider mb-1">Or paste a custom web link</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/your-photo"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] bg-[#FDFAF6] text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#E07A5F] text-white rounded-xl font-bold hover:opacity-95"
              >
                Save Profile settings
              </button>
            </form>
          </motion.div>
        )}

        {/* PET ADD / EDIT POPUP */}
        {petFormOpen && (
          <motion.div
            key="pet-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-sm mb-6"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-[#D3D1C7] mb-4">
              <h3 className="font-sans font-extrabold text-[#3D405B] text-base">
                {selectedPetToEdit ? `Edit ${selectedPetToEdit.name}` : 'Add a Companion'}
              </h3>
              <button
                onClick={() => {
                  setPetFormOpen(false);
                  setSelectedPetToEdit(null);
                }}
                className="text-xs text-[#888780] font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSavePet} className="space-y-4 font-body text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#3D405B] mb-1">Companion Name</label>
                  <input
                    type="text"
                    required
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g. Barnaby"
                    className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3D405B] mb-1">Species</label>
                  <select
                    value={petSpecies}
                    onChange={(e: any) => setPetSpecies(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#D3D1C7]"
                  >
                    <option value="dog">Dog 🐶</option>
                    <option value="cat">Cat 🐱</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#3D405B] mb-1">Breed</label>
                  <input
                    type="text"
                    required
                    value={petBreed}
                    onChange={(e) => setPetBreed(e.target.value)}
                    placeholder="e.g. Golden Retriever"
                    className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3D405B] mb-1">Age</label>
                  <input
                    type="text"
                    value={petAge}
                    onChange={(e) => setPetAge(e.target.value)}
                    placeholder="e.g. 3 years / 5 months"
                    className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#D3D1C7]/20">
                <ImageUploader
                  label="Companion Profile Photo"
                  subLabel="Supports PNG, JPG (click or drag here)"
                  styleType="compact"
                  maxFiles={1}
                  multiple={false}
                  existingImages={petPhoto ? [petPhoto] : []}
                  onImageUploaded={(url) => setPetPhoto(url)}
                  onRemoveImage={() => setPetPhoto('')}
                />

                <div className="pt-1.5">
                  <label className="block text-[10px] font-bold text-[#888780] uppercase tracking-wider mb-1">Or paste a photo web link</label>
                  <input
                    type="text"
                    value={petPhoto}
                    onChange={(e) => setPetPhoto(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7] bg-[#FDFAF6] text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D405B] mb-1">Companion Bio (optional)</label>
                <textarea
                  rows={2}
                  value={petBio}
                  onChange={(e) => setPetBio(e.target.value)}
                  placeholder="Enjoys positive training, raw kibble..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D3D1C7]"
                />
              </div>

              <div className="flex gap-2">
                {selectedPetToEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete companion from profile?')) {
                        onDeletePet(selectedPetToEdit.pet_id);
                        setPetFormOpen(false);
                      }
                    }}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-xl font-bold flex items-center gap-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E07A5F] text-white rounded-xl font-bold hover:opacity-95"
                >
                  Save Companion specifications
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!viewingPublicUser && <PetBirthdayBanner pets={userPets} />}

      {/* PUBLIC PROFILE MODE HEADER */}
      {viewingPublicUser && (
        <button
          onClick={onBackToMyProfile}
          className="mb-4 flex items-center gap-1.5 text-xs font-bold text-[#E07A5F] hover:underline"
        >
          ← Return to your Profile
        </button>
      )}

      {/* CORE PROFILE HEADER BOX */}
      <section className="bg-white rounded-3xl border border-[#D3D1C7] p-5 shadow-xs mb-6 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07A5F]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Avatar frame */}
          <div className="relative group">
            <img
              src={targetUserObj.avatar_url}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#D3D1C7]"
              alt="Profile placeholder"
            />
            {!viewingPublicUser && currentUser && (
              <button
                onClick={handleOpenEditProfile}
                className="absolute bottom-0 right-0 p-1 bg-[#E07A5F] text-white rounded-full border border-white hover:scale-105 transition-transform"
                title="Change Avatar"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="font-sans font-extrabold text-[#3D405B] text-lg leading-tight">
                {targetUserObj.display_name}
              </h2>

              {!viewingPublicUser && currentUser && (
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-1 hover:text-[#E07A5F] transition-colors"
                  title="Open Settings Dialog"
                >
                  <GearIcon className="w-4 h-4 text-[#888780]" />
                </button>
              )}
            </div>

            <p className="font-body text-xs text-[#2C2C2A] leading-relaxed mb-2.5 max-w-md">
              {targetUserObj.bio}
            </p>

            {/* Icons indicators */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[10px] text-[#888780] font-body font-bold uppercase tracking-wide">
              {targetUserObj.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E07A5F]" /> {targetUserObj.location}
                </span>
              )}

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#81B29A]" /> Joined {targetUserObj.joined_date}
              </span>

              <span className="px-2 py-0.5 bg-[#3D405B]/10 text-[#3D405B] rounded font-extrabold text-[9px]">
                {targetUserObj.species_preference.toUpperCase()} PREFERENCE
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile secondary CTA */}
        {!viewingPublicUser && currentUser && (
          <div className="border-t border-[#D3D1C7]/30 mt-4 pt-3 flex justify-between items-center sm:justify-end sm:gap-3">
            <button
              onClick={() => {
                onLogOut();
                setSettingsOpen(false);
              }}
              className="px-3.5 py-1 text-xs text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
            <button
              onClick={handleOpenEditProfile}
              className="px-3.5 py-1 text-xs border border-[#D3D1C7] text-[#3D405B] font-bold hover:bg-[#FDFAF6] rounded-xl transition-all"
            >
              Modify Bio Info
            </button>
          </div>
        )}
      </section>

      {/* MY TABS BAR */}
      <nav className="flex gap-4 border-b border-[#D3D1C7] mb-5 text-xs font-bold font-sans">
        <button
          onClick={() => setActiveTab('pets')}
          className={`pb-2.5 relative transition-all ${
            activeTab === 'pets' ? 'text-[#E07A5F]' : 'text-[#888780]'
          }`}
        >
          My Pets ({userPets.length})
          {activeTab === 'pets' && (
            <motion.div layoutId="profile-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('wellness')}
          className={`pb-2.5 relative transition-all ${
            activeTab === 'wellness' ? 'text-[#E07A5F]' : 'text-[#888780]'
          }`}
        >
          Wellness Tracker 🩺
          {activeTab === 'wellness' && (
            <motion.div layoutId="profile-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-2.5 relative transition-all ${
            activeTab === 'posts' ? 'text-[#E07A5F]' : 'text-[#888780]'
          }`}
        >
          My Posts ({userPosts.length})
          {activeTab === 'posts' && (
            <motion.div layoutId="profile-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
          )}
        </button>

        {!viewingPublicUser && (
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-2.5 relative transition-all ${
              activeTab === 'reviews' ? 'text-[#E07A5F]' : 'text-[#888780]'
            }`}
          >
            My Reviews ({userReviews.length})
            {activeTab === 'reviews' && (
              <motion.div layoutId="profile-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
            )}
          </button>
        )}

        {!viewingPublicUser && (
          <button
            onClick={() => setActiveTab('reminders')}
            className={`pb-2.5 relative transition-all ${
              activeTab === 'reminders' ? 'text-[#E07A5F]' : 'text-[#888780]'
            }`}
          >
            Reminders 🔔
            {activeTab === 'reminders' && (
              <motion.div layoutId="profile-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
            )}
          </button>
        )}

        {!viewingPublicUser && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2.5 relative transition-all ${
              activeTab === 'saved' ? 'text-[#E07A5F]' : 'text-[#888780]'
            }`}
          >
            Saved 🔖 ({savedPostIds.length + savedTipIds.length})
            {activeTab === 'saved' && (
              <motion.div layoutId="profile-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E07A5F]" />
            )}
          </button>
        )}
      </nav>

      {/* TAB CONTENT AREAS */}
      <div>
        {activeTab === 'pets' && (
          <div>
            <div className="grid grid-cols-2 gap-3">
              {userPets.map((p) => (
                <div
                  key={p.pet_id}
                  onClick={() => {
                    if (!viewingPublicUser && currentUser) handleOpenPetForm(p);
                  }}
                  className={`bg-white rounded-3xl border border-[#D3D1C7] p-3 shadow-xs flex flex-col justify-between ${
                    !viewingPublicUser ? 'cursor-pointer hover:border-[#E07A5F]' : ''
                  }`}
                >
                  <div className="rounded-2xl overflow-hidden h-28 bg-[#FDFAF6] border border-[#D3D1C7]/30 mb-2 relative">
                    <img src={p.photo_url} className="w-full h-full object-cover" alt="Companion registry" />
                  </div>
                  <div>
                    <h4 className="font-sans font-extrabold text-[#3D405B] text-xs leading-none mb-1">{p.name}</h4>
                    <p className="font-body text-[10px] text-[#888780]">{p.breed} • {p.age}</p>
                    {p.bio && <p className="font-body text-[9px] text-[#888780] line-clamp-2 mt-1.5 leading-tight">{p.bio}</p>}
                  </div>
                </div>
              ))}
 
              {/* Add pet card option */}
              {!viewingPublicUser && currentUser && (
                <button
                  onClick={() => handleOpenPetForm()}
                  className="bg-[#FDFAF6] rounded-3xl border-2 border-dashed border-[#D3D1C7] p-5 flex flex-col items-center justify-center text-center hover:bg-[#FDFAF6]/80 focus:outline-none min-h-[170px]"
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#D3D1C7] mb-2.5">
                    <Plus className="w-5 h-5 text-[#E07A5F]" />
                  </div>
                  <span className="block font-sans font-extrabold text-xs text-[#3D405B]">Add a Pet</span>
                  <span className="text-[10px] text-[#888780] font-body">Register canine or feline</span>
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (() => {
          const activePetId = selectedWellnessPetId || userPets[0]?.pet_id || '';
          const activePet = userPets.find(p => p.pet_id === activePetId) || userPets[0];
          
          if (userPets.length === 0) {
            return (
              <div className="text-center py-12 bg-white border border-[#D3D1C7] rounded-3xl p-6">
                <Activity className="w-8 h-8 text-[#E07A5F] mx-auto mb-2 opacity-85" />
                <h3 className="font-sans font-bold text-sm text-[#3D405B]">No Registered Companions</h3>
                <p className="font-body text-xs text-[#888780] max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
                  Register your feline or canine friend inside the "My Pets" page to begin tracking vitals, metrics and logging health charts!
                </p>
                <button
                  onClick={() => setActiveTab('pets')}
                  className="px-4 py-2 bg-[#E07A5F] text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-95"
                >
                  + Register Pet Companion
                </button>
              </div>
            );
          }

          const petLogs = healthLogs.filter(l => l.pet_id === activePetId);
          
          // Calculate historical averages
          const getActiveAverageMetrics = () => {
            if (petLogs.length === 0) {
              return { activity: 5, nutrition: 5, mood: 5, hydration: 5, sleep: 5 };
            }
            const sum = petLogs.reduce(
              (acc, log) => {
                acc.activity += Number(log.activity || 5);
                acc.nutrition += Number(log.nutrition || 5);
                acc.mood += Number(log.mood || 5);
                acc.hydration += Number(log.hydration || 5);
                acc.sleep += Number(log.sleep || 5);
                return acc;
              },
              { activity: 0, nutrition: 0, mood: 0, hydration: 0, sleep: 0 }
            );
            const count = petLogs.length;
            return {
              activity: Math.round((sum.activity / count) * 10) / 10,
              nutrition: Math.round((sum.nutrition / count) * 10) / 10,
              mood: Math.round((sum.mood / count) * 10) / 10,
              hydration: Math.round((sum.hydration / count) * 10) / 10,
              sleep: Math.round((sum.sleep / count) * 10) / 10,
            };
          };

          const avgMetrics = getActiveAverageMetrics();

          const handleAddHealthLog = (e: React.FormEvent) => {
            e.preventDefault();
            if (!activePetId) return;
            
            const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            
            const newLog = {
              id: 'hlog_' + Date.now(),
              pet_id: activePetId,
              date: dateStr,
              activity: logActivity,
              nutrition: logNutrition,
              mood: logMood,
              hydration: logHydration,
              sleep: logSleep
            };
            const updated = [newLog, ...healthLogs];
            saveLogsToStorage(updated);
            
            if (logWeight > 0 && onUpdatePet) {
               const newWeightLog = [...(activePet.weight_log || []), { date: dateStr, weight: logWeight }];
               onUpdatePet({ ...activePet, weight_log: newWeightLog });
            }
            
            trackAnalytics('health_metrics_logged', { pet_id: activePetId });
            alert(`Success! Wellness logs registered for ${activePet.name}. radar metrics recalculations updated.`);
            setLogWeight(0);
          };

          return (
            <div className="space-y-5">
              {/* Pet Quick Switcher */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-2 px-2">
                {userPets.map(p => (
                  <button
                    key={p.pet_id}
                    onClick={() => {
                      setSelectedWellnessPetId(p.pet_id);
                      trackAnalytics('health_pet_swapped', { pet_id: p.pet_id });
                    }}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      activePetId === p.pet_id
                        ? 'bg-[#E07A5F] border-[#E07A5F] text-white shadow-xs'
                        : 'bg-white border-[#D3D1C7] text-[#3D405B] hover:bg-[#FDFAF6]'
                    }`}
                  >
                    <span>{p.species === 'dog' ? '🐶' : '🐱'}</span>
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              {/* Daily Vet Check-in Card Widget */}
              {activePet && (
                <div className="bg-linear-to-r from-[#FDFAF6] to-[#E07A5F]/5 border-2 border-[#E07A5F]/15 rounded-3xl p-5 mb-1.5 shadow-[0_12px_30px_rgba(224,122,95,0.02)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#E07A5F]/5 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.5 bg-[#E07A5F]/15 text-[#E07A5F] rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                        🩺 Daily Vet Check-in
                      </div>
                      <span className="text-[10px] text-[#888780] font-body bg-white border border-[#D3D1C7]/30 px-2 py-0.5 rounded-full">
                        Rotates Each Day
                      </span>
                    </div>
                    
                    {!checkinDoneToday && (
                      <span className="text-[10px] text-[#E07A5F] font-bold animate-pulse flex items-center gap-1">
                        ● 1 pending question
                      </span>
                    )}
                  </div>

                  {checkinDoneToday ? (
                    <div className="flex items-center gap-3 bg-[#81B29A]/10 border border-[#81B29A]/30 p-3.5 rounded-2xl">
                      <div className="w-8 h-8 rounded-full bg-[#81B29A] flex items-center justify-center text-white text-xs leading-none">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-sans font-extrabold text-xs text-[#3D405B]">
                          Daily check-in done for {activePet.name}!
                        </h4>
                        <p className="font-body text-[10px] text-[#888780] mt-0.5">
                          Thanks for keeping tabs on your pet's wellness. Today's telemetry is logged: Health Radar has updated.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <div>
                        <h3 className="font-sans font-extrabold text-[#3D405B] text-xs sm:text-sm leading-snug">
                          {checkinQuestions[currentQuestionIndex]?.question}
                        </h3>
                        <p className="font-body text-[10px] text-[#888780] mt-0.5">
                          Log today's condition directly to recalibrate your wellness index telemetry.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {checkinQuestions[currentQuestionIndex]?.options.map((opt, oIdx) => (
                          <button
                            key={`opt-${oIdx}`}
                            onClick={() => handleDailyCheckInSubmit(opt.value, checkinQuestions[currentQuestionIndex])}
                            className="text-left p-3.5 bg-white hover:bg-[#FDFAF6] active:bg-[#E07A5F]/10 border border-[#D3D1C7] hover:border-[#E07A5F]/60 rounded-2xl font-body text-xs text-[#3D405B] transition-all duration-150 cursor-pointer shadow-2xs flex items-center justify-between"
                          >
                            <span>{opt.text}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#E07A5F]/10 text-[#E07A5F] rounded-md shrink-0 ml-2">
                              {opt.value}/10
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Wellness dashboard grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Visual Radar Column */}
                <div className="space-y-4">
                  <HealthRadarChart metrics={avgMetrics} />
                  
                  {/* Historical metrics info stats */}
                  <div className="bg-white rounded-3xl border border-[#D3D1C7] p-4 text-xs space-y-2.5">
                    <h4 className="font-sans font-bold text-xs text-[#3D405B] flex items-center gap-1">
                      📊 Average Stats Summary • {activePet.name}
                    </h4>
                    <p className="text-[11px] text-[#888780] font-body leading-relaxed">
                      Averages derived dynamically across {petLogs.length} historical metric recordings.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                      <div className="bg-[#FDFAF6] border border-[#D3D1C7]/30 p-2 rounded-xl flex justify-between items-center">
                        <span className="text-[#888780]">🏃 Activity</span>
                        <span className="text-[#E07A5F]">{avgMetrics.activity}/10</span>
                      </div>
                      <div className="bg-[#FDFAF6] border border-[#D3D1C7]/30 p-2 rounded-xl flex justify-between items-center">
                        <span className="text-[#888780]">🍗 Nutrition</span>
                        <span className="text-[#E07A5F]">{avgMetrics.nutrition}/10</span>
                      </div>
                      <div className="bg-[#FDFAF6] border border-[#D3D1C7]/30 p-2 rounded-xl flex justify-between items-center">
                        <span className="text-[#888780]">🐾 Mood / Energy</span>
                        <span className="text-[#E07A5F]">{avgMetrics.mood}/10</span>
                      </div>
                      <div className="bg-[#FDFAF6] border border-[#D3D1C7]/30 p-2 rounded-xl flex justify-between items-center">
                        <span className="text-[#888780]">💧 Hydration</span>
                        <span className="text-[#E07A5F]">{avgMetrics.hydration}/10</span>
                      </div>
                      <div className="bg-[#FDFAF6] border border-[#D3D1C7]/30 p-2 rounded-xl flex justify-between items-center col-span-2">
                        <span className="text-[#888780] flex items-center gap-1">🌙 Sleep Quality</span>
                        <span className="text-[#E07A5F]">{avgMetrics.sleep}/10</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logging Slider Form column */}
                <div className="bg-white border border-[#D3D1C7] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <form onSubmit={handleAddHealthLog} className="space-y-4">
                    <div>
                      <h4 className="font-sans font-extrabold text-[#3D405B] text-sm mb-1 leading-none">
                        📝 Register Today's Spec
                      </h4>
                      <p className="text-[10px] font-body text-[#888780]">
                        Log quick sliders to recalculate active radar values in real-time.
                      </p>
                    </div>

                    {/* Sliders loop */}
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#3D405B]">
                          <span className="flex items-center gap-1">🏃 Activity Level</span>
                          <span className="text-[#E07A5F]">{logActivity}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">💤</span>
                          <input
                            type="range" min="1" max="10"
                            value={logActivity}
                            onChange={(e) => setLogActivity(Number(e.target.value))}
                            className="flex-1 accent-[#E07A5F] h-1.5 bg-[#FDFAF6] rounded-lg border border-[#D3D1C7]/50 cursor-pointer"
                          />
                          <span className="text-xs">⚡</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#3D405B]">
                          <span className="flex items-center gap-1">🍗 Nutrition / Appetite</span>
                          <span className="text-[#E07A5F]">{logNutrition}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🤢</span>
                          <input
                            type="range" min="1" max="10"
                            value={logNutrition}
                            onChange={(e) => setLogNutrition(Number(e.target.value))}
                            className="flex-1 accent-[#E07A5F] h-1.5 bg-[#FDFAF6] rounded-lg border border-[#D3D1C7]/50 cursor-pointer"
                          />
                          <span className="text-xs">😋</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#3D405B]">
                          <span className="flex items-center gap-1">🐾 Mood & Energy</span>
                          <span className="text-[#E07A5F]">{logMood}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">😢</span>
                          <input
                            type="range" min="1" max="10"
                            value={logMood}
                            onChange={(e) => setLogMood(Number(e.target.value))}
                            className="flex-1 accent-[#E07A5F] h-1.5 bg-[#FDFAF6] rounded-lg border border-[#D3D1C7]/50 cursor-pointer"
                          />
                          <span className="text-xs">🥰</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#3D405B]">
                          <span className="flex items-center gap-1">💧 Hydration Intake</span>
                          <span className="text-[#E07A5F]">{logHydration}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🌵</span>
                          <input
                            type="range" min="1" max="10"
                            value={logHydration}
                            onChange={(e) => setLogHydration(Number(e.target.value))}
                            className="flex-1 accent-[#E07A5F] h-1.5 bg-[#FDFAF6] rounded-lg border border-[#D3D1C7]/50 cursor-pointer"
                          />
                          <span className="text-xs">🌊</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#3D405B]">
                          <span className="flex items-center gap-1">⚖️ Weight (kg)</span>
                          <span className="text-[#E07A5F]">{logWeight === 0 ? '--' : logWeight}</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={logWeight || ''}
                          onChange={(e) => setLogWeight(Number(e.target.value))}
                          placeholder="Enter current weight (optional)"
                          className="w-full px-2 py-1.5 rounded border border-[#D3D1C7] text-xs bg-[#FDFAF6] focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-[#3D405B]">
                          <span className="flex items-center gap-1">🌙 Sleep Quality</span>
                          <span className="text-[#E07A5F]">{logSleep}/10</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">🥱</span>
                          <input
                            type="range" min="1" max="10"
                            value={logSleep}
                            onChange={(e) => setLogSleep(Number(e.target.value))}
                            className="flex-1 accent-[#E07A5F] h-1.5 bg-[#FDFAF6] rounded-lg border border-[#D3D1C7]/50 cursor-pointer"
                          />
                          <span className="text-xs">😴</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#E07A5F] text-white font-bold text-[11px] uppercase tracking-wide rounded-xl shadow-xs hover:opacity-95 transition-opacity"
                    >
                      Save Active Log Entry
                    </button>
                  </form>
                </div>
              </div>

              {/* Trend Chart and Milestones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <ActivityTrendChart data={petLogs} />
                <WeightTrendChart data={activePet.weight_log || []} />
                <AgeMilestones pet={activePet} />
              </div>

              {/* Log Historics list */}
              <div className="bg-white rounded-3xl border border-[#D3D1C7] p-4 text-xs space-y-3">
                <h4 className="font-sans font-bold text-xs text-[#3D405B]">📅 Logged Wellness Timeline ({petLogs.length})</h4>
                
                {petLogs.length === 0 ? (
                  <p className="text-[11px] text-[#888780] font-body text-center py-4">No health entries logged yet. Slide values and hit save above!</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {petLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-[#FDFAF6] border border-[#D3D1C7]/40 rounded-2xl flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#E07A5F]">
                            <span>📅 {log.date}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[9px] text-[#888780]">
                            <span>🏃 act: {log.activity}</span>
                            <span>🍗 nutr: {log.nutrition}</span>
                            <span>🐾 mood: {log.mood}</span>
                            <span>💧 hydr: {log.hydration}</span>
                            <span>🌙 sleep: {log.sleep}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm("Delete this metric entry?")) handleDeleteLog(log.id);
                          }}
                          className="p-1 px-2 border border-red-500/30 text-red-500 hover:bg-red-50 rounded-lg text-[9px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {userPosts.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[#D3D1C7] rounded-3xl p-5 text-xs text-[#888780]">
                No updates posted yet under this profile.
              </div>
            ) : (
              userPosts.map((post) => (
                <article key={post.post_id} className="bg-white rounded-3xl border border-[#D3D1C7] p-4 text-xs shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-sans font-extrabold text-[#3D405B] text-sm line-clamp-1">{post.title}</h4>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-[#FDFAF6] text-[#3D405B] rounded">
                      {post.species_tag}
                    </span>
                  </div>
                  <p className="font-body text-[#888780] text-xs line-clamp-2 mb-3 leading-relaxed">{post.body}</p>
                  <div className="flex justify-between items-center text-[10px] text-[#888780] font-bold">
                    <span>{post.likes_count} Likes • {post.comments.length} Comments</span>
                    <span>{post.created_at}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && !viewingPublicUser && (
          <div className="space-y-3">
            {userReviews.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[#D3D1C7] rounded-3xl p-5 text-xs text-[#888780]">
                No local product reviews submitted yet.
              </div>
            ) : (
              userReviews.map(({ review, product }) => (
                <div key={review.review_id} className="bg-white rounded-3xl border border-[#D3D1C7] p-3.5 text-xs shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-sans font-extrabold text-[#3D405B] text-xs">{product.name}</h4>
                      <p className="font-body text-[9px] text-[#888780]">brand: {product.brand}</p>
                    </div>

                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating ? 'text-[#F2CC8F] fill-current' : 'text-[#D3D1C7]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="font-body text-[#2C2C2A] text-xs mb-2Leading-relaxed whitespace-pre-wrap">{review.body}</p>
                  <p className="text-[9px] text-[#888780] font-body text-right">Helpfulness index: {review.helpful_count}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reminders' && !viewingPublicUser && currentUser && (
          <Reminders
            currentUser={currentUser}
            userPets={userPets}
            trackAnalytics={trackAnalytics}
          />
        )}

        {activeTab === 'saved' && !viewingPublicUser && (
          <div className="space-y-6">
            {/* Saved Posts Grid */}
            <div>
              <h3 className="font-sans font-extrabold text-[#3D405B] text-sm mb-3 flex items-center gap-1.5 border-b border-[#D3D1C7]/35 pb-1">
                <Bookmark className="w-4 h-4 text-[#E07A5F]" /> Saved Community Posts ({savedPostIds.length})
              </h3>

              {savedPostIds.length === 0 ? (
                <div className="text-center py-6 bg-white border border-[#D3D1C7]/70 rounded-3xl p-4">
                  <p className="font-body text-xs text-[#888780]">
                    No saved posts yet. Bookmarked posts will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {posts
                    .filter((p) => savedPostIds.includes(p.post_id))
                    .map((post) => (
                      <div
                        key={`saved-post-${post.post_id}`}
                        className="bg-white rounded-2xl border border-[#D3D1C7]/60 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-[#E07A5F]/10 text-[#E07A5F] rounded-md">
                              {post.species_tag}
                            </span>
                            
                            <button
                              onClick={() => {
                                if (onToggleBookmarkPost) onToggleBookmarkPost(post.post_id);
                              }}
                              className="text-[#E07A5F] hover:text-[#E07A5F]/80 shrink-0 cursor-pointer"
                              title="Unsave post"
                            >
                              <BookmarkCheck className="w-4 h-4 text-[#81B29A]" />
                            </button>
                          </div>

                          <h4 className="font-sans font-bold text-xs text-[#3D405B] mb-1 line-clamp-1">
                            {post.title}
                          </h4>
                          <p className="font-body text-[11px] text-[#888780] line-clamp-2 leading-relaxed mb-3">
                            {post.body}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (onNavigateToTab) {
                              onNavigateToTab('talk', post.post_id);
                            }
                          }}
                          className="w-full text-center py-1.5 bg-[#FDFAF6] border border-[#D3D1C7] hover:bg-[#E07A5F]/5 rounded-xl font-bold text-[10px] text-[#3D405B] transition-colors cursor-pointer"
                        >
                          View in PetTalk Feed
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Saved Vet Tips Grid */}
            <div>
              <h3 className="font-sans font-extrabold text-[#3D405B] text-sm mb-3 flex items-center gap-1.5 border-b border-[#D3D1C7]/35 pb-1">
                <BookOpen className="w-4 h-4 text-[#E07A5F]" /> Saved Vet Tips & Guidelines ({savedTipIds.length})
              </h3>

              {savedTipIds.length === 0 ? (
                <div className="text-center py-6 bg-white border border-[#D3D1C7]/70 rounded-3xl p-4">
                  <p className="font-body text-xs text-[#888780]">
                    No saved health guidelines yet. Bookmarked vet tips will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {tips
                    .filter((t) => savedTipIds.includes(t.tip_id))
                    .map((tip) => (
                      <div
                        key={`saved-tip-${tip.tip_id}`}
                        className="bg-white rounded-2xl border border-[#D3D1C7]/60 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-[#81B29A]/10 text-[#81B29A] rounded-md">
                              {tip.category}
                            </span>
                            
                            <button
                              onClick={() => {
                                if (onToggleBookmarkTip) onToggleBookmarkTip(tip.tip_id);
                              }}
                              className="text-[#81B29A] hover:text-[#81B29A]/80 shrink-0 cursor-pointer"
                              title="Unsave Tip"
                            >
                              <BookmarkCheck className="w-4 h-4 text-[#81B29A]" />
                            </button>
                          </div>

                          <h4 className="font-sans font-bold text-xs text-[#3D405B] mb-1 line-clamp-1">
                            {tip.title}
                          </h4>
                          <p className="font-body text-[11px] text-[#888780] line-clamp-2 leading-relaxed mb-3">
                            {tip.body.replace(/[#*\-]/g, '').slice(0, 100)}...
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (onNavigateToTab) {
                              onNavigateToTab('learn', tip.tip_id);
                            }
                          }}
                          className="w-full text-center py-1.5 bg-[#FDFAF6] border border-[#D3D1C7] hover:bg-[#E07A5F]/5 rounded-xl font-bold text-[10px] text-[#3D405B] transition-colors cursor-pointer"
                        >
                          Read Full Clinical Article
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CORE SETTINGS MODAL DIALOG GEAR OVERLAY */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-[#3D405B]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#D3D1C7] p-5 max-w-sm w-full font-body text-xs text-[#2C2C2A] space-y-4"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-[#D3D1C7]">
              <h3 className="font-sans font-extrabold text-[#3D405B] text-base flex items-center gap-1.5">
                <GearIcon className="w-4 h-4 text-[#E07A5F]" /> Settings Center
              </h3>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  setDeleteConfOpen(false);
                }}
                className="text-[#888780] hover:text-black font-bold"
              >
                Close
              </button>
            </div>

            {/* Notification triggers */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-xs text-[#3D405B] uppercase tracking-wide">Notification options</h4>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Notify on weekly digest newsletter</span>
                <input
                  type="checkbox"
                  checked={optDigest}
                  onChange={(e) => setOptDigest(e.target.checked)}
                  className="w-4 h-4 text-[#E07A5F] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Notify on comment replies</span>
                <input
                  type="checkbox"
                  checked={optComments}
                  onChange={(e) => setOptComments(e.target.checked)}
                  className="w-4 h-4 text-[#E07A5F] rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span>Notify flat liked milestones</span>
                <input
                  type="checkbox"
                  checked={optLikes}
                  onChange={(e) => setOptLikes(e.target.checked)}
                  className="w-4 h-4 text-[#E07A5F] rounded"
                />
              </label>
            </div>

            {/* Theme options */}
            <div className="space-y-3 pt-3 border-t border-[#D3D1C7]/30">
              <h4 className="font-sans font-bold text-xs text-[#3D405B] uppercase tracking-wide">Theme options</h4>
              <div className="flex items-center justify-between cursor-pointer" onClick={onToggleDarkMode}>
                <span className="flex items-center gap-1.5 font-bold">
                  {isDarkMode ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-[#F2CC8F]" /> Modern Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-[#E07A5F]" /> Warm Light Mode
                    </>
                  )}
                </span>
                
                {/* Visual active toggle switch */}
                <button
                  type="button"
                  className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative ${
                    isDarkMode ? 'bg-[#81B29A]' : 'bg-[#D3D1C7]'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                    animate={{ x: isDarkMode ? 17 : 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                </button>
              </div>
            </div>

            {/* Account controls */}
            <div className="space-y-2.5 pt-3 border-t border-[#D3D1C7]/30">
              <h4 className="font-sans font-bold text-xs text-[#3D405B] uppercase tracking-wide">Account controls</h4>

              <button
                type="button"
                className="w-full text-left py-2 border-b border-[#D3D1C7]/30 flex items-center justify-between text-[#3D405B] font-bold hover:text-[#E07A5F]"
                onClick={() => alert('Simulated: A secure password change ticket has been sent to your registered inbox.')}
              >
                Change Auth Password <Lock className="w-3.5 h-3.5 text-[#888780]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onLogOut();
                  setSettingsOpen(false);
                }}
                className="w-full text-left py-2 border-b border-[#D3D1C7]/30 flex items-center justify-between text-red-500 font-bold hover:opacity-90"
              >
                Log Out Profile <LogOut className="w-3.5 h-3.5 text-red-500/80" />
              </button>

              {!deleteConfOpen ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfOpen(true)}
                  className="w-full text-left py-2 flex items-center justify-between text-red-500 font-bold"
                >
                  Delete Account <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="bg-red-50 rounded-xl p-3 border border-red-200 mt-2 space-y-2">
                  <p className="text-[10px] text-red-600 font-bold">
                    WARNING: This irreversibly wipes all reviews, registered pets, comments, and logins. Continue?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfOpen(false)}
                      className="flex-1 py-1 bg-white border border-[#D3D1C7] text-xs font-bold"
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteAccount();
                        setSettingsOpen(false);
                      }}
                      className="flex-1 py-1 bg-red-500 text-white rounded-lg text-xs font-bold"
                    >
                      Wipe Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Version info footer */}
            <div className="pt-3 border-t border-[#D3D1C7]/30 text-center text-[10px] text-[#888780] font-body">
              PawPack iOS v1.3.4 (Build Dec 2026) • Connected as Local sandbox
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
