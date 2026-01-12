
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

// Always use process.env.API_KEY directly when initializing GoogleGenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const auditSmartContract = async (code: string): Promise<AuditResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Audit the following Solidity smart contract for common vulnerabilities like Reentrancy, Gas Limit issues, Integer Overflow, Access Control, and Logic Flaws.
    
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

  try {
    return JSON.parse(response.text || '{}');
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `As a Lead Blockchain Architect, provide a detailed technical blueprint for: ${topic}. 
    Include:
    1. System Components
    2. Cryptographic primitives (e.g., ZK-SNARKs, Linkable Ring Signatures)
    3. Consensus considerations
    4. Data availability strategies
    Use Markdown formatting with clear headers.`,
    config: {
      systemInstruction: "You are a world-class blockchain architect specializing in secure e-voting systems. Be technical, rigorous, and practical."
    }
  });

  return response.text || "Unable to generate advice at this moment.";
};

export const generateSmartContract = async (requirements: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a production-ready, highly secure Solidity smart contract for a blockchain voting system.
    Requirements: ${requirements}
    
    Rules:
    - Include OpenZeppelin-style security patterns.
    - Add detailed NatSpec comments.
    - Ensure it is gas-optimized.
    - Return ONLY the Solidity code block.`,
  });

  return response.text || "";
};
