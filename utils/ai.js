import fetch from "node-fetch";

export async function glmQuery(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost",
      "X-Title": "Pawthways",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "z-ai/glm-4.6",
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();

  // 👇 Para debug, para que no parezca que “no hace nada”
  console.log("RAW GLM RESPONSE:", JSON.stringify(data, null, 2));

  if (data.error) {
    // Si hay error de la API, que se vea claro en consola
    throw new Error(`GLM error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data?.choices?.[0]?.message?.content ?? "";
}


