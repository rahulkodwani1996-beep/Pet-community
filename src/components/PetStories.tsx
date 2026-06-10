import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Camera } from 'lucide-react';
import { User } from '../types';

interface Story {
  id: string;
  user_id: string;
  avatar_url: string;
  display_name: string;
  has_unseen: boolean;
  content_url: string; // Simulated content image/video
}

interface PetStoriesProps {
  currentUser: User | null;
  users: User[];
  onPromptSignUp: () => void;
}

export default function PetStories({ currentUser, users, onPromptSignUp }: PetStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [cameraAccess, setCameraAccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Generate some mock stories from the users list
    const mockStories: Story[] = users.slice(0, 5).map((u, i) => ({
      id: `story-${u.user_id}-${i}`,
      user_id: u.user_id,
      avatar_url: u.avatar_url || `https://i.pravatar.cc/150?u=${u.user_id}`,
      display_name: u.display_name,
      has_unseen: i % 2 === 0, // Just to show the ring color difference
      content_url: `https://source.unsplash.com/400x800/?pet,cat,dog&sig=${i}`, // Fallback placeholder
    }));
    setStories(mockStories);
  }, [users]);

  // Request camera access
  const handleAddStory = async () => {
    if (!currentUser) {
      onPromptSignUp();
      return;
    }
    setIsAddingStory(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraAccess(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied or unavailabe', err);
      // Even if failed, we show the UI
    }
  };

  const closeCamera = () => {
    setIsAddingStory(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraAccess(false);
  };

  return (
    <>
      <div className="w-full mb-6">
        <h3 className="text-xs font-bold text-[#888780] uppercase tracking-wider mb-3 px-1">Pet Stories</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1 items-start">
          
          {/* Add story item */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0" onClick={handleAddStory}>
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-[#D3D1C7] p-0.5 flex items-center justify-center bg-[#FDFAF6] hover:bg-[#E07A5F]/5 transition-colors">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="You" className="w-full h-full rounded-full object-cover opacity-60" />
              ) : (
                <Camera className="w-6 h-6 text-[#888780]" />
              )}
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#E07A5F] rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#3D405B]">Your Story</span>
          </div>

          {/* User Stories */}
          {stories.map(story => (
            <div 
              key={story.id} 
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
              onClick={() => {
                setActiveStory(story);
                setStories(stories.map(s => s.id === story.id ? { ...s, has_unseen: false } : s));
              }}
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${story.has_unseen ? 'bg-gradient-to-tr from-[#F2CC8F] to-[#E07A5F]' : 'bg-[#D3D1C7]'}`}>
                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                  <img src={story.avatar_url} alt={story.display_name} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#888780] max-w-[64px] truncate">{story.display_name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <div className="absolute top-4 right-4 z-50">
              <button onClick={() => setActiveStory(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-sm aspect-[9/16] bg-[#2C2C2A] rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Progress bar simulation */}
              <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
                <div className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    onAnimationComplete={() => setActiveStory(null)}
                    className="h-full bg-white"
                  />
                </div>
              </div>

              {/* Story Header */}
              <div className="absolute top-6 left-4 z-20 flex items-center gap-2">
                <img src={activeStory.avatar_url} className="w-8 h-8 rounded-full border border-white/50" alt="" />
                <span className="text-white text-xs font-bold drop-shadow-md">{activeStory.display_name}</span>
                <span className="text-white/70 text-[10px] font-bold drop-shadow-md ml-1">2h</span>
              </div>

              {/* Simulated Story Content */}
              <div className="w-full h-full bg-gradient-to-br from-[#3D405B] to-[#2C2C2A] flex items-center justify-center">
                 <img src={activeStory.content_url} className="w-full h-full object-cover opacity-80" alt="Story content" />
                 <div className="absolute bottom-10 left-0 right-0 p-4 text-center z-20">
                    <p className="text-white font-serif italic text-2xl drop-shadow-lg">Just had a snack! 🐾</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Camera / Add Story Modal */}
        {isAddingStory && (
           <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
           >
              <div className="absolute top-4 right-4 z-50">
                <button onClick={closeCamera} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors cursor-pointer">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="w-full max-w-sm aspect-[9/16] bg-[#2C2C2A] rounded-2xl overflow-hidden shadow-2xl relative">
                  {cameraAccess ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                      <Camera className="w-12 h-12 text-white/50 mb-4" />
                      <p className="text-white text-sm font-bold">Please allow camera access to share a physical story.</p>
                      <p className="text-white/50 text-xs mt-2">Or just upload from your gallery.</p>
                      <button onClick={closeCamera} className="mt-8 px-6 py-2 bg-white text-[#2C2C2A] rounded-full text-xs font-bold cursor-pointer hover:bg-gray-200">
                        Upload Video
                      </button>
                    </div>
                  )}

                  {cameraAccess && (
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                      <button className="w-16 h-16 rounded-full border-4 border-white/50 p-1 cursor-pointer">
                         <div className="w-full h-full rounded-full bg-white hover:scale-95 transition-transform" />
                      </button>
                    </div>
                  )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
