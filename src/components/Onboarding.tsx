/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { Sparkles, Heart, Compass, ShieldCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: (user: User | null, initialPreference: 'dog' | 'cat' | 'both') => void;
  trackAnalytics: (eventName: any, params: any) => void;
}

export default function Onboarding({ onComplete, trackAnalytics }: OnboardingProps) {
  const [slide, setSlide] = useState(3); // 3 for auth screen, 4 for username, 5 for avatar, 6 for bio, 7 for preference
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  
  const [errorMsg, setErrorMsg] = useState('');

  const checkUsername = (val: string) => {
    setUsername(val);
    if (val.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    setTimeout(() => {
      setUsernameAvailable(!val.includes('taken')); 
      setIsCheckingUsername(false);
    }, 500);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !displayName)) {
      setErrorMsg('Please populate all required fields correctly.');
      return;
    }
    setErrorMsg('');

    if (isSignUp) {
      setSlide(4);
      return;
    }

    // Generate a simulated user response
    const mockUser: User = {
      user_id: 'user_created_' + Math.random().toString(36).substr(2, 9),
      display_name: email.split('@')[0],
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0bMbMUrZzCaBUvWky7XIfPRMfS0AV8yUD30DNLtzJXLwlElPX8_Crgg23Q_Xryn3tJp7QvO1_7rSRk8VrAOVns0dU7-t5AHrusvQJDEeSg06CgyMTDexeYLrSFlDHeEqh7RUtNMymNtcnf5qVB6lhyHAR6Krv0uI9vFqOtt206PtNJMdN1_t8sP55fpuG94m_K-guz2Hi6grEnsOM29J1VdzfUXMU9HaO9MMYl9CxLCeW95-PoVo1VnxljsDeTzzO0W0WogykAA',
      bio: 'Welcome back!',
      species_preference: 'both',
      joined_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    trackAnalytics('app_open', { auth_method: 'email_login' });
    onComplete(mockUser, 'both');
  };

  const handleGoogleSignIn = () => {
    if (isSignUp) {
        setSlide(4);
        return;
    }
    // Elegant simulated Google Sign-In popup with instant return
    const mockUser: User = {
      user_id: 'user_google_' + Math.random().toString(36).substr(2, 9),
      display_name: 'Google Friend',
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0bMbMUrZzCaBUvWky7XIfPRMfS0AV8yUD30DNLtzJXLwlElPX8_Crgg23Q_Xryn3tJp7QvO1_7rSRk8VrAOVns0dU7-t5AHrusvQJDEeSg06CgyMTDexeYLrSFlDHeEqh7RUtNMymNtcnf5qVB6lhyHAR6Krv0uI9vFqOtt206PtNJMdN1_t8sP55fpuG94m_K-guz2Hi6grEnsOM29J1VdzfUXMU9HaO9MMYl9CxLCeW95-PoVo1VnxljsDeTzzO0W0WogykAA',
      bio: 'Eco-centric human exploring with tech-forward animals.',
      species_preference: 'both',
      joined_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    trackAnalytics('app_open', { auth_method: 'google_signin' });
    onComplete(mockUser, 'both');
  };

  const handlePrefSelection = (pref: 'dog' | 'cat' | 'both') => {
    const finalUserObj: User = {
      user_id: 'user_created_' + Math.random().toString(36).substr(2, 9),
      display_name: displayName || username || 'New User',
      avatar_url: avatarPreview || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0bMbMUrZzCaBUvWky7XIfPRMfS0AV8yUD30DNLtzJXLwlElPX8_Crgg23Q_Xryn3tJp7QvO1_7rSRk8VrAOVns0dU7-t5AHrusvQJDEeSg06CgyMTDexeYLrSFlDHeEqh7RUtNMymNtcnf5qVB6lhyHAR6Krv0uI9vFqOtt206PtNJMdN1_t8sP55fpuG94m_K-guz2Hi6grEnsOM29J1VdzfUXMU9HaO9MMYl9CxLCeW95-PoVo1VnxljsDeTzzO0W0WogykAA',
      bio: bio || 'New PawPack community member!',
      species_preference: pref,
      joined_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    trackAnalytics('species_toggle_switched', { mode: pref, source: 'onboarding' });
    onComplete(finalUserObj, pref);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] text-[#2C2C2A] flex flex-col items-center justify-center p-4 overflow-y-auto">
      <AnimatePresence mode="wait">
        {slide === 3 && (
          <motion.div
            key="auth-box"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[350px] flex flex-col gap-3"
          >
            {/* Main Auth Box */}
            <div className="bg-white border border-[#D3D1C7]/70 rounded-sm p-8 flex flex-col items-center shadow-xs">
              <h1 className="font-serif italic font-extrabold text-4xl mb-4 text-[#2C2C2A] tracking-tighter">
                PawPack
              </h1>
              
              {isSignUp && (
                <p className="font-sans font-bold text-[15px] leading-tight text-[#888780] mb-5 text-center px-2">
                  Sign up to see photos, videos, and vet tips from your friends.
                </p>
              )}

              {isSignUp && (
                <div className="w-full space-y-2 mb-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-lg bg-[#E07A5F] hover:bg-[#E07A5F]/90 transition-colors font-bold text-white text-[13px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.925a5.59 5.59 0 0 1 5.59-5.59c2.451 0 4.417 1.488 5.23 3.61l3.966-3.08A11.96 11.96 0 0 0 13.99 1a11.93 11.93 0 0 0-11.93 11.925c0 6.58 5.345 11.925 11.93 11.925a11.83 11.83 0 0 0 11.93-11.925c0-.987-.1-1.637-.25-2.565H12.24z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-lg bg-black hover:bg-neutral-800 transition-colors font-bold text-white text-[13px] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2A10 10 0 002 12a10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm2.25 5.5c.34-.43.56-1.04.5-1.66-.54.02-1.2.36-1.57.81-.32.39-.59 1.01-.5 1.62.6-.02 1.2-.33 1.57-.77zM11.9 19C9.5 19 8.6 17.6 7.6 17.6c-1.1 0-2.4 1.4-3.8.3C2.8 17 3.5 13.2 5.5 11.6c.9-.7 2-.7 2.7-.7.6 0 1.5.1 2.3.6.9-.5 1.8-.7 2.6-.7 1 0 2 .2 2.7.9-.6.4-1 1.1-1 2.1 0 1.9 1.6 2.5 1.8 2.5-.1.4-.7 1.9-1.9 1.9h-.2c-.8-.1-1.5-.4-2.6-.4z"/>
                    </svg>
                    Continue with Apple
                  </button>
                </div>
              )}

              <div className="flex items-center w-full my-3">
                <div className="flex-1 h-px bg-[#D3D1C7]/50"></div>
                <span className="mx-4 text-[11px] font-extrabold text-[#888780] uppercase">OR</span>
                <div className="flex-1 h-px bg-[#D3D1C7]/50"></div>
              </div>

              <form onSubmit={handleAuthSubmit} className="w-full space-y-1.5 flex flex-col">
                <input
                  type="email"
                  className="w-full px-2.5 py-2.5 bg-[#fafafa] border border-[#D3D1C7] rounded-[3px] text-xs focus:outline-none focus:border-[#888780] placeholder:text-[#888780]"
                  placeholder="Email or mobile number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                
                {isSignUp && (
                  <input
                    type="text"
                    className="w-full px-2.5 py-2.5 bg-[#fafafa] border border-[#D3D1C7] rounded-[3px] text-xs focus:outline-none focus:border-[#888780] placeholder:text-[#888780]"
                    placeholder="Full Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                )}

                <input
                  type="password"
                  className="w-full px-2.5 py-2.5 bg-[#fafafa] border border-[#D3D1C7] rounded-[3px] text-xs focus:outline-none focus:border-[#888780] placeholder:text-[#888780]"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {errorMsg && (
                  <p className="text-red-500 text-xs text-center mt-2 font-medium">{errorMsg}</p>
                )}

                {isSignUp && (
                  <p className="text-[11px] text-[#888780] text-center my-3 leading-relaxed">
                    By signing up, you agree to our <span className="font-semibold cursor-pointer">Terms</span>, <span className="font-semibold cursor-pointer">Privacy Policy</span> and <span className="font-semibold cursor-pointer">Cookies Policy</span>.
                  </p>
                )}

                {!isSignUp && (
                  <button
                    type="button"
                    className="text-xs text-[#3D405B] font-semibold text-right mt-1 mb-2 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}

                <button
                  type="submit"
                  className={`w-full py-2 rounded-lg font-bold text-[13px] text-white mt-1 transition-opacity cursor-pointer ${
                    (email.length > 3 && password.length > 5 && (!isSignUp || displayName.length > 0))
                      ? 'bg-[#E07A5F] hover:bg-[#E07A5F]/90'
                      : 'bg-[#E07A5F]/60'
                  }`}
                >
                  {isSignUp ? 'Sign up' : 'Log in'}
                </button>
              </form>

              {!isSignUp && (
                <div className="w-full mt-4">
                  <div className="flex items-center w-full my-4">
                    <div className="flex-1 h-px bg-[#D3D1C7]/50"></div>
                    <span className="mx-4 text-[11px] font-extrabold text-[#888780] uppercase">OR</span>
                    <div className="flex-1 h-px bg-[#D3D1C7]/50"></div>
                  </div>
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 text-[#3D405B] font-bold text-sm cursor-pointer"
                  >
                     <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.925a5.59 5.59 0 0 1 5.59-5.59c2.451 0 4.417 1.488 5.23 3.61l3.966-3.08A11.96 11.96 0 0 0 13.99 1a11.93 11.93 0 0 0-11.93 11.925c0 6.58 5.345 11.925 11.93 11.925a11.83 11.83 0 0 0 11.93-11.925c0-.987-.1-1.637-.25-2.565H12.24z"
                        />
                      </svg>
                    Log in with Google
                  </button>
                </div>
              )}
            </div>

            {/* Toggle Box */}
            <div className="bg-white border border-[#D3D1C7]/70 rounded-sm p-5 text-center text-[13px] shadow-xs">
              <span className="text-[#2C2C2A]">
                {isSignUp ? 'Have an account?' : "Don't have an account?"}
              </span>{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#E07A5F] font-bold hover:underline cursor-pointer"
              >
                {isSignUp ? 'Log in' : 'Sign up'}
              </button>
            </div>

            <div className="text-center mt-2">
              <p className="text-[13px] text-[#2C2C2A] mb-3">Get the app.</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-[130px] h-10 bg-[#2C2C2A] rounded-lg flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs font-bold">App Store</span>
                </div>
                <div className="w-[130px] h-10 bg-[#2C2C2A] rounded-lg flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs font-bold">Google Play</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {slide === 4 && (
          <motion.div
            key="username-slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[350px] flex flex-col gap-3"
          >
            <div className="bg-white border border-[#D3D1C7]/70 rounded-md p-8 flex flex-col items-center shadow-xs">
              <Compass className="w-10 h-10 text-[#E07A5F] mb-4" />
              <h1 className="font-sans font-bold text-xl mb-2 text-[#2C2C2A] text-center">
                Create Username
              </h1>
              <p className="font-sans text-xs text-[#888780] mb-5 text-center leading-relaxed">
                Choose a username for your new account. You can always change it later.
              </p>
              
              <div className="w-full relative mb-4">
                <input
                  type="text"
                  className={`w-full px-3 py-2.5 bg-[#fafafa] border rounded-[3px] text-xs focus:outline-none focus:border-[#888780] placeholder:text-[#888780] ${usernameAvailable === false ? 'border-red-500' : 'border-[#D3D1C7]'}`}
                  placeholder="Username"
                  value={username}
                  onChange={(e) => checkUsername(e.target.value)}
                />
                {isCheckingUsername && <span className="absolute right-3 top-3 text-[10px] text-[#888780]">Checking...</span>}
                {!isCheckingUsername && usernameAvailable === true && <ShieldCheck className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />}
                {!isCheckingUsername && usernameAvailable === false && <span className="absolute right-3 top-2.5 text-xs text-red-500">❌</span>}
              </div>

              <button
                onClick={() => setSlide(5)}
                disabled={!usernameAvailable}
                className="w-full py-2 rounded-lg font-bold text-[13px] text-white bg-[#E07A5F] hover:bg-[#E07A5F]/90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {slide === 5 && (
          <motion.div
            key="avatar-slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[350px] flex flex-col gap-3"
          >
            <div className="bg-white border border-[#D3D1C7]/70 rounded-md p-8 flex flex-col items-center shadow-xs">
              <h1 className="font-sans font-bold text-xl mb-2 text-[#2C2C2A] text-center">
                Add profile photo
              </h1>
              <p className="font-sans text-xs text-[#888780] mb-5 text-center leading-relaxed">
                Add a profile photo so your friends know it's you.
              </p>
              
              <div className="w-24 h-24 mb-6 relative">
                 <div className="w-full h-full rounded-full border-2 border-dashed border-[#D3D1C7] flex items-center justify-center overflow-hidden bg-[#fafafa]">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <span className="text-4xl">📸</span>
                    )}
                 </div>
                 <input type="file" accept="image/*" onChange={handleAvatarUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>

              <button
                onClick={() => setSlide(6)}
                className="w-full py-2 rounded-lg font-bold text-[13px] text-white bg-[#E07A5F] hover:bg-[#E07A5F]/90 transition-opacity cursor-pointer mb-3"
              >
                {avatarPreview ? 'Next' : 'Skip'}
              </button>
            </div>
          </motion.div>
        )}

        {slide === 6 && (
          <motion.div
            key="bio-slide"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-[350px] flex flex-col gap-3"
          >
            <div className="bg-white border border-[#D3D1C7]/70 rounded-md p-8 flex flex-col items-center shadow-xs">
              <h1 className="font-sans font-bold text-xl mb-2 text-[#2C2C2A] text-center">
                Tell us about you
              </h1>
              <p className="font-sans text-[11px] text-[#888780] mb-4 text-center">
                Share a quick bio and select your pet interests.
              </p>
              
              <textarea
                className="w-full px-3 py-2.5 bg-[#fafafa] border border-[#D3D1C7] rounded-[3px] text-xs focus:outline-none focus:border-[#888780] placeholder:text-[#888780] mb-4 resize-none"
                placeholder="Hi, I'm a proud pet parent..."
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              <div className="w-full mb-6">
                <span className="text-[10px] font-bold text-[#3D405B] mb-2 block uppercase">Interests</span>
                <div className="flex flex-wrap gap-2">
                  {['Dog Training', 'Cat Health', 'Pet Photography', 'Nutrition', 'Rescue'].map(int => (
                    <button
                      key={int}
                      onClick={() => toggleInterest(int)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        interests.includes(int) ? 'bg-[#3D405B] text-white' : 'bg-[#FDFAF6] text-[#888780] border border-[#D3D1C7]'
                      }`}
                    >
                      {int}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSlide(7)}
                className="w-full py-2 rounded-lg font-bold text-[13px] text-white bg-[#E07A5F] hover:bg-[#E07A5F]/90 transition-opacity cursor-pointer"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {slide === 7 && (
          <motion.div
            key="pref-selector"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-center"
            >
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-[#E07A5F]/10 mx-auto flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-[#E07A5F]" />
                </div>
                <h1 className="font-sans font-extrabold text-[#3D405B] text-2xl tracking-normal">
                  Animal Preference
                </h1>
                <p className="font-body text-xs text-[#888780] max-w-xs mx-auto mt-2">
                  This customizes your global homepage feed immediately. You can switch states in the top bar at any time!
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => handlePrefSelection('dog')}
                  className="w-full p-4 rounded-xl border border-[#D3D1C7] hover:border-[#F2CC8F] bg-white flex items-center gap-4 transition-all hover:shadow-xs group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#F2CC8F]/20 flex items-center justify-center group-hover:scale-105 transition-transform text-[#F2CC8F]">
                    🐶
                  </div>
                  <div className="text-left">
                    <p className="font-sans font-semibold text-[#2C2C2A] text-sm">Dog Mode</p>
                    <p className="font-body text-xs text-[#888780]">Tailored feeds for energetic pups and canines.</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePrefSelection('cat')}
                  className="w-full p-4 rounded-xl border border-[#D3D1C7] hover:border-[#81B29A] bg-white flex items-center gap-4 transition-all hover:shadow-xs group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#81B29A]/20 flex items-center justify-center group-hover:scale-105 transition-transform text-[#81B29A]">
                    🐱
                  </div>
                  <div className="text-left">
                    <p className="font-sans font-semibold text-[#2C2C2A] text-sm">Cat Mode</p>
                    <p className="font-body text-xs text-[#888780]">Curated items for comfortable soundless felines.</p>
                  </div>
                </button>

                <button
                  onClick={() => handlePrefSelection('both')}
                  className="w-full p-4 rounded-xl border border-[#D3D1C7] hover:border-[#3D405B] bg-white flex items-center gap-4 transition-all hover:shadow-xs group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#3D405B]/10 flex items-center justify-center group-hover:scale-105 transition-transform text-[#3D405B]">
                    🐾
                  </div>
                  <div className="text-left">
                    <p className="font-sans font-semibold text-[#2C2C2A] text-sm">Both Species</p>
                    <p className="font-body text-xs text-[#888780]">Access both perspectives inside your timeline.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Slide indicators / pagination */}
      {slide >= 3 && (
        <div className="text-center py-4 flex items-center justify-center gap-1.5 text-[11px] text-[#888780] font-body">
          <ShieldCheck className="w-3.5 h-3.5 text-[#81B29A]" />
          Secured Sandbox Connection. Data stored locally.
        </div>
      )}
    </div>
  );
}
