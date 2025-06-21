export interface KpiData {
  totalRespostas: number;
  duplasAtivas: number;
  mediaEncontros: number;
  duplasAtencao: number;
}

export interface ChartData {
  evaluation: Array<{
    name: string;
    value: number;
  }>;
  programFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  commentsAnalysis: Array<{
    category: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  mentorVsMentee: Array<{
    userType: string;
    averageRating: number;
    count: number;
  }>;
}

export interface ActivityData {
  id: string;
  dupla: string;
  data: string;
  destaque: string;
  pontoAtencao: string;
  feedbackIA: string;
  mentorAvatar: string;
  menteeAvatar: string;
}

export interface DashboardData {
  kpis: KpiData;
  charts: ChartData;
  activities: ActivityData[];
}

export interface FilterOptions {
  programas: string[];
  notasEncontro: Array<{
    value: string;
    label: string;
  }>;
}

export interface DashboardFilters {
  programa?: string;
  notaEncontro?: string;
}
