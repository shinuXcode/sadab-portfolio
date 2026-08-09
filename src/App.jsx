import { Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import { SiteContentProvider, useSiteContent } from './SiteContentContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIGuideWidget from './components/AIGuideWidget';
import CommandPalette from './components/CommandPalette';
import ShortcutsHelp from './components/ShortcutsHelp';
import DevTerminal from './components/DevTerminal';
import ErrorBoundary from './ErrorBoundary';
import PageSkeleton from './components/PageSkeleton';
const Home=lazy(()=>import('./pages/Home'));const About=lazy(()=>import('./pages/About'));const Projects=lazy(()=>import('./pages/Projects'));const Skills=lazy(()=>import('./pages/Skills'));const Contact=lazy(()=>import('./pages/Contact'));const Lab=lazy(()=>import('./pages/Lab'));const Admin=lazy(()=>import('./pages/Admin'));const NotFound=lazy(()=>import('./pages/NotFound'));const Now=lazy(()=>import('./pages/Now'));const Guestbook=lazy(()=>import('./pages/Guestbook'));const Preview=lazy(()=>import('./pages/Preview'));
function AnalyticsTracker(){const {content}=useSiteContent();const location=useLocation();useEffect(()=>{if(content.settings?.enableAnalytics===false)return;fetch('/api/analytics/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname})}).catch(()=>{})},[location.pathname,content.settings?.enableAnalytics]);return null}
function Shell(){const location=useLocation();const {content}=useSiteContent();const isControlRoom=location.pathname.startsWith('/control-room');const maintenance=content.settings?.maintenanceMode&&!isControlRoom;return <div className="app-shell">{!isControlRoom&&<Navbar/>}<AnalyticsTracker/><main style={{flex:1}}>{maintenance?<div className="page error-page"><div className="container error-inner"><span className="error-code">OFF</span><h1>Back in a bit.</h1><p>The portfolio is temporarily in maintenance mode.</p></div></div>:<Suspense fallback={<PageSkeleton/>}><Routes><Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/><Route path="/projects" element={<Projects/>}/><Route path="/skills" element={<Skills/>}/><Route path="/lab" element={<Lab/>}/><Route path="/now" element={<Now/>}/><Route path="/guestbook" element={<Guestbook/>}/><Route path="/preview" element={<Preview/>}/><Route path="/contact" element={<Contact/>}/><Route path="/control-room" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes></Suspense>}</main>{!isControlRoom&&<><Footer/><AIGuideWidget/><CommandPalette/><ShortcutsHelp/>{content.settings?.enableTerminal!==false&&<DevTerminal/>}</>}</div>}
export default function App(){return <ErrorBoundary><ThemeProvider><SiteContentProvider><Shell/></SiteContentProvider></ThemeProvider></ErrorBoundary>}
