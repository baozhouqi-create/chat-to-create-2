
import { GoogleGenAI, Type } from "@google/genai";
import { C2CResponse, ImageSuggestion } from "./types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are the backend engine for "Chat-to-Create" (C2C).
Monitor input to detect "Image-worthy" moments based on the following rules:

Rules:
1. Length: If the user input is less than 3 words, it is NOT suitable.
2. No Harm: If the input contains unsafe or harmful content, it is NOT suitable.
3. Visual Score (prioritize these if applicable):
   - Absurd Metaphors: User describes themselves or others as something they aren't (e.g., "toasted marshmallow," "secret agent").
   - Concrete Wishes/Imagination: User expresses a vivid wish or asks to imagine a scenario (e.g., "dog cleaning house," "being in Maldives").

If NOT suitable, respond with a JSON object where "isTriggered" is false, and MUST include a "reason" that is clear and concise (NOT in Gen Z slang) explaining why it was not suitable. The reason should be in the same language as the user input.
If SUITABLE, provide 3 distinct creative options within a JSON object where "isTriggered" is true, including a "reason" (in Gen Z slang, explaining why this is a good moment to generate) and "suggestions" array.

Suggestions must be Gen Z-coded: witty, dramatic, and use emojis.
Detailed Prompts must be professional, descriptive, and optimized for high-quality AI art generators.

Constraints:
- Output Language: Use the same language of the user input.
- Output Length: Short Suggestion Label no more than 8 words. Detailed Prompt no more than 100 characters.

Response format must ALWAYS be a valid JSON object:
{
  "isTriggered": boolean,
  "reason": string, // Always required. Clear and concise if isTriggered is false. Gen Z slang if isTriggered is true.
  "suggestions"?: [ // Only present if isTriggered is true
    { "label": "Witty Label 1 ✨", "prompt": "Comprehensive prompt for an image generator (max 100 chars)" },
    { "label": "Witty Label 2 💀", "prompt": "Comprehensive prompt for an image generator (max 100 chars)" },
    { "label": "Witty Label 3 🌈", "prompt": "Comprehensive prompt for an image generator (max 100 chars)" }
  ]
}
`;

export const analyzeChatMoment = async (message: string): Promise<C2CResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isTriggered: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  prompt: { type: Type.STRING }
                },
                required: ["label", "prompt"]
              }
            }
          },
          required: ["isTriggered", "reason"]
        }
      }
    });

    const resultText = response.text?.trim();
    const result = JSON.parse(resultText || '{}');
    return result as C2CResponse;
  } catch (error) {
    console.error("Analysis Error:", error);
    return { isTriggered: false, reason: "Analysis failed due to an internal error." };
  }
};

export const generateImage = async (
  prompt: string, 
  base64Image?: string, 
  mimeType?: string
): Promise<string | null> => {
  try {
    const contents: Array<any> = [];

    if (base64Image && mimeType) {
      contents.push({
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      });
      contents.push({
        text: `Based on the provided image as a reference for the main character, generate an image of this character doing the following: ${prompt}`
      });
    } else {
      contents.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contents },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};
