// 🤖 AI SERVICES - Runware Image Gen + OpenAI TTS
import OpenAI from 'openai';
import fetch from 'node-fetch';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key-for-development'
});

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || 'mock-key-for-development';

// 🎨 Generate Image with Runware API
export async function generateImage(prompt, style = 'meme') {
  try {
    // Runware API endpoint
    const response = await fetch('https://api.runware.ai/v1/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWARE_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        style: style,
        size: '1024x1024',
        quality: 'standard',
        n: 1
      })
    });

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      return {
        success: true,
        imageUrl: data.images[0].url,
        prompt: prompt
      };
    }

    // Fallback if API fails
    return {
      success: false,
      imageUrl: null,
      error: 'Image generation failed'
    };
  } catch (error) {
    console.error('Runware API error:', error);
    return {
      success: false,
      imageUrl: null,
      error: error.message
    };
  }
}

// 🔊 Generate Audio with OpenAI TTS
export async function generateAudio(text, language = 'es', voice = 'alloy') {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice,
      input: text,
      speed: 0.9
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return {
      success: true,
      audio: buffer,
      format: 'mp3'
    };
  } catch (error) {
    console.error('OpenAI TTS error:', error);
    return {
      success: false,
      audio: null,
      error: error.message
    };
  }
}

// 🌍 Language configurations (all OpenAI TTS supported)
export const SUPPORTED_LANGUAGES = {
  es: { name: 'Spanish', voice: 'alloy', flag: '🇪🇸' },
  en: { name: 'English', voice: 'nova', flag: '🇺🇸' },
  fr: { name: 'French', voice: 'shimmer', flag: '🇫🇷' },
  de: { name: 'German', voice: 'echo', flag: '🇩🇪' },
  it: { name: 'Italian', voice: 'fable', flag: '🇮🇹' },
  pt: { name: 'Portuguese', voice: 'onyx', flag: '🇧🇷' },
  ja: { name: 'Japanese', voice: 'alloy', flag: '🇯🇵' },
  ko: { name: 'Korean', voice: 'nova', flag: '🇰🇷' },
  zh: { name: 'Chinese', voice: 'shimmer', flag: '🇨🇳' },
  ru: { name: 'Russian', voice: 'echo', flag: '🇷🇺' },
  ar: { name: 'Arabic', voice: 'fable', flag: '🇸🇦' },
  hi: { name: 'Hindi', voice: 'onyx', flag: '🇮🇳' },
  nl: { name: 'Dutch', voice: 'alloy', flag: '🇳🇱' },
  pl: { name: 'Polish', voice: 'nova', flag: '🇵🇱' },
  tr: { name: 'Turkish', voice: 'shimmer', flag: '🇹🇷' },
  sv: { name: 'Swedish', voice: 'echo', flag: '🇸🇪' },
  id: { name: 'Indonesian', voice: 'fable', flag: '🇮🇩' },
  th: { name: 'Thai', voice: 'onyx', flag: '🇹🇭' },
  vi: { name: 'Vietnamese', voice: 'alloy', flag: '🇻🇳' },
  uk: { name: 'Ukrainian', voice: 'nova', flag: '🇺🇦' }
};

// 🎯 Generate funny meme scenarios by language
export function generateScenario(language = 'es') {
  const scenarios = {
    es: [
      { text: '¡El gato usa mi laptop!', translation: 'The cat is using my laptop!', emoji: '😂' },
      { text: 'Quiero tacos todos los días', translation: 'I want tacos every day', emoji: '🌮' },
      { text: 'Mi guitarra canta mejor que yo', translation: 'My guitar sings better than me', emoji: '🎸' },
      { text: 'Café primero, español después', translation: 'Coffee first, Spanish later', emoji: '☕' },
      { text: 'La llama habla español mejor', translation: 'The llama speaks Spanish better', emoji: '🦙' }
    ],
    en: [
      { text: 'My dog ate my homework again!', translation: 'Mi perro comió mi tarea otra vez', emoji: '🐕' },
      { text: 'Coffee is my best friend', translation: 'El café es mi mejor amigo', emoji: '☕' },
      { text: 'I speak to plants daily', translation: 'Hablo con las plantas diariamente', emoji: '🌱' }
    ],
    fr: [
      { text: 'Le chat dort sur mon clavier', translation: 'The cat sleeps on my keyboard', emoji: '😺' },
      { text: 'Je veux des croissants tous les jours', translation: 'I want croissants every day', emoji: '🥐' },
      { text: 'La Tour Eiffel danse la nuit', translation: 'The Eiffel Tower dances at night', emoji: '🗼' }
    ],
    // Add more languages...
  };

  const langScenarios = scenarios[language] || scenarios.es;
  return langScenarios[Math.floor(Math.random() * langScenarios.length)];
}
