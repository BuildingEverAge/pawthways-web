import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost",
      "X-Title": "Node Test",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "z-ai/glm-4.6",
      messages: [
        { role: "user", content: "Say hello from GLM 4.6" }
      ]
    })
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

run();
