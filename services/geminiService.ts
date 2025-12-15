import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Ensure the API key is available as an environment variable
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this project, we assume it's set.
  console.error("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// This function takes the email content and asks Gemini for reply suggestions.
export const generateSmartReplies = async (emailBody: string): Promise<string[]> => {
  if (!API_KEY) {
    return Promise.resolve(["Setup API_KEY to use this feature.", "Okay, got it.", "I'll reply later."]);
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze the following email and generate three short, distinct, and appropriate reply suggestions. The replies should be concise and professional.
        
        Email Body: "${emailBody}"
        
        Return your suggestions in a JSON object with a single key "replies", which should be an array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replies: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                }
              }
            }
          }
        }
    });

    let jsonString = response.text.trim();
    // The model might return the JSON string wrapped in markdown code fences.
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7, jsonString.length - 3).trim();
    }
    
    const parsed = JSON.parse(jsonString);
    
    if (parsed && Array.isArray(parsed.replies) && parsed.replies.length > 0) {
      return parsed.replies.slice(0, 3); // Ensure we only return up to 3 replies
    }
    
    return [];

  } catch (error) {
    console.error("Error generating smart replies:", error);
    // Return fallback replies in case of an API error
    return ["Yes, I agree.", "No, thank you.", "Let me check and get back to you."];
  }
};