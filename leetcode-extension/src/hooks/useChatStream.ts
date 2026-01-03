import { useState, useEffect } from "react";

const SERVER_URL = `${import.meta.env.VITE_API_URL}/chat`;

export const useChatStream = (
  problemData: any,
  userKey: string,
  slug: string | null
) => {
  const [messages, setMessages] = useState<
    { role: string; content: string; isError?: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // 1. Load History on Mount
  useEffect(() => {
    if (!slug) return;
    chrome.storage.local.get([`chat_${slug}`], (result) => {
      const stored = result[`chat_${slug}`] as
        | { role: string; content: string }[]
        | undefined;

      if (stored) {
        setMessages(stored);
      }
    });
  }, [slug]);

  // 2. Save History on Change (UPDATED)
  useEffect(() => {
    if (!slug || messages.length === 0) return;

    // 🛑 FILTER: Don't save error messages to local storage
    // We only want to persist valid conversation history
    const validHistory = messages.filter((msg) => !msg.isError);

    chrome.storage.local.set({ [`chat_${slug}`]: validHistory });
  }, [messages, slug]);

  const sendMessage = async (input: string) => {
    if (!input.trim() || !problemData) return;

    const newHistory = [...messages, { role: "user", content: input }];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Create a placeholder bubble
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          problemContext: {
            title: problemData.questionTitle,
            difficulty: problemData.difficulty,
            description: problemData.content || problemData.question,
          },
          userApiKey: userKey,
        }),
      });

      // Handle 429 Quota Error
      if (res.status === 429) {
        const data = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: data.error || "Daily limit reached.",
            isError: true, // This flag now prevents saving
          };
          return updated;
        });
        return;
      }

      if (!res.ok) throw new Error("Server Error");
      if (!res.body) throw new Error("No Stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        aiResponse += text;

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: aiResponse,
          };
          return updated;
        });
      }
    } catch (err) {
      // Fix: Replace the placeholder with error (don't append new)
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "❌ Connection Error. Is the backend running?",
          isError: true,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage, setMessages };
};