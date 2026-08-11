export const mediaSizes = {
  affinity: '(max-width: 768px) 100vw, (max-width: 1344px) 50vw, 672px',
  avatar: '(max-width: 768px) 128px, 160px',
  content: '(max-width: 768px) 100vw, 1360px',
  full: '100vw',
  galleryHalf: '50vw',
  galleryQuarter: '(max-width: 768px) 50vw, 25vw',
  galleryThird: '(max-width: 768px) 50vw, 33vw',
  half: '(max-width: 768px) 100vw, 50vw',
  icon: '64px',
  portraitGrid: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  quarter: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw',
  split: '(max-width: 1024px) 100vw, 58vw',
  third: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
} as const

export type MediaSizesPreset = keyof typeof mediaSizes
