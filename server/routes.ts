import type { Express } from "express";
import { createServer, type Server } from "http";
import { googleSheetsService } from "./services/googleSheets";
import { geminiService } from "./services/gemini";
import { z } from "zod";
import { dashboardFilters } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard data
  app.get("/api/dashboard-data", async (req, res) => {
    try {
      const { programa, notaEncontro } = req.query;
      
      // Validate query parameters
      const filters = dashboardFilters.parse({
        programa: programa as string,
        notaEncontro: notaEncontro as string,
      });

      const rawData = await googleSheetsService.fetchData();
      
      // Apply filters
      let filteredData = rawData;
      
      if (filters.programa) {
        filteredData = filteredData.filter(row => 
          row.program.toLowerCase().includes(filters.programa!.toLowerCase())
        );
      }
      
      if (filters.notaEncontro) {
        const [min, max] = filters.notaEncontro.split('-').map(Number);
        filteredData = filteredData.filter(row => {
          const rating = parseInt(row.meetingRating);
          return rating >= min && rating <= max;
        });
      }

      // Calculate KPIs
      const totalRespostas = filteredData.length;
      
      // Get unique pairs (assuming mentor-mentee pairs based on program and names)
      const uniquePairs = new Set();
      filteredData.forEach(row => {
        const pairKey = `${row.program}-${row.fullName}`;
        uniquePairs.add(pairKey);
      });
      const duplasAtivas = uniquePairs.size;
      
      // Calculate average meetings
      const totalMeetings = filteredData.reduce((sum, row) => sum + parseInt(row.meetingsCount || '0'), 0);
      const mediaEncontros = duplasAtivas > 0 ? parseFloat((totalMeetings / duplasAtivas).toFixed(1)) : 0;
      
      // Count pairs with attention points (based on low ratings or negative feedback)
      const duplasAtencao = filteredData.filter(row => {
        const rating = parseInt(row.meetingRating);
        const engagementRating = parseInt(row.engagementRating);
        return rating < 7 || engagementRating < 7 || 
               row.comments.toLowerCase().includes('problema') ||
               row.comments.toLowerCase().includes('dificuldade');
      }).length;

      // Generate evaluation chart data
      const ratingCounts = { '0-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 };
      filteredData.forEach(row => {
        const rating = parseInt(row.meetingRating);
        if (rating >= 0 && rating <= 4) ratingCounts['0-4']++;
        else if (rating >= 5 && rating <= 6) ratingCounts['5-6']++;
        else if (rating >= 7 && rating <= 8) ratingCounts['7-8']++;
        else if (rating >= 9 && rating <= 10) ratingCounts['9-10']++;
      });

      const evaluation = [
        { name: 'Insatisfatório', value: ratingCounts['0-4'] },
        { name: 'Regular', value: ratingCounts['5-6'] },
        { name: 'Bom', value: ratingCounts['7-8'] },
        { name: 'Excelente', value: ratingCounts['9-10'] },
      ];

      // Generate program funnel data (based on meetings count)
      const funnelData = { 'Não iniciou': 0, 'Início': 0, 'Meio': 0, 'Fim': 0 };
      filteredData.forEach(row => {
        const meetings = parseInt(row.meetingsCount);
        if (meetings === 0) funnelData['Não iniciou']++;
        else if (meetings >= 1 && meetings <= 3) funnelData['Início']++;
        else if (meetings >= 4 && meetings <= 7) funnelData['Meio']++;
        else funnelData['Fim']++;
      });

      const total = Object.values(funnelData).reduce((sum, count) => sum + count, 0);
      const programFunnel = Object.entries(funnelData).map(([stage, count]) => ({
        stage,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));

      // Generate comments analysis
      const commentsAnalysis = [
        { category: 'Positivos', count: 0, sentiment: 'positive' as const },
        { category: 'Neutros', count: 0, sentiment: 'neutral' as const },
        { category: 'Negativos', count: 0, sentiment: 'negative' as const },
      ];

      filteredData.forEach(row => {
        const comment = row.comments.toLowerCase();
        const experience = row.experience.toLowerCase();
        const rating = parseInt(row.meetingRating);

        if (rating >= 8 || comment.includes('excelente') || comment.includes('ótimo') || experience.includes('positiva')) {
          commentsAnalysis[0].count++;
        } else if (rating <= 5 || comment.includes('problema') || comment.includes('dificuldade') || experience.includes('ruim')) {
          commentsAnalysis[2].count++;
        } else {
          commentsAnalysis[1].count++;
        }
      });

      // Generate mentor vs mentee analysis
      const mentorData = filteredData.filter(row => row.userType.toLowerCase().includes('mentor'));
      const menteeData = filteredData.filter(row => row.userType.toLowerCase().includes('mentee') || row.userType.toLowerCase().includes('jovem'));

      const mentorVsMentee = [
        {
          userType: 'Mentores',
          averageRating: mentorData.length > 0 ? 
            mentorData.reduce((sum, row) => sum + parseInt(row.meetingRating), 0) / mentorData.length : 0,
          count: mentorData.length
        },
        {
          userType: 'Mentorados',
          averageRating: menteeData.length > 0 ? 
            menteeData.reduce((sum, row) => sum + parseInt(row.meetingRating), 0) / menteeData.length : 0,
          count: menteeData.length
        }
      ];

      // Get recent activities (last 5 entries)
      const recentEntries = filteredData
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      const activities = await Promise.all(
        recentEntries.map(async (entry, index) => {
          let aiFeedback = entry.aiFeedback;
          
          // Generate AI feedback if not present
          if (!aiFeedback) {
            try {
              aiFeedback = await geminiService.analyzeFeedback({
                meetingRating: parseInt(entry.meetingRating),
                experience: entry.experience,
                engagementRating: parseInt(entry.engagementRating),
                comments: entry.comments,
              });
              
              // Update the sheet with AI feedback
              await googleSheetsService.updateAIFeedback(index, aiFeedback);
            } catch (error) {
              console.error('Error generating AI feedback:', error);
              aiFeedback = 'Análise de IA temporariamente indisponível';
            }
          }

          return {
            id: `${entry.timestamp}-${entry.email}`,
            dupla: entry.fullName,
            data: new Date(entry.timestamp).toLocaleString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            destaque: entry.experience,
            pontoAtencao: entry.comments || 'Nenhum ponto de atenção identificado',
            feedbackIA: aiFeedback,
            mentorAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`,
            menteeAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`,
          };
        })
      );

      const responseData = {
        kpis: {
          totalRespostas,
          duplasAtivas,
          mediaEncontros,
          duplasAtencao,
        },
        charts: {
          evaluation,
          programFunnel,
          commentsAnalysis,
          mentorVsMentee,
        },
        activities,
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get filter options
  app.get("/api/filter-options", async (req, res) => {
    try {
      const rawData = await googleSheetsService.fetchData();
      
      const programas = Array.from(new Set(rawData.map(row => row.program).filter(Boolean)));
      
      res.json({
        programas,
        notasEncontro: [
          { value: '9-10', label: 'Excelente (9-10)' },
          { value: '7-8', label: 'Bom (7-8)' },
          { value: '5-6', label: 'Regular (5-6)' },
          { value: '0-4', label: 'Ruim (0-4)' },
        ],
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({ 
        error: 'Failed to fetch filter options',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
