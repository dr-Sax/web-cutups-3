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