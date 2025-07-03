document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: scanTextAndQuestions
    });
  });
});

function scanTextAndQuestions() {
  const storyText = document.body.innerText;
  const questions = Array.from(document.querySelectorAll(".question")).map(q => q.innerText);
  const payload = { story: storyText, questions };

  chrome.runtime.sendMessage({ action: "sendToAI", payload });
  document.getElementById("status").innerText = "Scanning complete. Go to questions.";
}
