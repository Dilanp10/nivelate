import { Platform } from 'react-native';

// Wrapper mínimo de Text-to-Speech con la Web Speech API (SpeechSynthesis).
// Decisión del proyecto: TTS en runtime, gratis, sin backend. Solo web en MVP.

export function isTtsAvailable(): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isTtsAvailable()) return null;
  const voices = window.speechSynthesis.getVoices();
  // Preferencia: en-US, luego cualquier en-*.
  return (
    voices.find((v) => v.lang === 'en-US') ??
    voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
    null
  );
}

/**
 * Reproduce `text` en inglés. Si el navegador no soporta TTS, resuelve sin hacer
 * nada (el UI muestra el texto igual). getVoices() puede estar vacío hasta el
 * evento voiceschanged; por eso reintentamos una vez.
 */
export function speak(text: string, lang = 'en-US'): void {
  if (!isTtsAvailable()) return;

  const synth = window.speechSynthesis;
  synth.cancel(); // corta cualquier reproducción previa

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.95;

  const voice = pickEnglishVoice();
  if (voice) {
    utter.voice = voice;
    synth.speak(utter);
    return;
  }

  // Voces todavía no cargadas: esperar una vez a voiceschanged.
  const onVoices = () => {
    const v = pickEnglishVoice();
    if (v) utter.voice = v;
    synth.speak(utter);
    synth.removeEventListener('voiceschanged', onVoices);
  };
  synth.addEventListener('voiceschanged', onVoices);
  // Fallback: si el evento no dispara pronto, hablar igual con la voz default.
  setTimeout(() => {
    synth.removeEventListener('voiceschanged', onVoices);
    if (!synth.speaking) synth.speak(utter);
  }, 250);
}

export function stopSpeaking(): void {
  if (isTtsAvailable()) window.speechSynthesis.cancel();
}
