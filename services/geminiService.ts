
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

// Always use process.env.API_KEY directly when initializing GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const auditSmartContract = async (code: string): Promise<AuditResult> => {
  // Use gemini-3-pro-preview for complex reasoning and coding tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Audit the following Solidity smart contract for common vulnerabilities like Reentrancy, Gas Limit issues, Integer Overflow (if applicable for version), and Access Control.
    
    Code:
    ${code}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          securityScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING, enum: ['high', 'medium', 'low', 'info'] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                line: { type: Type.NUMBER }
              },
              required: ['severity', 'title', 'description']
            }
          }
        },
        required: ['summary', 'securityScore', 'issues']
      }
    }
  });

  const text = response.text || '{}';
  try {
    // Robust parsing of JSON response which might be wrapped in markdown blocks
    const cleanJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse audit result", e);
    return {
      summary: "An error occurred while parsing the audit results.",
      securityScore: 0,
      issues: []
    };
  }
};

export const getArchitecturalAdvice = async (topic: string): Promise<string> => {
  // Use gemini-3-flash-preview for general technical advice.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a Blockchain Architect, provide specific, technical advice for building a decentralized e-voting system focusing on: ${topic}. 
    Focus on practical implementations, cryptography (ZKP, Ring Signatures), and scalability.`,
    config: {
      systemInstruction: "You are a world-class blockchain architect. Be concise, technical, and professional."
    }
  });

  return response.text || "Unable to generate advice at this moment.";
};

export const generateSmartContract = async (requirements: string): Promise<string> => {
  // Use gemini-3-pro-preview for production-ready code generation.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a production-ready Solidity smart contract for a voting system based on these requirements: ${requirements}. Include comments explaining security choices.`
  });

  return response.text || "";
};
