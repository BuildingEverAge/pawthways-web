import dotenv from "dotenv";
dotenv.config(); // 👈 esto carga el .env

import { glmQuery } from "./utils/ai.js";

async function main() {
  const scene = await glmQuery(
    "Write a short, emotional, cinematic scene about a rescued dog and a rabbit at sunset, in 3 sentences."
  );
  console.log("SCENE RESULT:\n", scene);
}

main();

