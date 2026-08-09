import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGuideReply, quickPrompts } from '../data/localGuideAI';
import { useSiteContent } from '../SiteContentContext';

export default function AIGuideWidget() {
  const { content } = useSiteContent(); const navigate = useNavigate();
  const [open,setOpen]=useState(false); const [input,setInput]=useState('');
  const [messages,setMessages]=useState([{from:'bot',text:`I'm ${content.profile?.name || 'Sadab'}'s site guide. Ask me about the portfolio.`}]);
  const [typing,setTyping]=useState(false); const endRef=useRef(null);
  useEffect(()=>{setMessages(m=>m.length===1?[{from:'bot',text:`I'm ${content.profile?.name || 'Sadab'}'s site guide. Ask me about the portfolio.`}]:m)},[content.profile?.name]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'})},[messages,open,typing]);
  function send(text){const trimmed=text.trim();if(!trimmed||typing)return;setMessages(m=>[...m,{from:'user',text:trimmed}]);setInput('');setTyping(true);setTimeout(()=>{setMessages(m=>[...m,{from:'bot',text:getGuideReply(trimmed,content,navigate)}]);setTyping(false)},280);}
  return <><div className={`ai-panel ${open?'open':''}`} role="dialog" aria-label="Site guide"><div className="ai-header"><span className="ai-status-dot"/><div><strong>Site Guide</strong><br/><span>Local intelligence · no API key</span></div></div><div className="ai-messages">{messages.map((m,i)=><div key={i} className={`ai-msg ${m.from}`}>{m.text}</div>)}{typing&&<div className="ai-msg bot typing"><i/><i/><i/></div>}<div ref={endRef}/></div><div className="ai-quick">{quickPrompts.map(q=><button key={q} className="ai-chip" onClick={()=>send(q)}>{q}</button>)}</div><form className="ai-input-row" onSubmit={e=>{e.preventDefault();send(input)}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about the site…" aria-label="Message the site guide"/><button type="submit" aria-label="Send">→</button></form></div><button className="ai-fab" onClick={()=>setOpen(o=>!o)} aria-label="Toggle site guide">{open?'✕':'🤖'}</button></>;
}
