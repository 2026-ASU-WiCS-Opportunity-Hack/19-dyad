const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

function readEnvValue(key: string) {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : "";
}

export function hasElevenLabsConfig() {
  return Boolean(readEnvValue("ELEVENLABS_API_KEY") && readEnvValue("ELEVENLABS_VOICE_ID"));
}

export function getElevenLabsVoiceId() {
  return readEnvValue("ELEVENLABS_VOICE_ID");
}

export function getElevenLabsModelId() {
  return readEnvValue("ELEVENLABS_MODEL_ID") || "eleven_multilingual_v2";
}

export async function requestSpeechAudio({
  text
}: {
  text: string;
}) {
  const apiKey = readEnvValue("ELEVENLABS_API_KEY");
  const voiceId = getElevenLabsVoiceId();
  if (!apiKey || !voiceId) {
    throw new Error("ElevenLabs is not configured.");
  }

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey
      },
      body: JSON.stringify({
        text,
        model_id: getElevenLabsModelId()
      })
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `ElevenLabs request failed with status ${response.status}`);
  }

  return response.arrayBuffer();
}
