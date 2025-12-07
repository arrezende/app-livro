import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um assistente literário útil. Analise o seguinte texto extraído de uma página de livro e forneça um resumo conciso (máximo 3 frases) e explique quaisquer conceitos complexos ou termos arcaicos se existirem. Responda em Português.\n\nTexto:\n"${text}"`,
    });
    
    return response.text || "Não foi possível gerar um resumo.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao conectar com a IA.");
  }
};

export const generateRecap = async (bookTitle: string, text: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
Você é um assistente de memória literária. O usuário está lendo o livro "${bookTitle}".
Ele parou de ler e precisa lembrar o que estava acontecendo.

Regras Críticas:
1. Eu vou te fornecer o texto do capítulo anterior e o texto do capítulo atual ATÉ O PONTO ONDE O USUÁRIO PAROU.
2. O texto termina abruptamente. NÃO invente o que acontece depois.
3. Resuma os eventos principais que levaram até o momento atual.
4. Termine o resumo com um gancho ("cliffhanger") sutil baseada na última frase lida, convidando o usuário a continuar.
5. Use tom amigável e evite spoilers de qualquer coisa que não esteja no texto fornecido.
6. Responda em Português.

Texto lido até agora:
"${text}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o resumo do que aconteceu até agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao conectar com a IA para gerar o histórico.");
  }
};

export const analyzeSelection = async (text: string, mode: 'explain' | 'summarize' | 'translate'): Promise<string> => {
  try {
    const ai = getClient();
    let prompt = "";

    switch (mode) {
      case 'explain':
        prompt = `Explique o significado, contexto ou conceitos presentes neste trecho destacado: "${text}". Se for uma palavra arcaica ou termo específico, dê a definição. Responda em Português de forma didática.`;
        break;
      case 'summarize':
        prompt = `Resuma este trecho específico em uma única frase clara: "${text}". Responda em Português.`;
        break;
      case 'translate':
        prompt = `Traduza o seguinte trecho para o Português Brasileiro, mantendo o tom literário original: "${text}"`;
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível analisar o trecho selecionado.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao processar o texto selecionado.");
  }
};

export const identifyCharacter = async (characterName: string, bookTitle: string, author: string): Promise<string> => {
  try {
    const ai = getClient();
    
    const prompt = `
Você é um assistente literário para leitores que estão lendo o livro "${bookTitle}" de "${author || 'Autor desconhecido'}".
O usuário selecionou o nome "${characterName}" e quer saber quem é esse personagem.

DIRETRIZES ESTRITAS DE SEGURANÇA (ANTI-SPOILER):
1. Descreva o personagem baseando-se APENAS na premissa inicial do livro e em traços de personalidade gerais.
2. É ESTRITAMENTE PROIBIDO mencionar eventos que acontecem no final deste livro ou em livros sequentes da mesma série.
3. Se o personagem tiver uma identidade secreta ou reviravolta futura, NÃO a revele.
4. Foque em: Aparência física, papel na história (cargo/profissão) e relação inicial com o protagonista.
5. Se você não conhece o livro, use a ferramenta de busca para encontrar informações, mas FILTRE qualquer informação que pareça ser um spoiler, morte de personagem ou final da trama.
6. Responda em Português, de forma concisa (máximo 1 parágrafo).

Exemplo de tom seguro: "Severo Snape é o mestre de Poções em Hogwarts. Ele tem cabelos oleosos, nariz adunco e uma personalidade fria e sarcástica. Desde o início, demonstra uma forte antipatia por Harry Potter."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}], 
      }
    });

    return response.text || "Não foi possível identificar este personagem sem riscos de spoiler.";
  } catch (error) {
    console.error("Gemini Character ID Error:", error);
    throw new Error("Falha ao identificar o personagem.");
  }
};

export const detectBookGenre = async (title: string, author: string, snippet: string): Promise<'HORROR' | 'ROMANCE' | 'ADVENTURE' | 'FANTASY' | 'MYSTERY' | 'NONFICTION' | 'GENERAL'> => {
  try {
    const ai = getClient();
    const prompt = `
    Analise o título "${title}", autor "${author}" e o seguinte trecho do livro:
    "${snippet.substring(0, 500)}..."
    
    Classifique este livro em UM dos seguintes gêneros para definir a entonação de voz do narrador:
    HORROR (Terror, Suspense pesado)
    ROMANCE (Drama, Poesia, Romance)
    ADVENTURE (Ação, Épico, Heroico)
    FANTASY (Fantasia, Mágico)
    MYSTERY (Policial, Investigação)
    NONFICTION (Técnico, Biografia, História)
    
    Responda APENAS com a palavra da categoria (ex: HORROR). Se não tiver certeza, responda GENERAL.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const genre = (response.text?.trim().toUpperCase() || 'GENERAL') as any;
    return genre;
  } catch (e) {
    return 'GENERAL';
  }
}