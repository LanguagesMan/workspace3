// 📖 ENHANCED GRAMMAR SYSTEM - BETTER THAN LINGODEER
// Contextual grammar tips, pattern recognition, smart conjugations

class EnhancedGrammarSystem {
    constructor() {
        this.grammarRules = this.initializeGrammarRules();
        this.verbConjugations = this.initializeVerbConjugations();
        this.patterns = this.initializePatterns();
    }

    /**
     * DETECT WORD TYPE AND PROVIDE CONTEXTUAL TIP
     * Better than Lingodeer: Automatic from native content
     */
    analyzeWord(word, context = '') {
        const lowerWord = word.toLowerCase();
        
        // Check if it's a verb
        const verbInfo = this.analyzeVerb(lowerWord, context);
        if (verbInfo) return verbInfo;
        
        // Check if it's a noun
        const nounInfo = this.analyzeNoun(lowerWord, context);
        if (nounInfo) return nounInfo;
        
        // Check if it's an adjective
        const adjectiveInfo = this.analyzeAdjective(lowerWord, context);
        if (adjectiveInfo) return adjectiveInfo;
        
        // Check if it's a preposition
        const prepositionInfo = this.analyzePreposition(lowerWord, context);
        if (prepositionInfo) return prepositionInfo;
        
        // Check if it's a pronoun
        const pronounInfo = this.analyzePronoun(lowerWord, context);
        if (pronounInfo) return pronounInfo;
        
        // Default: unknown type
        return {
            word,
            type: 'unknown',
            tip: 'Click to learn more about this word',
            icon: '💡'
        };
    }

    /**
     * ANALYZE VERB
     */
    analyzeVerb(word, context) {
        const commonVerbs = {
            // SER (to be - permanent)
            'ser': { infinitive: 'ser', type: 'irregular', group: 'ser', meaning: 'to be (permanent)' },
            'soy': { infinitive: 'ser', form: 'yo', type: 'irregular', meaning: 'I am' },
            'eres': { infinitive: 'ser', form: 'tú', type: 'irregular', meaning: 'you are' },
            'es': { infinitive: 'ser', form: 'él/ella', type: 'irregular', meaning: 'he/she is' },
            'somos': { infinitive: 'ser', form: 'nosotros', type: 'irregular', meaning: 'we are' },
            'son': { infinitive: 'ser', form: 'ellos', type: 'irregular', meaning: 'they are' },
            
            // ESTAR (to be - temporary)
            'estar': { infinitive: 'estar', type: 'irregular', group: 'estar', meaning: 'to be (temporary)' },
            'estoy': { infinitive: 'estar', form: 'yo', type: 'irregular', meaning: 'I am' },
            'estás': { infinitive: 'estar', form: 'tú', type: 'irregular', meaning: 'you are' },
            'está': { infinitive: 'estar', form: 'él/ella', type: 'irregular', meaning: 'he/she is' },
            'estamos': { infinitive: 'estar', form: 'nosotros', type: 'irregular', meaning: 'we are' },
            'están': { infinitive: 'estar', form: 'ellos', type: 'irregular', meaning: 'they are' },
            
            // HABER (to have - auxiliary)
            'haber': { infinitive: 'haber', type: 'irregular', group: 'haber', meaning: 'to have (auxiliary)' },
            'he': { infinitive: 'haber', form: 'yo', type: 'irregular', meaning: 'I have' },
            'has': { infinitive: 'haber', form: 'tú', type: 'irregular', meaning: 'you have' },
            'ha': { infinitive: 'haber', form: 'él/ella', type: 'irregular', meaning: 'he/she has' },
            'hemos': { infinitive: 'haber', form: 'nosotros', type: 'irregular', meaning: 'we have' },
            'han': { infinitive: 'haber', form: 'ellos', type: 'irregular', meaning: 'they have' },
            
            // TENER (to have - possession)
            'tener': { infinitive: 'tener', type: 'irregular', group: 'tener', meaning: 'to have' },
            'tengo': { infinitive: 'tener', form: 'yo', type: 'irregular', meaning: 'I have' },
            'tienes': { infinitive: 'tener', form: 'tú', type: 'irregular', meaning: 'you have' },
            'tiene': { infinitive: 'tener', form: 'él/ella', type: 'irregular', meaning: 'he/she has' },
            'tenemos': { infinitive: 'tener', form: 'nosotros', type: 'irregular', meaning: 'we have' },
            'tienen': { infinitive: 'tener', form: 'ellos', type: 'irregular', meaning: 'they have' },
            
            // IR (to go)
            'ir': { infinitive: 'ir', type: 'irregular', group: 'ir', meaning: 'to go' },
            'voy': { infinitive: 'ir', form: 'yo', type: 'irregular', meaning: 'I go' },
            'vas': { infinitive: 'ir', form: 'tú', type: 'irregular', meaning: 'you go' },
            'va': { infinitive: 'ir', form: 'él/ella', type: 'irregular', meaning: 'he/she goes' },
            'vamos': { infinitive: 'ir', form: 'nosotros', type: 'irregular', meaning: 'we go' },
            'van': { infinitive: 'ir', form: 'ellos', type: 'irregular', meaning: 'they go' },
            
            // Regular -AR verbs
            'hablar': { infinitive: 'hablar', type: 'regular', group: '-ar', meaning: 'to speak' },
            'hablo': { infinitive: 'hablar', form: 'yo', type: 'regular', meaning: 'I speak' },
            'hablas': { infinitive: 'hablar', form: 'tú', type: 'regular', meaning: 'you speak' },
            'habla': { infinitive: 'hablar', form: 'él/ella', type: 'regular', meaning: 'he/she speaks' },
            
            // Regular -ER verbs
            'comer': { infinitive: 'comer', type: 'regular', group: '-er', meaning: 'to eat' },
            'como': { infinitive: 'comer', form: 'yo', type: 'regular', meaning: 'I eat' },
            'comes': { infinitive: 'comer', form: 'tú', type: 'regular', meaning: 'you eat' },
            'come': { infinitive: 'comer', form: 'él/ella', type: 'regular', meaning: 'he/she eats' },
            
            // Regular -IR verbs
            'vivir': { infinitive: 'vivir', type: 'regular', group: '-ir', meaning: 'to live' },
            'vivo': { infinitive: 'vivir', form: 'yo', type: 'regular', meaning: 'I live' },
            'vives': { infinitive: 'vivir', form: 'tú', type: 'regular', meaning: 'you live' },
            'vive': { infinitive: 'vivir', form: 'él/ella', type: 'regular', meaning: 'he/she lives' }
        };
        
        const verbData = commonVerbs[word];
        if (!verbData) {
            // Try to detect by ending
            if (word.endsWith('ar') || word.endsWith('er') || word.endsWith('ir')) {
                return this.analyzeInfinitiveVerb(word);
            }
            return null;
        }
        
        // Generate full conjugation table
        const conjugationTable = this.getConjugationTable(verbData.infinitive);
        
        return {
            word,
            type: 'verb',
            ...verbData,
            conjugationTable,
            tip: this.generateVerbTip(verbData),
            examples: this.generateVerbExamples(verbData),
            icon: '🏃' // Action icon for verbs
        };
    }

    /**
     * Analyze infinitive verb
     */
    analyzeInfinitiveVerb(word) {
        let group = '';
        if (word.endsWith('ar')) group = '-ar';
        else if (word.endsWith('er')) group = '-er';
        else if (word.endsWith('ir')) group = '-ir';
        else return null;
        
        return {
            word,
            type: 'verb',
            infinitive: word,
            group,
            type: 'regular',
            tip: `This is a regular ${group} verb`,
            pattern: `Follow standard ${group} conjugation pattern`,
            icon: '🏃'
        };
    }

    /**
     * Generate verb tip
     */
    generateVerbTip(verbData) {
        if (verbData.infinitive === 'ser') {
            return '🎯 SER = permanent states (Soy mexicano = I AM Mexican)';
        }
        if (verbData.infinitive === 'estar') {
            return '🎯 ESTAR = temporary states (Estoy cansado = I AM tired)';
        }
        if (verbData.type === 'irregular') {
            return `⚠️ ${verbData.infinitive} is IRREGULAR - must memorize forms`;
        }
        return `✅ ${verbData.infinitive} is REGULAR ${verbData.group} verb`;
    }

    /**
     * Generate verb examples
     */
    generateVerbExamples(verbData) {
        const examples = {
            'ser': [
                'Yo soy estudiante (I am a student)',
                'Ella es alta (She is tall)',
                'Somos amigos (We are friends)'
            ],
            'estar': [
                'Estoy bien (I am fine)',
                'Está en casa (He/She is at home)',
                'Estamos aquí (We are here)'
            ],
            'tener': [
                'Tengo hambre (I am hungry - lit. I have hunger)',
                'Tiene 20 años (He/She is 20 years old)',
                'Tenemos tiempo (We have time)'
            ],
            'ir': [
                'Voy a casa (I go home)',
                'Va al trabajo (He/She goes to work)',
                'Vamos juntos (We go together)'
            ]
        };
        
        return examples[verbData.infinitive] || [];
    }

    /**
     * Get full conjugation table
     */
    getConjugationTable(infinitive) {
        const conjugations = this.verbConjugations[infinitive];
        if (!conjugations) return null;
        
        return {
            present: conjugations.present || {},
            preterite: conjugations.preterite || {},
            imperfect: conjugations.imperfect || {},
            future: conjugations.future || {},
            conditional: conjugations.conditional || {}
        };
    }

    /**
     * Initialize verb conjugations database
     */
    initializeVerbConjugations() {
        return {
            'ser': {
                present: { yo: 'soy', tú: 'eres', él: 'es', nosotros: 'somos', ellos: 'son' },
                preterite: { yo: 'fui', tú: 'fuiste', él: 'fue', nosotros: 'fuimos', ellos: 'fueron' },
                imperfect: { yo: 'era', tú: 'eras', él: 'era', nosotros: 'éramos', ellos: 'eran' },
                future: { yo: 'seré', tú: 'serás', él: 'será', nosotros: 'seremos', ellos: 'serán' }
            },
            'estar': {
                present: { yo: 'estoy', tú: 'estás', él: 'está', nosotros: 'estamos', ellos: 'están' },
                preterite: { yo: 'estuve', tú: 'estuviste', él: 'estuvo', nosotros: 'estuvimos', ellos: 'estuvieron' },
                imperfect: { yo: 'estaba', tú: 'estabas', él: 'estaba', nosotros: 'estábamos', ellos: 'estaban' },
                future: { yo: 'estaré', tú: 'estarás', él: 'estará', nosotros: 'estaremos', ellos: 'estarán' }
            },
            'tener': {
                present: { yo: 'tengo', tú: 'tienes', él: 'tiene', nosotros: 'tenemos', ellos: 'tienen' },
                preterite: { yo: 'tuve', tú: 'tuviste', él: 'tuvo', nosotros: 'tuvimos', ellos: 'tuvieron' },
                imperfect: { yo: 'tenía', tú: 'tenías', él: 'tenía', nosotros: 'teníamos', ellos: 'tenían' },
                future: { yo: 'tendré', tú: 'tendrás', él: 'tendrá', nosotros: 'tendremos', ellos: 'tendrán' }
            },
            'hablar': {
                present: { yo: 'hablo', tú: 'hablas', él: 'habla', nosotros: 'hablamos', ellos: 'hablan' },
                preterite: { yo: 'hablé', tú: 'hablaste', él: 'habló', nosotros: 'hablamos', ellos: 'hablaron' },
                imperfect: { yo: 'hablaba', tú: 'hablabas', él: 'hablaba', nosotros: 'hablábamos', ellos: 'hablaban' },
                future: { yo: 'hablaré', tú: 'hablarás', él: 'hablará', nosotros: 'hablaremos', ellos: 'hablarán' }
            },
            'comer': {
                present: { yo: 'como', tú: 'comes', él: 'come', nosotros: 'comemos', ellos: 'comen' },
                preterite: { yo: 'comí', tú: 'comiste', él: 'comió', nosotros: 'comimos', ellos: 'comieron' },
                imperfect: { yo: 'comía', tú: 'comías', él: 'comía', nosotros: 'comíamos', ellos: 'comían' },
                future: { yo: 'comeré', tú: 'comerás', él: 'comerá', nosotros: 'comeremos', ellos: 'comerán' }
            }
        };
    }

    /**
     * ANALYZE NOUN
     */
    analyzeNoun(word, context) {
        // Detect gender by ending
        let gender = 'unknown';
        let explanation = '';
        
        if (word.endsWith('o')) {
            gender = 'masculine';
            explanation = 'Most words ending in -o are masculine';
        } else if (word.endsWith('a')) {
            gender = 'feminine';
            explanation = 'Most words ending in -a are feminine';
        } else if (word.endsWith('ión')) {
            gender = 'feminine';
            explanation = 'Words ending in -ión are usually feminine';
        } else if (word.endsWith('dad') || word.endsWith('tad')) {
            gender = 'feminine';
            explanation = 'Words ending in -dad/-tad are feminine';
        }
        
        const plural = this.makePlural(word, gender);
        
        return {
            word,
            type: 'noun',
            gender,
            plural,
            tip: explanation,
            article: gender === 'masculine' ? 'el' : gender === 'feminine' ? 'la' : 'el/la',
            examples: [`${gender === 'masculine' ? 'el' : 'la'} ${word}`, `${gender === 'masculine' ? 'los' : 'las'} ${plural}`],
            icon: '📦'
        };
    }

    /**
     * Make plural form
     */
    makePlural(word, gender) {
        if (word.endsWith('z')) {
            return word.slice(0, -1) + 'ces'; // lápiz → lápices
        } else if (word.endsWith('vowel')) {
            return word + 's'; // casa → casas
        } else {
            return word + 'es'; // profesor → profesores
        }
    }

    /**
     * ANALYZE ADJECTIVE
     */
    analyzeAdjective(word, context) {
        const commonAdjectives = ['bueno', 'malo', 'grande', 'pequeño', 'bonito', 'feo', 'alto', 'bajo', 'feliz', 'triste'];
        
        if (!commonAdjectives.includes(word)) return null;
        
        return {
            word,
            type: 'adjective',
            tip: 'Adjectives describe nouns and must agree in gender/number',
            forms: this.getAdjectiveForms(word),
            placement: 'Usually comes AFTER the noun (la casa grande)',
            examples: [
                `Un libro ${word}`,
                `Una casa ${word}a` // simplified
            ],
            icon: '🎨'
        };
    }

    /**
     * Get adjective forms
     */
    getAdjectiveForms(word) {
        return {
            masculine: word,
            feminine: word.endsWith('o') ? word.slice(0, -1) + 'a' : word,
            pluralMasc: word + 's',
            pluralFem: (word.endsWith('o') ? word.slice(0, -1) + 'a' : word) + 's'
        };
    }

    /**
     * ANALYZE PREPOSITION
     */
    analyzePreposition(word, context) {
        const prepositions = {
            'a': { meaning: 'to', usage: 'Direction or indirect object', example: 'Voy a casa (I go to home)' },
            'de': { meaning: 'of/from', usage: 'Origin or possession', example: 'Soy de México (I am from Mexico)' },
            'en': { meaning: 'in/on/at', usage: 'Location', example: 'Estoy en casa (I am at home)' },
            'con': { meaning: 'with', usage: 'Accompaniment', example: 'Voy con Juan (I go with Juan)' },
            'por': { meaning: 'for/by/through', usage: 'Reason or means', example: 'Por la mañana (In the morning)' },
            'para': { meaning: 'for/to', usage: 'Purpose or destination', example: 'Es para ti (It\'s for you)' }
        };
        
        const prep = prepositions[word];
        if (!prep) return null;
        
        return {
            word,
            type: 'preposition',
            ...prep,
            tip: `"${word}" = "${prep.meaning}" - ${prep.usage}`,
            icon: '🔗'
        };
    }

    /**
     * ANALYZE PRONOUN
     */
    analyzePronoun(word, context) {
        const pronouns = {
            'yo': { meaning: 'I', type: 'subject', person: '1st singular' },
            'tú': { meaning: 'you', type: 'subject', person: '2nd singular (informal)' },
            'él': { meaning: 'he', type: 'subject', person: '3rd singular' },
            'ella': { meaning: 'she', type: 'subject', person: '3rd singular' },
            'nosotros': { meaning: 'we', type: 'subject', person: '1st plural (masc)' },
            'nosotras': { meaning: 'we', type: 'subject', person: '1st plural (fem)' },
            'ellos': { meaning: 'they', type: 'subject', person: '3rd plural (masc)' },
            'ellas': { meaning: 'they', type: 'subject', person: '3rd plural (fem)' },
            'me': { meaning: 'me', type: 'object', person: '1st singular' },
            'te': { meaning: 'you', type: 'object', person: '2nd singular' },
            'lo': { meaning: 'him/it', type: 'object', person: '3rd singular' },
            'la': { meaning: 'her/it', type: 'object', person: '3rd singular' }
        };
        
        const pronoun = pronouns[word];
        if (!pronoun) return null;
        
        return {
            word,
            type: 'pronoun',
            ...pronoun,
            tip: `"${word}" = "${pronoun.meaning}" (${pronoun.type} pronoun)`,
            icon: '👤'
        };
    }

    /**
     * Initialize grammar rules
     */
    initializeGrammarRules() {
        return {
            'ser_vs_estar': {
                title: 'SER vs ESTAR',
                rule: 'SER = permanent, ESTAR = temporary',
                examples: [
                    'Soy doctor (I AM a doctor - permanent)',
                    'Estoy cansado (I AM tired - temporary)'
                ]
            },
            'por_vs_para': {
                title: 'POR vs PARA',
                rule: 'POR = reason/means, PARA = purpose/destination',
                examples: [
                    'Estudio por la noche (I study during the night)',
                    'Estudio para el examen (I study for the exam)'
                ]
            },
            'gender_agreement': {
                title: 'Gender Agreement',
                rule: 'Adjectives must match noun gender',
                examples: [
                    'El libro rojo (masculine)',
                    'La casa roja (feminine)'
                ]
            }
        };
    }

    /**
     * Initialize patterns
     */
    initializePatterns() {
        return {
            'gustar': {
                name: 'Me gusta structure',
                pattern: 'Indirect object + gustar + noun',
                explanation: 'Literally means "it pleases me"',
                examples: [
                    'Me gusta el café (I like coffee - Coffee pleases me)',
                    'Me gustan los libros (I like books)'
                ]
            }
        };
    }

    /**
     * Get grammar rule
     */
    getGrammarRule(ruleId) {
        return this.grammarRules[ruleId];
    }

    /**
     * Detect patterns in sentence
     */
    detectPatterns(sentence) {
        const detectedPatterns = [];
        
        if (sentence.includes('me gusta') || sentence.includes('te gusta')) {
            detectedPatterns.push(this.patterns.gustar);
        }
        
        return detectedPatterns;
    }
}

module.exports = new EnhancedGrammarSystem();

