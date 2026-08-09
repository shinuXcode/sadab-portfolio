import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
export default function NotFound() {
  useSEO({ title: '404 — Sadab.dev', description: 'This page does not exist.', path: '/404' });
  return <div className="page error-page"><div className="container error-inner"><span className="error-code">404</span><h1>Even the compiler can't find this page.</h1><p>“Not all who wander are lost. Some just typed the wrong URL.”</p><Link to="/" className="btn btn-primary">← Back to home</Link></div></div>;
}
