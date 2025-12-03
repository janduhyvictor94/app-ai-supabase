import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FinancialSummary, Plot, Activity, Harvest } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAgriInsights = async (
  summary: FinancialSummary,
  activities: Activity[],
  harvests: Harvest[],
  plots: Plot[]
): Promise<string> => {
  try {
    const contextData = {
      summary,
      plots,
      recentActivities: activities.slice(0, 10), // Limit context
      recentHarvests: harvests.slice(0, 10)
    };

    const prompt = `
      Atue como um Engenheiro Agrônomo Sênior e Consultor Financeiro.
      Analise os seguintes dados da propriedade agrícola (em formato JSON):
      ${JSON.stringify(contextData)}

      Por favor, forneça um relatório conciso em HTML (sem markdown code blocks, apenas tags HTML básicas como <p>, <strong>, <ul>, <li>) cobrindo:
      1. Análise de Rentabilidade: Quais talhões estão dando prejuízo ou lucro e por quê.
      2. Eficiência de Manejo: Comentários sobre os custos de atividades (Adubação, Poda, etc).
      3. Recomendações: Sugestões práticas para melhorar a margem de lucro na próxima safra.
      
      Mantenha o tom profissional e direto. Use formatação HTML para deixar o texto legível.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "<p>Não foi possível gerar análise no momento.</p>";
  } catch (error) {
    console.error("Error generating insights:", error);
    return "<p>Erro ao conectar com a Inteligência Artificial. Verifique sua chave de API.</p>";
  }
};