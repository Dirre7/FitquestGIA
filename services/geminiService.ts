import { GoogleGenAI } from "@google/genai";
import { UserState } from "../types";

// Helper to get advice based on user stats
export const getAiCoachAdvice = async (user: UserState, query: string): Promise<string> => {
  // Use process.env.API_KEY exclusively as per guidelines
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "Error: API Key no configurada. Asegúrate de añadir API_KEY en las variables de entorno.";
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  const systemPrompt = `
    Eres "FitQuest Coach", un entrenador personal experto y motivador en una aplicación gamificada.
    El usuario está en Nivel ${user.level}.
    Ha completado ${user.completedWorkouts} entrenamientos.
    Su peso total levantado históricamente es ${user.totalWeightLifted} kg.
    
    Responde en Español. Sé conciso (máximo 3 párrafos), motivador y usa emojis.
    Si el usuario es principiante (Nivel < 5), da consejos básicos de forma.
    Si es avanzado, da consejos sobre periodización e intensidad.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    
    return response.text || "No pude generar un consejo en este momento.";
  } catch (error) {
    console.error("Error fetching AI advice:", error);
    return "Hubo un error conectando con el servidor de IA. Intenta más tarde.";
  }
};