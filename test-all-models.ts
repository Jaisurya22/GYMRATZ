import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const candidates = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash-001",
    "gemini-2.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
];

async function testAll() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;
    const genAI = new GoogleGenerativeAI(key);

    for (const modelName of candidates) {
        console.log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("hello");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}!`);
            console.log(response.text());
            return; // Stop on first success
        } catch (e: any) {
            console.log(`❌ Failed ${modelName}: ${e.message.substring(0, 100)}...`);
        }
    }
    console.log("❌ All models failed.");
}

testAll();
