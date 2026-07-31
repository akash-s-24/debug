import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/battle/'], // Keep active battles private
    },
    sitemap: 'https://debugduelarena.com/sitemap.xml',
  };
}
