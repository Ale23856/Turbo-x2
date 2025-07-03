chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "sendToAI") {
    handleAIRequest(req.payload);
  }
});

async function handleAIRequest({ story, questions }) {
  const answers = {};

  for (let question of questions) {
    let response = await tryGroq(story, question);

    if (!response || isAnswerNotInStory(response)) {
      response = await tryCohere(story, question);
    }

    if (!response || isAnswerNotInStory(response)) {
      response = await tryGemini(story, question);
    }

    answers[question] = splitAnswers(response || "Answer not in story.");
  }

  chrome.runtime.sendMessage({ action: "displayAnswers", answers });
}

function isAnswerNotInStory(text) {
  return text?.toLowerCase().includes("answer not in story");
}

function splitAnswers(text) {
  return text
    .split(/\n|- |\* /)
    .map(line => line.trim())
    .filter(line => line.length);
}

// GROQ API
async function tryGroq(story, question) {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "Answer based only on the story. If nothing is relevant, say 'Answer not in story.'" },
          { role: "user", content: `Story:\n${story}\n\nQuestion:\n${question}` }
        ]
      })
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim();
  } catch (err) {
    console.error("Groq error:", err);
    return "";
  }
}

// Cohere API
async function tryCohere(story, question) {
  try {
    const res = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": "Bearer vGK0oHBBpLsaprKTsfKUBC7M44YnnTdALwdU3YvT",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-r-plus",
        chat_history: [],
        message: `Answer based on this story. If no match, say 'Answer not in story.'\n\nStory:\n${story}\n\nQuestion:\n${question}`,
        temperature: 0.4
      })
    });
    const data = await res.json();
    return data?.text?.trim();
  } catch (err) {
    console.error("Cohere error:", err);
    return "";
  }
}

// Gemini API
async function tryGemini(story, question) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCMsXYFTZCSEFPn1pgJKWkpyNZnN588lwU", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Answer the question from this story. If not found, say 'Answer not in story.'\n\nStory:\n${story}\n\nQuestion:\n${question}`
          }]
        }]
      })
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  } catch (err) {
    console.error("Gemini error:", err);
    return "";
  }
}
