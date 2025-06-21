import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI with API key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface FeedbackAnalysisInput {
  meetingRating: number;
  experience: string;
  engagementRating: number;
  comments: string;
}

export interface FeedbackAnalysisResult {
  analysis: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  recommendations: string[];
  attentionPoints: string[];
}

export class GeminiService {
  async analyzeFeedback(feedbackData: FeedbackAnalysisInput): Promise<string> {
    try {
      const prompt = `
Analise os seguintes dados de feedback de uma sessão de mentoria e forneça insights valiosos:

Dados da sessão:
- Nota do encontro (0-10): ${feedbackData.meetingRating}
- Experiência relatada: "${feedbackData.experience}"
- Nota de engajamento da dupla (0-10): ${feedbackData.engagementRating}
- Comentários adicionais: "${feedbackData.comments}"

Forneça uma análise concisa e construtiva em português brasileiro que inclua:
1. Uma avaliação geral do progresso da dupla
2. Pontos positivos identificados
3. Áreas que necessitam atenção (se houver)
4. Recomendações específicas para melhorar a mentoria

Mantenha a resposta entre 50-100 palavras, sendo profissional e encorajadora.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const analysis = response.text || "Análise de IA temporariamente indisponível";
      return analysis.trim();
    } catch (error) {
      console.error('Error analyzing feedback with Gemini:', error);
      
      // Handle rate limit errors gracefully
      if (error.status === 429) {
        return "Análise de IA temporariamente indisponível devido ao limite de requisições. Tente novamente em alguns minutos.";
      }
      
      // For other errors, return a fallback message
      return "Análise de IA temporariamente indisponível. Verifique os dados fornecidos.";
    }
  }

  async analyzeDetailedFeedback(feedbackData: FeedbackAnalysisInput): Promise<FeedbackAnalysisResult> {
    try {
      const systemPrompt = `Você é um especialista em análise de programas de mentoria. 
Analise o feedback fornecido e retorne uma avaliação estruturada em JSON.
Responda em português brasileiro, sendo construtivo e específico.`;

      const userPrompt = `
Analise esta sessão de mentoria:
- Nota do encontro: ${feedbackData.meetingRating}/10
- Experiência: "${feedbackData.experience}"
- Engajamento da dupla: ${feedbackData.engagementRating}/10
- Comentários: "${feedbackData.comments}"

Forneça uma análise estruturada.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              analysis: { 
                type: "string",
                description: "Análise geral da sessão (50-80 palavras)"
              },
              sentiment: { 
                type: "string",
                enum: ["positive", "neutral", "negative"],
                description: "Sentimento geral do feedback"
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Lista de recomendações específicas"
              },
              attentionPoints: {
                type: "array",
                items: { type: "string" },
                description: "Pontos que requerem atenção"
              }
            },
            required: ["analysis", "sentiment", "recommendations", "attentionPoints"]
          }
        },
        contents: userPrompt,
      });

      const rawJson = response.text;
      
      if (rawJson) {
        const result: FeedbackAnalysisResult = JSON.parse(rawJson);
        return result;
      } else {
        throw new Error("Empty response from Gemini model");
      }
    } catch (error) {
      console.error('Error with detailed feedback analysis:', error);
      
      // Fallback analysis based on ratings
      const fallbackAnalysis = this.generateFallbackAnalysis(feedbackData);
      return fallbackAnalysis;
    }
  }

  private generateFallbackAnalysis(feedbackData: FeedbackAnalysisInput): FeedbackAnalysisResult {
    const { meetingRating, engagementRating, experience, comments } = feedbackData;
    
    // Determine sentiment based on ratings
    const avgRating = (meetingRating + engagementRating) / 2;
    let sentiment: 'positive' | 'neutral' | 'negative';
    
    if (avgRating >= 8) sentiment = 'positive';
    else if (avgRating >= 6) sentiment = 'neutral';
    else sentiment = 'negative';

    // Generate basic analysis
    let analysis = '';
    if (avgRating >= 8) {
      analysis = 'A dupla demonstra excelente progresso com avaliações positivas. A mentoria está sendo eficaz e o engajamento é alto.';
    } else if (avgRating >= 6) {
      analysis = 'A dupla apresenta progresso satisfatório. Há oportunidades de melhoria na dinâmica da mentoria.';
    } else {
      analysis = 'A dupla necessita atenção especial. As avaliações indicam desafios que devem ser abordados prioritariamente.';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (meetingRating < 7) {
      recommendations.push('Revisar a estrutura e dinâmica dos encontros');
    }
    if (engagementRating < 7) {
      recommendations.push('Trabalhar estratégias para aumentar o engajamento');
    }
    if (avgRating >= 8) {
      recommendations.push('Manter a qualidade atual dos encontros');
      recommendations.push('Considerar desafios mais avançados');
    }

    // Generate attention points
    const attentionPoints: string[] = [];
    if (comments.toLowerCase().includes('problema') || comments.toLowerCase().includes('dificuldade')) {
      attentionPoints.push('Questões específicas mencionadas nos comentários');
    }
    if (meetingRating <= 5) {
      attentionPoints.push('Baixa satisfação com os encontros');
    }
    if (engagementRating <= 5) {
      attentionPoints.push('Baixo engajamento da dupla');
    }

    return {
      analysis,
      sentiment,
      recommendations: recommendations.length > 0 ? recommendations : ['Continuar monitorando o progresso'],
      attentionPoints: attentionPoints.length > 0 ? attentionPoints : []
    };
  }

  async generateBulkFeedback(feedbackList: FeedbackAnalysisInput[]): Promise<string[]> {
    const results: string[] = [];
    
    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < feedbackList.length; i += batchSize) {
      const batch = feedbackList.slice(i, i + batchSize);
      
      const batchPromises = batch.map(feedback => this.analyzeFeedback(feedback));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch analysis failed:', result.reason);
          results.push('Erro na análise de IA para este feedback');
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < feedbackList.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  async analyzeProgramTrends(programData: { 
    programName: string; 
    feedbackList: FeedbackAnalysisInput[] 
  }): Promise<string> {
    try {
      const avgMeetingRating = programData.feedbackList.reduce((sum, f) => sum + f.meetingRating, 0) / programData.feedbackList.length;
      const avgEngagementRating = programData.feedbackList.reduce((sum, f) => sum + f.engagementRating, 0) / programData.feedbackList.length;
      
      const prompt = `
Analise as tendências do programa de mentoria "${programData.programName}":

Estatísticas gerais:
- Total de sessões: ${programData.feedbackList.length}
- Média de avaliação dos encontros: ${avgMeetingRating.toFixed(1)}/10
- Média de engajamento: ${avgEngagementRating.toFixed(1)}/10

Principais comentários e experiências:
${programData.feedbackList.slice(0, 10).map((f, i) => `${i+1}. "${f.experience}" (Nota: ${f.meetingRating})`).join('\n')}

Forneça uma análise das tendências do programa em 100-150 palavras, incluindo:
1. Avaliação geral da performance do programa
2. Padrões identificados
3. Recomendações estratégicas para melhoria
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Análise de tendências temporariamente indisponível";
    } catch (error) {
      console.error('Error analyzing program trends:', error);
      throw new Error(`Failed to analyze program trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
