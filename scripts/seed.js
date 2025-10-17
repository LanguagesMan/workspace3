// Database Seed Script - Populate initial content
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const articles = [
    // A1 Level Articles
    {
        id: 'a1_article_1',
        title: 'Mi Familia',
        description: 'Una historia simple sobre mi familia. Tengo una madre, un padre y un hermano.',
        content: 'Hola. Me llamo María. Tengo una familia pequeña. Mi madre se llama Ana. Mi padre se llama José. Tengo un hermano. Se llama Carlos. Él tiene diez años. Yo tengo doce años. Vivimos en una casa pequeña. Es bonita. Me gusta mi familia.',
        level: 'A1',
        topics: JSON.stringify(['family', 'daily_life']),
        sourceUrl: 'https://example.com/a1/familia',
        sourceName: 'Spanish Stories',
        hasAudio: false
    },
    {
        id: 'a1_article_2',
        title: 'En el Mercado',
        description: 'Comprar frutas y verduras en el mercado local.',
        content: 'Voy al mercado. Compro manzanas. Las manzanas son rojas. Compro plátanos. Los plátanos son amarillos. También compro tomates. Los tomates son buenos. Me gusta el mercado. Es grande y colorido.',
        level: 'A1',
        topics: JSON.stringify(['food', 'shopping']),
        sourceUrl: 'https://example.com/a1/mercado',
        sourceName: 'Spanish Stories',
        hasAudio: false
    },
    {
        id: 'a1_article_3',
        title: 'Mi Día',
        description: 'Descripción de un día típico.',
        content: 'Me levanto a las siete. Desayuno pan y leche. Voy a la escuela. Estudio matemáticas y español. Como a las dos. Por la tarde, juego con mis amigos. Ceno a las ocho. Me acuesto a las nueve.',
        level: 'A1',
        topics: JSON.stringify(['daily_life', 'routines']),
        sourceUrl: 'https://example.com/a1/dia',
        sourceName: 'Spanish Stories',
        hasAudio: false
    },
    
    // A2 Level Articles
    {
        id: 'a2_article_1',
        title: 'Vacaciones en la Playa',
        description: 'Un viaje memorable a la costa española.',
        content: 'El verano pasado, mi familia y yo fuimos a la playa. Nos quedamos en un hotel pequeño cerca del mar. Cada día nadábamos en el agua y tomábamos el sol. Mi hermano construyó castillos de arena. Por las noches, comíamos paella en restaurantes locales. Fue unas vacaciones maravillosas. Espero volver el próximo año.',
        level: 'A2',
        topics: JSON.stringify(['travel', 'family', 'vacation']),
        sourceUrl: 'https://example.com/a2/vacaciones',
        sourceName: 'Spanish Travel',
        hasAudio: true
    },
    {
        id: 'a2_article_2',
        title: 'Aprender Español',
        description: 'La experiencia de estudiar un nuevo idioma.',
        content: 'Comencé a aprender español hace seis meses. Al principio fue difícil. No entendía mucho. Pero practiqué todos los días. Usé aplicaciones, vi películas españolas y hablé con amigos. Ahora puedo tener conversaciones básicas. Me siento orgulloso de mi progreso. Quiero seguir mejorando.',
        level: 'A2',
        topics: JSON.stringify(['education', 'personal_development']),
        sourceUrl: 'https://example.com/a2/aprender',
        sourceName: 'Language Learning',
        hasAudio: true
    },
    {
        id: 'a2_article_3',
        title: 'Mi Ciudad Favorita',
        description: 'Barcelona: una ciudad llena de cultura y historia.',
        content: 'Barcelona es mi ciudad favorita en España. Tiene arquitectura increíble de Gaudí, como la Sagrada Familia. Las playas son hermosas y la comida es deliciosa. Me encanta caminar por Las Ramblas. Hay muchos artistas callejeros y tiendas interesantes. La vida nocturna es animada. Cada vez que visito, descubro algo nuevo.',
        level: 'A2',
        topics: JSON.stringify(['travel', 'culture', 'cities']),
        sourceUrl: 'https://example.com/a2/barcelona',
        sourceName: 'Spanish Travel',
        hasAudio: false
    },
    
    // B1 Level Articles
    {
        id: 'b1_article_1',
        title: 'El Cambio Climático en España',
        description: 'Cómo el cambio climático está afectando la península ibérica.',
        content: 'El cambio climático está teniendo un impacto significativo en España. Las temperaturas están aumentando, especialmente en verano. Los científicos han observado que las sequías son más frecuentes y severas. Esto afecta la agricultura y el suministro de agua. Las regiones costeras también enfrentan la subida del nivel del mar. El gobierno está implementando políticas para reducir emisiones. Sin embargo, se necesita más acción urgente para proteger el medio ambiente.',
        level: 'B1',
        topics: JSON.stringify(['environment', 'science', 'current_events']),
        sourceUrl: 'https://example.com/b1/clima',
        sourceName: 'El Mundo',
        hasAudio: true
    },
    {
        id: 'b1_article_2',
        title: 'La Tecnología en la Educación',
        description: 'Cómo las herramientas digitales están transformando las aulas.',
        content: 'La educación está experimentando una transformación digital. Las tabletas y ordenadores portátiles se han convertido en herramientas esenciales en las aulas modernas. Los estudiantes pueden acceder a recursos educativos en línea desde cualquier lugar. Las videoconferencias permiten clases virtuales con expertos internacionales. Aunque la tecnología ofrece muchas ventajas, también presenta desafíos. Algunos profesores luchan por adaptarse. Es importante encontrar un equilibrio entre métodos tradicionales y nuevos.',
        level: 'B1',
        topics: JSON.stringify(['technology', 'education', 'innovation']),
        sourceUrl: 'https://example.com/b1/tecnologia',
        sourceName: 'Educación Hoy',
        hasAudio: true
    },
    {
        id: 'b1_article_3',
        title: 'Tradiciones Españolas: La Siesta',
        description: 'El origen y la práctica moderna de la siesta en España.',
        content: 'La siesta es una tradición española famosa en todo el mundo. Históricamente, los españoles dormían después del almuerzo durante las horas más calurosas. Esta costumbre surgió por razones prácticas en un clima cálido. Hoy en día, la práctica está cambiando. Muchas empresas modernas no permiten siestas largas. Sin embargo, estudios científicos muestran que una siesta corta puede mejorar la productividad y la salud. Algunos países están considerando adoptar esta tradición española.',
        level: 'B1',
        topics: JSON.stringify(['culture', 'traditions', 'health']),
        sourceUrl: 'https://example.com/b1/siesta',
        sourceName: 'Cultura España',
        hasAudio: false
    },
    
    // B2 Level Articles
    {
        id: 'b2_article_1',
        title: 'La Inteligencia Artificial y el Futuro del Trabajo',
        description: 'Análisis del impacto de la IA en el mercado laboral español.',
        content: 'La inteligencia artificial está redefiniendo el panorama laboral en España y el mundo. Expertos predicen que millones de empleos serán automatizados en las próximas décadas. Sin embargo, también se crearán nuevas oportunidades profesionales. Los trabajadores necesitarán adaptarse mediante la formación continua. Las habilidades técnicas serán cada vez más valiosas. El debate ético sobre la IA es complejo: ¿cómo equilibramos el progreso tecnológico con la seguridad laboral? Los gobiernos deben desarrollar políticas que protejan a los trabajadores mientras fomentan la innovación.',
        level: 'B2',
        topics: JSON.stringify(['technology', 'economy', 'future', 'AI']),
        sourceUrl: 'https://example.com/b2/ia-trabajo',
        sourceName: 'El País',
        hasAudio: true
    },
    {
        id: 'b2_article_2',
        title: 'Sostenibilidad: El Desafío del Siglo XXI',
        description: 'Iniciativas ecológicas en España y su impacto global.',
        content: 'La sostenibilidad se ha convertido en una prioridad crítica para España. El país ha invertido fuertemente en energías renovables, particularmente solar y eólica. Las ciudades están implementando programas de reciclaje más estrictos y promoviendo el transporte público. A pesar de estos esfuerzos, persisten desafíos significativos. El consumismo excesivo y la producción industrial continúan generando emisiones preocupantes. La transición hacia una economía circular requiere cambios fundamentales en nuestros hábitos de consumo. La colaboración internacional es esencial para abordar esta crisis ambiental.',
        level: 'B2',
        topics: JSON.stringify(['environment', 'sustainability', 'politics', 'economy']),
        sourceUrl: 'https://example.com/b2/sostenibilidad',
        sourceName: 'El País',
        hasAudio: true
    },
    {
        id: 'b2_article_3',
        title: 'Cervantes: El Legado Inmortal',
        description: 'Análisis del impacto de Miguel de Cervantes en la literatura mundial.',
        content: 'Miguel de Cervantes Saavedra, autor de "Don Quijote de la Mancha", es considerado uno de los escritores más influyentes de la historia. Su obra maestra, publicada en 1605, revolucionó la narrativa occidental. La novela presenta una crítica satírica de las novelas de caballerías mientras explora temas universales como la locura, la realidad y la percepción. El ingenioso hidalgo Don Quijote ha inspirado innumerables adaptaciones, desde óperas hasta películas. La profundidad psicológica de los personajes de Cervantes anticipó técnicas literarias modernas. Su legado perdura en la literatura contemporánea.',
        level: 'B2',
        topics: JSON.stringify(['literature', 'culture', 'history', 'arts']),
        sourceUrl: 'https://example.com/b2/cervantes',
        sourceName: 'Literatura Española',
        hasAudio: false
    },
    
    // C1 Level Articles
    {
        id: 'c1_article_1',
        title: 'La Filosofía Existencialista en la España Contemporánea',
        description: 'Exploración de corrientes filosóficas en el pensamiento español moderno.',
        content: 'El existencialismo, aunque originado en Francia y Alemania, ha encontrado terreno fértil en la España contemporánea. Filósofos españoles han reinterpretado conceptos como la angustia existencial y la autenticidad a través del prisma de la historia nacional. La Guerra Civil y la dictadura franquista crearon un contexto único para cuestionar la naturaleza de la libertad y la responsabilidad individual. Pensadores como Ortega y Gasset influyeron profundamente en el desarrollo de esta corriente. La relación entre el individuo y la sociedad, central en el existencialismo, resuena particularmente en una cultura que valora tanto la comunidad como la individualidad.',
        level: 'C1',
        topics: JSON.stringify(['philosophy', 'history', 'culture', 'intellectual']),
        sourceUrl: 'https://example.com/c1/existencialismo',
        sourceName: 'Revista Filosófica',
        hasAudio: false
    },
    {
        id: 'c1_article_2',
        title: 'Neurociencia y Bilingüismo: Nuevos Descubrimientos',
        description: 'Investigación sobre cómo el cerebro procesa múltiples idiomas.',
        content: 'Recientes avances en neurociencia han revelado fascinantes insights sobre el cerebro bilingüe. Contrario a creencias anteriores, estudios demuestran que hablar múltiples idiomas no solo no confunde al cerebro, sino que lo fortalece. La plasticidad neuronal en individuos bilingües muestra patrones distintivos. Las áreas cerebrales responsables del control ejecutivo están más desarrolladas. Investigadores españoles han contribuido significativamente a este campo, utilizando técnicas de neuroimagen avanzadas. Los hallazgos sugieren beneficios cognitivos a largo plazo, incluyendo mayor resistencia al deterioro cognitivo relacionado con la edad. Estos descubrimientos tienen implicaciones profundas para políticas educativas.',
        level: 'C1',
        topics: JSON.stringify(['science', 'neuroscience', 'language', 'education']),
        sourceUrl: 'https://example.com/c1/neurociencia',
        sourceName: 'Ciencia y Tecnología',
        hasAudio: true
    }
];

async function main() {
    console.log('🌱 Starting database seed...\n');
    
    try {
        // Clear existing seed data (optional - be careful in production!)
        console.log('🗑️  Clearing existing articles...');
        await prisma.article.deleteMany({
            where: {
                id: { startsWith: 'a1_article_' }
            }
        });
        await prisma.article.deleteMany({
            where: {
                id: { startsWith: 'a2_article_' }
            }
        });
        await prisma.article.deleteMany({
            where: {
                id: { startsWith: 'b1_article_' }
            }
        });
        await prisma.article.deleteMany({
            where: {
                id: { startsWith: 'b2_article_' }
            }
        });
        await prisma.article.deleteMany({
            where: {
                id: { startsWith: 'c1_article_' }
            }
        });
        
        // Insert articles
        console.log('\n📚 Inserting articles...');
        for (const article of articles) {
            await prisma.article.create({ data: article });
            console.log(`  ✅ ${article.level}: ${article.title}`);
        }
        
        console.log(`\n✨ Successfully seeded ${articles.length} articles!`);
        
        // Summary by level
        const summary = {
            A1: articles.filter(a => a.level === 'A1').length,
            A2: articles.filter(a => a.level === 'A2').length,
            B1: articles.filter(a => a.level === 'B1').length,
            B2: articles.filter(a => a.level === 'B2').length,
            C1: articles.filter(a => a.level === 'C1').length,
        };
        
        console.log('\n📊 Summary by Level:');
        console.log(`   A1: ${summary.A1} articles`);
        console.log(`   A2: ${summary.A2} articles`);
        console.log(`   B1: ${summary.B1} articles`);
        console.log(`   B2: ${summary.B2} articles`);
        console.log(`   C1: ${summary.C1} articles`);
        console.log('\n🎉 Seed complete!\n');
        
    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
