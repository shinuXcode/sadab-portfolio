import { getCms } from './_lib/cms.mjs';

function esc(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req, res) {
  try {
    const cms = await getCms();
    const site = (cms.seo?.canonicalBase || 'https://sadab.dev').replace(/\/$/, '');
    const items = [
      ...(cms.projects || []).map(p => ({ title: p.title, desc: p.desc, link: `${site}/projects`, date: p.updatedAt || p.startedAt })),
      ...(cms.lab || []).map(l => ({ title: `[Lab] ${l.title}`, desc: l.desc, link: `${site}/lab`, date: null })),
    ].filter(i => i.title);

    const rssItems = items.map(i => `
    <item>
      <title>${esc(i.title)}</title>
      <link>${esc(i.link)}</link>
      <description>${esc(i.desc || '')}</description>
      ${i.date ? `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` : ''}
      <guid isPermaLink="false">${esc(i.link + i.title)}</guid>
    </item>`).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(cms.settings?.siteName || 'Sadab.dev')} — Updates</title>
    <link>${esc(site)}</link>
    <description>Latest projects and lab experiments from ${esc(cms.profile?.name || 'Sadab')}.</description>
    <language>en-us</language>${rssItems}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).send(rss);
  } catch (error) {
    console.error(error);
    res.status(503).json({ error: 'Feed unavailable' });
  }
}
