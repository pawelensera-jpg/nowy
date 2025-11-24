import { GoogleGenAI } from "@google/genai";
import { DeliveryItem } from "../types";

const apiKey = process.env.API_KEY || '';
// In a real app, handle missing API key gracefully via UI config or backend proxy.
// We assume it's injected for this demo environment.

export const analyzeSchedule = async (deliveries: DeliveryItem[]): Promise<string> => {
  if (!apiKey) {
    return "Klucz API Gemini nie został skonfigurowany. Ustaw process.env.API_KEY.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Convert data to a simplified string format for the prompt
    const dataString = JSON.stringify(deliveries.map(d => ({
      time: d.time,
      company: d.companyName,
      status: d.isArrived ? "NA MIEJSCU" : "OCZEKUJE",
      type: d.type
    })));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Jesteś asystentem logistycznym. Przeanalizuj poniższą listę awizacji na dziś.
      
      DANE: ${dataString}
      
      Zadanie:
      1. Podaj krótkie podsumowanie sytuacji (ile aut na placu, ile jeszcze ma dojechać).
      2. Wskaż czy są jakieś potencjalne spiętrzenia (np. dużo aut o tej samej godzinie).
      3. Odpowiedź ma być krótka, profesjonalna, po polsku, maksymalnie 3 zdania.`,
    });

    return response.text || "Nie udało się wygenerować analizy.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Wystąpił błąd podczas łączenia z asystentem AI.";
  }
};