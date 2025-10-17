// 📚 BABBEL-STYLE TOPIC ORGANIZATION - BUT BETTER
// Auto-detect topics from native content, organize by real-world usefulness

class BabbelStyleTopics {
    constructor() {
        this.topics = this.initializeTopics();
        this.contentTopics = new Map(); // contentId -> topics[]
    }

    /**
     * Define topic hierarchy with keywords and priority
     */
    initializeTopics() {
        return {
            // ESSENTIAL (A1 Level)
            'greetings': {
                name: 'Greetings & Introductions',
                priority: 1,
                minLevel: 'A1',
                icon: '👋',
                color: '#4CAF50',
                keywords: [
                    'hola', 'adiós', 'buenos', 'días', 'noches', 'tardes',
                    'cómo', 'estás', 'nombre', 'llamo', 'mucho', 'gusto',
                    'encantado', 'conocerte', 'placer', 'bienvenido'
                ],
                learningGoal: 'Introduce yourself and greet people',
                estimatedWords: 50
            },
            
            'numbers': {
                name: 'Numbers & Counting',
                priority: 1,
                minLevel: 'A1',
                icon: '🔢',
                color: '#2196F3',
                keywords: [
                    'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis',
                    'número', 'contar', 'primero', 'segundo', 'tercero',
                    'precio', 'costo', 'cuánto', 'cantidad'
                ],
                learningGoal: 'Count and discuss quantities',
                estimatedWords: 30
            },
            
            'family': {
                name: 'Family & Relationships',
                priority: 2,
                minLevel: 'A1',
                icon: '👨‍👩‍👧‍👦',
                color: '#FF9800',
                keywords: [
                    'familia', 'padre', 'madre', 'hermano', 'hermana',
                    'hijo', 'hija', 'abuelo', 'abuela', 'tío', 'tía',
                    'primo', 'esposo', 'esposa', 'novio', 'novia', 'pareja'
                ],
                learningGoal: 'Talk about family and relationships',
                estimatedWords: 40
            },
            
            'food': {
                name: 'Food & Dining',
                priority: 2,
                minLevel: 'A1',
                icon: '🍽️',
                color: '#FF5722',
                keywords: [
                    'comida', 'comer', 'beber', 'restaurante', 'café',
                    'desayuno', 'almuerzo', 'cena', 'hambre', 'sed',
                    'delicioso', 'rico', 'pan', 'agua', 'leche', 'carne',
                    'pollo', 'pescado', 'verduras', 'frutas', 'postre'
                ],
                learningGoal: 'Order food and discuss meals',
                estimatedWords: 80
            },
            
            'colors': {
                name: 'Colors & Descriptions',
                priority: 2,
                minLevel: 'A1',
                icon: '🎨',
                color: '#E91E63',
                keywords: [
                    'color', 'rojo', 'azul', 'verde', 'amarillo', 'negro',
                    'blanco', 'grande', 'pequeño', 'bonito', 'feo',
                    'nuevo', 'viejo', 'bueno', 'malo', 'alto', 'bajo'
                ],
                learningGoal: 'Describe objects and people',
                estimatedWords: 50
            },
            
            // PRACTICAL (A2 Level)
            'shopping': {
                name: 'Shopping & Money',
                priority: 3,
                minLevel: 'A2',
                icon: '🛍️',
                color: '#9C27B0',
                keywords: [
                    'tienda', 'comprar', 'vender', 'precio', 'dinero',
                    'pagar', 'efectivo', 'tarjeta', 'descuento', 'oferta',
                    'caro', 'barato', 'mercado', 'supermercado', 'ropa'
                ],
                learningGoal: 'Shop and handle transactions',
                estimatedWords: 60
            },
            
            'travel': {
                name: 'Travel & Directions',
                priority: 3,
                minLevel: 'A2',
                icon: '✈️',
                color: '#00BCD4',
                keywords: [
                    'viajar', 'viaje', 'turista', 'hotel', 'aeropuerto',
                    'avión', 'tren', 'autobús', 'taxi', 'calle', 'mapa',
                    'dirección', 'derecha', 'izquierda', 'cerca', 'lejos',
                    'país', 'ciudad', 'playa', 'montaña'
                ],
                learningGoal: 'Navigate and travel confidently',
                estimatedWords: 100
            },
            
            'health': {
                name: 'Health & Body',
                priority: 3,
                minLevel: 'A2',
                icon: '🏥',
                color: '#F44336',
                keywords: [
                    'salud', 'médico', 'hospital', 'enfermo', 'dolor',
                    'cabeza', 'estómago', 'brazo', 'pierna', 'ojo', 'oído',
                    'medicina', 'farmacia', 'cita', 'doctor'
                ],
                learningGoal: 'Discuss health and body parts',
                estimatedWords: 70
            },
            
            'weather': {
                name: 'Weather & Nature',
                priority: 3,
                minLevel: 'A2',
                icon: '🌤️',
                color: '#03A9F4',
                keywords: [
                    'tiempo', 'clima', 'sol', 'lluvia', 'nieve', 'viento',
                    'calor', 'frío', 'temperatura', 'nublado', 'despejado',
                    'naturaleza', 'árbol', 'flor', 'río', 'mar', 'cielo'
                ],
                learningGoal: 'Talk about weather and nature',
                estimatedWords: 50
            },
            
            'time': {
                name: 'Time & Dates',
                priority: 2,
                minLevel: 'A2',
                icon: '⏰',
                color: '#607D8B',
                keywords: [
                    'hora', 'tiempo', 'día', 'semana', 'mes', 'año',
                    'lunes', 'martes', 'miércoles', 'jueves', 'viernes',
                    'hoy', 'ayer', 'mañana', 'ahora', 'tarde', 'temprano',
                    'reloj', 'calendario', 'fecha', 'cumpleaños'
                ],
                learningGoal: 'Tell time and discuss schedules',
                estimatedWords: 60
            },
            
            // INTERMEDIATE (B1 Level)
            'work': {
                name: 'Work & Career',
                priority: 4,
                minLevel: 'B1',
                icon: '💼',
                color: '#795548',
                keywords: [
                    'trabajo', 'trabajar', 'oficina', 'jefe', 'empleado',
                    'reunión', 'proyecto', 'empresa', 'negocio', 'profesión',
                    'carrera', 'empleo', 'sueldo', 'entrevista', 'curriculum'
                ],
                learningGoal: 'Discuss professional life',
                estimatedWords: 100
            },
            
            'education': {
                name: 'Education & Learning',
                priority: 4,
                minLevel: 'B1',
                icon: '📚',
                color: '#3F51B5',
                keywords: [
                    'escuela', 'universidad', 'estudiar', 'estudiante',
                    'profesor', 'maestro', 'clase', 'curso', 'examen',
                    'tarea', 'libro', 'aprender', 'enseñar', 'educación'
                ],
                learningGoal: 'Talk about education and learning',
                estimatedWords: 80
            },
            
            'technology': {
                name: 'Technology & Internet',
                priority: 4,
                minLevel: 'B1',
                icon: '💻',
                color: '#009688',
                keywords: [
                    'tecnología', 'computadora', 'ordenador', 'teléfono',
                    'internet', 'email', 'correo', 'aplicación', 'programa',
                    'red', 'social', 'digital', 'virtual', 'online'
                ],
                learningGoal: 'Discuss technology and digital life',
                estimatedWords: 90
            },
            
            'hobbies': {
                name: 'Hobbies & Entertainment',
                priority: 4,
                minLevel: 'B1',
                icon: '🎮',
                color: '#FF4081',
                keywords: [
                    'hobby', 'pasatiempo', 'deporte', 'música', 'película',
                    'libro', 'jugar', 'leer', 'escuchar', 'ver', 'diversión',
                    'entretenimiento', 'tiempo', 'libre', 'película', 'serie'
                ],
                learningGoal: 'Discuss interests and leisure activities',
                estimatedWords: 80
            },
            
            'emotions': {
                name: 'Emotions & Feelings',
                priority: 3,
                minLevel: 'B1',
                icon: '😊',
                color: '#FFEB3B',
                keywords: [
                    'sentir', 'emoción', 'feliz', 'triste', 'enojado',
                    'contento', 'nervioso', 'tranquilo', 'emocionado',
                    'preocupado', 'sorprendido', 'amor', 'odio', 'miedo'
                ],
                learningGoal: 'Express emotions and feelings',
                estimatedWords: 60
            },
            
            // ADVANCED (B2+ Level)
            'politics': {
                name: 'Politics & Society',
                priority: 5,
                minLevel: 'B2',
                icon: '🏛️',
                color: '#5E35B1',
                keywords: [
                    'política', 'gobierno', 'presidente', 'elección', 'votar',
                    'democracia', 'ley', 'derecho', 'justicia', 'sociedad',
                    'partido', 'campaña', 'debate', 'reforma'
                ],
                learningGoal: 'Discuss politics and social issues',
                estimatedWords: 150
            },
            
            'culture': {
                name: 'Culture & Arts',
                priority: 5,
                minLevel: 'B2',
                icon: '🎭',
                color: '#D32F2F',
                keywords: [
                    'cultura', 'arte', 'pintura', 'museo', 'teatro',
                    'tradición', 'costumbre', 'festival', 'celebración',
                    'historia', 'artista', 'obra', 'exposición'
                ],
                learningGoal: 'Appreciate and discuss culture',
                estimatedWords: 120
            },
            
            'environment': {
                name: 'Environment & Sustainability',
                priority: 5,
                minLevel: 'B2',
                icon: '🌍',
                color: '#388E3C',
                keywords: [
                    'medio', 'ambiente', 'ecología', 'reciclar', 'contaminar',
                    'sostenible', 'renovable', 'cambio', 'climático', 'planeta',
                    'naturaleza', 'conservación', 'energía', 'verde'
                ],
                learningGoal: 'Discuss environmental topics',
                estimatedWords: 100
            },
            
            'philosophy': {
                name: 'Philosophy & Ideas',
                priority: 6,
                minLevel: 'C1',
                icon: '🤔',
                color: '#455A64',
                keywords: [
                    'filosofía', 'pensar', 'pensamiento', 'idea', 'concepto',
                    'teoría', 'razón', 'lógica', 'ética', 'moral',
                    'existencia', 'verdad', 'conocimiento', 'sabiduría'
                ],
                learningGoal: 'Engage in abstract discussions',
                estimatedWords: 150
            }
        };
    }

    /**
     * Auto-detect topics from transcription
     * BETTER THAN BABBEL: Automatic, no manual tagging needed
     */
    detectTopics(transcription, maxTopics = 3) {
        const text = transcription.toLowerCase();
        const detectedTopics = [];
        
        for (const [topicId, topic] of Object.entries(this.topics)) {
            let matchCount = 0;
            const matchedKeywords = [];
            
            // Count keyword matches
            for (const keyword of topic.keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    matchCount += matches.length;
                    matchedKeywords.push(keyword);
                }
            }
            
            if (matchCount > 0) {
                detectedTopics.push({
                    id: topicId,
                    name: topic.name,
                    icon: topic.icon,
                    color: topic.color,
                    confidence: matchCount,
                    matchedKeywords: matchedKeywords.slice(0, 5), // Top 5
                    priority: topic.priority,
                    minLevel: topic.minLevel
                });
            }
        }
        
        // Sort by confidence and return top matches
        detectedTopics.sort((a, b) => b.confidence - a.confidence);
        return detectedTopics.slice(0, maxTopics);
    }

    /**
     * Tag content with topics
     */
    tagContent(contentId, transcription) {
        const topics = this.detectTopics(transcription);
        this.contentTopics.set(contentId, topics);
        return topics;
    }

    /**
     * Get recommended topics for user level
     */
    getRecommendedTopics(userLevel) {
        const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        const userLevelIndex = levelOrder.indexOf(userLevel);
        
        const recommended = [];
        
        for (const [topicId, topic] of Object.entries(this.topics)) {
            const topicLevelIndex = levelOrder.indexOf(topic.minLevel);
            
            // Include topics at or below user level, plus one level up
            if (topicLevelIndex <= userLevelIndex + 1) {
                recommended.push({
                    id: topicId,
                    ...topic,
                    unlocked: topicLevelIndex <= userLevelIndex,
                    upcoming: topicLevelIndex === userLevelIndex + 1
                });
            }
        }
        
        // Sort by priority
        recommended.sort((a, b) => a.priority - b.priority);
        return recommended;
    }

    /**
     * Get content by topic
     */
    getContentByTopic(topicId, availableContent) {
        const filteredContent = [];
        
        for (const content of availableContent) {
            const topics = this.contentTopics.get(content.id) || 
                          this.detectTopics(content.transcription || content.text || '');
            
            if (topics.some(t => t.id === topicId)) {
                filteredContent.push({
                    ...content,
                    topicRelevance: topics.find(t => t.id === topicId)?.confidence || 0
                });
            }
        }
        
        // Sort by relevance
        filteredContent.sort((a, b) => b.topicRelevance - a.topicRelevance);
        return filteredContent;
    }

    /**
     * Get topic progress for user
     */
    getTopicProgress(userId, topicId, completedContent = []) {
        const topic = this.topics[topicId];
        if (!topic) return null;
        
        const topicContent = completedContent.filter(content => {
            const topics = this.contentTopics.get(content.id) || [];
            return topics.some(t => t.id === topicId);
        });
        
        return {
            topicId,
            name: topic.name,
            icon: topic.icon,
            completedVideos: topicContent.length,
            estimatedWords: topic.estimatedWords,
            learningGoal: topic.learningGoal,
            progress: Math.min(100, Math.round((topicContent.length / 10) * 100)) // 10 videos = 100%
        };
    }

    /**
     * Get learning path suggestion
     */
    suggestLearningPath(userLevel, interests = []) {
        const recommended = this.getRecommendedTopics(userLevel);
        
        // Prioritize based on interests
        if (interests.length > 0) {
            recommended.sort((a, b) => {
                const aInterest = interests.includes(a.id) ? 0 : 1;
                const bInterest = interests.includes(b.id) ? 0 : 1;
                return aInterest - bInterest || a.priority - b.priority;
            });
        }
        
        return {
            currentLevel: userLevel,
            recommendedTopics: recommended.slice(0, 5),
            nextMilestone: recommended.find(t => !t.unlocked),
            totalTopics: Object.keys(this.topics).length,
            unlockedTopics: recommended.filter(t => t.unlocked).length
        };
    }

    /**
     * Get topic summary dashboard
     */
    getTopicsDashboard(userLevel, completedContent = []) {
        const recommended = this.getRecommendedTopics(userLevel);
        const progress = {};
        
        for (const topic of recommended) {
            if (topic.unlocked) {
                progress[topic.id] = this.getTopicProgress(topic.id, topic.id, completedContent);
            }
        }
        
        return {
            userLevel,
            topics: recommended,
            progress,
            summary: {
                total: Object.keys(this.topics).length,
                unlocked: recommended.filter(t => t.unlocked).length,
                mastered: Object.values(progress).filter(p => p && p.progress === 100).length
            }
        };
    }

    /**
     * Get topic by ID
     */
    getTopic(topicId) {
        return this.topics[topicId];
    }

    /**
     * Get all topics
     */
    getAllTopics() {
        return this.topics;
    }
}

module.exports = new BabbelStyleTopics();

