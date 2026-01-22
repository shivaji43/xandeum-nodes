import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://xandeum-pnode-explorer.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://xandeum-pnode-explorer.vercel.app/network',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: 'https://xandeum-pnode-explorer.vercel.app/leaderboard',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
     {
      url: 'https://xandeum-pnode-explorer.vercel.app/trade',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.5,
    },
     {
      url: 'https://xandeum-pnode-explorer.vercel.app/watchlist',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
  ]
}
