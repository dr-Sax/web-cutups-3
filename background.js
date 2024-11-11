chrome.action.onClicked.addListener((tab) => {
    
    chrome.scripting.executeScript({
      target: {
        tabId: tab.id,
      },
      files: ["libraries/p5.js", "libraries/p5.min.js", "sketch.js"],
    });

    chrome.windows.create({
        url: chrome.runtime.getURL("./three-player/index.html"),
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

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && tab.url.includes('youtube.com/watch')) {
      const videoId = new URL(tab.url).searchParams.get('v');
      chrome.tabs.update(tabId, { url: `https://www.youtube.com/embed/${videoId}` });
    }
  });