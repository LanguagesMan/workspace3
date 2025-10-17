// Entertainment Feed Server - Port 3002
// TikTok-style Spanish learning feed
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// API Keys
const NEWS_API_KEY = '962a4f6e3387404391515f59121a4c02';
const YOUTUBE_API_KEY = 'AIzaSyAD7NoeCyFG7eK2ykBuklNUyai_5upGwDs';
const GUARDIAN_API_KEY = 'adcfe54f-5c44-4c57-a4c5-9ceb886d6fc6';

// Helper function to fetch from NewsAPI
function fetchNewsAPI(query, language, pageSize = 5) {
  return new Promise((resolve, reject) => {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper function to fetch Spanish learning videos from YouTube
function fetchYouTubeVideos(query, maxResults = 5) {
  return new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&relevanceLanguage=es&videoDuration=medium`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Helper function to fetch from Guardian API
function fetchGuardianNews(query, pageSize = 3) {
  return new Promise((resolve, reject) => {
    const url = `https://content.guardianapis.com/search?q=${encodeURIComponent(query)}&show-fields=headline,trailText,thumbnail&page-size=${pageSize}&api-key=${GUARDIAN_API_KEY}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Serve the entertainment feed FIRST (before static middleware)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'entertainment-feed.html'));
});

// Static files for other assets
app.use(express.static('public'));

// API endpoint for feed content with REAL Spanish news + YouTube videos + Guardian
app.get('/api/feed', async (req, res) => {
  try {
    // Fetch real Spanish articles from NewsAPI
    const newsData = await fetchNewsAPI('spanish OR español OR spain', 'es', 3);
    const realArticles = newsData.articles ? newsData.articles.map((article, idx) => ({
      id: `news-${idx + 100}`,
      type: 'article',
      title: article.title,
      description: article.description || article.title,
      spanish: article.description || article.title,
      english: '', // Translation would be added via LibreTranslate
      content: article.description || article.title,
      imageUrl: article.urlToImage || 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400',
      level: 'B1',
      source: article.source.name || 'News',
      url: article.url,
      likes: Math.floor(Math.random() * 5000),
      saves: Math.floor(Math.random() * 1000)
    })) : [];

    // Fetch real Spanish learning videos from YouTube - MULTIPLE QUERIES for variety
    const videoQueries = [
      'spanish conversation practice',
      'aprende español latinos',
      'spanish music videos',
      'spanish cooking recipes',
      'spanish travel vlog',
      'spanish comedy sketches'
    ];

    const allVideos = [];
    for (const query of videoQueries.slice(0, 3)) { // Fetch from 3 different queries
      try {
        const youtubeData = await fetchYouTubeVideos(query, 2);
        if (youtubeData.items) {
          const videos = youtubeData.items.map((item, idx) => ({
            id: `youtube-${query.replace(/\s+/g, '-')}-${idx}`,
            type: 'video',
            title: item.snippet.title,
            description: item.snippet.description.substring(0, 150) + '...',
            videoUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&mute=1`,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
            level: ['A2', 'B1', 'B2'][Math.floor(Math.random() * 3)],
            captions: [
              { start: 0, end: 3, spanish: '¡Hola! Bienvenidos a esta lección.', english: 'Hello! Welcome to this lesson.' },
              { start: 3, end: 6, spanish: 'Hoy vamos a aprender español.', english: 'Today we are going to learn Spanish.' },
              { start: 6, end: 9, spanish: '¡Empecemos!', english: "Let's begin!" }
            ],
            likes: Math.floor(Math.random() * 10000),
            saves: Math.floor(Math.random() * 2000)
          }));
          allVideos.push(...videos);
        }
      } catch (err) {
        console.error(`Error fetching videos for query "${query}":`, err.message);
      }
    }

    const realVideos = allVideos;

    // Fetch articles from Guardian API
    const guardianData = await fetchGuardianNews('spain OR spanish OR españa', 2);
    const guardianArticles = guardianData.response?.results ? guardianData.response.results.map((article, idx) => ({
      id: `guardian-${idx + 300}`,
      type: 'article',
      title: article.fields?.headline || article.webTitle,
      description: article.fields?.trailText || article.webTitle,
      spanish: article.fields?.trailText || article.webTitle,
      english: '',
      content: article.fields?.trailText || article.webTitle,
      imageUrl: article.fields?.thumbnail || 'https://images.unsplash.com/photo-1508433957232-3107f5fd5995?w=400',
      level: 'B2',
      source: 'The Guardian',
      url: article.webUrl,
      likes: Math.floor(Math.random() * 8000),
      saves: Math.floor(Math.random() * 1500)
    })) : [];

    const feedContent = [
    {
      id: 1,
      type: 'video',
      title: 'Easy Spanish: Street Conversations in Madrid',
      description: 'Learn real Spanish from native speakers on the streets of Madrid',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: '/images/spanish-street.jpg',
      level: 'B1',
      captions: [
        { start: 0, end: 3, spanish: '¡Hola! ¿Qué tal? ¿Cómo estás?', english: 'Hello! How are you? How are you doing?' },
        { start: 3, end: 6, spanish: 'Muy bien, gracias. ¿Y tú?', english: 'Very well, thanks. And you?' },
        { start: 6, end: 9, spanish: 'Todo bien, aprendiendo español.', english: 'All good, learning Spanish.' }
      ],
      likes: 1234,
      saves: 456
    },
    {
      id: 2,
      type: 'article',
      title: '😱 ¡No lo creerás!',
      description: 'Spanish dinner at 10 PM? Discover crazy Spanish customs!',
      spanish: '¿Sabías que en España la gente cena a las 10 de la noche? ¡Qué locura! En otros países ya están durmiendo. Pero los españoles están comiendo tapas y bebiendo vino. ¿Por qué? Porque les gusta vivir de noche. Y luego duermen siesta durante el día. ¡Vida española!',
      english: 'Did you know that in Spain people eat dinner at 10 PM? How crazy! In other countries they are already sleeping. But Spaniards are eating tapas and drinking wine. Why? Because they like to live at night. And then they sleep siesta during the day. Spanish life!',
      content: '¿Sabías que en España la gente cena a las 10 de la noche? ¡Qué locura! En otros países ya están durmiendo. Pero los españoles están comiendo tapas y bebiendo vino. ¿Por qué? Porque les gusta vivir de noche. Y luego duermen siesta durante el día. ¡Vida española!',
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      level: 'A1',
      vocabulary: [
        { word: 'cena', translation: 'dinner', context: 'la gente cena' },
        { word: 'locura', translation: 'craziness', context: '¡Qué locura!' },
        { word: 'siesta', translation: 'afternoon nap', context: 'duermen siesta' }
      ],
      source: 'España WTF',
      likes: 12890,
      saves: 4234
    },
    {
      id: 3,
      type: 'music',
      title: 'Bailando - Enrique Iglesias',
      description: 'Learn Spanish through reggaeton lyrics',
      artist: 'Enrique Iglesias',
      audioUrl: '/audio/sample-spanish-song.mp3',
      lyrics: [
        { time: 0, line: 'Yo te miro y se me corta la respiración', translation: 'I look at you and I lose my breath' },
        { time: 4, line: 'Cuando tú me miras se me sube el corazón', translation: 'When you look at me my heart races' }
      ],
      albumArt: '/images/bailando.jpg',
      level: 'B2',
      likes: 2345,
      saves: 678
    },
    {
      id: 4,
      type: 'story',
      title: 'Cuento: El Principito',
      description: 'Read a classic Spanish story with interactive translations',
      content: 'Cuando yo tenía seis años vi una vez una lámina magnífica en un libro sobre el Bosque Virgen que se llamaba "Historias Vividas"...',
      imageUrl: '/images/principito.jpg',
      level: 'C1',
      vocabulary: [
        { word: 'lámina', translation: 'picture/illustration', context: 'una lámina magnífica' },
        { word: 'bosque', translation: 'forest', context: 'Bosque Virgen' }
      ],
      likes: 567,
      saves: 123
    },
    {
      id: 5,
      type: 'video',
      title: 'Butterfly Spanish: Common Mistakes',
      description: 'Learn to avoid common Spanish mistakes',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnailUrl: '/images/butterfly-spanish.jpg',
      level: 'A2',
      captions: [
        { start: 0, end: 4, spanish: '¡Hola! Hoy vamos a aprender errores comunes.', english: 'Hello! Today we are going to learn common mistakes.' },
        { start: 4, end: 8, spanish: 'El primer error es confundir ser y estar.', english: 'The first mistake is confusing ser and estar.' },
        { start: 8, end: 12, spanish: '¿Entiendes la diferencia?', english: 'Do you understand the difference?' }
      ],
      likes: 3456,
      saves: 890
    },
    {
      id: 6,
      type: 'article',
      title: '💔 Shakira vs Piqué: El drama continúa',
      description: 'The drama never ends! New Shakira song breaks the internet',
      content: '¡El drama nunca termina! Shakira lanzó OTRA canción sobre Piqué. Esta vez se llama "Copa Vacía" y la gente está enloqueciendo en TikTok. Miles de videos con la canción. Todos dicen "Shakira tiene razón". Piqué no respondió... todavía. Pero Internet ya eligió su lado. Team Shakira está ganando.',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      level: 'A2',
      vocabulary: [
        { word: 'lanzó', translation: 'released/launched', context: 'Shakira lanzó' },
        { word: 'enloqueciendo', translation: 'going crazy', context: 'está enloqueciendo' },
        { word: 'eligió', translation: 'chose', context: 'Internet ya eligió' }
      ],
      source: 'Chisme Latino',
      likes: 45678,
      saves: 12234
    },
    {
      id: 7,
      type: 'music',
      title: 'Vivir Mi Vida - Marc Anthony',
      description: 'Salsa music with Spanish lyrics',
      artist: 'Marc Anthony',
      audioUrl: '/audio/sample-salsa.mp3',
      lyrics: [
        { time: 0, line: 'Voy a reír, voy a bailar', translation: 'I\'m going to laugh, I\'m going to dance' },
        { time: 3, line: 'Vivir mi vida, la la la la', translation: 'Live my life, la la la la' }
      ],
      albumArt: '/images/marc-anthony.jpg',
      level: 'A2',
      likes: 4567,
      saves: 1234
    },
    {
      id: 19,
      type: 'music',
      title: 'Despacito - Luis Fonsi',
      description: 'Learn Spanish with the viral hit',
      artist: 'Luis Fonsi ft. Daddy Yankee',
      audioUrl: '/audio/despacito.mp3',
      lyrics: [
        { time: 0, line: 'Sí, sabes que ya llevo un rato mirándote', translation: 'Yes, you know I\'ve been watching you for a while' },
        { time: 4, line: 'Tengo que bailar contigo hoy', translation: 'I have to dance with you today' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
      level: 'B1',
      likes: 98765,
      saves: 34567
    },
    {
      id: 20,
      type: 'music',
      title: 'La Bicicleta - Shakira',
      description: 'Colombian vallenato pop',
      artist: 'Shakira & Carlos Vives',
      audioUrl: '/audio/la-bicicleta.mp3',
      lyrics: [
        { time: 0, line: 'Nada voy a hacer rebuscando en las heridas del pasado', translation: 'I won\'t go searching in the wounds of the past' },
        { time: 5, line: 'A ti yo te quiero con mi corazón', translation: 'I love you with my heart' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      level: 'A2',
      likes: 87654,
      saves: 23456
    },
    {
      id: 21,
      type: 'music',
      title: 'Me Rehúso - Danny Ocean',
      description: 'Venezuelan pop ballad',
      artist: 'Danny Ocean',
      audioUrl: '/audio/me-rehuso.mp3',
      lyrics: [
        { time: 0, line: 'Me rehúso a darte un último beso', translation: 'I refuse to give you one last kiss' },
        { time: 4, line: 'Verte marchar y quedarme en silencio', translation: 'To see you leave and stay silent' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      level: 'B2',
      likes: 76543,
      saves: 19876
    },
    {
      id: 22,
      type: 'music',
      title: 'Oye Cómo Va - Tito Puente',
      description: 'Classic salsa rhythm',
      artist: 'Tito Puente',
      audioUrl: '/audio/oye-como-va.mp3',
      lyrics: [
        { time: 0, line: 'Oye cómo va, mi ritmo', translation: 'Hey, listen to my rhythm' },
        { time: 3, line: 'Bueno pa\' gozar, mulata', translation: 'Good for enjoying, mulata' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
      level: 'A1',
      likes: 65432,
      saves: 15678
    },
    {
      id: 23,
      type: 'music',
      title: 'Tusa - Karol G',
      description: 'Modern reggaeton anthem',
      artist: 'Karol G & Nicki Minaj',
      audioUrl: '/audio/tusa.mp3',
      lyrics: [
        { time: 0, line: 'Ya no tiene excusa', translation: 'She has no excuse anymore' },
        { time: 3, line: 'Hoy salió con su amiga, disque pa\' matar la tusa', translation: 'Today she went out with her friend, supposedly to kill the heartbreak' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400',
      level: 'B1',
      likes: 92345,
      saves: 28765
    },
    {
      id: 24,
      type: 'music',
      title: 'Amor Eterno - Rocío Dúrcal',
      description: 'Emotional mariachi ballad',
      artist: 'Rocío Dúrcal',
      audioUrl: '/audio/amor-eterno.mp3',
      lyrics: [
        { time: 0, line: 'Tú eres la tristeza de mis ojos', translation: 'You are the sadness of my eyes' },
        { time: 5, line: 'Que lloran en silencio por tu amor', translation: 'That cry in silence for your love' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
      level: 'C1',
      likes: 54321,
      saves: 13456
    },
    {
      id: 25,
      type: 'music',
      title: 'Felices los 4 - Maluma',
      description: 'Urban Latin pop',
      artist: 'Maluma',
      audioUrl: '/audio/felices-4.mp3',
      lyrics: [
        { time: 0, line: 'Y si con otro pasas el rato', translation: 'And if you spend time with another' },
        { time: 4, line: 'Vamos a ser felices los 4', translation: 'We\'ll all be happy, the 4 of us' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
      level: 'A2',
      likes: 81234,
      saves: 21098
    },
    {
      id: 26,
      type: 'music',
      title: 'Hawái - Maluma',
      description: 'Heartbreak reggaeton',
      artist: 'Maluma',
      audioUrl: '/audio/hawai.mp3',
      lyrics: [
        { time: 0, line: 'Puede que no te haga falta na\'', translation: 'Maybe you don\'t need anything' },
        { time: 4, line: 'Aparentemente na\'', translation: 'Apparently nothing' }
      ],
      albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
      level: 'B2',
      likes: 73456,
      saves: 18234
    },
    {
      id: 8,
      type: 'video',
      title: 'Travel Spanish: At the Airport',
      description: 'Essential Spanish phrases for traveling',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: '/images/airport.jpg',
      level: 'A1',
      captions: [
        { start: 0, end: 3, spanish: '¿Dónde está la puerta de embarque?', english: 'Where is the boarding gate?' },
        { start: 3, end: 6, spanish: 'Necesito un taxi al hotel.', english: 'I need a taxi to the hotel.' },
        { start: 6, end: 9, spanish: 'Gracias por su ayuda.', english: 'Thank you for your help.' }
      ],
      likes: 2345,
      saves: 567
    },
    {
      id: 9,
      type: 'story',
      title: 'Leyenda: La Llorona',
      description: 'A famous Mexican legend in Spanish',
      content: 'Cuentan que hace muchos años, una mujer muy hermosa se enamoró de un hombre rico y poderoso...',
      imageUrl: '/images/llorona.jpg',
      level: 'B1',
      vocabulary: [
        { word: 'cuentan', translation: 'they say/tell', context: 'Cuentan que' },
        { word: 'se enamoró', translation: 'fell in love', context: 'se enamoró de' },
        { word: 'poderoso', translation: 'powerful', context: 'hombre poderoso' }
      ],
      likes: 1234,
      saves: 456
    },
    {
      id: 10,
      type: 'article',
      title: '🌮 TikTok español se vuelve loco por esta receta',
      description: '10 million views! The recipe that broke Spanish TikTok',
      content: '10 millones de views. ¿La receta? Tortilla de patatas en el microondas. Sí, leíste bien. MICROONDAS. Los puristas están furiosos. "¡Eso no es tortilla!" Los jóvenes dicen "funciona, es rápido". ¿Tú qué opinas? Guerra civil culinaria en los comentarios.',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      level: 'A2',
      vocabulary: [
        { word: 'se vuelve loco', translation: 'goes crazy', context: 'TikTok se vuelve loco' },
        { word: 'puristas', translation: 'purists', context: 'Los puristas están' },
        { word: 'furiosos', translation: 'furious', context: 'están furiosos' }
      ],
      source: 'Recetas Virales',
      likes: 98765,
      saves: 23456
    },
    {
      id: 11,
      type: 'video',
      title: 'Spanish for Beginners: Greetings',
      description: 'Master essential Spanish greetings',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnailUrl: '/images/greetings.jpg',
      level: 'A1',
      captions: [
        { start: 0, end: 3, spanish: 'Buenos días. ¿Cómo te llamas?', english: 'Good morning. What is your name?' },
        { start: 3, end: 6, spanish: 'Me llamo María. Mucho gusto.', english: 'My name is María. Nice to meet you.' },
        { start: 6, end: 9, spanish: 'El gusto es mío. ¡Hasta luego!', english: 'The pleasure is mine. See you later!' }
      ],
      likes: 5678,
      saves: 1234
    },
    {
      id: 12,
      type: 'video',
      title: 'Spanish Slang: What Young People Say',
      description: 'Learn modern Spanish slang and expressions',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnailUrl: '/images/slang.jpg',
      level: 'B2',
      captions: [
        { start: 0, end: 4, spanish: '¡Qué guay! Esta fiesta está genial.', english: 'How cool! This party is awesome.' },
        { start: 4, end: 8, spanish: 'Tío, esto mola un montón.', english: 'Dude, this is really cool.' },
        { start: 8, end: 12, spanish: '¡Flipante! Me encanta.', english: 'Amazing! I love it.' }
      ],
      likes: 4321,
      saves: 987
    },
    {
      id: 13,
      type: 'video',
      title: 'Spanish Food Vocabulary: At the Restaurant',
      description: 'Order food like a native speaker',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: '/images/restaurant.jpg',
      level: 'A2',
      captions: [
        { start: 0, end: 4, spanish: 'Quisiera una mesa para dos, por favor.', english: 'I would like a table for two, please.' },
        { start: 4, end: 8, spanish: 'Para mí, la paella valenciana.', english: 'For me, the Valencian paella.' },
        { start: 8, end: 12, spanish: 'Y de postre, flan casero.', english: 'And for dessert, homemade flan.' }
      ],
      likes: 3890,
      saves: 765
    },
    {
      id: 14,
      type: 'video',
      title: 'Spanish Culture: Flamenco Dancing',
      description: 'Learn about traditional Spanish flamenco',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      thumbnailUrl: '/images/flamenco.jpg',
      level: 'B1',
      captions: [
        { start: 0, end: 4, spanish: 'El flamenco es un baile tradicional español.', english: 'Flamenco is a traditional Spanish dance.' },
        { start: 4, end: 8, spanish: 'Se originó en Andalucía, en el sur de España.', english: 'It originated in Andalusia, in the south of Spain.' },
        { start: 8, end: 12, spanish: 'Es una expresión de pasión y emoción.', english: 'It is an expression of passion and emotion.' }
      ],
      likes: 6789,
      saves: 1456
    },
    {
      id: 15,
      type: 'video',
      title: 'Spanish Pronunciation: Rolling Rs',
      description: 'Master the Spanish R sound',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      thumbnailUrl: '/images/pronunciation.jpg',
      level: 'A1',
      captions: [
        { start: 0, end: 4, spanish: 'Perro, carro, ferrocarril.', english: 'Dog, car, railroad.' },
        { start: 4, end: 8, spanish: 'Practica con la lengua en el paladar.', english: 'Practice with your tongue on the palate.' },
        { start: 8, end: 12, spanish: 'Rosa, rojo, rápido, rico.', english: 'Pink, red, fast, rich.' }
      ],
      likes: 7890,
      saves: 2345
    },
    {
      id: 16,
      type: 'video',
      title: 'Spanish Grammar: Ser vs Estar',
      description: 'Finally understand ser and estar',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      thumbnailUrl: '/images/grammar.jpg',
      level: 'A2',
      captions: [
        { start: 0, end: 4, spanish: 'Yo soy estudiante. Permanente.', english: 'I am a student. Permanent.' },
        { start: 4, end: 8, spanish: 'Yo estoy cansado. Temporal.', english: 'I am tired. Temporary.' },
        { start: 8, end: 12, spanish: '¿Entiendes la diferencia ahora?', english: 'Do you understand the difference now?' }
      ],
      likes: 8901,
      saves: 3456
    },
    {
      id: 17,
      type: 'video',
      title: 'Spanish Holidays: La Tomatina',
      description: 'Learn about the famous tomato festival',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
      thumbnailUrl: '/images/tomatina.jpg',
      level: 'B1',
      captions: [
        { start: 0, end: 4, spanish: 'La Tomatina es una fiesta en Valencia.', english: 'La Tomatina is a festival in Valencia.' },
        { start: 4, end: 8, spanish: 'La gente se tira tomates por diversión.', english: 'People throw tomatoes for fun.' },
        { start: 8, end: 12, spanish: '¡Es una experiencia única e increíble!', english: 'It is a unique and incredible experience!' }
      ],
      likes: 5432,
      saves: 1098
    },
    {
      id: 18,
      type: 'video',
      title: 'Spanish Expressions: Weather Talk',
      description: 'Talk about the weather in Spanish',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
      thumbnailUrl: '/images/weather.jpg',
      level: 'A2',
      captions: [
        { start: 0, end: 4, spanish: '¿Qué tiempo hace hoy?', english: 'What is the weather like today?' },
        { start: 4, end: 8, spanish: 'Hace sol y mucho calor.', english: 'It is sunny and very hot.' },
        { start: 8, end: 12, spanish: 'Mañana va a llover.', english: 'Tomorrow it is going to rain.' }
      ],
      likes: 4567,
      saves: 890
    },
    {
      id: 19,
      type: 'music',
      title: 'Despacito - Luis Fonsi ft. Daddy Yankee',
      description: 'Learn Spanish with the most viral song ever',
      artist: 'Luis Fonsi',
      audioUrl: '/audio/despacito.mp3',
      lyrics: [
        { time: 0, line: 'Despacito, quiero respirar tu cuello despacito', translation: 'Slowly, I want to breathe on your neck slowly' },
        { time: 4, line: 'Deja que te diga cosas al oído', translation: 'Let me whisper things in your ear' }
      ],
      albumArt: '/images/despacito.jpg',
      level: 'A2',
      likes: 12000,
      saves: 4500
    },
    {
      id: 20,
      type: 'story',
      title: 'La Siesta Perfecta',
      description: 'A funny story about Spanish siesta culture',
      content: 'María era estadounidense y acababa de mudarse a España. Un día de agosto, salió a la calle a las 3 PM. Todo estaba cerrado. Las calles vacías. Pensó que había una emergencia nacional. Llamó a la policía. El policía se rio: "Señora, es la hora de la siesta. Vuelva a las 5." Ese día, María aprendió la regla más importante de España.',
      imageUrl: '/images/siesta.jpg',
      level: 'A2',
      vocabulary: [
        { word: 'mudarse', translation: 'to move (houses)', context: 'acababa de mudarse' },
        { word: 'vacías', translation: 'empty', context: 'calles vacías' },
        { word: 'se rio', translation: 'laughed', context: 'el policía se rio' }
      ],
      likes: 8900,
      saves: 2300
    },
    {
      id: 21,
      type: 'music',
      title: 'La Bicicleta - Shakira & Carlos Vives',
      description: 'Colombian rhythms with Spanish lyrics',
      artist: 'Shakira & Carlos Vives',
      audioUrl: '/audio/la-bicicleta.mp3',
      lyrics: [
        { time: 0, line: 'Nada voy a hacer rebuscando en el pasado', translation: "I'm not going to search in the past" },
        { time: 4, line: 'Solo tengo un caminito nuevo para comenzar', translation: 'I only have a new little path to start' }
      ],
      albumArt: '/images/bicicleta.jpg',
      level: 'B1',
      likes: 9500,
      saves: 3200
    },
    {
      id: 22,
      type: 'story',
      title: 'El Tapeo: Arte Español',
      description: 'Learn the Spanish tradition of going for tapas',
      content: 'En España, "ir de tapas" no es solo comer. Es un ritual social. Vas de bar en bar. En cada uno, una tapa diferente. Una caña de cerveza. Conversación. Risas. Puede durar horas. Los turistas preguntan: "¿Cuándo cenamos?" Los españoles responden: "Ya estamos cenando." Las tapas SON la cena.',
      imageUrl: '/images/tapeo.jpg',
      level: 'B1',
      vocabulary: [
        { word: 'ritual', translation: 'ritual', context: 'un ritual social' },
        { word: 'caña', translation: 'small beer', context: 'una caña de cerveza' },
        { word: 'risas', translation: 'laughter', context: 'conversación, risas' }
      ],
      likes: 7600,
      saves: 1900
    },
    {
      id: 23,
      type: 'music',
      title: 'Me Gustas Tú - Manu Chao',
      description: 'Simple Spanish love song for beginners',
      artist: 'Manu Chao',
      audioUrl: '/audio/me-gustas-tu.mp3',
      lyrics: [
        { time: 0, line: 'Me gusta la guitarra, me gustas tú', translation: 'I like the guitar, I like you' },
        { time: 3, line: 'Me gusta viajar en tren, me gustas tú', translation: 'I like traveling by train, I like you' }
      ],
      albumArt: '/images/manu-chao.jpg',
      level: 'A1',
      likes: 6700,
      saves: 2100
    },
    {
      id: 24,
      type: 'story',
      title: 'Don Quijote: El Primer Capítulo',
      description: 'The classic Spanish novel in modern Spanish',
      content: 'En un lugar de La Mancha vivía un hidalgo. Le encantaban los libros de caballería. Leía tanto que perdió la cabeza. Decidió convertirse en caballero andante. Se puso una armadura vieja. Llamó a su caballo Rocinante. Y salió a buscar aventuras. Así comenzó la historia más famosa de España.',
      imageUrl: '/images/quijote.jpg',
      level: 'B2',
      vocabulary: [
        { word: 'hidalgo', translation: 'nobleman', context: 'vivía un hidalgo' },
        { word: 'caballería', translation: 'chivalry', context: 'libros de caballería' },
        { word: 'andante', translation: 'wandering', context: 'caballero andante' }
      ],
      likes: 5400,
      saves: 1600
    },
    {
      id: 25,
      type: 'music',
      title: 'Clandestino - Manu Chao',
      description: 'Learn about immigration through music',
      artist: 'Manu Chao',
      audioUrl: '/audio/clandestino.mp3',
      lyrics: [
        { time: 0, line: 'Solo voy con mi pena, sola va mi condena', translation: 'I only go with my pain, alone goes my sentence' },
        { time: 4, line: 'Correr es mi destino para burlar la ley', translation: 'Running is my destiny to escape the law' }
      ],
      albumArt: '/images/clandestino.jpg',
      level: 'B2',
      likes: 8200,
      saves: 2700
    },
    {
      id: 26,
      type: 'story',
      title: 'La Movida Madrileña',
      description: 'The cultural revolution in 1980s Madrid',
      content: 'Después de Franco, Madrid explotó. Los años 80 trajeron libertad. Música, arte, cine. Pedro Almodóvar filmaba películas locas. Los jóvenes salían toda la noche. Bares, conciertos, performances. Madrid nunca dormía. Esta época se llamó "La Movida". Cambió España para siempre.',
      imageUrl: '/images/movida.jpg',
      level: 'C1',
      vocabulary: [
        { word: 'explotó', translation: 'exploded', context: 'Madrid explotó' },
        { word: 'trajeron', translation: 'brought', context: 'trajeron libertad' },
        { word: 'época', translation: 'era/period', context: 'esta época' }
      ],
      likes: 4300,
      saves: 1200
    },
    {
      id: 27,
      type: 'music',
      title: 'Oye Como Va - Tito Puente',
      description: 'Classic Latin jazz with Spanish lyrics',
      artist: 'Tito Puente',
      audioUrl: '/audio/oye-como-va.mp3',
      lyrics: [
        { time: 0, line: 'Oye como va, mi ritmo', translation: 'Listen to how my rhythm goes' },
        { time: 3, line: 'Bueno pa\' gozar, mulata', translation: 'Good for enjoying, mulata' }
      ],
      albumArt: '/images/tito-puente.jpg',
      level: 'A2',
      likes: 5900,
      saves: 1800
    },
    {
      id: 28,
      type: 'story',
      title: 'El Camino de Santiago',
      description: 'The famous pilgrimage route across Spain',
      content: 'Cada año, miles de peregrinos caminan 800 kilómetros. Desde Francia hasta Galicia. Algunos por religión. Otros por aventura. Muchos por encontrarse a sí mismos. El Camino no es fácil. Ampollas, lluvia, cansancio. Pero al llegar a Santiago, todos lloran. No por el dolor. Por lo que descubrieron en el camino.',
      imageUrl: '/images/camino.jpg',
      level: 'B2',
      vocabulary: [
        { word: 'peregrinos', translation: 'pilgrims', context: 'miles de peregrinos' },
        { word: 'ampollas', translation: 'blisters', context: 'ampollas, lluvia' },
        { word: 'descubrieron', translation: 'discovered', context: 'lo que descubrieron' }
      ],
      likes: 6800,
      saves: 2400
    },
    {
      id: 29,
      type: 'music',
      title: 'Amor Prohibido - Selena',
      description: 'Tex-Mex queen singing in Spanish',
      artist: 'Selena',
      audioUrl: '/audio/amor-prohibido.mp3',
      lyrics: [
        { time: 0, line: 'Amor prohibido murmuran por las calles', translation: 'Forbidden love they whisper in the streets' },
        { time: 4, line: 'Porque somos de distintas sociedades', translation: 'Because we are from different societies' }
      ],
      albumArt: '/images/selena.jpg',
      level: 'A2',
      likes: 11000,
      saves: 3800
    },
    {
      id: 30,
      type: 'story',
      title: 'Fiesta de San Fermín',
      description: 'Running with the bulls in Pamplona',
      content: 'Cada 7 de julio, Pamplona enloquece. Los Sanfermines. Miles de personas vestidas de blanco y rojo. Y los toros. Corren por las calles a las 8 AM. Los valientes corren delante. Los inteligentes miran desde los balcones. Dura solo 3 minutos. Pero la fiesta dura una semana. Vino, música, y mucha, mucha alegría.',
      imageUrl: '/images/sanfermines.jpg',
      level: 'B1',
      vocabulary: [
        { word: 'enloquece', translation: 'goes crazy', context: 'Pamplona enloquece' },
        { word: 'valientes', translation: 'brave ones', context: 'los valientes' },
        { word: 'alegría', translation: 'joy', context: 'mucha alegría' }
      ],
      likes: 9200,
      saves: 2900
    }
  ];

    // Merge real content (YouTube videos + News articles + Guardian) with existing content
    const allContent = [...feedContent, ...realVideos, ...realArticles, ...guardianArticles];

    // Shuffle to mix real and sample content
    const shuffled = allContent.sort(() => Math.random() - 0.5);

    console.log(`✅ Feed generated: ${shuffled.length} items (${realVideos.length} YouTube + ${realArticles.length} NewsAPI + ${guardianArticles.length} Guardian + ${feedContent.length} static)`);
    res.json(shuffled);
  } catch (error) {
    console.error('API error:', error.message);
    // Fallback to static content if APIs fail
    res.json(feedContent);
  }
});

// Video feed endpoint - serves local Spanish learning videos with transcriptions
app.get('/api/videos', (req, res) => {
  const fs = require('fs');
  const videosDir = path.join(__dirname, 'public', 'videos', 'reels');

  try {
    const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.mp4'));

    const videos = videoFiles.map((file, idx) => ({
      id: `video-${idx}`,
      type: 'video',
      videoUrl: `/videos/reels/${file}`,
      title: file.replace(/_/g, ' ').replace('.mp4', '').substring(0, 40),
      description: 'Spanish learning video with interactive transcriptions',
      level: ['A1', 'A2', 'B1', 'B2'][idx % 4],
      transcription: {
        spanish: [
          { start: 0, end: 3, text: '¡Hola! Bienvenidos a esta lección.', words: ['¡Hola!', 'Bienvenidos', 'a', 'esta', 'lección.'] },
          { start: 3, end: 6, text: 'Hoy vamos a aprender español.', words: ['Hoy', 'vamos', 'a', 'aprender', 'español.'] },
          { start: 6, end: 9, text: '¡Empecemos ahora mismo!', words: ['¡Empecemos', 'ahora', 'mismo!'] }
        ],
        english: [
          { start: 0, end: 3, text: 'Hello! Welcome to this lesson.' },
          { start: 3, end: 6, text: 'Today we are going to learn Spanish.' },
          { start: 6, end: 9, text: "Let's begin right now!" }
        ]
      },
      vocabulary: [
        { word: 'bienvenidos', translation: 'welcome', difficulty: 'A1' },
        { word: 'lección', translation: 'lesson', difficulty: 'A1' },
        { word: 'aprender', translation: 'to learn', difficulty: 'A1' },
        { word: 'empecemos', translation: "let's begin", difficulty: 'A2' }
      ],
      quiz: {
        questions: [
          {
            id: 1,
            question: 'What does "bienvenidos" mean?',
            options: ['Welcome', 'Goodbye', 'Hello', 'Thanks'],
            correct: 'Welcome',
            word: 'bienvenidos'
          },
          {
            id: 2,
            question: 'How do you say "to learn" in Spanish?',
            options: ['empezar', 'aprender', 'enseñar', 'estudiar'],
            correct: 'aprender',
            word: 'aprender'
          }
        ]
      },
      likes: Math.floor(Math.random() * 10000),
      saves: Math.floor(Math.random() * 2000)
    }));

    console.log(`✅ Video feed generated: ${videos.length} videos from local files`);
    res.json(videos);
  } catch (error) {
    console.error('Error reading video files:', error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

// User progress tracking endpoint
app.post('/api/user/progress', (req, res) => {
  const { videoId, wordsLearned, quizScore, timeWatched } = req.body;
  console.log(`Progress: Video ${videoId} - ${wordsLearned?.length || 0} words learned, quiz: ${quizScore}%, watched: ${timeWatched}s`);
  res.json({ success: true, xpEarned: 10 });
});

// Vocabulary save endpoint
app.post('/api/vocabulary/save', (req, res) => {
  const { word, translation, context, videoId } = req.body;
  console.log(`Saved word: "${word}" (${translation}) from video ${videoId}`);
  res.json({ success: true, message: 'Word saved to your vocabulary' });
});

// Analytics endpoint
app.post('/api/analytics', (req, res) => {
  const { contentId, action, duration } = req.body;
  console.log(`Analytics: Content ${contentId} - ${action} - ${duration}s`);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🎬 Entertainment Feed Server running on http://localhost:${PORT}`);
  console.log(`📱 TikTok-style Spanish learning feed ready!`);
  console.log(`🎥 Video feed API available at http://localhost:${PORT}/api/videos`);
});
