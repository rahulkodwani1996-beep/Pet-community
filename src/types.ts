/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  user_id: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  location?: string;
  species_preference: 'dog' | 'cat' | 'both';
  joined_date: string;
}

export interface Pet {
  pet_id: string;
  owner_id: string;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: string; // e.g. "3 years" or "5 months"
  birthdate?: string; // e.g. "YYYY-MM-DD"
  photo_url: string;
  bio?: string;
  weight_log?: { date: string; weight: number }[];
}

export interface VetQuestion {
  question_id: string;
  author_id: string;
  species_tag: 'dog' | 'cat' | 'both';
  title: string;
  body: string;
  created_at: string;
  status: 'pending' | 'answered';
  expert_answer?: string;
  expert_name?: string;
}

export interface Comment {
  comment_id: string;
  post_id: string; // or tip_id
  author_id: string;
  body: string; // max 500 chars
  created_at: string;
}

export interface Post {
  post_id: string;
  author_id: string;
  species_tag: 'dog' | 'cat' | 'both';
  title: string; // max 100 chars
  body: string; // max 2000 chars
  images: string[]; // up to 4
  tags: string[];
  likes_count: number;
  liked_by: string[]; // user_ids who liked this post
  comments: Comment[];
  created_at: string;
  is_reported?: boolean;
}

export interface Review {
  review_id: string;
  product_id: string;
  author_id: string;
  rating: number; // 1 to 5
  body: string; // max 500 chars
  created_at: string;
  helpful_count: number;
  helpful_by: string[]; // user_ids who marked helpful
}

export interface Product {
  product_id: string;
  name: string;
  brand: string;
  species_tag: 'dog' | 'cat' | 'both';
  category: 'food' | 'grooming' | 'toys' | 'health' | 'accessories' | 'training';
  description: string;
  price_range: string; // e.g. "₹299–₹599"
  image_url: string;
  affiliate_link?: string;
  reviews: Review[];
}

export interface VetTip {
  tip_id: string;
  species_tag: 'dog' | 'cat' | 'both';
  category: 'nutrition' | 'behavior' | 'grooming' | 'health' | 'training' | 'first-aid';
  title: string;
  body: string; // rich content or paragraph text
  author_name: string;
  author_credentials: string; // e.g. "DVM, MVSc"
  thumbnail_url: string;
  read_time_mins: number;
  created_at: string;
  is_featured: boolean;
  helpful_ups: string[]; // uids of users who liked this tip
  helpful_downs: string[]; // uids of users who disliked this tip
  comments?: Comment[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'like' | 'comment' | 'tip' | 'general';
  created_at: string;
  read: boolean;
}

export interface AppState {
  currentUser: User | null; // null if guest
  isGuest: boolean;
  activeSpecies: 'dog' | 'cat' | 'both';
  activeTab: 'talk' | 'shop' | 'learn' | 'profile';
  likedPosts: string[]; // post_ids
}

export interface Reminder {
  reminder_id: string;
  pet_id: string; // empty string for all pets/general
  title: string;
  type: 'grooming' | 'vet' | 'medication' | 'vaccination' | 'food' | 'other';
  date: string; // YYYY-MM-DD
  time?: string; // optional HH:MM
  notes?: string;
  completed: boolean;
}

export interface AnalyticsEvent {
  event_name: 'app_open' | 'species_toggle_switched' | 'post_created' | 'post_liked' | 'comment_added' | 'product_viewed' | 'review_submitted' | 'tip_read' | 'profile_viewed';
  parameters: Record<string, any>;
  timestamp: string;
}
