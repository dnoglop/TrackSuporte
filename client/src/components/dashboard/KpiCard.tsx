import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "purple" | "green" | "yellow";
  trend: string;
  trendUp: boolean;
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  yellow: "bg-yellow-100 text-yellow-600",
};

export default function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendUp 
}: KpiCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <motion.p 
            className="text-2xl font-semibold text-gray-900"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            {value}
          </motion.p>
          <p className={`text-xs flex items-center mt-1 ${
            trendUp ? "text-secondary" : "text-warning"
          }`}>
            {trendUp ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            <span>{trend}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
