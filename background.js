chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "sendToAI") {
    handleAIRequest(req.payload);
  }
});

async function handleAIRequest({ story, questions }) {
  let answers = {};
  
  for (let question of questions) {
    let reply = await tryGroq(story, question);
    if (!reply || isAnswerNotFound(reply)) {
      console.log("↪️ Falling back to Cohere...");
      reply = await tryCohere(story, question);
    }
    if (!reply || isAnswerNotFound(reply)) {
      console.log("↪️ Falling back to Gemini...");
      reply = await tryGemini(story, question);
    }

    answers[question] = reply || "Answer not in story.";
  }

  console.log("✅ Final Answers:", answers);
  // You can also send these answers to popup or save them
}

// Utility to check if AI said no answer
function isAnswerNotFound(text) {
  return text.toLowerCase().includes("answer not in story");
}

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
          { role: "system", content: "Answer based on the story. If answer not found, say 'Answer not in story.'" },
          { role: "user", content: `Story:\n${story}\n\nQuestion:\n${question}` }
        ]
      })
    });
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq error:", err);
    return "";
  }
}

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
        message: `Based on the following story, answer the question. If not found, respond 'Answer not in story.'\n\nStory:\n${story}\n\nQuestion:\n${question}`,
        temperature: 0.3
      })
    });
    const data = await res.json();
    return data?.text || "";
  } catch (err) {
    console.error("Cohere error:", err);
    return "";
  }
}

async function tryGemini(story, question) {
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCMsXYFTZCSEFPn1pgJKWkpyNZnN588lwU", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Here is a story:\n${story}\n\nAnswer the question:\n${question}\nIf not found, say 'Answer not in story.'`
          }]
        }]
      })
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (err) {
    console.error("Gemini error:", err);
    return "";
  }
}
