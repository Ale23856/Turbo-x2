// content.js

function getLiveQuestions() {
  const questions = Array.from(document.querySelectorAll(".question")).map(el => el.innerText.trim());
  chrome.runtime.sendMessage({ action: "liveQuestions", questions });
}

// Wait for full DOM
window.addEventListener("load", () => {
  console.log("🔍 Content script loaded.");
  getLiveQuestions();

  // Optional: watch for new questions added dynamically
  const observer = new MutationObserver(() => getLiveQuestions());
  observer.observe(document.body, { childList: true, subtree: true });
});
