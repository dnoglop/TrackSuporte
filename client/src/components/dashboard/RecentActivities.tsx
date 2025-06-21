import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Sparkles, User } from "lucide-react";
import { ActivityData } from "@/lib/types";

interface RecentActivitiesProps {
  activities: ActivityData[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
        <motion.button 
          className="text-sm text-primary hover:text-primary/80 font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Ver todas
        </motion.button>
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
        <div>DUPLA</div>
        <div>DATA</div>
        <div>DESTAQUE</div>
        <div>PONTO DE ATENÇÃO</div>
        <div>FEEDBACK IA</div>
      </div>

      <div className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma atividade recente encontrada
          </div>
        ) : (
          activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.005 }}
            >
              {/* Dupla Column */}
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.dupla}</p>
                </div>
              </div>

              {/* Data Column */}
              <div className="flex items-center">
                <time className="text-sm text-gray-600">{activity.data}</time>
              </div>

              {/* Destaque Column */}
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-sm text-gray-700 truncate" title={activity.destaque}>
                  {activity.destaque}
                </p>
              </div>

              {/* Ponto de Atenção Column */}
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <p className="text-sm text-gray-700 truncate" title={activity.pontoAtencao}>
                  {activity.pontoAtencao}
                </p>
              </div>

              {/* AI Feedback Column */}
              <div className="flex items-center space-x-2">
                <motion.div 
                  className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700 truncate" title={activity.feedbackIA}>
                    {activity.feedbackIA}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
