import { motion } from "framer-motion";
import { FilterX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DashboardFilters, FilterOptions } from "@/lib/types";

interface FiltersSectionProps {
  filters: DashboardFilters;
  filterOptions?: FilterOptions;
  onFilterChange: (filters: DashboardFilters) => void;
  isLoading: boolean;
}

export default function FiltersSection({ 
  filters, 
  filterOptions, 
  onFilterChange, 
  isLoading 
}: FiltersSectionProps) {
  const handleProgramaChange = (value: string) => {
    onFilterChange({
      ...filters,
      programa: value === "all" ? undefined : value,
    });
  };

  const handleNotaChange = (value: string) => {
    onFilterChange({
      ...filters,
      notaEncontro: value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programa
          </label>
          {isLoading ? (
            <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          ) : (
            <Select value={filters.programa || "all"} onValueChange={handleProgramaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Programas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Programas</SelectItem>
                {filterOptions?.programas.map((programa) => (
                  <SelectItem key={programa} value={programa}>
                    {programa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nota do Encontro
          </label>
          <Select value={filters.notaEncontro || "all"} onValueChange={handleNotaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as Notas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Notas</SelectItem>
              {filterOptions?.notasEncontro.map((nota) => (
                <SelectItem key={nota.value} value={nota.value}>
                  {nota.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center"
            >
              <FilterX className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
