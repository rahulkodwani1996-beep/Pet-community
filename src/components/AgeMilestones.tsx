import React from 'react';
import { Pet } from '../types';
import { Shield, Sparkles, Activity, Apple } from 'lucide-react';

interface AgeMilestonesProps {
  pet: Pet;
}

export default function AgeMilestones({ pet }: AgeMilestonesProps) {
  // Approximate age in months for determining milestones
  const getAgeInMonths = () => {
    if (pet.birthdate) {
      const birth = new Date(pet.birthdate);
      const now = new Date();
      return (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth();
    }
    if (pet.age) {
      const ageStr = pet.age.toLowerCase();
      if (ageStr.includes('month')) return parseInt(ageStr) || 6;
      if (ageStr.includes('year')) return (parseInt(ageStr) || 1) * 12;
      return parseInt(ageStr) || 24; // Default guess
    }
    return 24; // Default if not found
  };
  
  const ageMonths = getAgeInMonths();

  const getMilestones = () => {
    let milestones = [];
    if (ageMonths <= 6) {
      milestones.push({ icon: Shield, color: 'text-[#81B29A]', bg: 'bg-[#81B29A]/15', text: 'Puppy/Kitten Vaccines Due', desc: 'Core vaccines & boosters are critical now.' });
      milestones.push({ icon: Apple, color: 'text-[#F2CC8F]', bg: 'bg-[#F2CC8F]/20', text: 'Growth Nutrition Phase', desc: 'High calorie & calcium diet required.' });
      milestones.push({ icon: Sparkles, color: 'text-[#E07A5F]', bg: 'bg-[#E07A5F]/15', text: 'Early Socialization', desc: 'Crucial period for behavior training.' });
    } else if (ageMonths <= 84) { // 7 years
      milestones.push({ icon: Shield, color: 'text-[#81B29A]', bg: 'bg-[#81B29A]/15', text: 'Annual Routine Checkups', desc: 'Keep track of yearly boosters & tick meds.' });
      milestones.push({ icon: Activity, color: 'text-[#E07A5F]', bg: 'bg-[#E07A5F]/15', text: 'Adult Maintenance', desc: 'Balance diet with regular high activity.' });
      milestones.push({ icon: Sparkles, color: 'text-[#F2CC8F]', bg: 'bg-[#F2CC8F]/20', text: 'Dental Care', desc: 'Annual teeth cleaning recommended.' });
    } else {
      milestones.push({ icon: Shield, color: 'text-[#81B29A]', bg: 'bg-[#81B29A]/15', text: 'Senior Blood Panel', desc: 'Bi-annual checkups to monitor organ health.' });
      milestones.push({ icon: Apple, color: 'text-[#F2CC8F]', bg: 'bg-[#F2CC8F]/20', text: 'Joint Support Diet', desc: 'Supplements like Glucosamine needed.' });
      milestones.push({ icon: Activity, color: 'text-[#E07A5F]', bg: 'bg-[#E07A5F]/15', text: 'Gentle Mobility', desc: 'Light walks and avoiding high stairs.' });
    }
    return milestones;
  };

  const milestones = getMilestones();

  return (
    <div className="bg-white border border-[#D3D1C7] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <h4 className="font-sans font-extrabold text-[#3D405B] text-sm mb-1 leading-none">
          🧬 Age Milestones
        </h4>
        <p className="text-[10px] font-body text-[#888780] mb-4">
          Personalized health & life-stage recommendations for {pet.name}.
        </p>
      </div>

      <div className="space-y-3">
        {milestones.map((ms, i) => (
          <div key={i} className="flex items-start gap-3 bg-[#FDFAF6] border border-[#D3D1C7]/40 p-3 rounded-2xl">
            <div className={`p-2 rounded-xl ${ms.bg}`}>
              <ms.icon className={`w-4 h-4 ${ms.color}`} />
            </div>
            <div>
              <h5 className="font-sans font-bold text-xs text-[#3D405B] leading-none mb-1">{ms.text}</h5>
              <p className="font-body text-[10px] text-[#2C2C2A]">{ms.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
