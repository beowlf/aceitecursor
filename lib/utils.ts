import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pendente: "bg-gray-100 text-gray-800",
    aceito: "bg-blue-100 text-blue-800",
    em_andamento: "bg-yellow-100 text-yellow-800",
    aguardando_correcao: "bg-orange-100 text-orange-800",
    corrigido: "bg-purple-100 text-purple-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: "Administrador",
    responsavel: "Responsável",
    elaborador: "Elaborador",
  };
  return labels[role] || role;
}






