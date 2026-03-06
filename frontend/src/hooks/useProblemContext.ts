import { useState, useEffect } from "react";

export const useProblemContext = () => {
  const [slug, setSlug] = useState<string | null>(null);
  const [problemData, setProblemData] = useState<any>(null);
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemError, setProblemError] = useState<string | null>(null);

  useEffect(() => {
    const listener = (req: any) => {
      if (req.type === "PROBLEM_UPDATED") setSlug(req.slug);
    };
    chrome.runtime.onMessage.addListener(listener);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url;
      if (url?.includes("/problems/")) {
        setSlug(url.split("/problems/")[1].split("/")[0]);
      }
    });
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    if (!slug) {
      setProblemData(null);
      setProblemError(null);
      return;
    }
    setProblemLoading(true);
    setProblemError(null);
    fetch(`${import.meta.env.VITE_API_URL}/problem/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load problem");
        return res.json();
      })
      .then((data) => {
        setProblemData(data);
      })
      .catch(() => setProblemError("Could not load problem"))
      .finally(() => setProblemLoading(false));
  }, [slug]);

  return { slug, problemData, problemLoading, problemError };
};
