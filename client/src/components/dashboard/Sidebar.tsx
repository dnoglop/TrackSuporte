import { motion } from "framer-motion";
import { 
  Users, 
  BarChart3, 
  GraduationCap, 
  HeartHandshake, 
  FileText, 
  Calendar, 
  Settings,
  MoreHorizontal
} from "lucide-react";

const navigationItems = [
  { icon: BarChart3, label: "Dashboard", href: "#", active: true },
  { icon: Users, label: "Mentores", href: "#" },
  { icon: GraduationCap, label: "Jovens", href: "#" },
  { icon: HeartHandshake, label: "Duplas", href: "#" },
  { icon: FileText, label: "Formulários", href: "#" },
  { icon: Calendar, label: "Agenda", href: "#" },
  { icon: Settings, label: "Configurações", href: "#" },
];

export default function Sidebar() {
  return (
    <motion.aside 
      className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col"
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">MentorTrack</span>
        </motion.div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigationItems.map((item, index) => (
          <motion.a
            key={item.label}
            href={item.href}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              item.active
                ? "text-primary bg-primary/10"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </motion.a>
        ))}
      </nav>

      {/* User Profile */}
      <motion.div 
        className="p-4 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150" 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Carlos Silva</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
