const stopWords = new Set(['the','a','an','is','are','my','your','me','you','what','where','how','can','i','to','of','for','on','and','do','show','tell','about']);
const aliases = {
  projects: ['project','projects','work','built','portfolio','apps','website'],
  skills: ['skill','skills','stack','tech','technology','tools','know'],
  contact: ['contact','email','reach','hire','message'],
  resume: ['resume','cv'],
  socials: ['social','github','linkedin','instagram','twitter','x'],
  lab: ['lab','experiment','experiments','unfinished','prototype','prototypes','wip','idea'],
  about: ['about','bio','who','sadab'],
  study: ['jee','study','physics','math','chemistry','school'],
};

function tokens(text) { return text.toLowerCase().replace(/[^a-z0-9+#.-]/g, ' ').split(/\s+/).filter((x) => x && !stopWords.has(x)); }
function score(input, words) { return tokens(input).reduce((sum, token) => sum + words.some((w) => w === token || token.includes(w) || w.includes(token)) ? 1 : 0, 0); }

export function getGuideReply(input, content, navigate) {
  const text = input.toLowerCase();
  const sections = Object.entries(aliases).map(([key, words]) => [key, score(text, words)]).sort((a,b)=>b[1]-a[1]);
  const intent = sections[0]?.[1] ? sections[0][0] : null;
  const profile = content.profile || {};
  if (/^(hi|hello|hey|yo|sup)\b/.test(text)) return `I'm ${profile.name || 'Sadab'}'s site guide. Ask me about projects, skills, the lab, resume, or contact.`;
  if (intent === 'projects') { navigate?.('/projects'); const names=(content.projects||[]).slice(0,3).map(p=>p.title).filter(Boolean); return names.length ? `I found ${content.projects.length} project${content.projects.length===1?'':'s'}: ${names.join(', ')}. I opened the Projects page.` : 'The Projects page is ready for your real projects. I opened it.'; }
  if (intent === 'lab') { navigate?.('/lab'); return `The Lab is for unfinished experiments, prototypes and weird ideas. I opened it.`; }
  if (intent === 'skills') { navigate?.('/skills'); return `The current stack includes ${(content.skills||[]).slice(0,5).map(s=>s.name).filter(Boolean).join(', ') || 'whatever you add in Admin'}. I opened Skills.`; }
  if (intent === 'contact') { navigate?.('/contact'); return `The easiest route is the Contact page${profile.email ? ` or ${profile.email}` : ''}. I opened Contact.`; }
  if (intent === 'resume') { return profile.resumeDriveLink && !profile.resumeDriveLink.includes('YOUR_') ? `Your resume is hosted on Google Drive: ${profile.resumeDriveLink}` : 'The resume link is still a placeholder. Update it from Admin.'; }
  if (intent === 'socials') { return `Socials: ${(content.socials||[]).map(s=>s.label).filter(Boolean).join(', ') || 'none added yet'}.`; }
  if (intent === 'study') return profile.bio || 'Study details are in the About page.';
  if (intent === 'about') { navigate?.('/about'); return profile.bio || `This is ${profile.name || 'Sadab'}'s portfolio.`; }
  if (/thank|thanks/.test(text)) return 'Anytime. The robot has returned to its suspiciously important duties.';
  return `I can help with projects, skills, the Lab, resume, socials, contact, or About. Try: “show unfinished projects”.`;
}

export const quickPrompts = ['Show my projects','Show the lab','What is the tech stack?','How do I contact Sadab?'];
