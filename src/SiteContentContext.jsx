import { createContext, useContext, useEffect, useState } from 'react';
import localContent from './data/content';
import { fetchSiteContent } from './data/contentStore';

const ContentContext = createContext({ content: localContent, loading: true, refresh: async () => {} });

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(localContent);
  const [loading, setLoading] = useState(true);

  const refresh = async (bustCache=false) => {
    setLoading(true);
    const next = await fetchSiteContent(bustCache);
    setContent(next);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  return <ContentContext.Provider value={{ content, loading, refresh }}>{children}</ContentContext.Provider>;
}

export function useSiteContent() { return useContext(ContentContext); }
