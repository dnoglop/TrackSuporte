import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartData } from "@/lib/types";
import { MessageSquare, Users, TrendingUp } from "lucide-react";

interface ChartsSectionProps {
  charts: ChartData;
}

export default function ChartsSection({ charts }: ChartsSectionProps) {
  const sentimentColors = {
    positive: '#10B981',
    neutral: '#F59E0B', 
    negative: '#EF4444'
  };



  return (
    <div className="space-y-6">
      {/* First Row - Main Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {/* Evaluation Chart */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Avaliação da Mentoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={charts.evaluation} 
                layout="horizontal" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[0, 'dataMax + 20']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [value, 'Respostas']}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  radius={[0, 4, 4, 0]}
                  stroke="#1E40AF"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Program Funnel Chart */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Funil do Programa</h3>
          <div className="h-64">
            <div className="space-y-4">
              {charts.programFunnel.map((stage, index) => {
                const colors = ['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'];
                return (
                  <motion.div 
                    key={stage.stage}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                      <span className="text-sm text-gray-500">{stage.count} duplas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <motion.div 
                        className={`${colors[index]} h-8 rounded-full flex items-center justify-center text-white text-xs font-medium`}
                        style={{ width: `${Math.max(stage.percentage, 10)}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(stage.percentage, 10)}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                      >
                        {stage.count}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Second Row - Additional Analysis Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        {/* Comments Analysis Chart */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Análise de Comentários</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.commentsAnalysis}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {charts.commentsAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sentimentColors[entry.sentiment]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {charts.commentsAnalysis.map((item, index) => (
              <motion.div 
                key={item.category}
                className="flex items-center justify-between"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: sentimentColors[item.sentiment] }}
                  />
                  <span className="text-sm text-gray-700">{item.category}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mentor vs Mentee Analysis */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-medium text-gray-900">Mentores vs Mentorados</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.mentorVsMentee}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userType" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}/10`, 
                    name === 'averageRating' ? 'Nota Média' : name
                  ]}
                />
                <Bar 
                  dataKey="averageRating" 
                  fill="hsl(249, 83%, 67%)" 
                  radius={[4, 4, 0, 0]}
                  name="Nota Média"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {charts.mentorVsMentee.map((item, index) => (
              <motion.div 
                key={item.userType}
                className="text-center p-3 bg-gray-50 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="text-xs text-gray-500 uppercase tracking-wide">{item.userType}</div>
                <div className="text-lg font-semibold text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-600">respostas</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
