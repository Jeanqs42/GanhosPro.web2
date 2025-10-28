import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.15.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured in Supabase secrets.");
    }

    const ai = new GoogleGenerativeAI(geminiApiKey);
    const { type, payload, chatHistory } = await req.json();

    let resultText: string;

    switch (type) {
      case 'analyzeRecords': {
        const { records, settings } = payload;
        const recordsSummary = records.map((r: any) => {
            const date = new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const carCost = r.kmDriven * settings.costPerKm;
            const netProfit = r.totalEarnings - (r.additionalCosts || 0) - carCost;
            return `- Data: ${date}, Ganhos: R$${r.totalEarnings.toFixed(2)}, KM: ${r.kmDriven.toFixed(1)}, Lucro Líquido: R$${netProfit.toFixed(2)}`;
        }).join('\n');

        const prompt = `
            Você é um assistente financeiro especializado em analisar dados de motoristas de aplicativo.
            Analise os seguintes registros de ganhos de um motorista. O custo por KM configurado é de R$${settings.costPerKm.toFixed(2)}.

            Registros:
            ${recordsSummary}

            Com base nesses dados, forneça uma análise concisa e útil. Inclua:
            1.  Um resumo geral do desempenho (Média de lucro líquido diário, média de R$/KM rodado líquido).
            2.  Identifique o dia mais lucrativo e o menos lucrativo.
            3.  Ofereça 2-3 dicas práticas e acionáveis para que o motorista possa aumentar seus lucros, com base nos dados fornecidos.

            Formate sua resposta de forma clara e amigável. Use bullets points para as dicas.
        `;
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: "Você é um especialista em finanças para motoristas de aplicativo. Seja direto, use a moeda Real (R$) e a métrica de quilômetros (KM)." });
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break;
      }
      case 'getChatFollowUp': {
        const { records, settings } = payload;
        const recordsSummary = records.map((r: any) => {
            const date = new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const carCost = r.kmDriven * settings.costPerKm;
            const netProfit = r.totalEarnings - (r.additionalCosts || 0) - carCost;
            return `- Data: ${date}, Ganhos: R$${r.totalEarnings.toFixed(2)}, KM: ${r.kmDriven.toFixed(1)}, Lucro Líquido: R$${netProfit.toFixed(2)}, Horas Trabalhadas: ${r.hoursWorked?.toFixed(1) || 'N/A'}, Custos Adicionais: R$${(r.additionalCosts || 0).toFixed(2)}`;
        }).join('\n');

        const contextMessage = {
            role: 'user' as const,
            parts: [{ text: `Aqui estão todos os registros de corrida do usuário e suas configurações. Use-os para responder às perguntas de forma detalhada, se necessário. Custo por KM: R$${settings.costPerKm.toFixed(2)}\n\nRegistros:\n${recordsSummary}` }]
        };

        const latestUserMessage = chatHistory[chatHistory.length - 1];
        const conversationHistoryForGemini = chatHistory.slice(0, -1);

        const historyForChat = [
            contextMessage,
            ...conversationHistoryForGemini,
        ];

        const model = ai.getGenerativeModel({ 
            model: 'gemini-2.5-flash', 
            systemInstruction: "Você é um especialista em finanças para motoristas de aplicativo. Responda às perguntas do usuário de forma curta e direta, usando os dados fornecidos e o histórico da conversa. Se a pergunta exigir detalhes específicos dos registros, consulte-os."
        });
        const chat = model.startChat({
            history: historyForChat,
        });
        const result = await chat.sendMessage(latestUserMessage.parts[0].text);
        resultText = result.response.text();
        break;
      }
      case 'getIntelligentReportAnalysis': {
        const { reportData, metricLabel } = payload;
        const dataSummary = reportData
            .map((d: any) => `Data: ${d.date}, Valor: ${d.value.toFixed(2)} ${d.unit}`)
            .join('\n');

        const prompt = `
            Você é um assistente financeiro conciso.
            Analise os seguintes dados de um relatório personalizado de um motorista de aplicativo sobre a métrica "${metricLabel}".

            Dados do Relatório:
            ${dataSummary}

            Forneça um feedback de UMA frase ou no máximo duas, resumindo o desempenho ou destacando um ponto importante (como o melhor dia ou uma tendência).
            Seja extremamente direto e objetivo. Exemplo: "Seu desempenho teve um pico no dia X, mas mostrou uma queda nos dias seguintes." ou "Sua média de ${metricLabel} se manteve estável durante o período."
        `;
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction: "Seja um especialista financeiro que fornece insights rápidos e diretos. Use a moeda Real (R$) e a métrica de quilômetros (KM)." });
        const result = await model.generateContent(prompt);
        resultText = result.response.text();
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid Gemini API type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ result: resultText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Gemini Proxy Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});