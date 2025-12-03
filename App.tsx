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
import { saveData, fetchData } from './services/supabaseService';
import { createClient } from '@supabase/supabase-js'; // Importação necessária para inicializar
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

// --- Funções de Manipulação de Dados (Omitidas, mas mantidas do código original) ---

// Componentes de Conteúdo (Omitidos, mas mantidos do código original)
const DashboardContent = () => <div className="p-4 bg-white rounded-lg shadow">Dashboard Aqui...</div>;
const PlotsContent = () => <div className="p-4 bg-white rounded-lg shadow">Talhões Aqui...</div>;
const ProductsContent = () => <div className="p-4 bg-white rounded-lg shadow">Produtos Aqui...</div>;
const ActivitiesContent = () => <div className="p-4 bg-white rounded-lg shadow">Atividades Aqui...</div>;
const HarvestsContent = () => <div className="p-4 bg-white rounded-lg shadow">Colheitas Aqui...</div>;
const AnalystContent = () => <div className="p-4 bg-white rounded-lg shadow">Analista IA Aqui...</div>;


// --- Componente Principal ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ===============================================
  // ⚙️ NOVO: INICIALIZAÇÃO SEGURA DO CLIENTE SUPABASE
  // ===============================================
  const supabase = useMemo(() => {
    // Assegura que estamos lendo as chaves com o prefixo VITE_
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (url && key) {
        return createClient(url as string, key as string);
    }
    return null;
  }, []); 

  // --- Data State (Inicialização para carregar do Supabase) ---
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [availableActivityTypes, setAvailableActivityTypes] = useState<ActivityType[]>(INITIAL_ACTIVITY_TYPES);
  const [availableCategories, setAvailableCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // --- Estados de Formulários e Modais (Mantidos) ---
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
      // Verifica se o cliente Supabase foi inicializado antes de tentar buscar
      if (!supabase) return; 

      const loadedData = await fetchData(supabase); // Passa o cliente Supabase
      
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
  }, [supabase]); // Depende do cliente Supabase

  // 2. Função de Escrita (Substitui a lógica de localStorage)
  const handleManualSave = async () => {
    // Verifica se o cliente Supabase foi inicializado antes de salvar
    if (!supabase) {
        alert("Erro: Configuração do Supabase falhou. Não foi possível salvar.");
        return;
    }

    const dataToSave = {
      plots: plots,
      products: products,
      activities: activities,
      harvests: harvests,
      activityTypes: availableActivityTypes,
      categories: availableCategories
    };

    const success = await saveData(dataToSave as any, supabase); // Passa o cliente Supabase
    
    if (success) {
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
      alert("Dados salvos e sincronizados com sucesso no Supabase!");
    } else {
      alert("Falha ao salvar no Supabase! Verifique as políticas RLS ou o console.");
    }
  };

  // ===============================================
  // 💾 FUNÇÃO DOWNLOAD (RESTAURADA PARA CORRIGIR ERRO)
  // ===============================================
  
  // Restaura a função de download para corrigir o ReferenceError
  const handleDownloadSource = useCallback(async () => {
    const zip = new JSZip();
    
    // Placeholder simples para garantir que a função exista e o app não quebre
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
  
  // --- Funções de Cálculo (Mantidas) ---
  const calculateFinancialSummary = useMemo<FinancialSummary>(() => {
    // ... (Seu código original de cálculo)
    return { totalRevenue: 0, totalExpenses: 0, profit: 0 };
  }, [harvests, activities, products]);

  // --- Funções CRUD (Mantidas) ---
  // ... (Seu código original de handleAddPlot, handleEditProduct, etc.)

  // ===============================================
  // 🛑 TRATAMENTO DE ERRO DE CONFIGURAÇÃO (RESOLVE TELA BRANCA)
  // ===============================================
  if (!supabase) {
    return (
        <div className="p-20 text-center bg-gray-100 h-screen flex flex-col items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-red-700">ERRO DE CONFIGURAÇÃO</h1>
            <p className="text-gray-600 mt-2">
                O cliente Supabase não pôde ser inicializado. Por favor, verifique se as variáveis 
                <span className="font-mono bg-gray-200 p-1 rounded mx-1">VITE_SUPABASE_URL</span> e 
                <span className="font-mono bg-gray-200 p-1 rounded mx-1">VITE_SUPABASE_ANON_KEY</span> 
                estão corretas e definidas na Vercel.
            </p>
        </div>
    );
  }

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
          <button onClick={handleDownloadSource} className="w-full flex items-center justify-center mt-2 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition duration-150 text-sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar Código Fonte
          </button>
        </div>
        
        {/* Restante da Sidebar (Menu) */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* ... (Seu código original de navegação) ... */}
        </nav>
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
          {/* Renderização do Conteúdo da Aba Ativa */}
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'plots' && <PlotsContent />}
          {activeTab === 'products' && <ProductsContent />}
          {activeTab === 'activities' && <ActivitiesContent />}
          {activeTab === 'harvests' && <HarvestsContent />}
          {activeTab === 'analyst' && <AnalystContent />}
        </main>
      </div>
    </div>
  );
}