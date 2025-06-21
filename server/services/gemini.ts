// server/services/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set.");
}

// Correção: usar GoogleGenerativeAI em vez de GoogleGenAI
const genAI = new GoogleGenerativeAI(apiKey);

export interface FeedbackAnalysisInput {
  meetingRating: number;
  experience: string;
  engagementRating: number;
  comments: string;
}

export interface FeedbackAnalysisResult {
  analysis: string;
  sentiment: "positivo" | "neutro" | "negativo";
  sentimentScore: number; // 1-10 onde 1-3=negativo, 4-7=neutro, 8-10=positivo
}

export class GeminiService {
  async analyzeFeedback(
    feedbackData: FeedbackAnalysisInput,
  ): Promise<FeedbackAnalysisResult> {
    if (!feedbackData.experience && !feedbackData.comments) {
      return {
        analysis:
          "Não foi possível gerar análise pois não há comentários ou descrição da experiência.",
        sentiment: "neutro",
        sentimentScore: 5,
      };
    }

    try {
      const prompt = `
Analise os seguintes dados de feedback de uma sessão de mentoria e forneça insights valiosos:

Dados da sessão:
- Nota do encontro (0-10): ${feedbackData.meetingRating}
- Experiência relatada: "${feedbackData.experience}"
- Nota de engajamento da dupla (0-10): ${feedbackData.engagementRating}
- Comentários adicionais: "${feedbackData.comments}"

IMPORTANTE: Retorne sua resposta em formato JSON válido com a seguinte estrutura:
{
  "analysis": "sua análise aqui",
  "sentiment": "positivo|neutro|negativo",
  "sentimentScore": número_de_1_a_10
}

Para a análise, forneça uma análise concisa e construtiva em português brasileiro que inclua:
1. Uma avaliação geral do progresso da dupla
2. Pontos positivos identificados
3. Áreas que necessitam atenção (se houver)
4. Recomendações específicas para melhorar a mentoria

Para o sentiment:
- "positivo": feedback majoritariamente positivo, notas altas, comentários encorajadores
- "neutro": feedback misto ou moderado, sem tendência clara
- "negativo": feedback com críticas, notas baixas, insatisfação expressa

Para sentimentScore:
- 1-3: Negativo (notas baixas, muitas críticas, insatisfação)
- 4-7: Neutro (feedback moderado, misto)
- 8-10: Positivo (notas altas, elogios, satisfação)

Mantenha a análise entre 50-100 palavras, sendo profissional e encorajadora.
Retorne APENAS o JSON, sem texto adicional.
`;

      // Correção: usar o nome correto do modelo
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Correção: usar generateContent diretamente
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();

      try {
        // Tentar fazer parse do JSON retornado pela IA
        const analysisResult = JSON.parse(text);

        // Validar se tem as propriedades necessárias
        if (
          !analysisResult.analysis ||
          !analysisResult.sentiment ||
          !analysisResult.sentimentScore
        ) {
          throw new Error(
            "Resposta da IA não contém todos os campos necessários",
          );
        }

        // Garantir que o sentiment é válido
        if (
          !["positivo", "neutro", "negativo"].includes(analysisResult.sentiment)
        ) {
          analysisResult.sentiment = "neutro";
        }

        // Garantir que o score está no range correto
        if (
          analysisResult.sentimentScore < 1 ||
          analysisResult.sentimentScore > 10
        ) {
          analysisResult.sentimentScore = 5;
        }

        return analysisResult;
      } catch (parseError) {
        console.error("Erro ao fazer parse da resposta da IA:", parseError);
        console.error("Resposta recebida:", text);

        // Fallback: tentar extrair informações básicas da resposta
        return {
          analysis:
            text.length > 0
              ? text
              : "Análise não pôde ser processada adequadamente.",
          sentiment: "neutro",
          sentimentScore: 5,
        };
      }
    } catch (error: any) {
      console.error("ERRO DETALHADO AO CHAMAR A API DO GEMINI:", error);
      return {
        analysis: "Análise de IA temporariamente indisponível.",
        sentiment: "neutro",
        sentimentScore: 5,
      };
    }
  }
}

export const geminiService = new GeminiService();
