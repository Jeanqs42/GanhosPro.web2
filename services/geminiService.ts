import { supabase } from '../src/integrations/supabase/client'; // Import Supabase client
import { RunRecord, AppSettings } from '../types';

// A chave da API do Gemini não é mais lida diretamente aqui, pois será usada na Edge Function.
// Removido: const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
// Removido: const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const invokeGeminiProxy = async (type: string, payload: any, chatHistory?: any[]) => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { type, payload, chatHistory },
    });

    if (error) {
      console.error('Supabase Function Invoke Error:', error);
      throw new Error(`Falha ao invocar a função Gemini Proxy: ${error.message}`);
    }
    if (data && data.result) {
      return data.result;
    }
    throw new Error('Resposta inválida da função Gemini Proxy.');
  } catch (error: any) {
    console.error("Error invoking Gemini proxy:", error);
    // Re-throw specific errors for better client-side handling
    if (error.message.includes("API_KEY_INVALID")) {
        throw new Error("Chave de API do Gemini inválida. Verifique sua chave em .env.local ou nos segredos do Supabase.");
    } else if (error.message.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("Limite de uso da API do Gemini atingido. Tente novamente mais tarde.");
    } else if (error.message.includes("NETWORK_ERROR") || error.message.includes("Failed to fetch")) {
        throw new Error("Erro de rede ao conectar com a IA. Verifique sua conexão.");
    }
    throw new Error(`Falha ao comunicar com o serviço de IA: ${error.message || 'Erro desconhecido'}`);
  }
};

export const analyzeRecords = async (records: RunRecord[], settings: AppSettings): Promise<string> => {
    // A validação da chave da API agora é feita na Edge Function
    return invokeGeminiProxy('analyzeRecords', { records, settings });
};

export const getChatFollowUp = async (
  records: RunRecord[],
  settings: AppSettings,
  fullChatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
    // A validação da chave da API agora é feita na Edge Function
    return invokeGeminiProxy('getChatFollowUp', { records, settings }, fullChatHistory);
};


export const getIntelligentReportAnalysis = async (
  reportData: { date: string; value: number; metric: string; unit: string }[],
  metricLabel: string
): Promise<string> => {
    // A validação da chave da API agora é feita na Edge Function
    return invokeGeminiProxy('getIntelligentReportAnalysis', { reportData, metricLabel });
};