export type BookGenre =
  | 'HORROR'
  | 'ROMANCE'
  | 'ADVENTURE'
  | 'FANTASY'
  | 'MYSTERY'
  | 'NONFICTION'
  | 'GENERAL'

// URL do seu Webhook N8N para áudio.
// Pode ser o mesmo do texto com action diferente, ou um webhook dedicado.
const N8N_AUDIO_WEBHOOK_URL =
  process.env.N8N_AUDIO_WEBHOOK_URL ||
  process.env.N8N_WEBHOOK_URL ||
  'https://n8n.arrezende.com.br/webhook/lumina-audio'

export const generateSpeech = async (
  text: string,
  genre: BookGenre,
): Promise<string> => {
  // No N8N, você deve configurar o nó "Respond to Webhook" para retornar Binary Data
  // E configurar o nó ElevenLabs/OpenAI TTS para baixar o áudio.

  try {
    const response = await fetch(N8N_AUDIO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_audio',
        text: text,
        genre: 'GENERAL',
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao gerar áudio via N8N')
    }

    // O N8N deve retornar o arquivo binário (audio/mpeg)
    const blob = await response.blob()

    if (blob.size === 0) {
      throw new Error('Áudio vazio recebido do N8N')
    }

    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('N8N Audio Service Error:', error)
    throw error
  }
}
