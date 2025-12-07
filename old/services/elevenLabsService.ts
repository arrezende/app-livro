
export type BookGenre = 'HORROR' | 'ROMANCE' | 'ADVENTURE' | 'FANTASY' | 'MYSTERY' | 'NONFICTION' | 'GENERAL';

const VOICE_MAP: Record<BookGenre, string> = {
  // IDs de voz da ElevenLabs (Exemplos públicos)
  // Nota: Em produção, ideal usar IDs verificados ou clonados
  HORROR: 'Tj9l48J9AJbry5yCP5eW', // Antoni (Deep/Intense) - Improvisado como grave
  ROMANCE: '21m00Tcm4TlvDq8ikWAM', // Rachel (Soft/Expressive)
  ADVENTURE: 'D38z5RcWu1voky8WS1ja', // Fin (Energetic/Gaming) - Usando placeholder, ideal achar uma voz heróica
  FANTASY: 'pNInz6obpgDQGcFmaJgB', // Adam (Deep narration)
  MYSTERY: 'TxGEqnHWrfWFTfGW9XjX', // Josh (Deep/Serious)
  NONFICTION: 'EXAVITQu4vr4xnSDxMaL', // Bella (Professional)
  GENERAL: '21m00Tcm4TlvDq8ikWAM' // Rachel (Standard)
};

export const generateSpeech = async (text: string, genre: BookGenre): Promise<string> => {
  const apiKey = process.env.ELEVEN_LABS_API_KEY;
  if (!apiKey) {
    throw new Error("ElevenLabs API Key não configurada.");
  }

  const voiceId = VOICE_MAP[genre] || VOICE_MAP.GENERAL;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          // Ajustes sutis baseados no gênero poderiam ser feitos aqui também
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail?.message || "Erro ao gerar áudio");
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("ElevenLabs Error:", error);
    throw error;
  }
};
