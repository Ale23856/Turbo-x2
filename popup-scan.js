document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => document.body.innerText
    }, results => {
      const storyText = results[0].result;
      chrome.storage.local.set({ scannedStory: storyText }, () => {
        window.location.href = "popup-qa.html";
      });
    });
  });
});
