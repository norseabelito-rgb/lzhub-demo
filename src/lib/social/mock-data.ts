/**
 * Mock data for social media module
 * Realistic LaserZone content for prototype development
 */

import { addDays, subDays, setHours, setMinutes } from 'date-fns'
import type {
  SocialPost,
  CaptionTemplate,
  HashtagSet,
  ContentLibraryItem,
  PostMetrics,
  PlatformPostStatus,
} from './types'

// ============================================================================
// Helper Functions
// ============================================================================

const now = new Date()

/**
 * Create a scheduled date for future posts
 */
function futureDate(daysFromNow: number, hour: number, minute: number = 0): Date {
  return setMinutes(setHours(addDays(now, daysFromNow), hour), minute)
}

/**
 * Create a past date for published posts
 */
function pastDate(daysAgo: number, hour: number, minute: number = 0): Date {
  return setMinutes(setHours(subDays(now, daysAgo), hour), minute)
}

/**
 * Create empty metrics
 */
function emptyMetrics(): PostMetrics {
  return {
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    lastUpdated: now,
  }
}

/**
 * Create published metrics with values
 */
function publishedMetrics(likes: number, comments: number, shares: number, views: number): PostMetrics {
  return {
    likes,
    comments,
    shares,
    views,
    lastUpdated: now,
  }
}

// ============================================================================
// Caption Templates
// ============================================================================

export const MOCK_CAPTION_TEMPLATES: CaptionTemplate[] = [
  {
    id: 'template-1',
    name: 'Promotie Weekend',
    content: `Weekend special la LaserZone! 🎯

Vino cu gasca si bucura-te de:
✨ [OFERTA_DETALII]
⏰ Valabil sambata si duminica

Rezerva acum: 07XX XXX XXX

#laserzone #weekend #bucuresti`,
    category: 'promotie',
    createdAt: pastDate(30, 10),
  },
  {
    id: 'template-2',
    name: 'Eveniment Special',
    content: `[NUMELE_EVENIMENTULUI] la LaserZone! 🎉

📅 Data: [DATA]
🕐 Ora: [ORA]
📍 LaserZone Bucuresti

Nu rata! Locurile sunt limitate.

Detalii si rezervari: 07XX XXX XXX`,
    category: 'eveniment',
    createdAt: pastDate(25, 14),
  },
  {
    id: 'template-3',
    name: 'Petrecere Copii',
    content: `Cel mai tare party pentru copilul tau! 🎂🎯

La LaserZone organizam petreceri de neuitat:
🎮 Laser tag
🎈 Decoratiuni
🍕 Gustari incluse
📸 Poze de grup

Pachet de la [PRET] lei!

Rezerva acum pentru copilul tau!`,
    category: 'petrecere',
    createdAt: pastDate(20, 11),
  },
  {
    id: 'template-4',
    name: 'Corporate Team Building',
    content: `Team building care chiar functioneaza! 💼🎯

Laser tag pentru echipa ta:
✅ Comunicare mai buna
✅ Colaborare in actiune
✅ Distractie garantata
✅ Amintiri de neuitat

Pachete corporate personalizate.
Contact: corporate@laserzone.ro`,
    category: 'corporate',
    createdAt: pastDate(15, 9),
  },
  {
    id: 'template-5',
    name: 'Postare Generala',
    content: `Pregatit pentru adrenalina? 🎯

La LaserZone fiecare joc e o aventura!

📍 [LOCATIE]
🕐 Program: [PROGRAM]

Te asteptam!`,
    category: 'general',
    createdAt: pastDate(10, 16),
  },
  {
    id: 'template-6',
    name: 'Concurs Social Media',
    content: `🎁 CONCURS LASERZONE! 🎁

Castiga [PREMIU]!

Cum participi:
1️⃣ Da follow @laserzone
2️⃣ Like la aceasta postare
3️⃣ Tag 2 prieteni in comentarii

Castigatorul va fi anuntat pe [DATA]!

#concurs #laserzone #giveaway`,
    category: 'promotie',
    createdAt: pastDate(5, 13),
  },
]

// ============================================================================
// Hashtag Sets
// ============================================================================

export const MOCK_HASHTAG_SETS: HashtagSet[] = [
  {
    id: 'hashtag-set-1',
    name: 'LaserZone General',
    hashtags: ['laserzone', 'lasertag', 'bucuresti', 'distractie', 'jocuri'],
    createdAt: pastDate(60, 10),
  },
  {
    id: 'hashtag-set-2',
    name: 'Evenimente',
    hashtags: ['petrecere', 'eveniment', 'teambuilding', 'fun', 'party'],
    createdAt: pastDate(55, 14),
  },
  {
    id: 'hashtag-set-3',
    name: 'Weekend',
    hashtags: ['weekend', 'sambata', 'duminica', 'relaxare', 'timpcuprietenii'],
    createdAt: pastDate(50, 11),
  },
  {
    id: 'hashtag-set-4',
    name: 'Familie',
    hashtags: ['familie', 'copii', 'parinti', 'distractieinfamilie', 'qualitytime'],
    createdAt: pastDate(45, 9),
  },
  {
    id: 'hashtag-set-5',
    name: 'Actiune',
    hashtags: ['actiune', 'adrenalina', 'competitie', 'strategie', 'echipa'],
    createdAt: pastDate(40, 15),
  },
]

// ============================================================================
// Content Library
// ============================================================================

export const MOCK_CONTENT_LIBRARY: ContentLibraryItem[] = [
  {
    id: 'media-1',
    name: 'Arena principala',
    type: 'image',
    url: '/images/social/arena-main.jpg',
    thumbnailUrl: '/images/social/arena-main-thumb.jpg',
    mimeType: 'image/jpeg',
    size: 2500000, // 2.5MB
    dimensions: { width: 1920, height: 1080 },
    tags: ['arena', 'interior', 'neon'],
    createdAt: pastDate(90, 10),
    updatedAt: pastDate(90, 10),
  },
  {
    id: 'media-2',
    name: 'Echipament laser',
    type: 'image',
    url: '/images/social/equipment.jpg',
    thumbnailUrl: '/images/social/equipment-thumb.jpg',
    mimeType: 'image/jpeg',
    size: 1800000, // 1.8MB
    dimensions: { width: 1080, height: 1080 },
    tags: ['echipament', 'arme', 'tech'],
    createdAt: pastDate(85, 14),
    updatedAt: pastDate(85, 14),
  },
  {
    id: 'media-3',
    name: 'Grupa in actiune',
    type: 'image',
    url: '/images/social/action-group.jpg',
    thumbnailUrl: '/images/social/action-group-thumb.jpg',
    mimeType: 'image/jpeg',
    size: 2200000, // 2.2MB
    dimensions: { width: 1200, height: 800 },
    tags: ['actiune', 'grup', 'joc'],
    createdAt: pastDate(80, 11),
    updatedAt: pastDate(80, 11),
  },
  {
    id: 'media-4',
    name: 'Petrecere copii',
    type: 'image',
    url: '/images/social/kids-party.jpg',
    thumbnailUrl: '/images/social/kids-party-thumb.jpg',
    mimeType: 'image/jpeg',
    size: 1950000, // 1.95MB
    dimensions: { width: 1080, height: 1350 },
    tags: ['petrecere', 'copii', 'aniversare'],
    createdAt: pastDate(75, 9),
    updatedAt: pastDate(75, 9),
  },
  {
    id: 'media-5',
    name: 'Video promo arena',
    type: 'video',
    url: '/videos/social/arena-promo.mp4',
    thumbnailUrl: '/images/social/arena-promo-thumb.jpg',
    mimeType: 'video/mp4',
    size: 45000000, // 45MB
    dimensions: { width: 1080, height: 1920 },
    duration: 30,
    tags: ['arena', 'promo', 'reel'],
    createdAt: pastDate(70, 15),
    updatedAt: pastDate(70, 15),
  },
  {
    id: 'media-6',
    name: 'Video tutorial joc',
    type: 'video',
    url: '/videos/social/tutorial.mp4',
    thumbnailUrl: '/images/social/tutorial-thumb.jpg',
    mimeType: 'video/mp4',
    size: 28000000, // 28MB
    dimensions: { width: 1920, height: 1080 },
    duration: 45,
    tags: ['tutorial', 'reguli', 'instructiuni'],
    createdAt: pastDate(65, 12),
    updatedAt: pastDate(65, 12),
  },
  {
    id: 'media-7',
    name: 'Team building corporate',
    type: 'image',
    url: '/images/social/corporate.jpg',
    thumbnailUrl: '/images/social/corporate-thumb.jpg',
    mimeType: 'image/jpeg',
    size: 2100000, // 2.1MB
    dimensions: { width: 1920, height: 1080 },
    tags: ['corporate', 'teambuilding', 'profesional'],
    createdAt: pastDate(60, 10),
    updatedAt: pastDate(60, 10),
  },
  {
    id: 'media-8',
    name: 'Scoreboard final',
    type: 'image',
    url: '/images/social/scoreboard.jpg',
    thumbnailUrl: '/images/social/scoreboard-thumb.jpg',
    mimeType: 'image/jpeg',
    size: 1500000, // 1.5MB
    dimensions: { width: 1080, height: 1080 },
    tags: ['scoreboard', 'rezultate', 'competitie'],
    createdAt: pastDate(55, 16),
    updatedAt: pastDate(55, 16),
  },
]

// ============================================================================
// Social Posts
// ============================================================================

export const MOCK_POSTS: SocialPost[] = [
  // Draft post (no scheduledAt)
  {
    id: 'post-1',
    caption: `Pregatiti pentru o noua aventura? 🎯

Arena LaserZone te asteapta cu provocari noi si adrenalina maxima!

Vino cu prietenii si arata-le cine e cel mai bun tanar!`,
    mediaIds: ['media-1'],
    hashtags: ['laserzone', 'lasertag', 'bucuresti', 'distractie'],
    platforms: ['facebook', 'instagram'],
    scheduledAt: null,
    publishedAt: null,
    status: 'draft',
    platformStatuses: {
      facebook: { status: 'draft' },
      instagram: { status: 'draft' },
      tiktok: { status: 'draft' },
    },
    metrics: {
      facebook: emptyMetrics(),
      instagram: emptyMetrics(),
      tiktok: emptyMetrics(),
    },
    createdBy: 'user-1',
    createdAt: pastDate(2, 14),
    updatedAt: pastDate(2, 14),
  },

  // Scheduled post 1 (future - 2 days)
  {
    id: 'post-2',
    caption: `Weekend special la LaserZone! 🎉

Sambata si duminica: 20% reducere la grupuri de 6+ persoane!

Rezerva acum si nu rata distractia!

📞 07XX XXX XXX
📍 Bucuresti`,
    mediaIds: ['media-3'],
    hashtags: ['laserzone', 'weekend', 'promotie', 'bucuresti', 'distractie'],
    platforms: ['facebook', 'instagram', 'tiktok'],
    scheduledAt: futureDate(2, 10, 0),
    publishedAt: null,
    status: 'scheduled',
    platformStatuses: {
      facebook: { status: 'scheduled' },
      instagram: { status: 'scheduled' },
      tiktok: { status: 'scheduled' },
    },
    metrics: {
      facebook: emptyMetrics(),
      instagram: emptyMetrics(),
      tiktok: emptyMetrics(),
    },
    createdBy: 'user-1',
    createdAt: pastDate(1, 11),
    updatedAt: pastDate(1, 11),
  },

  // Scheduled post 2 (future - 5 days)
  {
    id: 'post-3',
    caption: `Petreceri de neuitat pentru cei mici! 🎂🎯

Organizeaza aniversarea copilului tau la LaserZone:
✨ Pachete all-inclusive
🎈 Decoratiuni speciale
🍕 Gustari delicioase
📸 Poze de grup

De la 499 lei pentru 10 copii!

Rezerva: 07XX XXX XXX`,
    mediaIds: ['media-4'],
    hashtags: ['laserzone', 'petrecere', 'copii', 'aniversare', 'bucuresti'],
    platforms: ['facebook', 'instagram'],
    scheduledAt: futureDate(5, 12, 30),
    publishedAt: null,
    status: 'scheduled',
    platformStatuses: {
      facebook: { status: 'scheduled' },
      instagram: { status: 'scheduled' },
      tiktok: { status: 'draft' },
    },
    metrics: {
      facebook: emptyMetrics(),
      instagram: emptyMetrics(),
      tiktok: emptyMetrics(),
    },
    createdBy: 'user-1',
    createdAt: pastDate(3, 9),
    updatedAt: pastDate(3, 9),
  },

  // Published post (past - 7 days ago, with metrics)
  {
    id: 'post-4',
    caption: `Am avut o zi incredibila cu echipa de la TechCorp Romania! 💼🎯

Team building-ul perfect combina strategia, comunicarea si... putin laser tag!

Felicitari echipei castigatoare! 🏆

Vrei un team building diferit? Scrie-ne!`,
    mediaIds: ['media-7'],
    hashtags: ['laserzone', 'teambuilding', 'corporate', 'echipa', 'bucuresti'],
    platforms: ['facebook', 'instagram'],
    scheduledAt: pastDate(7, 15),
    publishedAt: pastDate(7, 15),
    status: 'published',
    platformStatuses: {
      facebook: { status: 'published', postId: 'fb-123456789' },
      instagram: { status: 'published', postId: 'ig-987654321' },
      tiktok: { status: 'draft' },
    },
    metrics: {
      facebook: publishedMetrics(156, 23, 12, 2450),
      instagram: publishedMetrics(284, 41, 28, 3120),
      tiktok: emptyMetrics(),
    },
    createdBy: 'user-1',
    createdAt: pastDate(8, 10),
    updatedAt: pastDate(7, 15),
  },

  // Failed post (attempted 3 days ago)
  {
    id: 'post-5',
    caption: `Azi testam noul echipament! 🎮

Stay tuned pentru surprize!`,
    mediaIds: ['media-5'],
    hashtags: ['laserzone', 'echipament', 'noutati'],
    platforms: ['tiktok'],
    scheduledAt: pastDate(3, 18),
    publishedAt: null,
    status: 'failed',
    platformStatuses: {
      facebook: { status: 'draft' },
      instagram: { status: 'draft' },
      tiktok: { status: 'failed', error: 'Video format not supported. Please use 9:16 aspect ratio.' },
    },
    metrics: {
      facebook: emptyMetrics(),
      instagram: emptyMetrics(),
      tiktok: emptyMetrics(),
    },
    createdBy: 'user-1',
    createdAt: pastDate(4, 12),
    updatedAt: pastDate(3, 18),
  },
]

// ============================================================================
// Initialize Store with Mock Data
// ============================================================================

/**
 * Function to populate store with mock data
 * Call this when store is empty or for testing
 */
export function initializeMockData(store: {
  posts: SocialPost[]
  captionTemplates: CaptionTemplate[]
  hashtagSets: HashtagSet[]
  contentLibrary: ContentLibraryItem[]
}) {
  return {
    posts: store.posts.length === 0 ? MOCK_POSTS : store.posts,
    captionTemplates: store.captionTemplates.length === 0 ? MOCK_CAPTION_TEMPLATES : store.captionTemplates,
    hashtagSets: store.hashtagSets.length === 0 ? MOCK_HASHTAG_SETS : store.hashtagSets,
    contentLibrary: store.contentLibrary.length === 0 ? MOCK_CONTENT_LIBRARY : store.contentLibrary,
  }
}
