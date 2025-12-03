
export const ActivityType = {
  ADUBACAO: 'Adubação',
  PODA: 'Poda',
  DESPONTE: 'Desponte',
  TOALET: 'Toalet/Limpeza',
  PULVERIZACAO: 'Pulverização',
  OUTROS: 'Outros'
};

export type ActivityTypeStr = string;

export enum UnitType {
  KG = 'kg',
  LITRO = 'L',
  UNIDADE = 'un',
  SACO = 'sc',
  CX = 'cx' // Caixa
}

export interface Plot {
  id: string;
  name: string;
  crop: string; // e.g., Manga, Goiaba
  area: number; // em hectares
}

export interface Product {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: UnitType;
  category: string; // Changed to string to allow custom categories
}

export interface ActivityItem {
  productId: string;
  quantity: number;
}

export interface Activity {
  id: string;
  plotId: string;
  date: string;
  type: string; // Changed to string to allow custom types
  status: 'completed' | 'planned'; // New field for planning
  description: string;
  laborCost: number; // Custo de mão de obra/serviço
  productsUsed: ActivityItem[];
  totalCost: number; // Calculado (labor + products)
}

export interface Harvest {
  id: string;
  plotId: string;
  date: string;
  cropType: string; // Manga or Goiaba snapshot
  classification: string; // Exportação, Mercado, Arrastão, etc.
  quantity: number; 
  unit: UnitType;
  unitPrice: number; // Price per unit/kg
  totalRevenue: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  plotSummaries: {
    plotId: string;
    plotName: string;
    cost: number;
    revenue: number;
    profit: number;
  }[];
}
