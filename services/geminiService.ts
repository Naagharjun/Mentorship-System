
import { GoogleGenAI, Type } from "@google/genai";
import { Mentor } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getMatchingMentor(userGoal: string, mentors: Mentor[]): Promise<string> {
    const mentorList = mentors.map(m => `${m.name} (Specialization: ${m.specialization}, Skills: ${m.skills?.join(', ')})`).join('\n');
    
    const prompt = `
      You are an expert career consultant. A user has the following goal: "${userGoal}".
      Based on the following list of mentors, which one is the best fit? 
      Explain why in 2 sentences and suggest 3 topics for their first session.

      Mentors:
      ${mentorList}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      return response.text || "I couldn't find a specific match, but Dr. Sarah Chen is a great general starting point.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to get AI recommendation at this moment.";
    }
  }

  async generateGrowthPath(currentSkills: string[], targetRole: string): Promise<any> {
    const prompt = `
      Create a step-by-step 3-month mentorship growth path for someone moving from [${currentSkills.join(', ')}] to a "${targetRole}" role.
      Provide a JSON structure with months as keys.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              month1: { type: Type.STRING },
              month2: { type: Type.STRING },
              month3: { type: Type.STRING },
              focusAreas: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ["month1", "month2", "month3", "focusAreas"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Path Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
