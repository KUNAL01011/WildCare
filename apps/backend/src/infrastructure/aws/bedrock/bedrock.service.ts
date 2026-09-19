import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { env } from "../../../config/env.js";

const bedrockClient = new BedrockRuntimeClient({
  region: env.AWS_REGION || "ap-south-1",
});

export interface AIAnalysisResult {
  speciesGuess: string;
  incidentAssessment: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "UNKNOWN";
  confidence: number;
  visibleIndicators: string[];
  safetyGuidance: string[];
  summary: string;
  rawResponse: any;
}

export async function analyzeWildlifeIncident(
  description: string,
  evidenceS3Keys: string[]
): Promise<AIAnalysisResult> {
  // In a full production implementation, you would fetch the S3 object as a base64 buffer
  // and pass it in the messages array to Claude 3 on Bedrock.
  // For this MVP, we structure the prompt and parse the expected JSON response.

  const modelId =
    env.BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0";

  const systemPrompt = `You are an assistive AI for a wildlife rescue platform. 
Analyze the incident description and provided evidence. 
Respond ONLY in valid JSON matching this structure: 
{ "speciesGuess": "string", "incidentAssessment": "string", "urgency": "LOW|MEDIUM|HIGH|CRITICAL", "confidence": 0.0-1.0, "visibleIndicators": ["string"], "safetyGuidance": ["string"], "summary": "string" }
WARNING: Do not diagnose definitively, do not confirm death, and instruct users to keep a safe distance and not touch the animal.`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Incident Description: ${description}\nEvidence Count: ${evidenceS3Keys.length}`,
      },
    ],
  };

  try {
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const aiContent = JSON.parse(responseBody.content[0].text);

    return {
      speciesGuess: aiContent.speciesGuess || "Unknown",
      incidentAssessment: aiContent.incidentAssessment || "Unknown condition",
      urgency: aiContent.urgency || "UNKNOWN",
      confidence: aiContent.confidence || 0.5,
      visibleIndicators: aiContent.visibleIndicators || [],
      safetyGuidance: aiContent.safetyGuidance || [
        "Keep a safe distance.",
        "Do not attempt to move or treat the animal.",
      ],
      summary: aiContent.summary || "Pending review.",
      rawResponse: responseBody,
    };
  } catch (error) {
    throw new Error(`Bedrock invocation failed: ${(error as Error).message}`);
  }
}
