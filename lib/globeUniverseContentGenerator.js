// Mock dependencies for standalone usage
class ViralTransformationEngine {
    analyzeViralPatterns() {
        return {
            transformationScore: 95,
            dopamineTriggers: ["visual_satisfaction", "surprise_reward", "completion_dopamine"]
        };
    }
}

class CharacterConsistencyVerifier {}
class SpanishLearningOptimizer {}

class GlobeUniverseContentGenerator {
  constructor() {
    this.viralEngine = new ViralTransformationEngine();
    this.characterVerifier = new CharacterConsistencyVerifier();
    this.spanishOptimizer = new SpanishLearningOptimizer();

    // Core Globe Universe Characters (TK2G Consistency)
    this.characters = {
      globe: {
        name: "GLOBE",
        appearance: "Wise-cracking interdimensional traveler with iconic sunglasses",
        personality: "Sarcastic, witty, makes meta-commentary",
        voice: "Confident Spanish pronunciation",
        signature: "🌍 with reflective sunglasses",
        consistency: {
          sunglasses: "Always reflective, slightly tilted",
          expression: "Knowing smirk",
          color: "Blue and green continents"
        }
      },
      marco: {
        name: "MARCO",
        appearance: "Bumbling tourist with consistent hat and camera",
        personality: "Enthusiastic but clumsy, accidentally causes chaos",
        voice: "Adorable struggling Spanish pronunciation",
        signature: "📷 Tourist hat with pins",
        consistency: {
          hat: "Beige safari hat with travel pins",
          camera: "Always around neck",
          expression: "Wide-eyed wonder"
        }
      },
      sofia: {
        name: "SOFIA",
        appearance: "Smart teacher with sparkly pointer and glasses",
        personality: "Exasperated but caring, explains everything",
        voice: "Perfect Spanish pronunciation",
        signature: "✨ Sparkly teaching pointer",
        consistency: {
          pointer: "Always sparkles when she speaks",
          glasses: "Smart rectangular frames",
          expression: "Patient but slightly frustrated"
        }
      }
    };

    // Viral Transformation Templates (Enhanced for Maximum Variety)
    this.transformationTemplates = [
      {
        id: "giant_growth",
        setup: "normal_small_object",
        transformation: "grows_to_giant_size",
        comedyPeak: "unexpected_consequence",
        surpriseEnding: "helpful_twist"
      },
      {
        id: "sentient_awakening",
        setup: "everyday_object",
        transformation: "becomes_sentient",
        comedyPeak: "personality_clash",
        surpriseEnding: "friendship_formed"
      },
      {
        id: "magical_transformation",
        setup: "ordinary_situation",
        transformation: "magical_change",
        comedyPeak: "chaos_ensues",
        surpriseEnding: "learning_moment"
      },
      {
        id: "color_explosion",
        setup: "plain_gray_object",
        transformation: "bursts_into_rainbow_colors",
        comedyPeak: "everything_turns_colorful",
        surpriseEnding: "creates_art_masterpiece"
      },
      {
        id: "time_reversal",
        setup: "modern_device",
        transformation: "travels_back_in_time",
        comedyPeak: "anachronistic_confusion",
        surpriseEnding: "teaches_history_lesson"
      },
      {
        id: "gravity_defiance",
        setup: "heavy_object",
        transformation: "starts_floating_upward",
        comedyPeak: "everything_goes_weightless",
        surpriseEnding: "creates_space_adventure"
      },
      {
        id: "clone_multiplication",
        setup: "single_character",
        transformation: "multiplies_into_many_copies",
        comedyPeak: "clones_cause_mayhem",
        surpriseEnding: "teamwork_solves_problem"
      },
      {
        id: "invisible_mystery",
        setup: "visible_object",
        transformation: "becomes_completely_invisible",
        comedyPeak: "characters_search_everywhere",
        surpriseEnding: "teaches_hide_and_seek"
      }
    ];
  }

  generateGlobeUniverseStory(theme = "transformation") {
    console.log(`🌍 GENERATING GLOBE UNIVERSE STORY: ${theme.toUpperCase()}`);

    // Step 1: Select viral transformation template
    const template = this.selectViralTemplate();

    // Step 2: Generate story with consistent characters
    const story = this.createTransformationStory(template);

    // Step 3: Add viral dopamine elements
    const viralStory = this.addViralElements(story);

    console.log("✨ GLOBE UNIVERSE STORY GENERATED WITH VIRAL MECHANICS!");
    return viralStory;
  }

  selectViralTemplate() {
    // Select random template for variety instead of always using the same one
    const randomIndex = Math.floor(Math.random() * this.transformationTemplates.length);
    const selectedTemplate = this.transformationTemplates[randomIndex];
    const viralMetrics = this.viralEngine.analyzeViralPatterns();

    console.log(`🎯 SELECTED VIRAL TEMPLATE: ${selectedTemplate.id.toUpperCase()}`);

    return {
      ...selectedTemplate,
      viralScore: viralMetrics.transformationScore || 95,
      dopamineElements: viralMetrics.dopamineTriggers || ["visual_satisfaction", "surprise_reward"]
    };
  }

  createTransformationStory(template) {
    // Generate specific story based on template with enhanced variety
    const stories = {
      giant_growth: this.generateGiantGrowthStory(),
      sentient_awakening: this.generateSentientAwakeningStory(),
      magical_transformation: this.generateMagicalTransformationStory(),
      color_explosion: this.generateColorExplosionStory(),
      time_reversal: this.generateTimeReversalStory(),
      gravity_defiance: this.generateGravityDefianceStory(),
      clone_multiplication: this.generateCloneMultiplicationStory(),
      invisible_mystery: this.generateInvisibleMysteryStory()
    };

    return stories[template.id] || stories.giant_growth;
  }

  generateGiantGrowthStory() {
    return {
      title: "🌱 LA PLANTA GIGANTE (The Giant Plant)",
      structure: {
        setup: {
          description: "Globe finds tiny plant on interdimensional table",
          duration: "3 seconds",
          visual: "Globe with sunglasses examining small green plant",
          characters: ["globe"],
          spanish: null
        },
        transformation: {
          description: "Plant grows into ENORMOUS tree in 2 seconds",
          visual: "Rapid growth animation, leaves exploding outward",
          dopamine: "Visual satisfaction of explosive growth",
          characters: ["globe", "marco", "sofia"],
          spanish: null
        },
        comedyPeak: {
          description: "Tree drops giant banana on Globe's head",
          visual: "Massive banana falls, Globe's sunglasses fly off",
          reaction: "Globe's sarcastic expression, Marco laughing, Sofia facepalming",
          characters: ["globe", "marco", "sofia"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "¡El árbol es enorme!",
          sentence2: "La planta creció muy rápido.",
          pronunciation: "slow and clear",
          visual_alignment: "Words appear as tree grows and banana falls",
          vocabulary: ["árbol (tree)", "enorme (enormous)", "planta (plant)", "creció (grew)", "rápido (fast)"]
        },
        surpriseEnding: {
          description: "Tree apologizes and grows a treehouse for everyone",
          visual: "Tree branches form perfect little house with windows",
          dopamine: "Completion satisfaction, social reward",
          reaction: "All characters cheering and high-fiving",
          spanish: "¡Gracias, árbol amigo!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 5,
        viral_elements: ["explosive_growth", "surprise_ending", "character_celebration"],
        tiktok_hashtags: ["#SpanishLearning", "#Transformation", "#GlobeUniverse", "#Viral"]
      }
    };
  }

  generateSentientAwakeningStory() {
    return {
      title: "☕ LA TAZA PARLANTE (The Talking Cup)",
      structure: {
        setup: {
          description: "Marco picks up normal coffee cup",
          duration: "3 seconds",
          visual: "Marco with tourist hat reaching for plain white cup",
          characters: ["marco"],
          spanish: null
        },
        transformation: {
          description: "Cup suddenly grows eyes and mouth",
          visual: "Cute eyes pop open, little mouth appears",
          dopamine: "Surprise character appearance",
          characters: ["marco", "coffee_cup"],
          spanish: null
        },
        comedyPeak: {
          description: "Cup complains about being picked up too early",
          visual: "Cup yawning, Marco shocked expression",
          reaction: "Sofia explaining, Globe rolling eyes",
          characters: ["globe", "marco", "sofia", "coffee_cup"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "La taza está hablando.",
          sentence2: "¡Qué sorpresa increíble!",
          pronunciation: "slow and clear",
          visual_alignment: "Words highlight cup's mouth moving and shocked faces",
          vocabulary: ["taza (cup)", "hablando (talking)", "sorpresa (surprise)", "increíble (incredible)"]
        },
        surpriseEnding: {
          description: "Cup reveals it makes the PERFECT coffee for Spanish lessons",
          visual: "Steam forms Spanish words, everyone's eyes light up",
          dopamine: "Achievement moment, learning reward",
          reaction: "All characters excited, cup proud",
          spanish: "¡El café perfecto para estudiar!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 4,
        viral_elements: ["character_surprise", "talking_object", "study_motivation"],
        tiktok_hashtags: ["#TalkingCup", "#SpanishCoffee", "#StudyMotivation", "#GlobeUniverse"]
      }
    };
  }

  generateMagicalTransformationStory() {
    return {
      title: "🪄 EL LÁPIZ MÁGICO (The Magic Pencil)",
      structure: {
        setup: {
          description: "Sofia picks up ordinary pencil to teach",
          duration: "3 seconds",
          visual: "Sofia with glasses and sparkly pointer, normal yellow pencil",
          characters: ["sofia"],
          spanish: null
        },
        transformation: {
          description: "Pencil transforms into glowing magic wand",
          visual: "Sparkles, rainbow colors, pencil elongates and glows",
          dopamine: "Magical visual satisfaction",
          characters: ["sofia", "magic_pencil"],
          spanish: null
        },
        comedyPeak: {
          description: "Everything Sofia writes becomes real",
          visual: "She writes 'gato' and cartoon cat appears, chaos ensues",
          reaction: "Globe amused, Marco chasing cat, Sofia panicking",
          characters: ["globe", "marco", "sofia", "cartoon_cat"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "El lápiz es mágico.",
          sentence2: "Las palabras se vuelven reales.",
          pronunciation: "slow and clear",
          visual_alignment: "Magic sparkles highlight words as they become real",
          vocabulary: ["lápiz (pencil)", "mágico (magic)", "palabras (words)", "reales (real)"]
        },
        surpriseEnding: {
          description: "Sofia writes 'amistad' and everyone becomes best friends forever",
          visual: "Heart sparkles surround all characters, group hug",
          dopamine: "Social connection, friendship reward",
          reaction: "All characters in happy group hug with sparkles",
          spanish: "¡La magia de la amistad!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 4,
        viral_elements: ["magic_transformation", "reality_bending", "friendship_ending"],
        tiktok_hashtags: ["#MagicPencil", "#SpanishMagic", "#Friendship", "#Transformation"]
      }
    };
  }

  generateColorExplosionStory() {
    return {
      title: "🌈 LA EXPLOSIÓN DE COLORES (The Color Explosion)",
      structure: {
        setup: {
          description: "Globe finds boring gray Spanish textbook",
          duration: "3 seconds",
          visual: "Globe with sunglasses holding dull gray book, looking disappointed",
          characters: ["globe"],
          spanish: null
        },
        transformation: {
          description: "Book bursts into spectacular rainbow colors",
          visual: "Explosive rainbow eruption, colors splashing everywhere",
          dopamine: "Visual color satisfaction, surprise burst",
          characters: ["globe", "colorful_book"],
          spanish: null
        },
        comedyPeak: {
          description: "Colors spread to everything - Globe turns rainbow too",
          visual: "Globe's sunglasses reflect rainbow, Marco's hat turns purple, Sofia's pointer sparkles",
          reaction: "Everyone looking at their colorful selves in amazement",
          characters: ["globe", "marco", "sofia"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "¡Los colores son muy bonitos!",
          sentence2: "Me gusta el arco iris.",
          pronunciation: "slow and clear",
          visual_alignment: "Each color highlights different Spanish words",
          vocabulary: ["colores (colors)", "bonitos (beautiful)", "arco iris (rainbow)", "rojo (red)", "azul (blue)"]
        },
        surpriseEnding: {
          description: "The colorful book reveals it's an art masterpiece teaching Spanish through colors",
          visual: "Book opens to show beautiful Spanish art lesson with color vocabulary",
          dopamine: "Learning achievement, artistic satisfaction",
          reaction: "All characters applauding the beautiful art lesson",
          spanish: "¡El arte enseña español!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 5,
        viral_elements: ["color_explosion", "visual_transformation", "art_education"],
        tiktok_hashtags: ["#ColorExplosion", "#SpanishColors", "#ArtLearning", "#Rainbow"]
      }
    };
  }

  generateTimeReversalStory() {
    return {
      title: "⏰ LA MÁQUINA DEL TIEMPO (The Time Machine)",
      structure: {
        setup: {
          description: "Marco tries to use modern Spanish learning app",
          duration: "3 seconds",
          visual: "Marco with tourist hat confused by smartphone app interface",
          characters: ["marco"],
          spanish: null
        },
        transformation: {
          description: "Phone starts spinning and travels back to medieval Spain",
          visual: "Swirling time vortex, medieval castle background appears",
          dopamine: "Time travel excitement, historical surprise",
          characters: ["marco", "time_phone"],
          spanish: null
        },
        comedyPeak: {
          description: "Medieval knight speaks perfect modern Spanish, Marco speaks ancient Spanish",
          visual: "Knight in armor speaking clearly, Marco stumbling over old Spanish words",
          reaction: "Globe laughing, Sofia trying to translate, knight confused",
          characters: ["globe", "marco", "sofia", "medieval_knight"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "¿Qué hora es?",
          sentence2: "Viajamos al pasado.",
          pronunciation: "slow and clear",
          visual_alignment: "Clock hands moving backwards as words appear",
          vocabulary: ["hora (time)", "viajamos (we travel)", "pasado (past)", "antiguo (ancient)"]
        },
        surpriseEnding: {
          description: "Knight teaches Marco that Spanish has evolved beautifully through time",
          visual: "Timeline showing Spanish evolution, everyone learning together",
          dopamine: "Historical learning, connection across time",
          reaction: "All characters amazed by Spanish language history",
          spanish: "¡El español viaja a través del tiempo!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 4,
        viral_elements: ["time_travel", "historical_humor", "language_evolution"],
        tiktok_hashtags: ["#TimeTravel", "#SpanishHistory", "#Medieval", "#LanguageEvolution"]
      }
    };
  }

  generateGravityDefianceStory() {
    return {
      title: "🚀 LA GRAVEDAD PERDIDA (Lost Gravity)",
      structure: {
        setup: {
          description: "Sofia drops heavy Spanish dictionary",
          duration: "3 seconds",
          visual: "Sofia with teaching pointer accidentally dropping thick book",
          characters: ["sofia"],
          spanish: null
        },
        transformation: {
          description: "Dictionary starts floating upward instead of falling",
          visual: "Book floating gracefully, defying gravity with sparkles",
          dopamine: "Gravity-defying wonder, unexpected physics",
          characters: ["sofia", "floating_dictionary"],
          spanish: null
        },
        comedyPeak: {
          description: "Everyone starts floating too, Spanish words floating around them",
          visual: "All characters floating weightlessly, Spanish words orbiting around them",
          reaction: "Globe's sunglasses floating off, Marco spinning with camera, Sofia still teaching while floating",
          characters: ["globe", "marco", "sofia"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "Estamos flotando en el espacio.",
          sentence2: "No hay gravedad aquí.",
          pronunciation: "slow and clear",
          visual_alignment: "Words float weightlessly as characters speak",
          vocabulary: ["flotando (floating)", "espacio (space)", "gravedad (gravity)", "arriba (up)"]
        },
        surpriseEnding: {
          description: "They float to space station where aliens want to learn Spanish too",
          visual: "Cute aliens with big eyes excited to learn Spanish from floating teachers",
          dopamine: "Space adventure, universal connection through language",
          reaction: "Everyone teaching Spanish to excited alien students",
          spanish: "¡El español es universal!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 4,
        viral_elements: ["anti_gravity", "space_adventure", "universal_language"],
        tiktok_hashtags: ["#AntiGravity", "#SpaceSpanish", "#Aliens", "#UniversalLanguage"]
      }
    };
  }

  generateCloneMultiplicationStory() {
    return {
      title: "👥 LOS CLONES DE MARCO (Marco's Clones)",
      structure: {
        setup: {
          description: "Marco wishes he could practice Spanish with more people",
          duration: "3 seconds",
          visual: "Lonely Marco with tourist hat looking sad with just one Spanish book",
          characters: ["marco"],
          spanish: null
        },
        transformation: {
          description: "Marco splits into five identical clones",
          visual: "Marco multiplying with flash effects, all wearing identical tourist hats",
          dopamine: "Multiplication surprise, instant social group",
          characters: ["marco", "marco_clones"],
          spanish: null
        },
        comedyPeak: {
          description: "All Marco clones argue in different Spanish accents",
          visual: "Five Marcos with different accent bubbles, all talking over each other",
          reaction: "Globe covering ears, Sofia overwhelmed trying to teach them all",
          characters: ["globe", "marco", "marco_clones", "sofia"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "Somos cinco hermanos.",
          sentence2: "Hablamos español juntos.",
          pronunciation: "slow and clear",
          visual_alignment: "Each clone points to themselves as numbers appear",
          vocabulary: ["cinco (five)", "hermanos (brothers)", "juntos (together)", "hablamos (we speak)"]
        },
        surpriseEnding: {
          description: "Clones form perfect Spanish conversation circle, teaching each other different dialects",
          visual: "Marcos in circle, each speaking different Spanish dialect with flag backgrounds",
          dopamine: "Teamwork success, cultural diversity celebration",
          reaction: "All characters joining the diverse Spanish conversation circle",
          spanish: "¡El español tiene muchos acentos hermosos!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 4,
        viral_elements: ["clone_multiplication", "accent_diversity", "group_learning"],
        tiktok_hashtags: ["#CloneSpanish", "#SpanishDialects", "#GroupLearning", "#Accents"]
      }
    };
  }

  generateInvisibleMysteryStory() {
    return {
      title: "👻 EL MAESTRO INVISIBLE (The Invisible Teacher)",
      structure: {
        setup: {
          description: "Sofia's teaching pointer mysteriously disappears",
          duration: "3 seconds",
          visual: "Sofia reaching for her sparkly pointer but finding empty air",
          characters: ["sofia"],
          spanish: null
        },
        transformation: {
          description: "Pointer becomes completely invisible but still works",
          visual: "Invisible sparkles in air, words appearing with no visible pointer",
          dopamine: "Mystery intrigue, magical invisibility",
          characters: ["sofia", "invisible_pointer"],
          spanish: null
        },
        comedyPeak: {
          description: "Everyone searches everywhere while invisible pointer teaches Spanish",
          visual: "Globe and Marco looking under furniture while Spanish words magically appear in air",
          reaction: "Characters confused but learning from floating Spanish lessons",
          characters: ["globe", "marco", "sofia"],
          spanish: null
        },
        spanishLearning: {
          sentence1: "¿Dónde está mi maestro?",
          sentence2: "Está aquí pero invisible.",
          pronunciation: "slow and clear",
          visual_alignment: "Words appear mysteriously as invisible teacher 'points' to them",
          vocabulary: ["dónde (where)", "maestro (teacher)", "invisible (invisible)", "aquí (here)"]
        },
        surpriseEnding: {
          description: "Invisible pointer reveals it was teaching hide and seek in Spanish all along",
          visual: "Pointer becomes visible with big smile, everyone laughing and playing Spanish hide and seek",
          dopamine: "Mystery solved, playful learning game",
          reaction: "All characters happily playing Spanish hide and seek together",
          spanish: "¡Jugamos al escondite en español!"
        }
      },
      metadata: {
        duration: "30 seconds",
        difficulty: "beginner",
        vocabulary_count: 4,
        viral_elements: ["invisible_mystery", "hide_and_seek", "playful_learning"],
        tiktok_hashtags: ["#InvisibleTeacher", "#SpanishGames", "#HideAndSeek", "#Mystery"]
      }
    };
  }

  addViralElements(story) {
    // Enhance story with viral dopamine triggers
    const viralEnhanced = {
      ...story,
      viral_optimization: {
        hook: {
          first_3_seconds: "Immediate visual intrigue with character recognition",
          dopamine_trigger: "Anticipation of transformation"
        },
        engagement: {
          transformation_moment: "Maximum visual satisfaction and surprise",
          character_reactions: "Relatable emotions and expressions"
        },
        retention: {
          spanish_integration: "Learning feels rewarding, not forced",
          surprise_ending: "Unexpected positive outcome creates sharing impulse"
        },
        virality: {
          tiktok_optimization: "Perfect 30-second structure with consistent characters",
          rewatchability: "Missed details and Spanish vocabulary encourage replays",
          shareability: "Wholesome content that teaches and entertains"
        }
      }
    };

    return viralEnhanced;
  }

  generateMultipleStories(count = 3) {
    console.log(`🌍 GENERATING ${count} GLOBE UNIVERSE STORIES FOR VIRAL SERIES`);

    const stories = [];
    const themes = ["transformation", "comedy", "friendship"];

    for (let i = 0; i < count; i++) {
      const theme = themes[i % themes.length];
      const story = this.generateGlobeUniverseStory(theme);
      stories.push(story);

      console.log(`✅ Story ${i + 1}/${count}: ${story.title}`);
    }

    return {
      series_title: "🌍 GLOBE UNIVERSE: Interdimensional Spanish Adventures",
      stories: stories,
      series_metadata: {
        total_stories: count,
        character_consistency: "Verified TK2G standards",
        spanish_level: "Beginner friendly",
        viral_potential: "Maximum engagement optimization",
        production_ready: true
      }
    };
  }

  exportForProduction(stories) {
    const productionPackage = {
      content_type: "Globe Universe Viral Series",
      format: "TikTok optimized 30-second episodes",
      characters: this.characters,
      stories: stories,
      production_notes: {
        animation_style: "Consistent 3D characters across all episodes",
        voice_acting: "Three distinct personalities with Spanish pronunciation levels",
        visual_effects: "Transformation animations with dopamine-inducing elements",
        spanish_integration: "Natural vocabulary teaching through visual context",
        viral_optimization: "Surprise endings and shareable moments in every episode"
      },
      deployment: {
        platforms: ["TikTok", "Instagram Reels", "YouTube Shorts"],
        hashtag_strategy: "#GlobeUniverse #SpanishLearning #Transformation #Viral",
        posting_schedule: "Daily releases with consistent character appearances",
        engagement_strategy: "Educational content that feels like entertainment"
      }
    };

    console.log("🚀 GLOBE UNIVERSE CONTENT PACKAGE READY FOR VIRAL DEPLOYMENT!");
    return productionPackage;
  }
}

module.exports = { GlobeUniverseContentGenerator };
