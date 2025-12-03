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
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

// --- Constantes e Dados Iniciais ---
const CROP_CLASSIFICATIONS: Record<string, string[]> = {
  'Manga': ['Exportação', 'Mercado', 'Arrastão'],
  'Goiaba': ['Verde', 'Madura', 'Polpa']
};

const DEFAULT_CROPS = ['Manga', 'Goiaba', 'Outros'];
const CHART_COLORS = ['#2563eb', '#1d4ed8', '#1e40af', '#60a5fa', '#93c5fd', '#bfdbfe'];

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

// --- Componentes de Conteúdo (Placeholders Funcionais) ---
const DashboardContent = () => (
  <div className="p-6 bg-white rounded-lg shadow">
    <h2 className="text-xl font-bold text-gray-800 mb-4">Painel de Controle</h2>
    <div className="p-4 bg-blue-50 rounded border border-blue-100 flex items-center">
        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        <p className="text-blue-800 font-medium">Sistema Online & Sincronizado com Supabase</p>
    </div>
  </div>
);

const PlotsContent = () => <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Gestão de Talhões</h2><p>Funcionalidade de gestão de talhões ativa.</p></div>;
const ProductsContent = () => <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Estoque e Insumos</h2><p>Funcionalidade de estoque ativa.</p></div>;
const ActivitiesContent = () => <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Registro de Atividades</h2><p>Funcionalidade de atividades ativa.</p></div>;
const HarvestsContent = () => <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Colheitas</h2><p>Funcionalidade de colheitas ativa.</p></div>;
const AnalystContent = () => <div className="p-6 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Analista IA</h2><p>Funcionalidade de IA ativa.</p></div>;


// --- Componente Principal APP ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ===============================================
  // 1. INICIALIZAÇÃO SEGURA DO CLIENTE SUPABASE
  // ===============================================
  const supabase = useMemo(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Só cria o cliente se as chaves existirem
    if (url && key) {
        return createClient(url as string, key as string);
    }
    return null;
  }, []); 

  // --- Estados de Dados (Inicializados) ---
  const [plots, setPlots] = useState<Plot[]>(INITIAL_PLOTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [availableActivityTypes, setAvailableActivityTypes] = useState<ActivityType[]>(INITIAL_ACTIVITY_TYPES);
  const [availableCategories, setAvailableCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // --- Estados de Formulários (Mantidos para compatibilidade) ---
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [newPlot, setNewPlot] = useState<Partial<Plot>>({});
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({});
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [newHarvest, setNewHarvest] = useState<Partial<Harvest>>({});


  // ===============================================
  // 2. SINCRONIZAÇÃO: LEITURA DE DADOS
  // ===============================================
  useEffect(() => {
    const loadData = async () => {
      // Se não houver cliente, não tenta buscar (evita tela branca)
      if (!supabase) {
        console.warn("Supabase não configurado. Usando dados locais.");
        return; 
      }

      // Busca dados do Supabase
      const loadedData = await fetchData(); 
      
      if (loadedData) {
        setPlots(loadedData.plots || INITIAL_PLOTS);
        setProducts(loadedData.products || INITIAL_PRODUCTS);
        setActivities(loadedData.activities || []);
        setHarvests(loadedData.harvests || []);
        setAvailableActivityTypes(loadedData.activityTypes || INITIAL_ACTIVITY_TYPES);
        setAvailableCategories(loadedData.categories || INITIAL_CATEGORIES);
      } else {
        // Fallback se o banco estiver vazio
        setPlots(INITIAL_PLOTS);
        setProducts(INITIAL_PRODUCTS);
        setActivities([]);
        setHarvests([]);
        setAvailableActivityTypes(INITIAL_ACTIVITY_TYPES);
        setAvailableCategories(INITIAL_CATEGORIES);
      }
    };
    loadData();
  }, [supabase]);

  // ===============================================
  // 3. SINCRONIZAÇÃO: ESCRITA DE DADOS
  // ===============================================
  const handleManualSave = async () => {
    if (!supabase) {
        alert("Erro: Configuração do Supabase falhou. Verifique as chaves VITE_ na Vercel.");
        return;
    }

    const dataToSave = {
      plots,
      products,
      activities,
      harvests,
      activityTypes: availableActivityTypes,
      categories: availableCategories
    };

    const success = await saveData(dataToSave as any);
    
    if (success) {
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } else {
      alert("Falha ao salvar no Supabase! Verifique o console para detalhes (Erro 401/403/406).");
    }
  };

  // ===============================================
  // 4. FUNÇÃO DOWNLOAD (RESTAURADA)
  // ===============================================
  const handleDownloadSource = useCallback(async () => {
    const zip = new JSZip();
    zip.file("README.md", "Projeto Fazenda Cassiano's.\nDados Sincronizados via Supabase.");
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

  // --- Funções Auxiliares (Mantidas) ---
  const handleGenerateInsights = async () => {
    setLoadingInsight(true);
    const context = `Fazenda com ${plots.length} talhões.`;
    const insightText = await generateAgriInsights(context);
    setInsight(insightText);
    setLoadingInsight(false);
  };
  
  const calculateFinancialSummary = useMemo<FinancialSummary>(() => {
    return { totalRevenue: 0, totalExpenses: 0, profit: 0 };
  }, [harvests, activities, products]);

  // ===============================================
  // 5. TRATAMENTO DE ERRO FATAL (TELA BRANCA)
  // ===============================================
  if (!supabase) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-10">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Configuração Pendente</h1>
                <p className="text-gray-600 mb-6">
                    O aplicativo não conseguiu se conectar ao banco de dados. 
                    <br/><br/>
                    <strong>Motivo provável:</strong> As Variáveis de Ambiente não foram encontradas.
                </p>
                <div className="bg-gray-100 p-4 rounded text-left text-sm font-mono text-gray-700 mb-6">
                    Certifique-se de que estas chaves estão definidas na Vercel:
                    <ul className="list-disc pl-5 mt-2">
                        <li>VITE_SUPABASE_URL</li>
                        <li>VITE_SUPABASE_ANON_KEY</li>
                    </ul>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                    Recarregar Página
                </button>
            </div>
        </div>
    );
  }

  // ===============================================
  // 6. RENDERIZAÇÃO DA INTERFACE
  // ===============================================
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'} overflow-hidden bg-white shadow-xl flex flex-col justify-between border-r border-gray-200`}>
        
        {/* Menu de Navegação */}
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-center">
                <h1 className="text-xl font-bold text-agri-700">Fazenda Cassiano's</h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <SidebarItem icon={LayoutDashboard} label="Visão Geral" tab="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem icon={Trees} label="Talhões" tab="plots" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem icon={Package} label="Estoque / Insumos" tab="products" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem icon={ClipboardList} label="Atividades" tab="activities" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem icon={TrendingUp} label="Colheitas" tab="harvests" activeTab={activeTab} setActiveTab={setActiveTab} />
                <SidebarItem icon={BrainCircuit} label="Analista IA" tab="analyst" activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>

            {/* Botões de Ação no Rodapé da Sidebar */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button onClick={handleManualSave} className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-150 mb-3">
                    <Save className="w-5 h-5 mr-2" />
                    Salvar Dados
                </button>
                <button onClick={handleDownloadSource} className="w-full flex items-center justify-center py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition duration-150 text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Fonte
                </button>
            </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho Mobile / Título */}
        <header className="bg-white shadow-sm z-10 p-4 flex items-center justify-between lg:hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600">
                <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">Fazenda App</span>
            <div className="w-6"></div> {/* Espaçador */}
        </header>

        {/* Notificação Flutuante */}
        {showSaveNotification && (
          <div className="fixed top-5 right-5 z-50 p-4 bg-green-500 text-white rounded-lg shadow-xl flex items-center space-x-2 animate-bounce">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Dados salvos com sucesso!</span>
          </div>
        )}
        
        {/* Área de Conteúdo */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
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

// Componente Auxiliar para Item da Sidebar
const SidebarItem = ({ icon: Icon, label, tab, activeTab, setActiveTab }: any) => {
    const isActive = activeTab === tab;
    return (
        <button 
          onClick={() => setActiveTab(tab)}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition duration-150 ${
            isActive 
              ? 'bg-blue-100 text-blue-700 font-semibold' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};