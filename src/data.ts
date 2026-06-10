/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Pet, Post, Product, VetTip } from './types';

export const INITIAL_USERS: User[] = [
  {
    user_id: 'user_1',
    display_name: 'Rahul Kodwani',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0bMbMUrZzCaBUvWky7XIfPRMfS0AV8yUD30DNLtzJXLwlElPX8_Crgg23Q_Xryn3tJp7QvO1_7rSRk8VrAOVns0dU7-t5AHrusvQJDEeSg06CgyMTDexeYLrSFlDHeEqh7RUtNMymNtcnf5qVB6lhyHAR6Krv0uI9vFqOtt206PtNJMdN1_t8sP55fpuG94m_K-guz2Hi6grEnsOM29J1VdzfUXMU9HaO9MMYl9CxLCeW95-PoVo1VnxljsDeTzzO0W0WogykAA',
    bio: 'Dedicated pet parent living in New Delhi. Dog enthusiast and amateur photographer. Enjoying nature walks with Barnaby!',
    location: 'New Delhi, India',
    species_preference: 'both',
    joined_date: '10 Jan 2026',
  },
  {
    user_id: 'user_2',
    display_name: 'Priya Sharma',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YTvrRlliVcmc9LDj7-lx8TF_fejlAQP9uW0LJnEvZGci7nHKWA3nvtGdZTOg978ycXHiDXM4LZJFp4ta3m5fQVp05CGgxplI4UklKdQ6gmj3Mz2nCT8wIm0eEf2-PgAK7kQPfIPO7t74GuoMvpPl8JjjZo3cTt7p8vH7fBv3e9iLc-yVjMvlsyTvtZeuuonuMmN4s1WpDubn88uZhyZHazuqN6pw2jfaXLPsMUx48_L-G2azYxIsX7jRQqY7mhmGfNLSuHO1yLk',
    bio: 'Feline wellness advocate & cat mom to Luna. Coffee lover and behavioral hobbyist exploring micro-signals in pets.',
    location: 'Mumbai, India',
    species_preference: 'cat',
    joined_date: '04 Mar 2026',
  },
  {
    user_id: 'user_3',
    display_name: 'Dr. Elena Rostova',
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YTvrRlliVcmc9LDj7-lx8TF_fejlAQP9uW0LJnEvZGci7nHKWA3nvtGdZTOg978ycXHiDXM4LZJFp4ta3m5fQVp05CGgxplI4UklKdQ6gmj3Mz2nCT8wIm0eEf2-PgAK7kQPfIPO7t74GuoMvpPl8JjjZo3cTt7p8vH7fBv3e9iLc-yVjMvlsyTvtZeuuonuMmN4s1WpDubn88uZhyZHazuqN6pw2jfaXLPsMUx48_L-G2azYxIsX7jRQqY7mhmGfNLSuHO1yLk',
    bio: 'Veterinary Surgeon with 12+ years experience. Passionate about preventative care, clinical innovation, and evidence-guided holistic nutrition.',
    location: 'Bangalore, India',
    species_preference: 'both',
    joined_date: '15 Jan 2025',
  }
];

export const INITIAL_PETS: Pet[] = [
  {
    pet_id: 'pet_1',
    owner_id: 'user_1',
    name: 'Barnaby',
    species: 'dog',
    breed: 'Golden Retriever',
    age: '3 years',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtsZ0fs1D_1DRThWNRu369z_soo0PTrdhGIMQFZr311Xs_jPupRF41D8HkiHKIvLPuPv6o1fzZYGN10MeCO2kXSUBwUzF98p0hscUHKR-iG0QHlkXKTmAEJ6-ILBbyFFwct5BIuqIap4pqwlgiobo3MKJNRArNLbZ9uEE3Dr82DhEqaiG2U0y4MVmAQMbwD_hQx7rgx89-BumyIqtctK_mh2fP7mCsf8JsSLsRqa6xNSvpRCLYRcbIGsgMO6qy5ygBnRWQw33Lipc',
    bio: 'Love chasing frisbees in the morning fog, eating carrots, and being extremely social with everyone at the park!',
  },
  {
    pet_id: 'pet_2',
    owner_id: 'user_2',
    name: 'Luna',
    species: 'cat',
    breed: 'Bombay Cat',
    age: '2 years',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBto9jw44CgOYFBEnUOvQY-mZj9hOpDN-J3-taprr3jO_4qntoZmjo2Sx5AlT3BTVg5WZwPQnAhqQyOGGiEeRuDNVZ3NGjhvEvKjZ83y7gSIzano9sYDp0VZjfXjb6dHOpwzRIPCzD7CJ34YVSEyx5C-qSKtNRuzZrTX0FuwumrK3IXtNlAn6PmsKsqrNzh4yLQ4fm4ONGsem74a_P0PPtITA7Pwb7G5QZ_NyA-tzhpfyU2dfVXxNQ7L8G-haeZaRZ7tNtDkxXkVTg',
    bio: 'Prefers stretching on the velvet sofa, stalking glowing moths, and napping inside organic high-roof cardboard boxes.',
  },
  {
    pet_id: 'pet_3',
    owner_id: 'user_1',
    name: 'Thor',
    species: 'dog',
    breed: 'Siberian Husky',
    age: '4 years',
    photo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAVicaaVOb9pZnvsJfkhMZ4wclD7c-6cizs7sTS9ZAsHOO6LeWhkAufGiJ5f5HA48ahl4dY09J7MHH9LCGFbjJc-PqGq3bwvM7byT7n2J0vTSXi03R-7xC7GyJsv9h5miMoh8auPiGljnCq1GOZNULWo6CDhClaRQHq-Lxa4tAiCngSp2TzEGj4Opy3P4Dj-vIuKA-VlkEbd5FkCvcLg9h_-vYpZcIjOMYwo91yETVq5-hmi26l3Ju_eHx4mc3Fl6zUgEUvaP3qY0',
    bio: 'Enjoys outdoor twilight trails and cold winter evenings. Vocal communicator who sings on key.',
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    post_id: 'post_1',
    author_id: 'user_1',
    species_tag: 'dog',
    title: 'Morning frisbee training was a major success today!',
    body: 'Morning zoomies at the public dog park with Barnaby! He finally mastered the mid-air disc catch on the third try. Highly recommend keeping a pocket of baby carrots for immediate visual and positive reinforcement. How do your goldens handle tracking higher speed catches?',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAtsZ0fs1D_1DRThWNRu369z_soo0PTrdhGIMQFZr311Xs_jPupRF41D8HkiHKIvLPuPv6o1fzZYGN10MeCO2kXSUBwUzF98p0hscUHKR-iG0QHlkXKTmAEJ6-ILBbyFFwct5BIuqIap4pqwlgiobo3MKJNRArNLbZ9uEE3Dr82DhEqaiG2U0y4MVmAQMbwD_hQx7rgx89-BumyIqtctK_mh2fP7mCsf8JsSLsRqa6xNSvpRCLYRcbIGsgMO6qy5ygBnRWQw33Lipc'],
    tags: ['Training', 'Outdoor', 'Health'],
    likes_count: 24,
    liked_by: ['user_2'],
    comments: [
      {
        comment_id: 'comment_1_1',
        post_id: 'post_1',
        author_id: 'user_2',
        body: 'Barnaby looks gorgeous! His attention span is awesome. Luna just ignores any toy unless it has an active bioluminescent teal glow, haha!',
        created_at: '09 Jun 2026',
      }
    ],
    created_at: '09 Jun 2026',
  },
  {
    post_id: 'post_2',
    author_id: 'user_2',
    species_tag: 'cat',
    title: 'How Luna stays calm on high-stress monsoon days',
    body: 'Felines are highly sensitive to low-frequency barometric adjustments. Someone is not ready for Monday, but establishing a dark, enclosed pocket with her organic stone bed has been a lifesaver. Keeps environmental sound-flickers totally isolated!',
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBto9jw44CgOYFBEnUOvQY-mZj9hOpDN-J3-taprr3jO_4qntoZmjo2Sx5AlT3BTVg5WZwPQnAhqQyOGGiEeRuDNVZ3NGjhvEvKjZ83y7gSIzano9sYDp0VZjfXjb6dHOpwzRIPCzD7CJ34YVSEyx5C-qSKtNRuzZrTX0FuwumrK3IXtNlAn6PmsKsqrNzh4yLQ4fm4ONGsem74a_P0PPtITA7Pwb7G5QZ_NyA-tzhpfyU2dfVXxNQ7L8G-haeZaRZ7tNtDkxXkVTg'],
    tags: ['Behavior', 'Wellness', 'Napping'],
    likes_count: 42,
    liked_by: ['user_1', 'user_3'],
    comments: [
      {
        comment_id: 'comment_2_1',
        post_id: 'post_2',
        author_id: 'user_3',
        body: 'Terrific focus on the environmental sound buffer, Priya. Creating a tight nesting sanctuary lowers standard cortisol markers considerably in multi-apartment cats.',
        created_at: '08 Jun 2026',
      }
    ],
    created_at: '08 Jun 2026',
  },
  {
    post_id: 'post_3',
    author_id: 'user_3',
    species_tag: 'both',
    title: 'Dr. Rostova\'s Quick Checklist for Vet Visit Desensitization',
    body: 'Many pet owners worry about clinical stress patterns during routine health visits. To make things simple, start early with basic paw handling at home. Rubbing their paws gently while they are relaxed makes clinical diagnostic checks extremely easy! Always bring their favorite freeze-dried treats to have at the reception area.',
    images: [],
    tags: ['First Aid', 'Health', 'Grooming'],
    likes_count: 15,
    liked_by: [],
    comments: [],
    created_at: '07 Jun 2026',
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 'prod_1',
    name: 'LumiWand Teaser Toy',
    brand: 'PetZen',
    species_tag: 'cat',
    category: 'toys',
    description: 'Expertly designed teaser with responsive carbon-fiber flexible rods and genuine biosourced teal accents to trigger healthy predatory play cycles. Durable construction resists energetic tugs.',
    price_range: '₹1,249–₹1,499',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiKfrqIg5TJ_bZzA31T-GJhePU6zLwtSww3YKO4ouZNPfmbsqpNRKQyEkxTCP8w58Nczm90dkUmGu97k6fQ2AW6e5kjNOBc0rWS2YIVMdvyxBHn1sS3ZmhAmYSIWCClBZ59P_mKl81qeslfOJwy-PSzuogNUTKxbC-DpsTQtwDFCGeT54dbpWEpso-J7SpaluXC7hdaC2Hu-IuCA6VPGLRUTlYBYPRb61gMBCbP87SWkTbrA3VWn1ntKitVgcXh2gIcucnP4-l8gk',
    affiliate_link: 'https://amazon.in',
    reviews: [
      {
        review_id: 'rev_1_1',
        product_id: 'prod_1',
        author_id: 'user_2',
        rating: 5,
        body: 'Absolute absolute winner! Luna went completely wild for the subtle bouncy movement. Standard feathers tear within 2 minutes, but this carbon weave is exceptionally solid.',
        created_at: '09 Jun 2026',
        helpful_count: 5,
        helpful_by: ['user_1'],
      }
    ]
  },
  {
    product_id: 'prod_2',
    name: 'Sanctuary Pod Charcoal Bed',
    brand: 'OasisSleep',
    species_tag: 'cat',
    category: 'accessories',
    description: 'A smooth, river-stone shaped enclosed bed made from double-dense compressed orthopaedic charcoal fibers. Offers complete ambient sound isolation and cozy thermodynamic heat retention.',
    price_range: '₹4,999–₹6,500',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABLbX2uRbUExzQ3n4jjEEBwMwkdEX3_cWvl_-z8ITSmKUEsZn6B4xTR9_tgAixJ0SmgbSzbxcUeRR0t0e2a21q9vqAhHhOjJHvOm9HAW5KefNlhhCG86SgenvXaW--A6h355IwKhOaOlx5fghMk5wJvJeEh7MLyqaHv7BCreoBRj-0qzWNarOMYa8msCVbGJ5tBQxeL8Np0UCEelDdfCX3fvjo22XubbOs7gygNxt_4ERefmeSA6R-mBknjjbwo6biWYdFuVn1qQc',
    affiliate_link: 'https://amazon.in',
    reviews: [
      {
        review_id: 'rev_2_1',
        product_id: 'prod_2',
        author_id: 'user_2',
        rating: 5,
        body: 'Top tier craftsmanship. My cat stays inside it during heavy storms and rests completely peaceful. Worth every single rupee.',
        created_at: '08 Jun 2026',
        helpful_count: 3,
        helpful_by: ['user_3'],
      }
    ]
  },
  {
    product_id: 'prod_3',
    name: 'Premium Slow-Baked Kibble (Chicken & Peas)',
    brand: 'NurturePro',
    species_tag: 'both',
    category: 'food',
    description: 'Slow-baked at controlled low temperatures to retain baseline vitamins and amino profiles. Complete raw-coated bites for excellent gut motility and high-trust organic nutrition.',
    price_range: '₹899–₹1,299',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGa8-7-yxaV0wLonrY8DtJwGDFdUccIAy5oS17U3DVgTsta83sN_J8pIclU5LLRGCRNKEKOPfm2RGXVeOMOo3srH8aMv9mQRSWfRD3pF94lg0_V3JV4ay27sveauD9FUX2K7IxwSPEBh3udX4P9-_eGdCXFThmTD5neZ_0CUT4HJ5o-EWkrzi3fjiKM1Tg65Xs_2VRjL6he9Oar3c1b0dJDm12D-ZWu-gJHOWPan9zVNAQ9cMIRoB8OLrrcdWL8akQ0Xzg58Yy--o',
    affiliate_link: 'https://amazon.in',
    reviews: [
      {
        review_id: 'rev_3_1',
        product_id: 'prod_3',
        author_id: 'user_1',
        rating: 4,
        body: 'Barnabys digestion turned excellent within two weeks. No immediate hot spots or itching. Good natural value.',
        created_at: '05 Jun 2026',
        helpful_count: 2,
        helpful_by: ['user_2'],
      }
    ]
  },
  {
    product_id: 'prod_4',
    name: 'Zenith Fine-Detangling Brush',
    brand: 'PawGroom',
    species_tag: 'both',
    category: 'grooming',
    description: 'Ergonomic non-pressure fine pins gently extract undercoat fur and skin flakes without scratching surface follicles. Smooth curved handle prevents wrist strain during long sessions.',
    price_range: '₹599–₹799',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW60JzxrwctFUXIXUhFhA7xmpT4yYDpCoHK2JoJ9gvAZ3vQ5MACq9VvzD-Xx_HHgpuCMdNki5RqQhwzuM91kAopGV_zvghMZtNNQgjKWezI0giG9wg7OkcnRR5HjAKGXU3PyAae7a9aCRxNiNUtfUos3RxDVYY0TCpo2miQw5fe4jwlJEmrc5NxTbN13qeAoX9LT5OrAl-w0MT-VyFHAdohl4Azf_WSn89wgeXu67HL1JqzWa-w-yw_VYB9q7eJmdzUeCY71zdmSE',
    reviews: []
  },
  {
    product_id: 'prod_5',
    name: 'Elevated Dual-Glass Aero Diner',
    brand: 'FormSpace',
    species_tag: 'both',
    category: 'accessories',
    description: 'A matte-black elevated dual-bowl diner featuring shallow frosted glass cups with non-slip bases. Designed medically to reduce neck tension and prevent aerophagia during meal times.',
    price_range: '₹2,499–₹3,200',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB44HFDv3OYZ1fRyw1Tsc2thB3kKUqmSUMIdHY57joBX2BpAD4M6zB7K9evUcJQTl6yPDczinzUKuK7P8qTNiRb619IQCxyVIirIcOAxrjEMUMD1fk5OjsQ8oRY91nlAe7KEikuy3vFKiaL_fK1yMsDu0eKofCa7I4eVsT-6SMIr9FdU8HTrhFCiQf2w7MhnOyDJzHo5xWTT9vKRwiHiIGlYyMdrMye_QlK6qd80Ozz41Ukc9dKa4uMQPt_ZzAdLHtnoPD2HhziClA',
    affiliate_link: 'https://amazon.in',
    reviews: []
  }
];

export const INITIAL_TIPS: VetTip[] = [
  {
    tip_id: 'tip_1',
    species_tag: 'both',
    category: 'health',
    title: 'The Modern Urban Pet: Navigating Environmental Stressors',
    body: '## Navigating Urban Settings\n\nVeterinary insights on how to mitigate the effects of modern noise pollution, limited green public spaces, and urban separation anxieties for both canine and feline companions living in high-density areas.\n\n### Key Clinical Recommendations\n- **Create safe structural corners:** Felines and dogs benefit heavily from quiet, low-noise dark zones located far from drafty windows.\n- **Regulate light cycles:** Match interior lighting with organic outdoor day-night transitions to reduce anxiety.\n- **Incorporate mental foraging:** Use lick mats and slow snack layouts to ease active heartrates in highly congested town areas.',
    author_name: 'Dr. Elena Rostova',
    author_credentials: 'DVM, Chief Clinical Officer',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArGsuBNZJeVyZRb6wqvW3yNCH1JqD43bH4RJeBaRJmISarAy1SFYzViqPwy4ZNnOo6_Ak3i7I_wn7EApfP1DxuilGxNEPqtBsrlKUaamhcNb564BVh_ZB-ndyEun20vecmecMoIxfoMNAex_htQf3_Xe172zlBGFGGeN9VXOLvHkTkq6cPB42xFsdakIkd5pj7YqrZaPOf17MxpAAlih9H_nbiDzg-wiwVh-GPQ2Cz4LMn9OVYBvmUYvQQ4BEs9Jp4OiLH5ZqKU-s',
    read_time_mins: 8,
    created_at: '09 Jun 2026',
    is_featured: true,
    helpful_ups: ['user_1', 'user_2'],
    helpful_downs: []
  },
  {
    tip_id: 'tip_2',
    species_tag: 'dog',
    category: 'nutrition',
    title: 'Decoding Premium Kibble Labels with Visual Confidence',
    body: '## Reading Between the Ingredients\n\nWhat those complex scientific nutrient declarations actually mean for your pet\'s daily gut stability and coat longevity.\n\n### Raw protein vs. Byproduct meal\nAlways prefer labels that state real primary meats (e.g., "deboned fresh chicken") inside the first three named elements. Watch out for ambiguous salt ratios and high-gluten starch fillers that spike baseline insulin indices unnecessarily.',
    author_name: 'Dr. Elena Rostova',
    author_credentials: 'DVM, DACVN',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGa8-7-yxaV0wLonrY8DtJwGDFdUccIAy5oS17U3DVgTsta83sN_J8pIclU5LLRGCRNKEKOPfm2RGXVeOMOo3srH8aMv9mQRSWfRD3pF94lg0_V3JV4ay27sveauD9FUX2K7IxwSPEBh3udX4P9-_eGdCXFThmTD5neZ_0CUT4HJ5o-EWkrzi3fjiKM1Tg65Xs_2VRjL6he9Oar3c1b0dJDm12D-ZWu-gJHOWPan9zVNAQ9cMIRoB8OLrrcdWL8akQ0Xzg58Yy--o',
    read_time_mins: 5,
    created_at: '08 Jun 2026',
    is_featured: false,
    helpful_ups: ['user_1'],
    helpful_downs: []
  },
  {
    tip_id: 'tip_3',
    species_tag: 'cat',
    category: 'behavior',
    title: 'Understanding Subtle Micro-Signals in Nervous Felines',
    body: '## Feline Silent Micro-Speak\n\nLearn to parse the soft body language signals that mark high-strain situations before they escalate into high heartbeats.\n\n### Focal Micro-Indicators\n- **The Ripple Effect:** Frequent twitching along the mid-spine muscles typically indexes immediate sensory overload.\n- **Ear Posturing:** Rotate-flat ears ("airplane ears") communicate severe lack of confidence.\n- **Pupil Dilatations:** Sudden black spherical dilations indicate adrenaline surges. Rest the active interactions immediately.',
    author_name: 'Dr. Elena Rostova',
    author_credentials: 'DVM, Feline Specialist',
    thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBto9jw44CgOYFBEnUOvQY-mZj9hOpDN-J3-taprr3jO_4qntoZmjo2Sx5AlT3BTVg5WZwPQnAhqQyOGGiEeRuDNVZ3NGjhvEvKjZ83y7gSIzano9sYDp0VZjfXjb6dHOpwzRIPCzD7CJ34YVSEyx5C-qSKtNRuzZrTX0FuwumrK3IXtNlAn6PmsKsqrNzh4yLQ4fm4ONGsem74a_P0PPtITA7Pwb7G5QZ_NyA-tzhpfyU2dfVXxNQ7L8G-haeZaRZ7tNtDkxXkVTg',
    read_time_mins: 6,
    created_at: '06 Jun 2026',
    is_featured: false,
    helpful_ups: ['user_2'],
    helpful_downs: []
  }
];

export const PRESET_TAG_LIST = ['Health', 'Training', 'Wellness', 'Napping', 'Nutrition', 'Behavior', 'Outdoor', 'Grooming'];

export const PROFANITY_WORDS = ['crap', 'damn', 'shit', 'idiot', 'stupid', 'bastard', 'hell'];

export function filterProfanity(text: string): string {
  let cleaned = text;
  PROFANITY_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '****');
  });
  return cleaned;
}
