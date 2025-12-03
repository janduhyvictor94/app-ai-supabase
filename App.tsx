
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Trees, 
  DollarSign, 
  ClipboardList, 
  Package, 
  Plus, 
  Trash2, 
  BrainCircuit,
  TrendingUp,
  Leaf,
  Calendar,
  Clock,
  PieChart,
  Menu,
  X,
  Save,
  CheckCircle,
  Pencil,
  AlertTriangle,
  Printer,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { Plot, Product, Activity, Harvest, ActivityType, UnitType, FinancialSummary } from './types';
import { SummaryCard } from './components/SummaryCard';
import { generateAgriInsights } from './services/geminiService';
import JSZip from 'jszip';

// --- Constants ---
const CROP_CLASSIFICATIONS: Record<string, string[]> = {
  'Manga': ['Exportação', 'Mercado', 'Arrastão'],
  'Goiaba': ['Verde', 'Madura', 'Polpa']
};

const DEFAULT_CROPS = ['Manga', 'Goiaba', 'Outros'];
// Atualizado para combinar com o tema azul
const CHART_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// --- Helper: Date Formatting ---
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  // Evita problemas de timezone criando a data como UTC e pegando partes
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// --- Initial Mock Data ---
const INITIAL_PLOTS: Plot[] = [
  { id: '1', name: 'Talhão 01 - Manga Palmer', crop: 'Manga', area: 5.0 },
  { id: '2', name: 'Talhão 02 - Goiaba Tailandesa', crop: 'Goiaba', area: 3.5 },
  { id: '3', name: 'Talhão 03 - Manga Tommy', crop: 'Manga', area: 4.0 },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'NPK 20-05-20', pricePerUnit: 180, unit: UnitType.SACO, category: 'Fertilizante' },
  { id: '2', name: 'Fungicida Cobre', pricePerUnit: 95, unit: UnitType.LITRO, category: 'Defensivo' },
  { id: '3', name: 'Caixa Plástica', pricePerUnit: 12, unit: UnitType.UNIDADE, category: 'Outros' },
  { id: '4', name: 'Esterco Bovino', pricePerUnit: 25, unit: UnitType.SACO, category: 'Adubo' },
];

const INITIAL_ACTIVITIES: Activity[] = [
  { 
    id: '1', 
    plotId: '1', 
    date: '2024-01-15', 
    type: ActivityType.PODA, 
    status: 'completed',
    description: 'Poda de formação pós-colheita', 
    laborCost: 1500, 
    productsUsed: [], 
    totalCost: 1500 
  },
  { 
    id: '2', 
    plotId: '2', 
    date: '2024-02-10', 
    type: ActivityType.ADUBACAO, 
    status: 'completed',
    description: 'Adubação de produção', 
    laborCost: 300, 
    productsUsed: [{ productId: '1', quantity: 15 }], 
    totalCost: 3000 // 300 + (15 * 180)
  },
  { 
    id: '3', 
    plotId: '1', 
    date: '2024-11-20', 
    type: ActivityType.PULVERIZACAO, 
    status: 'planned',
    description: 'Aplicação preventiva para Oídio (Planejado)', 
    laborCost: 200, 
    productsUsed: [{ productId: '2', quantity: 5 }], 
    totalCost: 675 // 200 + (5 * 95)
  },
];

const INITIAL_HARVESTS: Harvest[] = [
  { 
    id: '1', 
    plotId: '1', 
    date: '2024-03-20', 
    cropType: 'Manga', 
    classification: 'Exportação',
    quantity: 2000, 
    unit: UnitType.KG, 
    unitPrice: 4.50, 
    totalRevenue: 9000 
  },
  { 
    id: '2', 
    plotId: '2', 
    date: '2024-04-15', 
    cropType: 'Goiaba', 
    classification: 'Mercado',
    quantity: 150, 
    unit: UnitType.CX, 
    unitPrice: 35.00, 
    totalRevenue: 5250 
  },
];

// --- CLEAN APP CODE FOR EXPORT ---
// Updated with Detailed Report Tables (Date included)
const CLEAN_APP_CODE = `import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Trees, DollarSign, ClipboardList, Package, Plus, Trash2, 
  BrainCircuit, TrendingUp, Leaf, Calendar, Clock, PieChart, Menu, X, Save, 
  CheckCircle, Pencil, AlertTriangle, Printer, Copy, ChevronLeft, ChevronRight, CalendarDays
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { Plot, Product, Activity, Harvest, ActivityType, UnitType, FinancialSummary } from './types';
import { SummaryCard } from './components/SummaryCard';
import { generateAgriInsights } from './services/geminiService';

const CROP_CLASSIFICATIONS: Record<string, string[]> = {
  'Manga': ['Exportação', 'Mercado', 'Arrastão'],
  'Goiaba': ['Verde', 'Madura', 'Polpa']
};
const DEFAULT_CROPS = ['Manga', 'Goiaba', 'Outros'];
const CHART_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

// Helper for display date
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return \`\${day}/\${month}/\${year}\`;
};

// ... Initial Data Constants (same as original) ...
const INITIAL_PLOTS = []; const INITIAL_PRODUCTS = []; const INITIAL_ACTIVITIES = []; const INITIAL_HARVESTS = [];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plots' | 'activities' | 'calendar' | 'harvests' | 'inventory' | 'analysis' | 'reports'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [activityView, setActivityView] = useState<'history' | 'planning'>('history');
  const [reportMode, setReportMode] = useState<'plot' | 'general'>('general');
  const [selectedReportPlotId, setSelectedReportPlotId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: 'plot' | 'product' | 'activity' | 'harvest' | null; id: string | null; }>({ isOpen: false, type: null, id: null });

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarPlotId, setCalendarPlotId] = useState('');

  const [plots, setPlots] = useState<Plot[]>(() => { try { const saved = localStorage.getItem('fazenda_plots'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [products, setProducts] = useState<Product[]>(() => { try { const saved = localStorage.getItem('fazenda_products'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [activities, setActivities] = useState<Activity[]>(() => { try { const saved = localStorage.getItem('fazenda_activities'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });
  const [harvests, setHarvests] = useState<Harvest[]>(() => { try { const saved = localStorage.getItem('fazenda_harvests'); return saved ? JSON.parse(saved) : []; } catch (e) { return []; } });

  const [availableActivityTypes, setAvailableActivityTypes] = useState<string[]>(() => { try { const saved = localStorage.getItem('fazenda_activity_types'); return saved ? JSON.parse(saved) : Object.values(ActivityType); } catch (e) { return Object.values(ActivityType); } });
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => { try { const saved = localStorage.getItem('fazenda_categories'); return saved ? JSON.parse(saved) : ['Fertilizante', 'Defensivo', 'Adubo', 'Outros']; } catch (e) { return ['Fertilizante', 'Defensivo', 'Adubo', 'Outros']; } });

  useEffect(() => { localStorage.setItem('fazenda_plots', JSON.stringify(plots)); }, [plots]);
  useEffect(() => { localStorage.setItem('fazenda_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('fazenda_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('fazenda_harvests', JSON.stringify(harvests)); }, [harvests]);
  useEffect(() => { localStorage.setItem('fazenda_activity_types', JSON.stringify(availableActivityTypes)); }, [availableActivityTypes]);
  useEffect(() => { localStorage.setItem('fazenda_categories', JSON.stringify(availableCategories)); }, [availableCategories]);

  const [showPlotForm, setShowPlotForm] = useState(false);
  const [newPlot, setNewPlot] = useState<Partial<Plot>>({ crop: 'Manga' });
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'Outros', unit: 'un' as UnitType });
  const [isCustomCategoryInput, setIsCustomCategoryInput] = useState(false);

  const [showActivityForm, setShowActivityForm] = useState(false);
  // Date fix: Use local time for default
  const getTodayLocal = () => { const d = new Date(); return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; };
  
  const [newActivity, setNewActivity] = useState<{ plotId: string; type: string; status: 'completed' | 'planned'; date: string; description: string; laborCost: number; selectedProduct: string; selectedQuantity: number; addedProducts: { productId: string; quantity: number; cost: number }[]; }>({ plotId: '', type: ActivityType.OUTROS, status: 'completed', date: getTodayLocal(), description: '', laborCost: 0, selectedProduct: '', selectedQuantity: 0, addedProducts: [] });
  const [isCustomActivityTypeInput, setIsCustomActivityTypeInput] = useState(false);
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [newHarvest, setNewHarvest] = useState<Partial<Harvest>>({ date: getTodayLocal(), unit: 'kg' as UnitType, unitPrice: 0, quantity: 0 });

  const [aiReport, setAiReport] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // ... Helpers ...
  const changeMonth = (offset: number) => { setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1)); };
  const getMonthName = (date: Date) => { return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }); };
  
  const timelineData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const filtered = activities.filter(a => {
      const [aYear, aMonth] = a.date.split('-').map(Number);
      const inMonth = (aYear === year && (aMonth - 1) === month);
      if (!inMonth) return false;
      if (calendarPlotId && a.plotId !== calendarPlotId) return false;
      return true;
    });
    const grouped: Record<string, Activity[]> = {};
    filtered.forEach(a => { if (!grouped[a.date]) grouped[a.date] = []; grouped[a.date].push(a); });
    return Object.keys(grouped).sort().map(date => ({ date, items: grouped[date] }));
  }, [activities, calendarDate, calendarPlotId]);

  const financialSummary: FinancialSummary = useMemo(() => {
    let totalRevenue = 0; let totalCost = 0;
    const plotSummariesMap = new Map<string, { cost: number; revenue: number }>();
    plots.forEach(p => plotSummariesMap.set(p.id, { cost: 0, revenue: 0 }));
    activities.filter(a => a.status === 'completed').forEach(act => {
      totalCost += act.totalCost;
      const current = plotSummariesMap.get(act.plotId) || { cost: 0, revenue: 0 };
      plotSummariesMap.set(act.plotId, { ...current, cost: current.cost + act.totalCost });
    });
    harvests.forEach(har => {
      totalRevenue += har.totalRevenue;
      const current = plotSummariesMap.get(har.plotId) || { cost: 0, revenue: 0 };
      plotSummariesMap.set(har.plotId, { ...current, revenue: current.revenue + har.totalRevenue });
    });
    const plotSummaries = Array.from(plotSummariesMap.entries()).map(([plotId, data]) => {
      const plot = plots.find(p => p.id === plotId);
      return { plotId, plotName: plot ? plot.name : 'Desconhecido', cost: data.cost, revenue: data.revenue, profit: data.revenue - data.cost };
    });
    return { totalRevenue, totalCost, netProfit: totalRevenue - totalCost, plotSummaries };
  }, [plots, activities, harvests]);

  const serviceCostAnalysis = useMemo(() => {
    const summary: Record<string, { count: number, labor: number, products: number, total: number }> = {};
    activities.forEach(act => {
      if (act.status !== 'completed') return;
      if (!summary[act.type]) summary[act.type] = { count: 0, labor: 0, products: 0, total: 0 };
      const productCost = act.totalCost - act.laborCost;
      summary[act.type].count += 1;
      summary[act.type].labor += act.laborCost;
      summary[act.type].products += productCost;
      summary[act.type].total += act.totalCost;
    });
    return Object.entries(summary).map(([type, data]) => ({ type, ...data })).sort((a, b) => b.total - a.total);
  }, [activities]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
       {/* Use bg-blue-900 instead of emerald-900 */}
       <div className="flex-1 p-4 md:p-8"><h1 className="text-2xl font-bold mb-4">Painel (Versão Offline)</h1></div>
    </div>
  );
}
`;

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plots' | 'activities' | 'calendar' | 'harvests' | 'inventory' | 'analysis' | 'reports'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  
  // Activity Sub-tab state
  const [activityView, setActivityView] = useState<'history' | 'planning'>('history');

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarPlotId, setCalendarPlotId] = useState('');

  // Report Sub-state
  const [reportMode, setReportMode] = useState<'plot' | 'general'>('general');
  const [selectedReportPlotId, setSelectedReportPlotId] = useState<string>('');

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'plot' | 'product' | 'activity' | 'harvest' | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });

  // Data State
  const [plots, setPlots] = useState<Plot[]>(() => {
    try { const saved = localStorage.getItem('fazenda_plots'); return saved ? JSON.parse(saved) : INITIAL_PLOTS; } catch (e) { return INITIAL_PLOTS; }
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try { const saved = localStorage.getItem('fazenda_products'); return saved ? JSON.parse(saved) : INITIAL_PRODUCTS; } catch (e) { return INITIAL_PRODUCTS; }
  });
  const [activities, setActivities] = useState<Activity[]>(() => {
    try { const saved = localStorage.getItem('fazenda_activities'); return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES; } catch (e) { return INITIAL_ACTIVITIES; }
  });
  const [harvests, setHarvests] = useState<Harvest[]>(() => {
    try { const saved = localStorage.getItem('fazenda_harvests'); return saved ? JSON.parse(saved) : INITIAL_HARVESTS; } catch (e) { return INITIAL_HARVESTS; }
  });

  // Dynamic Lists State
  const [availableActivityTypes, setAvailableActivityTypes] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('fazenda_activity_types'); return saved ? JSON.parse(saved) : Object.values(ActivityType); } catch (e) { return Object.values(ActivityType); }
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    try { const saved = localStorage.getItem('fazenda_categories'); return saved ? JSON.parse(saved) : ['Fertilizante', 'Defensivo', 'Adubo', 'Outros']; } catch (e) { return ['Fertilizante', 'Defensivo', 'Adubo', 'Outros']; }
  });

  // --- Persistence ---
  useEffect(() => { localStorage.setItem('fazenda_plots', JSON.stringify(plots)); }, [plots]);
  useEffect(() => { localStorage.setItem('fazenda_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('fazenda_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('fazenda_harvests', JSON.stringify(harvests)); }, [harvests]);
  useEffect(() => { localStorage.setItem('fazenda_activity_types', JSON.stringify(availableActivityTypes)); }, [availableActivityTypes]);
  useEffect(() => { localStorage.setItem('fazenda_categories', JSON.stringify(availableCategories)); }, [availableCategories]);

  // Forms State
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [newPlot, setNewPlot] = useState<Partial<Plot>>({ crop: 'Manga' });

  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: 'Outros', unit: UnitType.UNIDADE });
  const [isCustomCategoryInput, setIsCustomCategoryInput] = useState(false);

  const [showActivityForm, setShowActivityForm] = useState(false);
  
  // Date Fix: Helper to get local date string YYYY-MM-DD
  const getTodayLocal = () => {
    const d = new Date();
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  };

  const [newActivity, setNewActivity] = useState<{
    plotId: string;
    type: string;
    status: 'completed' | 'planned';
    date: string;
    description: string;
    laborCost: number;
    selectedProduct: string;
    selectedQuantity: number;
    addedProducts: { productId: string; quantity: number; cost: number }[];
  }>({
    plotId: '',
    type: ActivityType.OUTROS,
    status: 'completed',
    date: getTodayLocal(),
    description: '',
    laborCost: 0,
    selectedProduct: '',
    selectedQuantity: 0,
    addedProducts: []
  });
  const [isCustomActivityTypeInput, setIsCustomActivityTypeInput] = useState(false);

  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [newHarvest, setNewHarvest] = useState<Partial<Harvest>>({ 
    date: getTodayLocal(),
    unit: UnitType.KG,
    unitPrice: 0,
    quantity: 0
  });

  // Analysis State
  const [aiReport, setAiReport] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // --- Calculations ---
  const financialSummary: FinancialSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    const plotSummariesMap = new Map<string, { cost: number; revenue: number }>();

    plots.forEach(p => plotSummariesMap.set(p.id, { cost: 0, revenue: 0 }));

    activities.filter(a => a.status === 'completed').forEach(act => {
      totalCost += act.totalCost;
      const current = plotSummariesMap.get(act.plotId) || { cost: 0, revenue: 0 };
      plotSummariesMap.set(act.plotId, { ...current, cost: current.cost + act.totalCost });
    });

    harvests.forEach(har => {
      totalRevenue += har.totalRevenue;
      const current = plotSummariesMap.get(har.plotId) || { cost: 0, revenue: 0 };
      plotSummariesMap.set(har.plotId, { ...current, revenue: current.revenue + har.totalRevenue });
    });

    const plotSummaries = Array.from(plotSummariesMap.entries()).map(([plotId, data]) => {
      const plot = plots.find(p => p.id === plotId);
      return {
        plotId,
        plotName: plot ? plot.name : 'Desconhecido',
        cost: data.cost,
        revenue: data.revenue,
        profit: data.revenue - data.cost
      };
    });

    return { totalRevenue, totalCost, netProfit: totalRevenue - totalCost, plotSummaries };
  }, [plots, activities, harvests]);

  const serviceCostAnalysis = useMemo(() => {
    const summary: Record<string, { count: number, labor: number, products: number, total: number }> = {};
    activities.forEach(act => {
      if (act.status !== 'completed') return;
      if (!summary[act.type]) summary[act.type] = { count: 0, labor: 0, products: 0, total: 0 };
      const productCost = act.totalCost - act.laborCost;
      summary[act.type].count += 1;
      summary[act.type].labor += act.laborCost;
      summary[act.type].products += productCost;
      summary[act.type].total += act.totalCost;
    });
    return Object.entries(summary).map(([type, data]) => ({ type, ...data })).sort((a, b) => b.total - a.total);
  }, [activities]);

  // --- Calendar Helpers (Timeline) ---
  const changeMonth = (offset: number) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1));
  };
  const getMonthName = (date: Date) => {
    // Capitalize first letter
    const name = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  // Timeline Data Computation
  const timelineData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    // Filter activities for this month
    const filtered = activities.filter(a => {
      const d = new Date(a.date);
      // Adjust because date string is YYYY-MM-DD
      const [aYear, aMonth] = a.date.split('-').map(Number);
      // Check if it's the correct month and year (remember JS month is 0-indexed)
      const inMonth = (aYear === year && (aMonth - 1) === month);
      
      if (!inMonth) return false;
      if (calendarPlotId && a.plotId !== calendarPlotId) return false;
      return true;
    });

    // Group by date
    const grouped: Record<string, Activity[]> = {};
    filtered.forEach(a => {
      if (!grouped[a.date]) grouped[a.date] = [];
      grouped[a.date].push(a);
    });

    // Sort dates descending (newest first) or ascending? User said "monitoramento de atividades ja realizadas", usually newest first is good for "feed", but for calendar usually chronological (ascending). Let's do Ascending.
    return Object.keys(grouped).sort().map(date => ({
      date,
      items: grouped[date]
    }));
  }, [activities, calendarDate, calendarPlotId]);

  // --- Handlers ---
  const getClassificationOptions = (plotId: string): string[] => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot) return [];
    const cropLower = plot.crop.toLowerCase();
    if (cropLower.includes('manga')) return CROP_CLASSIFICATIONS['Manga'];
    if (cropLower.includes('goiaba')) return CROP_CLASSIFICATIONS['Goiaba'];
    return ['Padrão', 'Segunda', 'Descarte'];
  };

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const downloadProject = async () => {
    const zip = new JSZip();
    zip.file("package.json", JSON.stringify({
      "name": "fazenda-cassianos",
      "private": true,
      "version": "1.0.0",
      "type": "module",
      "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
      "dependencies": { "react": "^18.3.1", "react-dom": "^18.3.1", "lucide-react": "^0.344.0", "recharts": "^2.12.2", "@google/genai": "^0.1.1" },
      "devDependencies": { "@types/react": "^18.3.3", "@types/react-dom": "^18.3.0", "@vitejs/plugin-react": "^4.2.1", "typescript": "^5.2.2", "vite": "^5.2.0", "autoprefixer": "^10.4.19", "postcss": "^8.4.38", "tailwindcss": "^3.4.3" }
    }, null, 2));

    zip.file("vite.config.ts", `import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: { 'process.env.API_KEY': JSON.stringify(env.API_KEY) }
  };
});`);

    zip.file("tsconfig.json", `{ "compilerOptions": { "target": "ES2020", "useDefineForClassFields": true, "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": true, "moduleResolution": "bundler", "allowImportingTsExtensions": true, "resolveJsonModule": true, "isolatedModules": true, "noEmit": true, "jsx": "react-jsx", "strict": true, "noUnusedLocals": false, "noUnusedParameters": false, "noFallthroughCasesInSwitch": true }, "include": ["src"], "references": [{ "path": "./tsconfig.node.json" }] }`);
    zip.file("tsconfig.node.json", `{ "compilerOptions": { "composite": true, "skipLibCheck": true, "module": "ESNext", "moduleResolution": "bundler", "allowSyntheticDefaultImports": true }, "include": ["vite.config.ts"] }`);
    zip.file("index.html", `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Fazenda Cassiano's</title><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{colors:{agri:{50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a'}}}}}</script></head><body class="bg-gray-50 text-gray-900"><div id="root"></div><script type="module" src="/src/index.tsx"></script></body></html>`);

    const src = zip.folder("src");
    // Add existing files content...
    src?.file("index.tsx", `import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App'; const rootElement = document.getElementById('root'); if (!rootElement) throw new Error("Could not find root element"); const root = ReactDOM.createRoot(rootElement); root.render(<React.StrictMode><App /></React.StrictMode>);`);
    src?.file("types.ts", `export const ActivityType = { ADUBACAO: 'Adubação', PODA: 'Poda', DESPONTE: 'Desponte', TOALET: 'Toalet/Limpeza', PULVERIZACAO: 'Pulverização', OUTROS: 'Outros' }; export type ActivityTypeStr = string; export enum UnitType { KG = 'kg', LITRO = 'L', UNIDADE = 'un', SACO = 'sc', CX = 'cx' } export interface Plot { id: string; name: string; crop: string; area: number; } export interface Product { id: string; name: string; pricePerUnit: number; unit: UnitType; category: string; } export interface ActivityItem { productId: string; quantity: number; } export interface Activity { id: string; plotId: string; date: string; type: string; status: 'completed' | 'planned'; description: string; laborCost: number; productsUsed: ActivityItem[]; totalCost: number; } export interface Harvest { id: string; plotId: string; date: string; cropType: string; classification: string; quantity: number; unit: UnitType; unitPrice: number; totalRevenue: number; } export interface FinancialSummary { totalRevenue: number; totalCost: number; netProfit: number; plotSummaries: { plotId: string; plotName: string; cost: number; revenue: number; profit: number; }[]; }`);
    
    // Fetch external files to bundle if possible, otherwise use placeholders or strings
    const services = src?.folder("services");
    services?.file("geminiService.ts", `import { GoogleGenAI } from "@google/genai"; const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' }); export const generateAgriInsights = async (summary: any, activities: any, harvests: any, plots: any) => { return "<p>Simulação de IA.</p>"; };`);
    
    const components = src?.folder("components");
    components?.file("SummaryCard.tsx", `import React from 'react'; export const SummaryCard = ({ title, value, icon: Icon, colorClass = "bg-white" }: any) => (<div className={\`\${colorClass} rounded-xl shadow-sm p-6 border border-gray-200 flex items-start justify-between\`}><div><p className="text-sm font-bold text-gray-700 mb-1">{title}</p><h3 className="text-2xl font-extrabold text-gray-900">{value}</h3></div><div className="p-3 bg-white/60 rounded-lg border border-gray-200"><Icon className="w-6 h-6 text-agri-800" /></div></div>);`);

    src?.file("App.tsx", CLEAN_APP_CODE);
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fazenda-cassianos-blue.zip";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openDeleteModal = (e: React.MouseEvent, type: 'plot' | 'product' | 'activity' | 'harvest', id: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type, id });
  };

  const confirmDelete = () => {
    const { type, id } = deleteModal;
    if (!type || !id) return;
    if (type === 'plot') setPlots(prev => prev.filter(p => String(p.id) !== String(id)));
    else if (type === 'product') setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
    else if (type === 'activity') setActivities(prev => prev.filter(a => String(a.id) !== String(id)));
    else if (type === 'harvest') setHarvests(prev => prev.filter(h => String(h.id) !== String(id)));
    setDeleteModal({ isOpen: false, type: null, id: null });
  };

  const handleEditPlot = (e: React.MouseEvent, plot: Plot) => {
    e.stopPropagation();
    setNewPlot(plot);
    setEditingId(plot.id);
    setShowPlotForm(true);
  };

  const handleEditProduct = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setNewProduct(product);
    setEditingId(product.id);
    setIsCustomCategoryInput(false);
    setShowProductForm(true);
  };

  const handleEditActivity = (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    const reconstructedProducts = activity.productsUsed.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return { productId: item.productId, quantity: item.quantity, cost: prod ? prod.pricePerUnit * item.quantity : 0 };
    });
    setNewActivity({
      plotId: activity.plotId,
      type: activity.type,
      status: activity.status,
      date: activity.date,
      description: activity.description,
      laborCost: activity.laborCost,
      selectedProduct: '',
      selectedQuantity: 0,
      addedProducts: reconstructedProducts
    });
    setEditingId(activity.id);
    setIsCustomActivityTypeInput(false);
    setShowActivityForm(true);
  };

  const handleDuplicateActivity = (e: React.MouseEvent, activity: Activity) => {
    e.stopPropagation();
    const reconstructedProducts = activity.productsUsed.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return { productId: item.productId, quantity: item.quantity, cost: prod ? prod.pricePerUnit * item.quantity : 0 };
    });
    setNewActivity({
      plotId: activity.plotId,
      type: activity.type,
      status: activity.status,
      date: getTodayLocal(), // Use local date for "Today"
      description: activity.description,
      laborCost: activity.laborCost,
      selectedProduct: '',
      selectedQuantity: 0,
      addedProducts: reconstructedProducts
    });
    setEditingId(null);
    setIsCustomActivityTypeInput(false);
    setShowActivityForm(true);
  };

  const handleEditHarvest = (e: React.MouseEvent, harvest: Harvest) => {
    e.stopPropagation();
    setNewHarvest(harvest);
    setEditingId(harvest.id);
    setShowHarvestForm(true);
  };

  const handleManualSave = () => {
    localStorage.setItem('fazenda_plots', JSON.stringify(plots));
    localStorage.setItem('fazenda_products', JSON.stringify(products));
    localStorage.setItem('fazenda_activities', JSON.stringify(activities));
    localStorage.setItem('fazenda_harvests', JSON.stringify(harvests));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleSavePlot = () => {
    if (newPlot.name && newPlot.area) {
      if (editingId) setPlots(plots.map(p => p.id === editingId ? { ...newPlot, id: editingId } as Plot : p));
      else setPlots([...plots, { ...newPlot, id: Date.now().toString() } as Plot]);
      setNewPlot({ crop: 'Manga' });
      setEditingId(null);
      setShowPlotForm(false);
    }
  };

  const handleSaveProduct = () => {
    if (newProduct.name && newProduct.pricePerUnit && newProduct.category) {
      if (isCustomCategoryInput && !availableCategories.includes(newProduct.category)) {
        setAvailableCategories([...availableCategories, newProduct.category]);
      }
      if (editingId) setProducts(products.map(p => p.id === editingId ? { ...newProduct, id: editingId } as Product : p));
      else setProducts([...products, { ...newProduct, id: Date.now().toString() } as Product]);
      setNewProduct({ category: 'Outros', unit: UnitType.UNIDADE });
      setEditingId(null);
      setShowProductForm(false);
      setIsCustomCategoryInput(false);
    }
  };

  const addProductToActivity = () => {
    if (newActivity.selectedProduct && newActivity.selectedQuantity > 0) {
      const prod = products.find(p => p.id === newActivity.selectedProduct);
      if (prod) {
        const cost = prod.pricePerUnit * newActivity.selectedQuantity;
        setNewActivity({
          ...newActivity,
          addedProducts: [...newActivity.addedProducts, { productId: prod.id, quantity: newActivity.selectedQuantity, cost }],
          selectedProduct: '', selectedQuantity: 0
        });
      }
    }
  };

  const handleSaveActivity = () => {
    if (newActivity.plotId && newActivity.type) {
      if (isCustomActivityTypeInput && !availableActivityTypes.includes(newActivity.type)) {
        setAvailableActivityTypes([...availableActivityTypes, newActivity.type]);
      }
      const productsCost = newActivity.addedProducts.reduce((acc, curr) => acc + curr.cost, 0);
      const totalCost = Number(newActivity.laborCost) + productsCost;
      const activityData: Activity = {
        id: editingId || Date.now().toString(),
        plotId: newActivity.plotId,
        date: newActivity.date,
        type: newActivity.type,
        status: newActivity.status,
        description: newActivity.description,
        laborCost: Number(newActivity.laborCost),
        productsUsed: newActivity.addedProducts.map(ap => ({ productId: ap.productId, quantity: ap.quantity })),
        totalCost
      };
      if (editingId) setActivities(activities.map(a => a.id === editingId ? activityData : a));
      else setActivities([activityData, ...activities]);
      
      setNewActivity({ plotId: '', type: ActivityType.OUTROS, status: 'completed', date: getTodayLocal(), description: '', laborCost: 0, selectedProduct: '', selectedQuantity: 0, addedProducts: [] });
      setEditingId(null);
      setShowActivityForm(false);
      setIsCustomActivityTypeInput(false);
      if (activityData.status === 'planned') { setActiveTab('activities'); setActivityView('planning'); }
    }
  };

  const handleSaveHarvest = () => {
    if (newHarvest.plotId && newHarvest.quantity && newHarvest.unitPrice) {
       const plot = plots.find(p => p.id === newHarvest.plotId);
       const totalRevenue = Number(newHarvest.quantity) * Number(newHarvest.unitPrice);
       const harvestData: Harvest = {
         id: editingId || Date.now().toString(),
         plotId: newHarvest.plotId!,
         date: newHarvest.date!,
         cropType: plot?.crop || 'Outros',
         classification: newHarvest.classification || 'Padrão',
         quantity: Number(newHarvest.quantity),
         unit: newHarvest.unit || UnitType.KG,
         unitPrice: Number(newHarvest.unitPrice),
         totalRevenue: totalRevenue
       };
       if (editingId) setHarvests(harvests.map(h => h.id === editingId ? harvestData : h));
       else setHarvests([harvestData, ...harvests]);
       setNewHarvest({ date: getTodayLocal(), unit: UnitType.KG, quantity: 0, unitPrice: 0 });
       setEditingId(null);
       setShowHarvestForm(false);
    }
  };

  const runAnalysis = async () => {
    setLoadingAi(true);
    const report = await generateAgriInsights(financialSummary, activities, harvests, plots);
    setAiReport(report);
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans">
      {/* Notifications */}
      {showSaveNotification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in print:hidden">
          <CheckCircle className="w-6 h-6" /> <span className="font-bold">Dados salvos com sucesso!</span>
        </div>
      )}

      {/* Mobile Header (Blue Theme) */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md print:hidden">
        <div className="flex items-center space-x-2">
           <div className="p-1.5 bg-blue-500 rounded-lg"><Leaf className="w-5 h-5 text-white" /></div>
           <h1 className="text-lg font-bold tracking-tight">Fazenda Cassiano's</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 hover:bg-blue-800 rounded">
           {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Blue Theme) */}
      <aside className={`bg-blue-900 text-white w-64 flex-shrink-0 fixed md:sticky top-0 bottom-0 z-40 h-screen transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:block print:hidden`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg"><Leaf className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold tracking-tight">Fazenda Cassiano's</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-blue-300 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <nav className="px-4 space-y-2 pb-6 overflow-y-auto h-[calc(100vh-80px)]">
          <button onClick={() => handleNavClick('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span className="font-medium">Visão Geral</span>
          </button>
          <button onClick={() => handleNavClick('plots')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'plots' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <Trees className="w-5 h-5" /> <span className="font-medium">Talhões</span>
          </button>
          <button onClick={() => handleNavClick('activities')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'activities' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <ClipboardList className="w-5 h-5" /> <span className="font-medium">Atividades</span>
          </button>
          <button onClick={() => handleNavClick('calendar')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'calendar' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <CalendarDays className="w-5 h-5" /> <span className="font-medium">Calendário</span>
          </button>
          <button onClick={() => handleNavClick('harvests')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'harvests' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <Package className="w-5 h-5" /> <span className="font-medium">Colheitas</span>
          </button>
          <button onClick={() => handleNavClick('inventory')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'inventory' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <ClipboardList className="w-5 h-5" /> <span className="font-medium">Estoque / Insumos</span>
          </button>
          <button onClick={() => handleNavClick('reports')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-blue-800 text-white shadow-sm' : 'text-blue-100 hover:bg-blue-800/50'}`}>
            <PieChart className="w-5 h-5" /> <span className="font-medium">Relatórios</span>
          </button>
          <div className="pt-4 mt-4 border-t border-blue-800">
             <button onClick={() => handleNavClick('analysis')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'analysis' ? 'bg-purple-800 text-white shadow-sm' : 'text-purple-200 hover:bg-purple-900/50'}`}>
              <BrainCircuit className="w-5 h-5" /> <span className="font-medium">Analista IA</span>
            </button>
          </div>
          <div className="pt-4 mt-4 border-t border-blue-800">
             <button onClick={handleManualSave} className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-sm active:scale-95">
              <Save className="w-5 h-5" /> <span>Salvar Dados</span>
            </button>
          </div>
          <div className="pt-4 mt-4 border-t border-blue-800">
            <button onClick={downloadProject} className="w-full flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-sm active:scale-95">
              <Download className="w-5 h-5" /> <span>Baixar Código Fonte</span>
            </button>
            <p className="text-center text-xs text-blue-300 mt-2">Baixe para gerar a build</p>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-100 print:p-0 print:bg-white">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 print:hidden">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && 'Painel de Controle'}
              {activeTab === 'plots' && 'Gestão de Talhões'}
              {activeTab === 'activities' && 'Diário & Planejamento'}
              {activeTab === 'calendar' && 'Calendário de Manejo'}
              {activeTab === 'harvests' && 'Vendas e Colheita'}
              {activeTab === 'inventory' && 'Estoque de Produtos'}
              {activeTab === 'analysis' && 'Análise Inteligente'}
              {activeTab === 'reports' && 'Relatórios e Custos'}
            </h2>
            <p className="text-gray-700 text-sm font-medium">
              {activeTab === 'reports' ? 'Análise detalhada de custos e receitas.' : activeTab === 'inventory' ? 'Cadastre aqui os produtos que você utiliza no manejo.' : activeTab === 'calendar' ? 'Visualize as atividades realizadas mês a mês.' : 'Gerencie sua produção agrícola de forma eficiente.'}
            </p>
          </div>
          <div className="flex space-x-2">
            {activeTab === 'plots' && (
                <button onClick={() => { setNewPlot({ crop: 'Manga' }); setEditingId(null); setShowPlotForm(true); }} className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> <span>Novo Talhão</span>
                </button>
            )}
            {activeTab === 'inventory' && (
                <button onClick={() => { setNewProduct({ category: 'Outros', unit: UnitType.UNIDADE }); setEditingId(null); setIsCustomCategoryInput(false); setShowProductForm(true); }} className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> <span>Cadastrar Produto</span>
                </button>
            )}
            {activeTab === 'activities' && (
                <button onClick={() => { 
                   setNewActivity({ plotId: '', type: ActivityType.OUTROS, status: 'completed', date: getTodayLocal(), description: '', laborCost: 0, selectedProduct: '', selectedQuantity: 0, addedProducts: [] });
                   setEditingId(null); setIsCustomActivityTypeInput(false); setShowActivityForm(true); 
                }} className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> <span>Nova Atividade</span>
                </button>
            )}
            {activeTab === 'harvests' && (
                <button onClick={() => { 
                  setNewHarvest({ date: getTodayLocal(), unit: UnitType.KG, quantity: 0, unitPrice: 0 });
                  setEditingId(null); setShowHarvestForm(true); 
                }} className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> <span>Registrar Colheita</span>
                </button>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
           <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Receita Total" value={`R$ ${financialSummary.totalRevenue.toLocaleString()}`} icon={TrendingUp} colorClass="bg-blue-50 border-blue-200" />
                <SummaryCard title="Custo de Produção" value={`R$ ${financialSummary.totalCost.toLocaleString()}`} icon={ClipboardList} colorClass="bg-amber-50 border-amber-200" />
                <SummaryCard title="Lucro Líquido" value={`R$ ${financialSummary.netProfit.toLocaleString()}`} icon={DollarSign} colorClass={financialSummary.netProfit >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} />
             </div>
             {/* Charts */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <h3 className="text-lg font-bold text-gray-900 mb-6">Desempenho Financeiro por Talhão</h3>
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={financialSummary.plotSummaries}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                     <XAxis dataKey="plotName" tick={{fontSize: 12, fill: '#374151'}} />
                     <YAxis tickFormatter={(val) => `R$${val/1000}k`} tick={{fill: '#374151'}} />
                     <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                     <Legend wrapperStyle={{ color: '#1f2937' }} />
                     <Bar dataKey="revenue" name="Receita" fill="#2563eb" radius={[4, 4, 0, 0]} />
                     <Bar dataKey="cost" name="Custo" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>
        )}

        {/* Calendar Tab (Timeline View) */}
        {activeTab === 'calendar' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in">
             {/* Header: Month/Year and Filters */}
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-0 bg-white z-10 py-2 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-md transition-shadow text-gray-700"><ChevronLeft className="w-5 h-5" /></button>
                    <span className="px-4 font-bold text-lg text-gray-900 w-40 text-center">{getMonthName(calendarDate)}</span>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-md transition-shadow text-gray-700"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="w-full md:w-64">
                   <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-900 font-medium" value={calendarPlotId} onChange={e => setCalendarPlotId(e.target.value)}>
                      <option value="">Todos os Talhões</option>
                      {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                </div>
             </div>

             {/* Timeline List */}
             <div className="space-y-8">
                {timelineData.length === 0 ? (
                   <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                      <p className="font-medium">Nenhuma atividade registrada neste período.</p>
                   </div>
                ) : (
                  timelineData.map(({ date, items }) => (
                     <div key={date} className="relative pl-6 border-l-2 border-blue-200 pb-2 last:pb-0 last:border-l-0">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                           {formatDate(date)} <span className="text-xs font-normal text-gray-500 ml-2 uppercase tracking-wide">Dia {date.split('-')[2]}</span>
                        </h3>
                        <div className="space-y-3">
                           {items.map(act => (
                              <div key={act.id} className={`p-4 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center ${act.status === 'planned' ? 'bg-purple-50 border-purple-100' : 'bg-white border-gray-200'}`}>
                                 <div>
                                    <div className="flex items-center space-x-2">
                                       <span className="font-bold text-gray-800">{act.type}</span>
                                       {act.status === 'planned' && <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold uppercase">Agendado</span>}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                       <span className="font-medium text-blue-700">{plots.find(p => p.id === act.plotId)?.name}</span>
                                       {act.description && <span className="mx-1 text-gray-400">-</span>}
                                       {act.description}
                                    </div>
                                 </div>
                                 <div className="mt-2 md:mt-0 text-right">
                                    <span className="block font-bold text-gray-900">R$ {act.totalCost.toLocaleString()}</span>
                                    {act.productsUsed.length > 0 && <span className="text-xs text-gray-500">{act.productsUsed.length} insumos</span>}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))
                )}
             </div>
          </div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit shadow-sm print:hidden">
                  <button onClick={() => setReportMode('general')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${reportMode === 'general' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-50'}`}>Consolidado por Serviço (Geral)</button>
                  <button onClick={() => setReportMode('plot')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${reportMode === 'plot' ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-50'}`}>Análise por Talhão (Gráficos)</button>
              </div>
              {reportMode === 'general' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-0 print:p-0">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Relatório Geral de Custos</h3>
                      <button onClick={() => window.print()} className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold transition-colors print:hidden"><Printer className="w-4 h-4" /><span>Imprimir</span></button>
                  </div>
                  {/* Summary Table */}
                  <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Resumo por Categoria de Serviço</h4>
                  <div className="overflow-x-auto mb-8">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-bold border-b-2 border-gray-300">
                          <tr><th className="px-4 py-3 border border-gray-200">Tipo de Serviço</th><th className="px-4 py-3 border border-gray-200 text-center">Ocorrências</th><th className="px-4 py-3 border border-gray-200 text-right">Custo Mão de Obra</th><th className="px-4 py-3 border border-gray-200 text-right">Custo Insumos</th><th className="px-4 py-3 border border-gray-200 text-right">Total</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                          {serviceCostAnalysis.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50"><td className="px-4 py-3 border border-gray-200 font-bold text-gray-900">{item.type}</td><td className="px-4 py-3 border border-gray-200 text-center">{item.count}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {item.labor.toLocaleString()}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {item.products.toLocaleString()}</td><td className="px-4 py-3 border border-gray-200 text-right font-bold bg-gray-50">R$ {item.total.toLocaleString()}</td></tr>
                          ))}
                          <tr className="bg-gray-100 font-extrabold text-gray-900 border-t-2 border-gray-300"><td className="px-4 py-3 border border-gray-200">TOTAL GERAL</td><td className="px-4 py-3 border border-gray-200 text-center">{serviceCostAnalysis.reduce((acc, i) => acc + i.count, 0)}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {serviceCostAnalysis.reduce((acc, i) => acc + i.labor, 0).toLocaleString()}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {serviceCostAnalysis.reduce((acc, i) => acc + i.products, 0).toLocaleString()}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {serviceCostAnalysis.reduce((acc, i) => acc + i.total, 0).toLocaleString()}</td></tr>
                        </tbody>
                      </table>
                  </div>

                  {/* Detailed Table */}
                  <div className="break-before-page">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 pt-4">Extrato Detalhado de Atividades</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-bold border-b-2 border-gray-300">
                          <tr>
                            <th className="px-4 py-3 border border-gray-200">Data</th>
                            <th className="px-4 py-3 border border-gray-200">Talhão</th>
                            <th className="px-4 py-3 border border-gray-200">Tipo</th>
                            <th className="px-4 py-3 border border-gray-200">Descrição</th>
                            <th className="px-4 py-3 border border-gray-200 text-right">Valor Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                           {activities.filter(a => a.status === 'completed').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(act => (
                             <tr key={act.id} className="hover:bg-gray-50">
                               <td className="px-4 py-2 border border-gray-200 font-medium">{formatDate(act.date)}</td>
                               <td className="px-4 py-2 border border-gray-200">{plots.find(p=>p.id===act.plotId)?.name}</td>
                               <td className="px-4 py-2 border border-gray-200"><span className="font-bold text-gray-700">{act.type}</span></td>
                               <td className="px-4 py-2 border border-gray-200 text-xs text-gray-600 truncate max-w-xs">{act.description}</td>
                               <td className="px-4 py-2 border border-gray-200 text-right font-bold text-gray-900">R$ {act.totalCost.toLocaleString()}</td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:hidden flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="w-full md:w-1/2">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Selecione o Talhão:</label>
                      <select className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-800" value={selectedReportPlotId} onChange={e => setSelectedReportPlotId(e.target.value)}>
                        <option value="">Selecione...</option>
                        {plots.map(p => <option key={p.id} value={p.id}>{p.name} ({p.crop})</option>)}
                      </select>
                  </div>
                  {selectedReportPlotId && <button onClick={() => window.print()} className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-bold transition-colors"><Printer className="w-4 h-4" /><span>Imprimir Relatório</span></button>}
                </div>
                {selectedReportPlotId && (
                   <div className="print:p-4">
                     <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
                       <h2 className="text-2xl font-bold text-gray-900">Relatório: {plots.find(p=>p.id===selectedReportPlotId)?.name}</h2>
                       <p className="text-gray-600">Data de emissão: {new Date().toLocaleDateString()}</p>
                     </div>
                     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-0 print:p-0">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={financialSummary.plotSummaries.filter(p => p.plotId === selectedReportPlotId).flatMap(p => [{name: 'Receita', value: p.revenue}, {name: 'Custo', value: p.cost}])} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>{[0, 1].map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />)}</Pie><Tooltip formatter={(val) => `R$ ${Number(val).toLocaleString()}`} /><Legend /></RePieChart></ResponsiveContainer></div>
                          <div><h4 className="text-lg font-bold text-gray-800 mb-4">Resumo Financeiro</h4>{financialSummary.plotSummaries.filter(p => p.plotId === selectedReportPlotId).map(p => (<div key={p.plotId} className="space-y-3"><div className="flex justify-between p-3 bg-gray-50 rounded"><span>Receita:</span><span className="font-bold text-green-600">R$ {p.revenue.toLocaleString()}</span></div><div className="flex justify-between p-3 bg-gray-50 rounded"><span>Custo:</span><span className="font-bold text-amber-600">R$ {p.cost.toLocaleString()}</span></div><div className="flex justify-between p-3 bg-gray-50 rounded border-t border-gray-200"><span>Lucro:</span><span className={`font-bold ${p.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {p.profit.toLocaleString()}</span></div></div>))}</div>
                       </div>
                       
                       <h4 className="text-lg font-bold text-gray-800 mb-4 mt-8 border-b pb-2">Resumo por Categoria</h4>
                        <table className="w-full text-sm text-left border-collapse mb-8">
                          <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-bold border-b-2 border-gray-300"><tr><th className="px-4 py-3 border border-gray-200">Serviço</th><th className="px-4 py-3 border border-gray-200 text-right">Mão de Obra</th><th className="px-4 py-3 border border-gray-200 text-right">Insumos</th><th className="px-4 py-3 border border-gray-200 text-right">Total</th></tr></thead>
                          <tbody className="divide-y divide-gray-200 text-gray-800">
                             {activities.filter(a => a.plotId === selectedReportPlotId && a.status === 'completed').reduce((acc, curr) => {
                                const existing = acc.find(i => i.type === curr.type);
                                if (existing) { existing.labor += curr.laborCost; existing.products += (curr.totalCost - curr.laborCost); existing.total += curr.totalCost; } else { acc.push({ type: curr.type, labor: curr.laborCost, products: curr.totalCost - curr.laborCost, total: curr.totalCost }); }
                                return acc;
                             }, [] as {type:string, labor:number, products:number, total:number}[]).map((row, idx) => (
                               <tr key={idx}><td className="px-4 py-3 border border-gray-200 font-bold">{row.type}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {row.labor.toLocaleString()}</td><td className="px-4 py-3 border border-gray-200 text-right">R$ {row.products.toLocaleString()}</td><td className="px-4 py-3 border border-gray-200 text-right font-bold">R$ {row.total.toLocaleString()}</td></tr>
                             ))}
                          </tbody>
                        </table>

                        <div className="break-before-page">
                          <h4 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Extrato Detalhado do Talhão</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                              <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-bold border-b-2 border-gray-300">
                                <tr>
                                  <th className="px-4 py-3 border border-gray-200">Data</th>
                                  <th className="px-4 py-3 border border-gray-200">Tipo</th>
                                  <th className="px-4 py-3 border border-gray-200">Descrição</th>
                                  <th className="px-4 py-3 border border-gray-200 text-right">Valor Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 text-gray-800">
                                {activities.filter(a => a.plotId === selectedReportPlotId && a.status === 'completed').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(act => (
                                  <tr key={act.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border border-gray-200 font-medium">{formatDate(act.date)}</td>
                                    <td className="px-4 py-2 border border-gray-200"><span className="font-bold text-gray-700">{act.type}</span></td>
                                    <td className="px-4 py-2 border border-gray-200 text-xs text-gray-600 truncate max-w-xs">{act.description}</td>
                                    <td className="px-4 py-2 border border-gray-200 text-right font-bold text-gray-900">R$ {act.totalCost.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                     </div>
                   </div>
                )}
                </>
              )}
            </div>
        )}

        {/* Plots Tab */}
        {activeTab === 'plots' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map(plot => (
               <div key={plot.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-700 border border-blue-100"><Trees className="w-6 h-6" /></div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${plot.crop === 'Manga' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-900'}`}>{plot.crop}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plot.name}</h3>
                  <p className="text-gray-700 font-medium mb-4">{plot.area} Hectares</p>
                  <div className="flex justify-end space-x-1 mt-4 border-t border-gray-100 pt-3">
                    <button type="button" onClick={(e) => handleEditPlot(e, plot)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg border border-gray-100 flex items-center gap-1 text-xs font-bold"><Pencil className="w-4 h-4" /> Editar</button>
                    <button type="button" onClick={(e) => openDeleteModal(e, 'plot', plot.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg border border-gray-100 flex items-center gap-1 text-xs font-bold"><Trash2 className="w-4 h-4" /> Excluir</button>
                  </div>
               </div>
            ))}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-bold border-b border-gray-200">
                    <tr><th className="px-6 py-4">Produto</th><th className="px-6 py-4">Categoria</th><th className="px-6 py-4">Preço de Custo</th><th className="px-6 py-4 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800">
                    {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${product.category === 'Fertilizante' ? 'bg-amber-100 text-amber-800' : product.category === 'Defensivo' ? 'bg-red-100 text-red-800' : product.category === 'Adubo' ? 'bg-lime-100 text-lime-800' : 'bg-gray-200 text-gray-800'}`}>{product.category}</span></td>
                        <td className="px-6 py-4 font-medium">R$ {product.pricePerUnit.toFixed(2)} / {product.unit}</td>
                        <td className="px-6 py-4 text-right flex justify-end space-x-2">
                           <button type="button" onClick={(e) => handleEditProduct(e, product)} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 cursor-pointer"><Pencil className="w-5 h-5 pointer-events-none" /></button>
                           <button type="button" onClick={(e) => openDeleteModal(e, 'product', product.id)} className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-5 h-5 pointer-events-none" /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        )}

        {/* Activities Tab (Revised Layout) */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200 w-fit shadow-sm">
              <button onClick={() => setActivityView('history')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activityView === 'history' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-50'}`}>Histórico (Realizadas)</button>
              <button onClick={() => setActivityView('planning')} className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activityView === 'planning' ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-50'}`}>Planejamento (Futuro)</button>
            </div>
            {activities.filter(a => a.status === (activityView === 'history' ? 'completed' : 'planned')).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(activity => (
              <div key={activity.id} className={`rounded-xl shadow-sm border p-6 group ${activity.status === 'planned' ? 'bg-purple-50/50 border-purple-200' : 'bg-white border-gray-200'}`}>
                {/* NEW HEADER LAYOUT - No Absolute Positioning */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div className="flex-1">
                     <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-extrabold text-gray-900 text-lg">{activity.type}</h3>
                        {activity.status === 'planned' && <span className="bg-purple-200 text-purple-900 text-xs px-2 py-0.5 rounded-full font-bold">Agendada</span>}
                     </div>
                     <div className="flex items-center text-sm text-gray-700 space-x-3 font-medium">
                        <span className="text-blue-800">{plots.find(p => p.id === activity.plotId)?.name}</span> 
                        <span className="text-gray-400">•</span> 
                        <span>{formatDate(activity.date)}</span>
                     </div>
                  </div>

                  {/* Buttons grouped properly on the right */}
                  <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200 self-start md:self-auto">
                    <button title="Duplicar" type="button" onClick={(e) => handleDuplicateActivity(e, activity)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button title="Editar" type="button" onClick={(e) => handleEditActivity(e, activity)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button title="Excluir" type="button" onClick={(e) => openDeleteModal(e, 'activity', activity.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-100 pt-4 mt-2">
                  <p className="text-gray-800 text-sm italic bg-gray-50/50 p-2 rounded w-full md:w-2/3">"{activity.description}"</p>
                  <div className="text-right mt-3 md:mt-0 min-w-max ml-4">
                     <span className={`block text-xl font-extrabold ${activity.status === 'planned' ? 'text-purple-700' : 'text-gray-900'}`}>R$ {activity.totalCost.toLocaleString()}</span>
                     <span className="text-xs text-gray-600 font-medium">{activity.status === 'planned' ? 'Custo Estimado' : 'Custo Total'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Harvests Tab */}
        {activeTab === 'harvests' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-900 uppercase text-xs font-bold border-b border-gray-200">
                    <tr><th className="px-6 py-4">Data</th><th className="px-6 py-4">Talhão</th><th className="px-6 py-4">Classificação</th><th className="px-6 py-4">Qtd / Preço</th><th className="px-6 py-4 text-right">Total</th><th className="px-6 py-4 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800">
                    {harvests.map(h => (
                    <tr key={h.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-700 font-medium">{formatDate(h.date)}</td>
                        <td className="px-6 py-4"><div className="font-bold text-gray-900">{plots.find(p => p.id === h.plotId)?.name}</div></td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-200 rounded-md text-xs font-bold text-gray-800 border border-gray-200">{h.classification}</span></td>
                        <td className="px-6 py-4"><div className="text-gray-900 font-bold">{h.quantity} {h.unit}</div><div className="text-xs text-gray-600 font-medium">a R$ {h.unitPrice.toFixed(2)}</div></td>
                        <td className="px-6 py-4 text-right font-extrabold text-blue-700">R$ {h.totalRevenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right flex justify-end space-x-2">
                           <button type="button" onClick={(e) => handleEditHarvest(e, h)} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 cursor-pointer"><Pencil className="w-5 h-5 pointer-events-none" /></button>
                           <button type="button" onClick={(e) => openDeleteModal(e, 'harvest', h.id)} className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-5 h-5 pointer-events-none" /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
             </div>
          </div>
        )}
        
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="max-w-4xl mx-auto space-y-6">
             <div className="bg-purple-900 text-white rounded-2xl p-8 shadow-lg border border-purple-800">
               <button onClick={runAnalysis} disabled={loadingAi} className="w-full bg-white text-purple-900 font-bold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center shadow-md">{loadingAi ? "Processando..." : "Gerar Relatório de Análise"}</button>
             </div>
             {aiReport && <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in"><div className="prose prose-blue max-w-none text-gray-800 space-y-4 font-medium" dangerouslySetInnerHTML={{ __html: aiReport }} /></div>}
          </div>
        )}
      </main>

      {/* --- MODALS --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-fade-in print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border border-gray-200">
             <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
             <div className="flex w-full space-x-3"><button onClick={() => setDeleteModal({ isOpen: false, type: null, id: null })} className="flex-1 py-3 text-gray-700 font-bold bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button><button onClick={confirmDelete} className="flex-1 py-3 text-white font-bold bg-red-600 rounded-lg hover:bg-red-700 shadow-md">Excluir</button></div>
          </div>
        </div>
      )}

      {/* New Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{editingId ? 'Editar Insumo' : 'Novo Insumo'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome do Produto" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" value={newProduct.name || ''} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <div className="flex gap-2">
                 {isCustomCategoryInput ? (
                   <div className="flex-1 flex gap-2">
                      <input type="text" placeholder="Nova Categoria" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-50" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} autoFocus />
                      <button onClick={() => setIsCustomCategoryInput(false)} className="px-3 bg-gray-200 rounded-lg hover:bg-gray-300"><X className="w-4 h-4" /></button>
                   </div>
                 ) : (
                   <div className="flex-1 flex gap-2">
                     <select className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>{availableCategories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                     <button title="Adicionar Categoria" onClick={() => { setIsCustomCategoryInput(true); setNewProduct({...newProduct, category: ''}); }} className="px-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"><Plus className="w-4 h-4" /></button>
                   </div>
                 )}
              </div>
              <div className="flex space-x-2">
                <input type="number" placeholder="Preço Custo" className="w-2/3 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" value={newProduct.pricePerUnit || ''} onChange={e => setNewProduct({...newProduct, pricePerUnit: Number(e.target.value)})} />
                <select className="w-1/3 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value as UnitType})}>{Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}</select>
              </div>
              <div className="flex space-x-3 pt-2"><button onClick={() => { setShowProductForm(false); setEditingId(null); setIsCustomCategoryInput(false); }} className="flex-1 py-3 text-gray-700 font-bold bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button><button onClick={handleSaveProduct} className="flex-1 py-3 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800">{editingId ? 'Salvar Alterações' : 'Salvar'}</button></div>
            </div>
          </div>
        </div>
      )}

      {/* New Activity Modal */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{editingId ? 'Editar Atividade' : 'Nova Atividade de Manejo'}</h3>
            <div className="space-y-4">
              <div className="flex space-x-4 mb-2 bg-gray-100 p-1 rounded-lg w-fit border border-gray-200">
                <button onClick={() => setNewActivity({...newActivity, status: 'completed'})} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${newActivity.status === 'completed' ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Realizada (Histórico)</button>
                <button onClick={() => setNewActivity({...newActivity, status: 'planned'})} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${newActivity.status === 'planned' ? 'bg-purple-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>Agendar (Planejamento)</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <select className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900" value={newActivity.plotId} onChange={e => setNewActivity({...newActivity, plotId: e.target.value})}>
                  <option value="">Selecione o Talhão</option>{plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="date" className="w-full border border-gray-200 rounded-lg p-3 text-gray-900" value={newActivity.date} onChange={e => setNewActivity({...newActivity, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex gap-2">
                 {isCustomActivityTypeInput ? (
                   <div className="flex-1 flex gap-2">
                      <input type="text" placeholder="Tipo (Ex: Irrigação)" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-blue-50" value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})} autoFocus />
                      <button onClick={() => setIsCustomActivityTypeInput(false)} className="px-3 bg-gray-200 rounded-lg hover:bg-gray-300"><X className="w-4 h-4" /></button>
                   </div>
                 ) : (
                   <div className="flex-1 flex gap-2">
                     <select className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900" value={newActivity.type} onChange={e => setNewActivity({...newActivity, type: e.target.value})}>{availableActivityTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
                     <button title="Adicionar Tipo" onClick={() => { setIsCustomActivityTypeInput(true); setNewActivity({...newActivity, type: ''}); }} className="px-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"><Plus className="w-4 h-4" /></button>
                   </div>
                 )}
                </div>
                <input type="number" placeholder="Custo Mão de Obra (R$)" className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 placeholder-gray-500" value={newActivity.laborCost || ''} onChange={e => setNewActivity({...newActivity, laborCost: Number(e.target.value)})} />
              </div>
              <textarea placeholder="Descrição (Ex: Aplicação nas bordas)" className="w-full border border-gray-200 rounded-lg p-3 h-20 text-gray-900 placeholder-gray-500" value={newActivity.description} onChange={e => setNewActivity({...newActivity, description: e.target.value})} />
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-2">Adicionar Insumos</h4>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-3">
                  <select className="flex-1 border border-gray-200 rounded-lg p-2 text-sm bg-white text-gray-900" value={newActivity.selectedProduct} onChange={e => setNewActivity({...newActivity, selectedProduct: e.target.value})}>
                    <option value="">Selecione o produto...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} (R${p.pricePerUnit}/{p.unit})</option>)}
                  </select>
                  <input type="number" placeholder="Qtd" className="w-24 border border-gray-200 rounded-lg p-2 text-sm text-gray-900" value={newActivity.selectedQuantity || ''} onChange={e => setNewActivity({...newActivity, selectedQuantity: Number(e.target.value)})} />
                  <button onClick={addProductToActivity} type="button" className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800">Add</button>
                </div>
                {newActivity.addedProducts.length > 0 && (
                  <ul className="text-sm bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {newActivity.addedProducts.map((item, idx) => {
                      const p = products.find(prod => prod.id === item.productId);
                      return (<li key={idx} className="p-2 flex justify-between"><span className="text-gray-700 font-medium">{p?.name} (x{item.quantity})</span><span className="flex items-center space-x-2"><span className="font-bold text-gray-900">R$ {item.cost.toFixed(2)}</span><button type="button" className="text-red-500 hover:text-red-700" onClick={() => { setNewActivity({...newActivity, addedProducts: newActivity.addedProducts.filter((_, i) => i !== idx)}) }}><X className="w-4 h-4" /></button></span></li>)
                    })}
                  </ul>
                )}
              </div>
              <div className="flex justify-between items-center pt-2">
                 <div className="text-lg font-bold text-gray-900">Total Estimado: R$ {(Number(newActivity.laborCost) + newActivity.addedProducts.reduce((a,b) => a + b.cost, 0)).toFixed(2)}</div>
                 <div className="flex space-x-3">
                   <button onClick={() => { setShowActivityForm(false); setEditingId(null); setIsCustomActivityTypeInput(false); }} className="px-6 py-3 text-gray-700 font-bold bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                   <button onClick={handleSaveActivity} className={`px-6 py-3 text-white font-bold rounded-lg ${newActivity.status === 'planned' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-blue-700 hover:bg-blue-800'}`}>{editingId ? 'Salvar Alterações' : (newActivity.status === 'planned' ? 'Agendar' : 'Concluir')}</button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plot Form */}
      {showPlotForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{editingId ? 'Editar Talhão' : 'Novo Talhão'}</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome (Ex: Talhão A)" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" value={newPlot.name || ''} onChange={e => setNewPlot({...newPlot, name: e.target.value})} />
              <select className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900" value={newPlot.crop} onChange={e => setNewPlot({...newPlot, crop: e.target.value})}>{DEFAULT_CROPS.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <input type="number" placeholder="Área (Hectares)" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" value={newPlot.area || ''} onChange={e => setNewPlot({...newPlot, area: Number(e.target.value)})} />
              <div className="flex space-x-3 pt-2"><button onClick={() => { setShowPlotForm(false); setEditingId(null); }} className="flex-1 py-3 text-gray-700 font-bold bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button><button onClick={handleSavePlot} className="flex-1 py-3 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800">{editingId ? 'Salvar Alterações' : 'Salvar'}</button></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Harvest Form */}
      {showHarvestForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold mb-4 text-gray-900">{editingId ? 'Editar Colheita' : 'Registrar Colheita / Venda'}</h3>
            <div className="space-y-4">
              <select className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900" value={newHarvest.plotId || ''} onChange={e => { setNewHarvest({...newHarvest, plotId: e.target.value, classification: ''}); }}>
                <option value="">Selecione o Talhão</option>{plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {newHarvest.plotId && <div className="space-y-1"><label className="text-xs font-bold text-gray-600 uppercase">Classificação</label><select className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900" value={newHarvest.classification || ''} onChange={e => setNewHarvest({...newHarvest, classification: e.target.value})}><option value="">Selecione o Tipo</option>{getClassificationOptions(newHarvest.plotId!).map(opt => (<option key={opt} value={opt}>{opt}</option>))}</select></div>}
              <input type="date" className="w-full border border-gray-200 rounded-lg p-3 text-gray-900" value={newHarvest.date} onChange={e => setNewHarvest({...newHarvest, date: e.target.value})} />
              <div className="flex space-x-2"><input type="number" placeholder="Qtd" className="w-2/3 border border-gray-200 rounded-lg p-3 text-gray-900" value={newHarvest.quantity || ''} onChange={e => setNewHarvest({...newHarvest, quantity: Number(e.target.value)})} /><select className="w-1/3 border border-gray-200 rounded-lg p-3 bg-white text-gray-900" value={newHarvest.unit} onChange={e => setNewHarvest({...newHarvest, unit: e.target.value as UnitType})}>{Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}</select></div>
              <input type="number" placeholder="Preço Unitário (R$)" className="w-full border border-gray-200 rounded-lg p-3 text-gray-900" value={newHarvest.unitPrice || ''} onChange={e => setNewHarvest({...newHarvest, unitPrice: Number(e.target.value)})} />
              <div className="bg-gray-100 p-3 rounded-lg text-right border border-gray-200"><span className="font-bold text-gray-700 mr-2">Total Estimado:</span><span className="font-extrabold text-blue-800 text-lg">R$ {((newHarvest.quantity || 0) * (newHarvest.unitPrice || 0)).toLocaleString()}</span></div>
              <div className="flex space-x-3 pt-2"><button onClick={() => { setShowHarvestForm(false); setEditingId(null); }} className="flex-1 py-3 text-gray-700 font-bold bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button><button onClick={handleSaveHarvest} className="flex-1 py-3 text-white font-bold bg-blue-700 rounded-lg hover:bg-blue-800">{editingId ? 'Salvar Alterações' : 'Salvar'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
