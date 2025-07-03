chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "sendToAI") {
    handleAIRequest(req.payload);
  }
});

async function handleAIRequest({ story, questions }) {
  let answers = {};
  for (let q of questions) {
    try {
      let res = await callGroqAPI(story, q);
      if (!res || res.answerNotFound) {
        res = await callCohereAPI(story, q);
      }
      if (!res || res.answerNotFound) {
        res = await callGeminiAPI(story, q);
      }
      answers[q] = res.answer || "Answer not in story.";
    } catch {
      answers[q] = "Answer not in story.";
    }
  }
  console.log("Answers:", answers);
}
