// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://edumatrix.vercel.app', // 🔁 Change to your production domain
  generateRobotsTxt: true,           // ✅ Also generates robots.txt
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin'],               // 🔁 Add any private routes to exclude
};
  