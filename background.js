chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      files: ["libraries/p5.js", "libraries/p5.min.js", "sketch.js"],
    });

    chrome.windows.create({
        url: chrome.runtime.getURL("assembler/index.html"),
        type: "popup"
      });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      // The tab has finished loading, so you can re-initialize your content script
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        files: ["libraries/p5.js", "libraries/p5.min.js", "sketch.js"],
      });
    }
  });

  function extractYouTubeReelsId(url) {
    if (!url) return null;

    try {
        // Normalize the URL
        url = url.trim();

        // Remove query parameters and fragment identifiers
        url = url.split('?')[0].split('#')[0];

        // Patterns to match:
        // 1. YouTube Shorts/Reels direct URL
        const shortsPattern = /(?:shorts\/|\/shorts\/)([a-zA-Z0-9_-]+)/;
        const shortsMatch = url.match(shortsPattern);
        if (shortsMatch) return shortsMatch[1];

        // 2. Full YouTube URL with video parameter
        const fullUrlPattern = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([a-zA-Z0-9_-]+)/;
        const fullUrlMatch = url.match(fullUrlPattern);
        if (fullUrlMatch) return fullUrlMatch[1];

        // 3. Direct video ID
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

        return null;
    } catch (error) {
        console.error('Error extracting YouTube Reels ID:', error);
        return null;
    }
  }

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url.includes('youtube.com/watch')) {
      const videoId = new URL(tab.url).searchParams.get('v');
      chrome.tabs.update(tabId, { url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}` });
    }
    else if (changeInfo.url && tab.url.includes('youtube.com/shorts')){
      const videoId = extractYouTubeReelsId(tab.url);
      chrome.tabs.update(tabId, { url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${videoId}` });
    }
  });

  