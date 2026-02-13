import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzeNutrition(text: string) {
    console.log("Analyzing nutrition for text:", text); // New log
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // 2.0-flash failed quota check, 2.5-flash confirmed working via test script
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const prompt = `Analyze the food description and return a JSON object with the following fields: 
      - foodName (string): A short, descriptive name of the food
      - calories (number): Estimated calories
      - protein (number): Estimated protein in grams
      - carbs (number): Estimated carbs in grams
      - fat (number): Estimated fat in grams
      
      Return ONLY the JSON object, no markdown or text. If the input is not food or invalid, return null values or reasonable estimates based on best guess.
      
      Food description: ${text}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        console.log("Gemini Raw Response:", textResponse); // Debug logging

        // Clean up potential markdown code blocks (Gemini sometimes wraps JSON in ```json ... ```)
        // improved regex to be more flexible with whitespace and capitalization
        let jsonString = textResponse.replace(/```json/gi, "").replace(/```/g, "").trim();

        try {
            return JSON.parse(jsonString);
        } catch (parseError) {
            console.error("Failed to parse JSON from Gemini:", jsonString);
            throw new Error("Received invalid JSON from AI. Please try again.");
        }
    } catch (error: any) {
        console.error("Gemini API error:", error);

        // Check for common Gemini errors
        if (error.message?.includes("API key not valid")) {
            throw new Error("Invalid Gemini API Key. Please check your .env file.");
        }
        if (error.response?.promptFeedback?.blockReason) {
            throw new Error(`AI blocked the request: ${error.response.promptFeedback.blockReason}`);
        }

        throw new Error(`Failed to analyze: ${error.message}`);
    }
}
