import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import FiltersSection from "@/components/dashboard/FiltersSection";
import KpiGrid from "@/components/dashboard/KpiGrid";
import ChartsSection from "@/components/dashboard/ChartsSection";
import RecentActivities from "@/components/dashboard/RecentActivities";
import { DashboardData, FilterOptions, DashboardFilters } from "@/lib/types";

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({});

  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard-data', filters.programa, filters.notaEncontro],
  });

  const { data: filterOptions, isLoading: isFiltersLoading } = useQuery<FilterOptions>({
    queryKey: ['/api/filter-options'],
  });

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar dashboard</h1>
          <p className="text-gray-600 mb-4">
            {dashboardError instanceof Error ? dashboardError.message : 'Erro desconhecido'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <motion.div 
          className="p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiltersSection
            filters={filters}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            isLoading={isFiltersLoading}
          />

          {isDashboardLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : dashboardData ? (
            <>
              <KpiGrid kpis={dashboardData.kpis} />
              <ChartsSection charts={dashboardData.charts} />
              <RecentActivities activities={dashboardData.activities} />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum dado disponível</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
