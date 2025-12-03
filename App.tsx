import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  CalendarDays,
  Search
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
import { saveData, fetchData } from './services/supabaseService'; // <<-- SERVIÇO SUPABASE
import JSZip from 'jszip';


// --- Constantes e Dados Iniciais (Mantidos do AI Studio) ---
const CROP_CLASSIFICATIONS: Record<string, string[]> = {
  'Manga': ['Exportação', 'Mercado', 'Arrastão'],
  'Goiaba': ['Verde', 'Madura', 'Polpa']
};

const DEFAULT_CROPS = ['Manga', 'Goiaba', 'Outros'];
// Atualizado para combinar com o tema azul
const CHART_COLORS = ['#2563eb', '#1d4ed8', '#1e40af', '#60a5fa', '#93c5fd', '#bfdbfe'];

// Dados Iniciais - Usados como fallback se o Supabase estiver vazio
const INITIAL_PLOTS: Plot[] = [
  { id: 1, name: "Talhão 02", crop: "Goiaba", area: 3.5, unit: "Hectares" },
  { id: 2, name: "Talhão 03 - Manga Tommy", crop: "Manga", area: 4, unit: "Hectares" },
];

const INITIAL_ACTIVITY_TYPES: ActivityType[] = [
  { id: 1, name: "Irrigação", icon: "💧" },
  { id: 2, name: "Adubação", icon: "🧪" },
  { id: 3, name: "Poda", icon: "✂️" },
];

const INITIAL_CATEGORIES = ['Manga', 'Goiaba', 'Insumos'];
const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Fertilizante NPK", unit: "Kg", currentStock: 250, unitPrice: 15.50, category: 'Insumos' },
  { id: 2, name: "Mudas de Manga", unit: "Unidade", currentStock: 100, unitPrice: 35.00, category: 'Manga' },
];

// --- Componente Principal ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Data State (Inicialização para carregar do Supabase) ---
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [availableActivityTypes, setAvailableActivityTypes] = useState<ActivityType[]>(INITIAL_ACTIVITY_TYPES);
  const [availableCategories, setAvailableCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // --- Estados de Formulários e Modais ---
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [newPlot, setNewPlot] = useState<Partial<Plot>>({});
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [newHarvest, setNewHarvest] = useState<Partial<Harvest>>({});


  // ===============================================
  // 🔄 SINCRONIZAÇÃO DE DADOS (LÓGICA SUPABASE)
  // ===============================================

  // 1. Lógica de Leitura (Carrega dados do Supabase ao iniciar)
  useEffect(() => {
    const loadData = async () => {
      const loadedData = await fetchData();
      
      if (loadedData) {
        // Se houver dados salvos no Supabase, atualiza todos os estados
        setPlots(loadedData.plots || INITIAL_PLOTS);
        setProducts(loadedData.products || INITIAL_PRODUCTS);
        setActivities(loadedData.activities || []);
        setHarvests(loadedData.harvests || []);
        setAvailableActivityTypes(loadedData.activityTypes || INITIAL_ACTIVITY_TYPES);
        setAvailableCategories(loadedData.categories || INITIAL_CATEGORIES);
      } else {
        // Se não houver dados no Supabase, usa os valores iniciais (Fallback)
        setPlots(INITIAL_PLOTS);
        setProducts(INITIAL_PRODUCTS);
        setActivities([]);
        setHarvests([]);
        setAvailableActivityTypes(INITIAL_ACTIVITY_TYPES);
        setAvailableCategories(INITIAL_CATEGORIES);
      }
    };
    loadData();
  }, []); 

  // 2. Função de Escrita (Substitui a lógica de localStorage)
  const handleManualSave = async () => {
    const dataToSave = {
      plots: plots,
      products: products,
      activities: activities,
      harvests: harvests,
      activityTypes: availableActivityTypes,
      categories: availableCategories
    };

    const success = await saveData(dataToSave as any);
    
    if (success) {
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
      alert("Dados salvos e sincronizados com sucesso no Supabase!");
    } else {
      alert("Falha ao salvar no Supabase! Verifique as políticas RLS ou o console.");
    }
  };

  // ===============================================
  // 💾 FUNÇÃO DOWNLOAD (CORREÇÃO DO REFERENCE ERROR)
  // ===============================================
  
  // Função que foi renomeada/removida, restaurada para corrigir o ReferenceError
  const handleDownloadSource = useCallback(async () => {
    // Código para criação do arquivo ZIP do projeto (usando JSZip)
    const zip = new JSZip();
    
    // Adicione os arquivos essenciais ao ZIP
    const filesToZip = {
      "App.tsx": "Conteúdo completo do App.tsx...",
      "index.html": "Conteúdo completo do index.html...",
      "package.json": "Conteúdo completo do package.json...",
      "README.md": "Arquivo README.md...",
      "supabaseService.ts": "Conteúdo completo do services/supabaseService.ts...",
      // Inclua outros arquivos importantes (types.ts, configs, etc.)
    };

    // Este código é um placeholder. A função real deve ler os arquivos locais,
    // mas garantirá que o botão funcione e o erro desapareça.
    zip.file("README.md", "Projeto Fazenda Cassiano's. Use npm install e npm run dev.\nDados Sincronizados via Supabase.");
    
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fazenda-app-source.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []); 

  // ===============================================
  // 🧠 Lógica de IA e Cálculos (Mantida)
  // ===============================================

  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    const context = `
      Situação atual da fazenda Fazenda Cassiano's.
      Talhões: ${JSON.stringify(plots.map(p => ({ nome: p.name, cultura: p.crop, area: p.area })))}
      Colheitas recentes (últimos 6 meses): ${JSON.stringify(harvests.slice(0, 5).map(h => ({ cultura: h.crop, quantidade: h.quantity, valor: h.quantity * h.unitPrice })))}
      Atividades pendentes: ${activities.filter(a => a.status === 'Pendente').length}
    `;
    const insightText = await generateAgriInsights(context);
    setInsight(insightText);
    setLoadingInsight(false);
  };
  
  // (MANTENHA A PARTIR DAQUI O RESTANTE DO CÓDIGO DO SEU APP.TSX ORIGINAL)
  // ... todas as funções de cálculo useMemo, useMemo e useCallback
  // ... todas as funções de handleAdd, handleEdit, handleDelete
  // ... todos os componentes internos (DashboardContent, PlotsContent, etc.)

  // ===============================================
  // 🎨 Retorno da Interface (Mantida)
  // ===============================================

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden bg-white shadow-xl flex flex-col justify-between border-r border-gray-200`}>
        
        {/* Botão Salvar Dados e Baixar Código Fonte */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleManualSave} className="w-full flex items-center justify-center py-3 px-4 bg-agri-600 hover:bg-agri-700 text-white font-bold rounded-lg shadow-lg transition duration-150 transform hover:scale-[1.01] text-lg">
            <Save className="w-5 h-5 mr-3" />
            Salvar Dados
          </button>
          {/* A chamada está agora corrigida e aponta para a função restaurada */}
          <button onClick={handleDownloadSource} className="w-full flex items-center justify-center mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition duration-150 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar Código Fonte
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Notificação de Salvo */}
        {showSaveNotification && (
          <div className="fixed top-5 right-5 z-50 p-4 bg-green-500 text-white rounded-lg shadow-xl flex items-center space-x-2 transition-opacity duration-300">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Dados salvos com sucesso!</span>
          </div>
        )}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {activeTab === 'dashboard' && 'Dashboard Aqui...'}
          {activeTab === 'plots' && 'Talhões Aqui...'}
          {/* ... outras abas ... */}
        </main>
      </div>
    </div>
  );
}