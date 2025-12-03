import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Interfaces de Dados ---
interface FazendaData {
  plots: any[];
  products: any[];
  activities: any[];
  harvests: any[];
  activityTypes: string[];
  categories: string[];
}

// --- Inicialização do Cliente Supabase ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// O cliente é inicializado fora da função para ser reutilizado.
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

/**
 * Função para buscar (READ) o registro de dados completo da fazenda.
 * @returns {Promise<FazendaData | null>}
 */
export async function fetchData(): Promise<FazendaData | null> {
  if (!supabase) {
    console.error("Erro: Cliente Supabase não inicializado. Verifique as chaves VITE_ na Vercel.");
    return null;
  }

  try {
    // CORREÇÃO: Usando .single() para resolver o erro 406 na leitura (Not Acceptable)
    const { data, error } = await supabase
      .from('registros')
      .select('conteudo')
      .eq('id', 1)
      .single(); // <--- CHAVE PARA RESOLVER O ERRO 406

    // PGRST116: Código para 'Linha não encontrada' (o que é normal se o banco estiver vazio)
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Se houver dados, retorna o conteúdo da coluna 'conteudo'
    return data ? data.conteudo : null;

  } catch (error) {
    console.error("ERRO AO BUSCAR DADOS DO SUPABASE:", (error as Error).message);
    return null;
  }
}

/**
 * Função para salvar/atualizar (UPSERT) o registro de dados completo da fazenda.
 * @param {FazendaData} dataToSave - O objeto contendo todos os dados do estado da aplicação.
 * @returns {Promise<boolean>} Retorna true em caso de sucesso.
 */
export async function saveData(dataToSave: FazendaData): Promise<boolean> {
  if (!supabase) {
    console.error("Erro: Cliente Supabase não inicializado.");
    return false;
  }

  // Faz um 'upsert' (atualizar ou inserir) no registro com ID 1
  const { error } = await supabase
    .from('registros')
    .upsert(
      [
        { id: 1, conteudo: dataToSave }
      ], 
      { onConflict: 'id' } // Garante que, se o ID 1 existir, ele será atualizado.
    );

  if (error) {
    console.error("ERRO AO SALVAR DADOS NO SUPABASE:", (error as Error).message);
    return false;
  }

  return true;
}