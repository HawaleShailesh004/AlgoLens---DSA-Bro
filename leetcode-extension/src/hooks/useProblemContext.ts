import { useState, useEffect } from 'react';

export const useProblemContext = () => {
  const [slug, setSlug] = useState<string | null>(null);
  const [problemData, setProblemData] = useState<any>(null);

  useEffect(() => {
    // 1. Listen for background script messages
    const listener = (req: any) => {
      if (req.type === "PROBLEM_UPDATED") setSlug(req.slug);
    };
    chrome.runtime.onMessage.addListener(listener);

    // 2. Check active tab on mount
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (url?.includes("/problems/")) {
        setSlug(url.split("/problems/")[1].split("/")[0]);
      }
    });

    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!slug) return;
    fetch(`https://leetcode-api-pied.vercel.app/problem/${slug}`)
      .then(res => res.json())
      .then(data => setProblemData(data));
  }, [slug]);

  return { slug, problemData };
};