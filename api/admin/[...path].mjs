import login from '../_lib/admin/login.mjs';
import changePassword from '../_lib/admin/change-password.mjs';
import content from '../_lib/admin/content.mjs';
import forgot from '../_lib/admin/forgot.mjs';
import logout from '../_lib/admin/logout.mjs';
import me from '../_lib/admin/me.mjs';
import reset from '../_lib/admin/reset.mjs';
import status from '../_lib/admin/status.mjs';

const handlers = {
  login,
  'change-password': changePassword,
  content,
  forgot,
  logout,
  me,
  reset,
  status
};

function resolveRoute(req) {
  const raw = req.query?.path ?? req.query?.['...path'];
  if (Array.isArray(raw) && raw.length) return raw.join('/').replace(/^\/+|\/+$/g, '');
  if (typeof raw === 'string' && raw.trim()) return raw.trim().replace(/^\/+|\/+$/g, '');

  const url = String(req.url || '');
  const pathname = url.split('?')[0];
  const marker = '/api/admin/';
  const index = pathname.indexOf(marker);
  if (index !== -1) return decodeURIComponent(pathname.slice(index + marker.length)).replace(/^\/+|\/+$/g, '');

  return '';
}

export default async function handler(req, res) {
  const route = resolveRoute(req);
  const target = handlers[route];
  if (!target) return res.status(404).json({ error: 'Admin endpoint not found' });
  return target(req, res);
}
