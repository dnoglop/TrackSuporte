// client/src/components/dashboard/FiltersSection.tsx

import { motion } from "framer-motion";
import { FilterX, RefreshCw, Sparkles } from "lucide-react";
import {
  useQueryClient,
  useIsFetching,
  useMutation,
} from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardFilters, FilterOptions } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  isLoading,
}: FiltersSectionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isFetchingData =
    useIsFetching({ queryKey: ["/api/dashboard-data"] }) > 0;
  const isFetchingOptions =
    useIsFetching({ queryKey: ["/api/filter-options"] }) > 0;
  const isUpdating = isFetchingData || isFetchingOptions;

  const handleRefresh = () => {
    toast({
      title: "Atualizando dados...",
      description: "Buscando as informações mais recentes da planilha.",
    });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard-data"] });
    queryClient.invalidateQueries({ queryKey: ["/api/filter-options"] });
  };

  const processSheetsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/process-all-sheets"),
    onMutate: () => {
      toast({
        title: "Iniciando Processamento em Lote",
        description:
          "A IA está analisando todas as respostas. Isso pode levar vários minutos. Você pode continuar usando o dashboard.",
        duration: 10000,
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Processamento Concluído!",
        description: `Foram geradas ${data.processedRows || 0} novas análises. Clique em 'Atualizar' para ver os resultados.`,
        duration: 10000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-data"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Processamento",
        description: `Ocorreu um erro: ${error.message}. Tente novamente.`,
        variant: "destructive",
      });
    },
  });

  const handleProcessSheets = () => {
    processSheetsMutation.mutate();
  };

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
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programa
          </label>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <Select
              value={filters.programa || "all"}
              onValueChange={handleProgramaChange}
            >
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
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nota do Encontro
          </label>
          {isLoading ? (
            <Skeleton className="h-10 w-full rounded-md" />
          ) : (
            <Select
              value={filters.notaEncontro || "all"}
              onValueChange={handleNotaChange}
            >
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
          )}
        </div>
        <div className="flex items-end space-x-2">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="flex items-center"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Limpar
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isUpdating}
            className="flex items-center"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isUpdating ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          <Button
            variant="default"
            onClick={handleProcessSheets}
            disabled={processSheetsMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Sparkles
              className={`w-4 h-4 mr-2 ${
                processSheetsMutation.isPending ? "animate-spin" : ""
              }`}
            />
            Gerar Análises IA
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
