// server/routes.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { googleSheetsService } from "./services/googleSheets.js";
import {
  geminiService,
  FeedbackAnalysisInput,
  FeedbackAnalysisResult,
} from "./services/gemini.js";
import { dashboardFilters } from "@shared/schema";

// Função para converter datas do formato "dd/mm/aaaa hh:mm:ss" para um objeto Date.
function parseBrazilianDate(dateString: string): Date {
  if (
    !dateString ||
    typeof dateString !== "string" ||
    !dateString.includes("/")
  ) {
    return new Date(0);
  }
  try {
    const [datePart, timePart] = dateString.split(" ");
    if (!datePart) return new Date(0);
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = (timePart || "0:0:0")
      .split(":")
      .map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return new Date(0);
    const date = new Date(year, month - 1, day, hours, minutes, seconds);
    if (isNaN(date.getTime())) return new Date(0);
    return date;
  } catch (e) {
    return new Date(0);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/dashboard-data", async (req, res) => {
    try {
      const { programa, notaEncontro } = req.query;
      const filters = dashboardFilters.parse({
        programa: programa as string,
        notaEncontro: notaEncontro as string,
      });

      const rawData = await googleSheetsService.fetchData();
      let filteredData = rawData;

      if (filters.programa) {
        filteredData = filteredData.filter((row) =>
          row.program.toLowerCase().includes(filters.programa!.toLowerCase()),
        );
      }
      if (filters.notaEncontro) {
        const [min, max] = filters.notaEncontro.split("-").map(Number);
        filteredData = filteredData.filter((row) => {
          const rating = parseInt(row.meetingRating);
          return !isNaN(rating) && rating >= min && rating <= max;
        });
      }

      // ==========================================================
      // CORREÇÕES NOS CÁLCULOS DE KPIS E GRÁFICOS
      // ==========================================================

      // KPIs
      const totalRespostas = filteredData.length;
      const duplasAtivas = new Set(filteredData.map((d) => d.email)).size; // Usando email como ID único da dupla
      const duplasAtencao = filteredData.filter(
        (row) =>
          parseInt(row.meetingRating) < 7 || parseInt(row.engagementRating) < 7,
      ).length;

      // ✅ 1. Média de Encontros (Média da coluna J - meetingDuration)
      const durations = filteredData
        .map((row) => parseInt(row.meetingDuration))
        .filter((d) => !isNaN(d) && d > 0);
      const mediaEncontros =
        durations.length > 0
          ? parseFloat(
              (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(
                1,
              ),
            )
          : 0;

      // Gráficos

      // ✅ 2. Avaliação da Mentoria (Gráfico de Barras Horizontais)
      const ratingCounts = { Excelente: 0, Bom: 0, Ruim: 0, Insatisfeito: 0 };
      filteredData.forEach((row) => {
        const rating = parseInt(row.meetingRating);
        if (!isNaN(rating)) {
          if (rating >= 9) ratingCounts["Excelente"]++;
          else if (rating >= 8) ratingCounts["Bom"]++;
          else if (rating >= 6) ratingCounts["Ruim"]++;
          else ratingCounts["Insatisfeito"]++;
        }
      });
      const evaluation = Object.entries(ratingCounts).map(([name, value]) => ({
        name,
        value,
      }));

      // ✅ 3. Funil do Programa (Análise da Coluna H - meetingsCount)
      const funnelData = { "Não iniciou": 0, Início: 0, Meio: 0, Fim: 0 };
      const uniqueDuplasForFunnel = new Set();
      filteredData.forEach((row) => {
        if (uniqueDuplasForFunnel.has(row.email)) return; // Contar cada dupla apenas uma vez

        const meetings = parseInt(row.meetingsCount);
        if (isNaN(meetings)) return;

        if (meetings === 0) funnelData["Não iniciou"]++;
        else if (meetings >= 1 && meetings <= 2) funnelData["Início"]++;
        else if (meetings >= 3 && meetings <= 5) funnelData["Meio"]++;
        else if (meetings >= 6) funnelData["Fim"]++;

        uniqueDuplasForFunnel.add(row.email);
      });
      const totalDuplasFunnel = uniqueDuplasForFunnel.size;
      const programFunnel = Object.entries(funnelData).map(
        ([stage, count]) => ({
          stage,
          count,
          percentage:
            totalDuplasFunnel > 0
              ? Math.round((count / totalDuplasFunnel) * 100)
              : 0,
        }),
      );

      // ✅ 4. Mentores vs Mentorados (Análise da Coluna E - userType)
      let mentorCount = 0;
      let menteeCount = 0;
      const uniqueUsersForCount = new Set();
      filteredData.forEach((row) => {
        if (uniqueUsersForCount.has(row.email)) return;

        const userType = row.userType.toLowerCase();
        if (userType.includes("mentor")) {
          mentorCount++;
        } else if (userType.includes("mentorado")) {
          menteeCount++;
        }

        uniqueUsersForCount.add(row.email);
      });
      // O gráfico de barras verticais espera essa estrutura
      const mentorVsMentee = [
        { userType: "Mentores", count: mentorCount },
        { userType: "Mentorados", count: menteeCount },
      ];

      // ✅ 5. Análise de Comentários (Usa o feedback da IA)
      const sentimentCounts = { positivo: 0, neutro: 0, negativo: 0 };
      filteredData.forEach((row) => {
        const aiFeedback = (row.aiFeedback || "").toLowerCase();
        if (aiFeedback.includes("[positivo]")) {
          sentimentCounts.positivo++;
        } else if (aiFeedback.includes("[negativo]")) {
          sentimentCounts.negativo++;
        } else if (aiFeedback.trim() !== "") {
          // Se tiver feedback, mas não for positivo/negativo, é neutro
          sentimentCounts.neutro++;
        }
      });
      const commentsAnalysis = [
        {
          category: "Positivos",
          count: sentimentCounts.positivo,
          sentiment: "positive" as const,
        },
        {
          category: "Neutros",
          count: sentimentCounts.neutro,
          sentiment: "neutral" as const,
        },
        {
          category: "Negativos",
          count: sentimentCounts.negativo,
          sentiment: "negative" as const,
        },
      ];

      // Atividades Recentes
      const recentEntries = filteredData
        .sort(
          (a, b) =>
            parseBrazilianDate(b.timestamp).getTime() -
            parseBrazilianDate(a.timestamp).getTime(),
        )
        .slice(0, 5);
      const activities = recentEntries.map((entry) => ({
        id: `${entry.timestamp}-${entry.email}`,
        dupla: entry.fullName,
        data: parseBrazilianDate(entry.timestamp).toLocaleString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        destaque: entry.experience,
        pontoAtencao: entry.comments,
        feedbackIA: entry.aiFeedback || "Análise IA pendente.",
        mentorAvatar: "",
        menteeAvatar: "",
      }));

      const responseData = {
        kpis: { totalRespostas, duplasAtivas, mediaEncontros, duplasAtencao },
        charts: { evaluation, programFunnel, commentsAnalysis, mentorVsMentee },
        activities,
      };
      res.json(responseData);
    } catch (error: any) {
      console.error("ERRO FATAL NA ROTA /api/dashboard-data:", error);
      res
        .status(500)
        .json({
          error: "Failed to fetch dashboard data",
          details: error.message,
        });
    }
  });

  app.get("/api/filter-options", async (req, res) => {
    /* ... seu código aqui ... */
  });

  app.post("/api/process-all-sheets", async (req, res) => {
    try {
      console.log("Iniciando processamento em lote da planilha...");
      const allData = await googleSheetsService.fetchData();
      let processedCount = 0;

      for (let i = 0; i < allData.length; i++) {
        const row = allData[i];
        if (row.aiFeedback && row.aiFeedback.trim() !== "") {
          continue;
        }

        console.log(`Processando linha ${i + 2}: ${row.fullName}`);

        const feedbackInput: FeedbackAnalysisInput = {
          meetingRating: parseInt(row.meetingRating) || 0,
          experience: row.experience,
          engagementRating: parseInt(row.engagementRating) || 0,
          comments: row.comments,
        };

        const aiResult: FeedbackAnalysisResult =
          await geminiService.analyzeFeedback(feedbackInput);

        const feedbackStringToSave = `[${aiResult.sentiment.toUpperCase()}] [${aiResult.sentimentScore}/10] ${aiResult.analysis}`;

        await googleSheetsService.updateAIFeedback(i, feedbackStringToSave);
        processedCount++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      console.log(
        `Processamento concluído. ${processedCount} linhas atualizadas.`,
      );
      res
        .status(200)
        .json({
          message: "Processamento concluído!",
          processedRows: processedCount,
        });
    } catch (error) {
      console.error("Erro no processamento em lote:", error);
      res.status(500).json({ error: "Falha no processamento em lote." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
