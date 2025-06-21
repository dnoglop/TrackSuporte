import { motion } from "framer-motion";
import KpiCard from "./KpiCard";
import { FileText, Users, Calendar, AlertTriangle } from "lucide-react";
import { KpiData } from "@/lib/types";

interface KpiGridProps {
  kpis: KpiData;
}

export default function KpiGrid({ kpis }: KpiGridProps) {
  const kpiCards = [
    {
      title: "Total de Respostas",
      value: kpis.totalRespostas,
      icon: FileText,
      color: "blue",
      trend: "+12% desde o último mês",
      trendUp: true,
    },
    {
      title: "Duplas Ativas",
      value: kpis.duplasAtivas,
      icon: Users,
      color: "purple",
      trend: "+3% desde o último mês",
      trendUp: true,
    },
    {
      title: "Média de Encontros",
      value: kpis.mediaEncontros,
      icon: Calendar,
      color: "green",
      trend: "+8% desde o último mês",
      trendUp: true,
    },
    {
      title: "Duplas com Atenção",
      value: kpis.duplasAtencao,
      icon: AlertTriangle,
      color: "yellow",
      trend: "-2 desde o último mês",
      trendUp: false,
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {kpiCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
        >
          <KpiCard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
}
