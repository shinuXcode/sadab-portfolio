// Local fallback. The Admin panel / Google Drive CMS becomes the source of truth after setup.
export const profile = {
  name: 'Md Sadab', role: 'Full-Stack Dev · JEE Aspirant · Linux Nerd',
  tagline: 'Building things on the internet while prepping for JEE.', location: 'Katihar, Bihar, India',
  bio: 'Class 11 student splitting time between Physics/Chem/Math prep for JEE and shipping full-stack web projects. Runs everything on Linux, drinks too much home-brewed coffee, and thinks a good UI is basically a love letter to the user.',
  resumeDriveLink: 'https://drive.google.com/YOUR_RESUME_LINK_HERE', email: 'your@email.com',
};
export const socials = [
  { label:'GitHub', icon:'🐙', url:'https://github.com/yourhandle' }, { label:'LinkedIn', icon:'💼', url:'https://linkedin.com/in/yourhandle' },
  { label:'Instagram', icon:'📸', url:'https://instagram.com/yourhandle' }, { label:'Twitter/X', icon:'𝕏', url:'https://x.com/yourhandle' },
  { label:'LeetCode', icon:'🧩', url:'https://leetcode.com/yourhandle' }, { label:'Email', icon:'✉️', url:'mailto:your@email.com' },
];
export const projects = [
  { title:'Project One', desc:"Short one-line description of what this project does and why it's cool.", tags:['React','Vite','Supabase'], link:'#', icon:'🚀' },
  { title:'Project Two', desc:"Short one-line description of what this project does and why it's cool.", tags:['Three.js','WebGL'], link:'#', icon:'🧠' },
  { title:'Project Three', desc:"Short one-line description of what this project does and why it's cool.", tags:['Python','Automation'], link:'#', icon:'⚙️' },
  { title:'Project Four', desc:"Short one-line description of what this project does and why it's cool.", tags:['Linux','Termux','Ollama'], link:'#', icon:'🐧' },
];
export const skills = [
  { name:'JavaScript / React', level:85, note:'Building interfaces and interactive web apps.' }, { name:'Python', level:75, note:'Backend, scripting and automation.' },
  { name:'Linux / Shell', level:80, note:'Daily-driver tooling and system work.' }, { name:'Physics (JEE)', level:70, note:'Current academic focus.' },
  { name:'Math (JEE)', level:68, note:'Logic and problem solving.' }, { name:'UI / UX Design', level:78, note:'Designing clean interfaces.' },
];
export const funFacts = [
  { icon:'☕', label:'Coffee brewed', value:'500+ cups' }, { icon:'🐧', label:'Daily driver', value:'Zorin OS' },
  { icon:'🎬', label:'Rewatching', value:'House of the Dragon' }, { icon:'🎮', label:'Cloud gaming on', value:'GeForce Now' },
];
export const lab = [];
export const gallery = [];
export const settings = { siteName:'Sadab.dev', siteDescription:'Md Sadab — full-stack developer portfolio, projects and experimental lab.' };
export default { profile, socials, projects, skills, funFacts, lab, gallery, settings };
