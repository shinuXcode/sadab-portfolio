import login from '../_lib/admin/login.mjs';
import changePassword from '../_lib/admin/change-password.mjs';
import content from '../_lib/admin/content.mjs';
import forgot from '../_lib/admin/forgot.mjs';
import logout from '../_lib/admin/logout.mjs';
import me from '../_lib/admin/me.mjs';
import reset from '../_lib/admin/reset.mjs';
import status from '../_lib/admin/status.mjs';

const handlers = { login, 'change-password': changePassword, content, forgot, logout, me, reset, status };

export default async function handler(req, res) {
  const raw = req.query?.path ?? '';
  const route = Array.isArray(raw) ? raw.join('/') : String(raw);
  const target = handlers[route];
  if (!target) return res.status(404).json({ error: 'Admin endpoint not found' });
  return target(req, res);
}
