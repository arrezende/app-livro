// URL do seu Webhook N8N.
// Idealmente, isso deve vir de process.env.REACT_APP_N8N_WEBHOOK_URL ou similar.
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'https://n8n.arrezende.com.br/webhook/lumina-ai'

interface N8NResponse {
  text: string
}

/**
 * Função genérica para comunicar com o N8N
 */
async function callN8N(payload: any): Promise<string> {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Erro N8N: ${response.statusText}`)
    }

    const data: N8NResponse = await response.json()
    console.log('N8N Response:', data)

    //O workflow do N8N deve retornar um JSON com a propriedade "text"
    if (!data.text) {
      throw new Error(
        "Formato de resposta do N8N inválido. Esperado { text: '...' }",
      )
    }

    return data.text
  } catch (error) {
    console.error('N8N Service Error:', error)
    // Fallback amigável ou rethrow
    throw new Error('Não foi possível processar a solicitação com a IA.')
  }
}

export const summarizeText = async (text: string): Promise<string> => {
  return callN8N({
    action: 'summarize',
    text: text,
  })
}

export const generateRecap = async (
  bookTitle: string,
  text: string,
): Promise<string> => {
  return callN8N({
    action: 'recap',
    bookTitle: bookTitle,
    text: text,
  })
}

export const analyzeSelection = async (
  text: string,
  mode: 'explain' | 'summarize' | 'translate',
): Promise<string> => {
  return callN8N({
    action: 'analyze',
    mode: mode, // explain, summarize, translate
    text: text,
  })
}

export const identifyCharacter = async (
  characterName: string,
  bookTitle: string,
  author: string,
): Promise<string> => {
  return callN8N({
    action: 'identify_character',
    characterName: characterName,
    bookTitle: bookTitle,
    author: author,
  })
}

export const detectBookGenre = async (
  title: string,
  author: string,
  snippet: string,
): Promise<
  | 'HORROR'
  | 'ROMANCE'
  | 'ADVENTURE'
  | 'FANTASY'
  | 'MYSTERY'
  | 'NONFICTION'
  | 'GENERAL'
> => {
  try {
    const result = await callN8N({
      action: 'detect_genre',
      title: title,
      author: author,
      snippet: snippet.substring(0, 1000),
    })

    const genre = result.trim().toUpperCase()

    // Validação básica para garantir que o N8N retornou um gênero válido
    const validGenres = [
      'HORROR',
      'ROMANCE',
      'ADVENTURE',
      'FANTASY',
      'MYSTERY',
      'NONFICTION',
      'GENERAL',
    ]
    if (validGenres.includes(genre)) {
      return genre as any
    }
    return 'GENERAL'
  } catch (e) {
    console.warn('Falha na detecção de gênero via N8N, usando padrão.', e)
    return 'GENERAL'
  }
}
