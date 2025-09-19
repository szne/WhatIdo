// lib/openai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // ブラウザから直接叩く場合必須
});

export { openai };