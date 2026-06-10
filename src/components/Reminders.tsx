/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Pet, Reminder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Check,
  CheckCircle,
  AlertTriangle,
  Bell,
  Stethoscope,
  Scissors,
  Pill,
  Syringe,
  Coffee,
  HelpCircle,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

interface RemindersProps {
  currentUser: User;
  userPets: Pet[];
  trackAnalytics: (eventName: string, params: Record<string, any>) => void;
}

export default function Reminders({
  currentUser,
  userPets,
  trackAnalytics
}: RemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Form input states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Reminder['type']>('vet');
  const [petId, setPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Filters state
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPet, setFilterPet] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`pawpack_reminders_${currentUser.user_id}`);
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing reminders', e);
      }
    } else {
      // Seed some initial friendly reminders if none exist
      const today = new Date();
      const inTwoDays = new Date();
      inTwoDays.setDate(today.getDate() + 2);
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const formattedInTwoDays = inTwoDays.toISOString().split('T')[0];
      const formattedNextWeek = nextWeek.toISOString().split('T')[0];

      const initialSeed: Reminder[] = [
        {
          reminder_id: 'rem_seed1',
          pet_id: userPets[0]?.pet_id || '',
          title: 'Spade/Neutering & Vet Checkup 🩺',
          type: 'vet',
          date: formattedInTwoDays,
          time: '10:00',
          notes: 'Routine checkup and body weight charting.',
          completed: false
        },
        {
          reminder_id: 'rem_seed2',
          pet_id: userPets[0]?.pet_id || '',
          title: 'De-worming dosage 💊',
          type: 'medication',
          date: formattedNextWeek,
          time: '08:30',
          notes: 'Give hidden in wet food.',
          completed: false
        }
      ];

      setReminders(initialSeed);
      localStorage.setItem(`pawpack_reminders_${currentUser.user_id}`, JSON.stringify(initialSeed));
    }
  }, [currentUser.user_id, userPets]);

  // Helper and save to storage
  const saveReminders = (updatedList: Reminder[]) => {
    setReminders(updatedList);
    localStorage.setItem(`pawpack_reminders_${currentUser.user_id}`, JSON.stringify(updatedList));
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Please enter a reminder title');
      return;
    }
    if (!date) {
      setFormError('Please select a scheduled date');
      return;
    }

    const newReminder: Reminder = {
      reminder_id: 'rem_' + Date.now(),
      pet_id: petId, // Can be empty string for "All Pets"
      title: title.trim(),
      type,
      date,
      time: time || undefined,
      notes: notes.trim() || undefined,
      completed: false
    };

    const updated = [newReminder, ...reminders];
    saveReminders(updated);
    trackAnalytics('reminder_created', { reminder_id: newReminder.reminder_id, type: newReminder.type });

    // Reset fields
    setTitle('');
    setType('vet');
    setPetId('');
    setDate('');
    setTime('');
    setNotes('');
    setIsAdding(false);
  };

  const handleToggleComplete = (id: string) => {
    const updated = reminders.map((rem) => {
      if (rem.reminder_id === id) {
        const nextState = !rem.completed;
        trackAnalytics('reminder_toggle_complete', { reminder_id: id, completed: nextState });
        return { ...rem, completed: nextState };
      }
      return rem;
    });
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((rem) => rem.reminder_id !== id);
    saveReminders(updated);
    trackAnalytics('reminder_deleted', { reminder_id: id });
  };

  // Get reminder task icon
  const getTaskIcon = (taskType: Reminder['type']) => {
    switch (taskType) {
      case 'grooming':
        return <Scissors className="w-4 h-4 text-[#E07A5F]" />;
      case 'vet':
        return <Stethoscope className="w-4 h-4 text-[#81B29A]" />;
      case 'medication':
        return <Pill className="w-4 h-4 text-[#F2CC8F]" />;
      case 'vaccination':
        return <Syringe className="w-4 h-4 text-[#3D405B]" />;
      case 'food':
        return <Coffee className="w-4 h-4 text-[#E07A5F]" />;
      default:
        return <Bell className="w-4 h-4 text-[#888780]" />;
    }
  };

  // Get matching pet detail helper
  const getPetName = (pId: string) => {
    if (!pId) return 'All Pets 🐾';
    const match = userPets.find((p) => p.pet_id === pId);
    return match ? `${match.name} (${match.breed})` : 'My Companion';
  };

  // Get due state metadata and text color descriptors
  const getDueStatus = (rem: Reminder) => {
    if (rem.completed) return { text: 'Completed', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };

    const todayStr = new Date().toISOString().split('T')[0];
    if (rem.date === todayStr) {
      return { text: 'Today', color: 'text-amber-600 bg-amber-50 border-amber-100 animate-pulse' };
    } else if (rem.date < todayStr) {
      return { text: 'Overdue ⚠️', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    } else {
      // Calculate remaining days
      const daysDiff = Math.ceil(
        (new Date(rem.date).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        text: `In ${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`,
        color: 'text-blue-600 bg-blue-50 border-blue-100'
      };
    }
  };

  // Filter lists
  const filteredReminders = reminders.filter((rem) => {
    if (filterType !== 'all' && rem.type !== filterType) return false;
    if (filterPet !== 'all' && rem.pet_id !== filterPet) return false;
    if (!showCompleted && rem.completed) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FDFAF6] border border-[#D3D1C7]/60 p-4 rounded-3xl">
        <div>
          <h3 className="font-sans font-extrabold text-[#3D405B] text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#E07A5F]" />
            Reminders & Tasks
          </h3>
          <p className="font-body text-xs text-[#888780]">
            Track healthcare regimes, upcoming grooming schedules, or dietary intervals.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#E07A5F] hover:bg-[#E07A5F]/95 text-white rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          {isAdding ? 'Close form' : (
            <>
              <Plus className="w-4 h-4" /> Schedule Task
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ADD TASK PANEL */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-[#D3D1C7] rounded-3xl p-5 shadow-xs"
          >
            <form onSubmit={handleAddReminder} className="space-y-4">
              <h4 className="font-sans font-extrabold text-[#3D405B] text-sm">Create New Schedule</h4>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#3D405B]">Task Name / Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Tick protection update, Spa grooming day"
                    className="w-full px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                    maxLength={100}
                  />
                </div>

                {/* Associate Pet */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#3D405B]">Companion Pet</label>
                  <select
                    value={petId}
                    onChange={(e) => setPetId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                  >
                    <option value="">General (All Pets / Generic) 🐾</option>
                    {userPets.map((p) => (
                      <option key={p.pet_id} value={p.pet_id}>
                        {p.name} ({p.breed})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Type */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#3D405B]">Task Category</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['vet', 'grooming', 'medication', 'vaccination', 'food', 'other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`py-2 px-1 text-[10px] font-bold border rounded-xl capitalize flex flex-col items-center gap-1 transition-all ${
                          type === t
                            ? 'bg-[#E07A5F]/10 border-[#E07A5F] text-[#E07A5F]'
                            : 'bg-[#FDFAF6] border-[#D3D1C7] text-[#3D405B] hover:bg-[#FAF2EE]/50'
                        }`}
                      >
                        {getTaskIcon(t)}
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#3D405B]">Date *</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#3D405B]">Time (Optional)</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#3D405B]">Notes / Specific Dosage Instructions</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Dosage levels, checklist details, physician suggestions..."
                      rows={2}
                      className="w-full px-3 py-2 bg-[#FDFAF6] border border-[#D3D1C7] rounded-xl text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
                      maxLength={300}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D3D1C7]/20">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-[#D3D1C7] text-xs font-bold text-[#888780] rounded-xl hover:bg-[#FDFAF6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3D405B] text-white text-xs font-bold rounded-xl hover:opacity-90"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTERS & SEARCH ROW */}
      <div className="bg-[#FDFAF6]/60 border border-[#D3D1C7]/40 px-4 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pet group filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#888780] uppercase text-[10px] tracking-wide">For Pet:</span>
            <select
              value={filterPet}
              onChange={(e) => setFilterPet(e.target.value)}
              className="bg-white border border-[#D3D1C7] rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">Every Companion</option>
              <option value="">General Feed / General</option>
              {userPets.map((p) => (
                <option key={p.pet_id} value={p.pet_id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#888780] uppercase text-[10px] tracking-wide">Category:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-[#D3D1C7] rounded-lg px-2 py-1 text-xs focus:outline-none capitalize"
            >
              <option value="all">All Specialties</option>
              <option value="vet">🩺 Vet Checkup</option>
              <option value="grooming">✂️ Grooming</option>
              <option value="medication">💊 Medication</option>
              <option value="vaccination">💉 Vaccination</option>
              <option value="food">☕ Food / Diet</option>
              <option value="other">🔔 Other Tasks</option>
            </select>
          </div>
        </div>

        {/* Show completed list switch */}
        <button
          type="button"
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-1.5 font-bold text-[#3D405B] hover:text-[#E07A5F]"
        >
          {showCompleted ? (
            <CheckSquare className="w-4 h-4 text-[#81B29A]" />
          ) : (
            <Square className="w-4 h-4 text-[#888780]" />
          )}
          <span>Show Completed Tasks</span>
        </button>
      </div>

      {/* MAIN REMINDERS DISPLAY CONTAINER */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#D3D1C7] rounded-3xl p-5 text-xs text-[#888780] space-y-1.5">
            <Clock className="w-8 h-8 text-[#D3D1C7] mx-auto mb-1 animate-pulse-subtle" />
            <p className="font-bold text-[#3D405B]">No reminders found matching the filter.</p>
            <p className="max-w-xs mx-auto text-[11px] font-body pb-2">
              Add upcoming vet times, medicine doses, or wash lists or clear filter bounds to view more historical marks.
            </p>
            {isAdding ? null : (
              <button
                onClick={() => setIsAdding(true)}
                className="px-3 py-1 bg-[#3D405B] text-white rounded-xl text-[10px] font-bold"
              >
                Create One Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {filteredReminders.map((rem) => {
                const status = getDueStatus(rem);
                return (
                  <motion.div
                    key={rem.reminder_id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white rounded-3xl border border-[#D3D1C7] p-3.5 flex items-start gap-3 transition-shadow hover:shadow-xs relative overflow-hidden ${
                      rem.completed ? 'opacity-70 bg-gray-50/50' : ''
                    }`}
                  >
                    {/* Color bar indicator based on type */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        rem.type === 'vet'
                          ? 'bg-[#81B29A]'
                          : rem.type === 'grooming'
                          ? 'bg-[#E07A5F]'
                          : rem.type === 'medication'
                          ? 'bg-[#F2CC8F]'
                          : rem.type === 'vaccination'
                          ? 'bg-[#3D405B]'
                          : rem.type === 'food'
                          ? 'bg-[#E19A84]'
                          : 'bg-[#D3D1C7]'
                      }`}
                    />

                    {/* Toggle check button */}
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(rem.reminder_id)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-all ${
                        rem.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-[#D3D1C7] bg-[#FDFAF6] hover:border-[#81B29A] text-transparent hover:text-[#81B29A]/50'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4
                            className={`font-sans font-extrabold text-[#3D405B] text-xs ${
                              rem.completed ? 'line-through text-gray-400' : ''
                            }`}
                          >
                            {rem.title}
                          </h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold capitalize flex items-center gap-1 ${status.color}`}>
                            {getTaskIcon(rem.type)}
                            {rem.type}
                          </span>
                        </div>

                        {/* Relative Due status text */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider text-[9px] ${status.color}`}>
                          {status.text}
                        </span>
                      </div>

                      {/* Scheduling detail info line */}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#888780] font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#E07A5F]" /> {rem.date}
                        </span>
                        {rem.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#81B29A]" /> {rem.time}
                          </span>
                        )}
                        <span className="bg-[#FDFAF6] border border-[#D3D1C7]/30 px-2 py-0.5 rounded">
                          {getPetName(rem.pet_id)}
                        </span>
                      </div>

                      {/* Reminder comments or notes */}
                      {rem.notes && (
                        <p className={`font-body text-[11px] text-[#2C2C2A] bg-gray-50/50 p-2 rounded-xl mt-1 leading-relaxed border border-[#D3D1C7]/15 whitespace-pre-wrap ${rem.completed ? 'line-through opacity-60' : ''}`}>
                          {rem.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions panel */}
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(rem.reminder_id)}
                      className="p-1 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-150 shrink-0 self-start text-[#888780] cursor-pointer"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* HELPFUL SYSTEM BADGES OR MOTIVATIONAL ADVICE FOOTER */}
      <div className="p-3.5 bg-[#FAF2EE]/50 border border-[#E07A5F]/20 rounded-2xl flex items-start gap-2 text-[11px] font-body text-[#3D405B]">
        <AlertTriangle className="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-extrabold uppercase text-[9px] text-[#E07A5F] tracking-wide block">PRO VETERINARY TIMELINES</span>
          <span>
            Annual vaccinations and twice-annual health checks are essential for keeping your companion in perfect health. Maintain reminders to get badges of pristine custody!
          </span>
        </div>
      </div>
    </div>
  );
}
