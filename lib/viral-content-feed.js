// VIRAL CONTENT FEED - Real gossip, news, trending topics (NOT boring lessons!)
// Users learn Spanish through INTERESTING content they actually want to read

const VIRAL_CONTENT = [
    // CELEBRITY GOSSIP
    {
        id: 'celeb_001',
        type: 'gossip',
        title: '💔 CONFIRMED: Shakira & Tom Cruise Dating After Met Gala',
        subtitle: 'Sources say they were "inseparable" all night',
        image: 'https://images.unsplash.com/photo-1540331547168-8b63109225b7?w=800',
        spanishText: 'Shakira y Tom Cruise fueron vistos juntos en la Met Gala. Los testigos dicen que estaban "inseparables" toda la noche.',
        content: 'Exclusive photos show Shakira and Tom Cruise leaving the Met Gala together. Insiders confirm they\'ve been secretly dating for 3 months.',
        difficulty: 'intermediate',
        engagement: 'high'
    },
    {
        id: 'celeb_002',
        type: 'gossip',
        title: '🔥 Bad Bunny Responds to Kendall Jenner Breakup Rumors',
        subtitle: 'The reggaeton star posts cryptic message',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
        spanishText: 'Bad Bunny publicó un mensaje críptico en Instagram después de los rumores de ruptura con Kendall Jenner.',
        content: 'Bad Bunny posts "Todo tiene su tiempo" on Instagram story after Kendall unfollows him.',
        difficulty: 'beginner',
        engagement: 'viral'
    },
    {
        id: 'celeb_003',
        type: 'gossip',
        title: '😱 Dua Lipa Caught Kissing Mystery Man in Ibiza',
        subtitle: 'New romance alert! Photos going viral',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
        spanishText: 'Dua Lipa fue fotografiada besando a un hombre misterioso en una playa de Ibiza.',
        content: 'Paparazzi photos show Dua Lipa with a tattooed Spanish model. Fans are investigating his identity on TikTok.',
        difficulty: 'intermediate',
        engagement: 'viral'
    },

    // TRENDING NEWS
    {
        id: 'trending_001',
        type: 'trending',
        title: '🚀 Elon Musk Just Bought TikTok For $50 Billion',
        subtitle: 'Breaking: Deal closed this morning',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
        spanishText: 'Elon Musk compró TikTok por 50 mil millones de dólares. El trato se cerró esta mañana.',
        content: 'In a shocking move, Elon Musk acquired TikTok. He promises "no censorship" and plans to integrate with X.',
        difficulty: 'intermediate',
        engagement: 'viral'
    },
    {
        id: 'trending_002',
        type: 'trending',
        title: '💸 Bitcoin Hits $100,000 - Crypto Millionaires Everywhere',
        subtitle: 'Your friend who bought in 2020 is rich now',
        image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
        spanishText: 'Bitcoin alcanzó los 100,000 dólares. Muchas personas se convirtieron en millonarios de la noche a la mañana.',
        content: 'Bitcoin smashes through $100k barrier. Early investors are now millionaires. Should you buy now?',
        difficulty: 'intermediate',
        engagement: 'high'
    },
    {
        id: 'trending_003',
        type: 'trending',
        title: '🎮 GTA 6 Leaked Footage Shows Mind-Blowing Graphics',
        subtitle: 'This looks INSANE! Release date confirmed',
        image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        spanishText: 'Se filtraron imágenes de GTA 6 con gráficos increíbles. La fecha de lanzamiento fue confirmada.',
        content: 'Leaked gameplay shows photorealistic graphics. Rockstar confirms 2025 release. Fans are losing their minds.',
        difficulty: 'beginner',
        engagement: 'viral'
    },

    // VIRAL SOCIAL MEDIA
    {
        id: 'social_001',
        type: 'viral',
        title: '😂 This TikTok Dance Trend is EVERYWHERE Right Now',
        subtitle: '500M views and counting',
        image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
        spanishText: 'Esta tendencia de baile de TikTok tiene 500 millones de vistas. Todo el mundo lo está haciendo.',
        content: 'The "Twist & Shout" dance challenge has 500M views. Even your parents are doing it.',
        difficulty: 'beginner',
        engagement: 'viral'
    },
    {
        id: 'social_002',
        type: 'viral',
        title: '🍕 This $1 Pizza Hack is Blowing Up on Instagram',
        subtitle: 'Save $1000s a year with this trick',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
        spanishText: 'Este truco de pizza de 1 dólar está explotando en Instagram. Puedes ahorrar miles al año.',
        content: 'Food blogger reveals restaurant secret: Order plain pizza, add your own toppings. Saves thousands.',
        difficulty: 'beginner',
        engagement: 'high'
    },
    {
        id: 'social_003',
        type: 'viral',
        title: '👻 Creepy Video Found on Dead Man\'s Phone Goes Viral',
        subtitle: 'Warning: You won\'t sleep tonight',
        image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800',
        spanishText: 'Un video escalofriante encontrado en el teléfono de un hombre muerto se volvió viral.',
        content: 'Police released footage from missing hiker\'s phone. The last 30 seconds are unexplainable.',
        difficulty: 'intermediate',
        engagement: 'viral'
    },

    // SCANDALS & DRAMA
    {
        id: 'drama_001',
        type: 'drama',
        title: '🤯 Influencer Exposed: She NEVER Went to Bali',
        subtitle: 'All photos were faked with AI',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        spanishText: 'Una influencer fue expuesta: nunca fue a Bali. Todas sus fotos fueron falsas con IA.',
        content: 'Travel influencer with 2M followers faked entire "Bali trip" using AI. Followers are furious.',
        difficulty: 'intermediate',
        engagement: 'viral'
    },
    {
        id: 'drama_002',
        type: 'drama',
        title: '💰 YouTuber Scammed Fans Out of $10 Million',
        subtitle: 'FBI is now involved. Arrests expected',
        image: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800',
        spanishText: 'Un YouTuber estafó a sus fans por 10 millones de dólares. El FBI está involucrado.',
        content: 'Popular crypto YouTuber\'s "investment" was a scam. FBI investigating. Fans want their money back.',
        difficulty: 'advanced',
        engagement: 'high'
    }
];

// Get random viral content
function getViralContent(count = 10) {
    const shuffled = [...VIRAL_CONTENT].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Get content by type
function getContentByType(type, count = 5) {
    return VIRAL_CONTENT
        .filter(item => item.type === type)
        .slice(0, count);
}

module.exports = {
    VIRAL_CONTENT,
    getViralContent,
    getContentByType
};
