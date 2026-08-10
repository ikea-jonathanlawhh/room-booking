const defaultHeaderTitle = process.env.NUXT_PUBLIC_HEADER_TITLE || process.env.HEADER_TITLE || 'Meeting Room Display'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-09',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  future: {
    compatibilityVersion: 4
  },
  routeRules: {
    '/api/rooms': { swr: 60 }
  },
  runtimeConfig: {
    meetingRoomApiUrl: process.env.MEETING_ROOM_API_URL || '',
    public: {
      meetingRoomApiUrl: '/api/rooms',
      headerTitle: defaultHeaderTitle
    }
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: defaultHeaderTitle,
      meta: [
        { name: 'description', content: 'Real-time meeting room availability and schedule display board' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
      ]
    }
  }
})
