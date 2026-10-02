// Personal details and content — edit here.
export const config = {
  name: 'Mike Androulakis',
  role: 'Creative Designer',
  email: 'hello@yourdomain.com',
  // Fluid background colour. Brand metallic blue alternative: '#2f6f8f'
  blobColor: '#5653c8',
  // Order matches the object's four designed states in src/lib/objectStates.ts
  categories: [
    { id: 'brand', name: 'Brand Identity' },
    { id: 'uiux', name: 'UI / UX' },
    { id: 'art-direction', name: 'Art Direction' },
    { id: 'creative', name: 'Creative Development' },
  ],
} as const

export type CategoryId = (typeof config.categories)[number]['id']
