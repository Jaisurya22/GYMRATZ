import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGemini() {
    console.log("Testing Gemini API with gemini-2.0-flash...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("❌ Error: GEMINI_API_KEY is missing in .env");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        const prompt = "Analyze nutrition for: 1 apple";
        console.log("Sending prompt:", prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Success! Response received:");
        console.log(text.substring(0, 100) + "...");
    } catch (error: any) {
        console.error("❌ Gemini API Failed:");
        if (error.message) console.error(error.message);
    }
}

testGemini();
