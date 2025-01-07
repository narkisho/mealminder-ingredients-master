import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI;

export const initializeGemini = (apiKey: string) => {
  genAI = new GoogleGenerativeAI(apiKey);
};

export const generateRecipeFromImage = async (
  image: string,
  preferences: {
    dietaryRestrictions?: string[];
    skillLevel?: string;
    timeAvailable?: number;
  }
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    // Convert base64 image to proper format
    const imageData = {
      inlineData: {
        data: image.split(",")[1],
        mimeType: "image/jpeg",
      },
    };

    const prompt = `Analyze this image and identify the ingredients. Then, create a recipe considering these preferences:
    ${preferences.dietaryRestrictions ? `Dietary restrictions: ${preferences.dietaryRestrictions.join(", ")}` : ""}
    ${preferences.skillLevel ? `Skill level: ${preferences.skillLevel}` : ""}
    ${preferences.timeAvailable ? `Time available: ${preferences.timeAvailable} minutes` : ""}
    
    Please provide:
    1. List of identified ingredients with confidence scores
    2. Complete recipe with instructions
    3. Cooking time and difficulty rating
    4. Nutritional information`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe. Please try again.");
  }
};