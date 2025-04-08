
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: ptBR });
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Função para formatar o status de pagamento
export function formatPaymentStatus(status: string) {
  switch (status) {
    case "paid":
      return "Pago";
    case "pending":
      return "Pendente";
    case "overdue":
      return "Atrasado";
    default:
      return status;
  }
}

// Função para obter classe CSS para o status de pagamento
export function getStatusColorClass(status: string) {
  switch (status) {
    case "paid":
    case "Pago":
      return "text-green-600";
    case "pending":
    case "Pendente":
      return "text-amber-600";
    case "overdue":
    case "Atrasado":
    case "Não Pago":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}
