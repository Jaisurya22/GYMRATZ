import "dotenv/config";

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("No key found");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Found", data.models.length, "models.");
            const candidates = data.models
                .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
                .map((m: any) => m.name);

            console.log("--- Text Generation Models ---");
            candidates.forEach((name: string) => console.log(name));
        } else {
            console.log("No models property in response:", JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.error("Failed to list models:", error.message);
    }
}

listModels();
