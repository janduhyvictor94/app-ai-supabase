import { createClient } from '@supabase/supabase-js';

// --- Variáveis de Ambiente ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Inicialização do Cliente Supabase ---
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface FazendaData {
  plots: any[];
  products: any[];
  activities: any[];
  harvests: any[];
  activityTypes: string[];
  categories: string[];
}

export async function fetchData(): Promise<FazendaData | null> {
  if (!supabase) {
    console.error("Erro: Cliente Supabase não inicializado.");
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('registros')
      .select('conteudo')
      .eq('id', 1)
      .single(); 
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data ? data.conteudo : null;
  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DO SUPABASE:", (error as Error).message);
    return null;
  }
}

export async function saveData(dataToSave: FazendaData): Promise<boolean> {
  if (!supabase) {
    console.error("Erro: Cliente Supabase não inicializado.");
    return false;
  }
  const { error } = await supabase
    .from('registros')
    .upsert(
      [
        { id: 1, conteudo: dataToSave }
      ], 
      { onConflict: 'id' } 
    );
  if (error) {
    console.error("ERRO AO SALVAR DADOS NO SUPABASE:", (error as Error).message);
    return false;
  }
  return true;
}