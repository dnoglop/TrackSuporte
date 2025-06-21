import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";

export default function Header() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <motion.header 
      className="bg-white border-b border-gray-200 px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard de Acompanhamento de Mentorias
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Acompanhe o progresso do seu programa de mentoria
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bell className="w-5 h-5" />
          </motion.button>
          <motion.button 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          <span className="text-sm text-gray-500 capitalize">{currentDate}</span>
        </div>
      </div>
    </motion.header>
  );
}
