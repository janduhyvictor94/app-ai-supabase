import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, trend, colorClass = "bg-white" }) => {
  return (
    <div className={`${colorClass} rounded-xl shadow-sm p-6 border border-gray-200 flex items-start justify-between`}>
      <div>
        <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
        {trend && <p className="text-xs text-gray-600 mt-2 font-medium">{trend}</p>}
      </div>
      <div className="p-3 bg-white/60 rounded-lg border border-gray-200">
        <Icon className="w-6 h-6 text-agri-800" />
      </div>
    </div>
  );
};