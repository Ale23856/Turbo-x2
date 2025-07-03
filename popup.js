let storyText = "";

document.getElementById("scanBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => document.body.innerText
    }, results => {
      storyText = results[0].result;
      document.getElementById("status").innerText = "✅ Scanning complete. Press Next.";
    });
  });
});

document.getElementById("nextBtn").addEventListener("click", () => {
  chrome.tabs.sendMessage(tabs[0].id, { action: "getQuestions" });
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "triggerAI") {
    chrome.runtime.sendMessage({
      action: "sendToAI",
      payload: { story: storyText, questions: req.questions }
    });
    document.getElementById("status").innerText = "🔍 Getting answers...";
  }

  if (req.action === "displayAnswers") {
    const qaDiv = document.getElementById("qaBlock");
    qaDiv.innerHTML = "";
    Object.entries(req.answers).forEach(([question, answerList]) => {
      const block = document.createElement("div");
      block.className = "question-block";

      const qText = document.createElement("p");
      qText.innerText = `❓ ${question}`;
      block.appendChild(qText);

      const ul = document.createElement("ul");
      answerList.forEach(ans => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.innerText = ans;
        btn.onclick = () => alert(`You selected:\n\n${ans}`);
        li.appendChild(btn);
        ul.appendChild(li);
      });
      block.appendChild(ul);
      qaDiv.appendChild(block);
    });
    document.getElementById("status").innerText = "✅ Answers ready. Choose your response.";
  }
});

