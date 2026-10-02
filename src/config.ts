// Personal details and content — edit here.
export const config = {
  name: 'Mike Androulakis',
  role: 'Creative Designer',
  email: 'hello@yourdomain.com',
  // Fluid background colour. Brand metallic blue alternative: '#2f6f8f'
  blobColor: '#5653c8',
  // Each work's `color` tints the background while its card is in focus
  categories: [
    {
      name: 'UX Design',
      works: [
        { title: 'Project One', year: '2026', color: '#5653c8' },
        { title: 'Project Two', year: '2025', color: '#c8536f' },
        { title: 'Project Three', year: '2025', color: '#2f8f7a' },
        { title: 'Project Four', year: '2024', color: '#d08a3a' },
      ],
    },
    {
      name: 'Web Development',
      works: [
        { title: 'Project One', year: '2026', color: '#3a7fd0' },
        { title: 'Project Two', year: '2025', color: '#8a4fc8' },
        { title: 'Project Three', year: '2024', color: '#2f8f7a' },
      ],
    },
    {
      name: 'Web Design',
      works: [
        { title: 'Project One', year: '2026', color: '#c8536f' },
        { title: 'Project Two', year: '2025', color: '#5653c8' },
        { title: 'Project Three', year: '2025', color: '#d08a3a' },
        { title: 'Project Four', year: '2024', color: '#3a7fd0' },
        { title: 'Project Five', year: '2023', color: '#2f8f7a' },
      ],
    },
    {
      name: 'Branding',
      works: [
        { title: 'Project One', year: '2026', color: '#d08a3a' },
        { title: 'Project Two', year: '2025', color: '#8a4fc8' },
        { title: 'Project Three', year: '2024', color: '#c8536f' },
      ],
    },
  ],
}

export type Category = (typeof config.categories)[number]

export const slug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
