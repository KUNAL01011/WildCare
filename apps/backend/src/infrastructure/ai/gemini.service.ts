import { GoogleGenAI } from "@google/genai";
import { env } from "@/config/env";

const ai = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;

const ANALYSIS_PROMPT = `You are a wildlife expert AI assistant for a wildlife rescue app called WildCare.
Analyze the provided image(s) of an animal and return a JSON response with the following fields:

{
  "animalName": "specific common name of the animal (e.g., Indian Peafowl, Rhesus Macaque, Indian Cobra)",
  "animalType": "broad category (e.g., Bird, Mammal, Reptile, Amphibian, Fish, Insect)",
  "animalConfidence": 0.0 to 1.0,
  "condition": "one of: healthy, injured, sick, distressed, deceased, unknown",
  "conditionConfidence": 0.0 to 1.0,
  "severity": "one of: low, medium, high, critical",
  "severityConfidence": 0.0 to 1.0,
  "observations": "brief description of visible injuries, behavior, or condition indicators"
}

Be accurate. If the image is unclear or doesn't show an animal, set confidence values low and use "unknown".
Return ONLY valid JSON, no markdown formatting or code blocks.`;

export interface AIAnalysisResult {
  animalName: string;
  animalType: string;
  animalConfidence: number;
  condition: string;
  conditionConfidence: number;
  severity: string;
  severityConfidence: number;
  observations: string;
}

export async function analyzeAnimalImages(
  imageBuffers: { buffer: Buffer; mimeType: string }[]
): Promise<AIAnalysisResult> {
  if (!ai) {
    return getMockResult();
  }

  try {
    const imageParts = imageBuffers.map((img) => ({
      inlineData: {
        data: img.buffer.toString("base64"),
        mimeType: img.mimeType,
      },
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: ANALYSIS_PROMPT },
          ],
        },
      ],
    });

    const text = response.text?.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    if (!text) return getMockResult();

    const parsed = JSON.parse(text);

    return {
      animalName: parsed.animalName || "Unknown Animal",
      animalType: parsed.animalType || "Unknown",
      animalConfidence: clamp(parsed.animalConfidence ?? 0.5),
      condition: parsed.condition || "unknown",
      conditionConfidence: clamp(parsed.conditionConfidence ?? 0.5),
      severity: parsed.severity || "medium",
      severityConfidence: clamp(parsed.severityConfidence ?? 0.5),
      observations: parsed.observations || "",
    };
  } catch {
    return getMockResult();
  }
}

function clamp(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function getMockResult(): AIAnalysisResult {
  return {
    animalName: "Unknown Animal",
    animalType: "Unknown",
    animalConfidence: 0.5,
    condition: "unknown",
    conditionConfidence: 0.5,
    severity: "medium",
    severityConfidence: 0.5,
    observations: "AI analysis unavailable - GEMINI_API_KEY not configured",
  };
}
