// Function to extract slug and notify
const notifyExtension = () => {
  const path = window.location.pathname;
  if (path.includes("/problems/")) {
    const slug = path.split("/problems/")[1].split("/")[0];
    chrome.runtime.sendMessage({ type: "PROBLEM_UPDATED", slug: slug });
  }
};

// 1. Observer for URL changes (SPA navigation)
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    notifyExtension();
  }
}).observe(document, {subtree: true, childList: true});

// 2. Run on initial load
setTimeout(notifyExtension, 1500); // Small delay to ensure extension is ready