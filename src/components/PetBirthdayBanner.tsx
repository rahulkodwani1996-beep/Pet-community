import React from 'react';
import { motion } from 'framer-motion';
import { Cake, Sparkles } from 'lucide-react';
import { Pet } from '../types';

interface PetBirthdayBannerProps {
  pets: Pet[];
}

export default function PetBirthdayBanner({ pets }: PetBirthdayBannerProps) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const birthdayPets = pets.filter(pet => {
    if (!pet.birthdate) return false;
    const [year, month, day] = pet.birthdate.split('-');
    return parseInt(month, 10) === currentMonth && parseInt(day, 10) === currentDay;
  });

  if (birthdayPets.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {birthdayPets.map(pet => (
        <motion.div
          key={pet.pet_id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="relative overflow-hidden bg-gradient-to-r from-[#E07A5F] to-[#F2CC8F] rounded-2xl p-5 shadow-lg border-2 border-white/20"
        >
          {/* Confetti / Sparkles decoration */}
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Sparkles className="w-24 h-24 text-white" />
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 p-1 backdrop-blur-sm border border-white/40 flex-shrink-0">
              <img src={pet.photo_url} alt={pet.name} className="w-full h-full rounded-full object-cover" />
            </div>
            
            <div className="text-white">
              <div className="flex items-center gap-2 mb-1">
                <Cake className="w-5 h-5 text-white animate-bounce" />
                <h3 className="font-display font-extrabold text-lg leading-none">Happy Birthday, {pet.name}!</h3>
              </div>
              <p className="font-body text-xs text-white/90 font-medium">
                Time for treats and belly rubs! Celebrate your {pet.species} today!
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
