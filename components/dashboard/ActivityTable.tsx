'use client';

import { Search, Filter, MoreVertical } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Trabalho } from '@/types/database';

interface ActivityTableProps {
  atividades: Array<{
    id: string;
    order_id: string;
    atividade: string;
    preco: number;
    status: string;
    data: string;
  }>;
}

export default function ActivityTable({ atividades }: ActivityTableProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={18} />
            Filtro
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID do Pedido</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Atividade</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Preço</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {atividades.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{item.order_id}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{item.atividade}</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  R$ {item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.data)}</td>
                <td className="py-3 px-4">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}






