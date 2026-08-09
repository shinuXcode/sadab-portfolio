import { getCms } from '../_lib/cms.mjs';
import { readDriveImage } from '../_lib/drive.mjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const fileId = String(req.query?.fileId || '').trim();
    if (!fileId || fileId.length > 200) return res.status(400).json({ error: 'Invalid image id' });
    const cms = await getCms();
    const allowed = (cms.gallery || []).some(item => String(item.driveFileId || '') === fileId && item.visible !== false);
    if (!allowed) return res.status(404).json({ error: 'Image not found' });
    const { meta, response } = await readDriveImage(fileId);
    res.setHeader('Content-Type', meta.mimeType);
    // Gallery images are addressed by their immutable Drive file id, so once fetched
    // they never change under the same URL — safe to cache aggressively at the edge
    // and in the browser instead of re-validating every day.
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=31536000, immutable');
    if (meta.size) res.setHeader('Content-Length', String(meta.size));
    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).send(buffer);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Gallery image unavailable' });
  }
}
