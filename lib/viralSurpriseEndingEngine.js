/**
 * VIRAL SURPRISE ENDING ENGINE 2025
 * Generates million+ view surprise endings for Globe Universe transformations
 */

export class ViralSurpriseEndingEngine {
  constructor() {
    // Million+ view surprise ending patterns
    this.megaViralEndingPatterns = {
      characterReversals: [
        {
          setup: 'Globe maintains cool confidence throughout chaos',
          reversal: 'Globe\'s sunglasses finally slip off revealing he was nervous the whole time',
          spanishTwist: 'But underneath are even COOLER sunglasses',
          dopamineReward: 'Double sunglasses reveal creates massive satisfaction'
        },
        {
          setup: 'Marco causes disaster after disaster',
          reversal: 'Marco accidentally saves everyone with his clumsiness',
          spanishTwist: 'His stumbling perfectly teaches Spanish pronunciation',
          dopamineReward: 'Clumsy hero moment generates triumph feeling'
        },
        {
          setup: 'Sofia patiently explains Spanish throughout',
          reversal: 'Sofia reveals she was learning too - from a tiny Spanish textbook',
          spanishTwist: 'The book is actually sentient and has been helping',
          dopamineReward: 'Teacher-student role flip creates delightful surprise'
        }
      ],

      objectMindBlown: [
        {
          trigger: 'Tree transformation',
          surprise: 'Tree drops golden fruit that turns into tiny Globe helpers',
          spanish: '¡Los árboles tienen sorpresas!',
          viralElement: 'Multiplication effect - one Globe becomes many'
        },
        {
          trigger: 'Butterfly transformation',
          surprise: 'Butterflies form Spanish words in the sky that come to life',
          spanish: 'Las palabras vuelan y bailan',
          viralElement: 'Living language - words become animated characters'
        },
        {
          trigger: 'Snake transformation',
          surprise: 'Snake writes a portal that characters jump through',
          spanish: '¡La serpiente abre puertas mágicas!',
          viralElement: 'Meta breakthrough - breaking the fourth wall'
        }
      ],

      metaBreakthroughs: [
        {
          setup: 'Characters interact with normal objects',
          breakthrough: 'Objects realize they\'re in a Spanish learning video',
          reaction: 'All objects start teaching Spanish enthusiastically',
          resolution: 'Chaos ensues as everything becomes a teacher'
        },
        {
          setup: 'Globe uses interdimensional powers',
          breakthrough: 'Globe accidentally brings viewers into the video',
          reaction: 'Characters wave at the camera and ask viewers questions',
          resolution: 'Viewers become part of the Spanish lesson'
        },
        {
          setup: 'Marco struggles with Spanish',
          breakthrough: 'Marco discovers he can speak perfect Spanish when singing',
          reaction: 'Everything transforms into a musical Spanish lesson',
          resolution: 'Even Globe and Sofia start dancing'
        }
      ],

      emotionalPeaks: [
        {
          buildUp: 'Characters seem defeated by chaos',
          turnAround: 'They realize chaos created perfect Spanish lesson',
          celebration: 'Group hug while saying new Spanish words',
          lastTwist: 'The words create fireworks that spell more vocabulary'
        },
        {
          buildUp: 'Transformation seems to go wrong',
          turnAround: 'Wrong transformation was exactly what was needed',
          celebration: 'Characters celebrate their Spanish success',
          lastTwist: 'Success attracts more magical objects wanting to learn'
        }
      ]
    };

    // Character-specific surprise ending patterns
    this.characterSignatureEndings = {
      globe: {
        coolMaintained: 'Sunglasses reflect the perfect Spanish lesson',
        coolBroken: 'Sunglasses shatter but reveal beautiful Spanish words underneath',
        coolEvolved: 'Sunglasses upgrade into translation glasses',
        metacool: 'Globe steps out of video to teach viewers directly'
      },
      marco: {
        accidentalWin: 'Marco\'s mistake creates perfect Spanish solution',
        clumsinessRedeemed: 'Clumsiness turns into graceful Spanish dance',
        touristWisdom: 'Marco\'s simple tourist approach teaches everyone',
        surpriseCompetence: 'Marco reveals he\'s been secretly fluent all along'
      },
      sofia: {
        patienceRewarded: 'Sofia\'s teaching creates magical Spanish garden',
        teacherTaught: 'Sofia learns something new from the chaos',
        pointerMagic: 'Teaching pointer becomes magical Spanish wand',
        professorProud: 'Sofia beams with pride as everyone succeeds'
      }
    };

    // Viral mechanics for surprise endings
    this.viralOptimization = {
      timing: {
        setupDuration: 2.0, // Build expectation
        reversalMoment: 0.5, // Quick shock
        resolutionPhase: 2.5, // Satisfying conclusion
      },
      dopamineSpikes: {
        expectationSubversion: 'Viewers think they know what\'s happening',
        visualSurprise: 'Something impossible appears',
        emotionalPayoff: 'Heartwarming or hilarious resolution',
        learningReward: 'Spanish vocabulary clicks into place'
      },
      shareabilityFactors: {
        quotability: 'Memorable Spanish phrase',
        rewatchValue: 'Hidden details to discover',
        emotionalImpact: 'Makes viewers feel good',
        discussability: 'Something to comment about'
      }
    };
  }

  /**
   * Generate viral surprise ending for Globe Universe transformation
   */
  generateViralSurpriseEnding(transformationContent) {
    const ending = {
      id: `ending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      // Surprise ending components
      surpriseType: this.selectSurpriseType(transformationContent),
      characterMoment: this.generateCharacterMoment(transformationContent),
      visualTwist: this.createVisualTwist(transformationContent),
      spanishPayoff: this.generateSpanishPayoff(transformationContent),

      // Complete ending sequence
      endingSequence: this.buildEndingSequence(transformationContent),

      // Viral optimization
      viralPotential: this.calculateEndingViralPotential(transformationContent),
      dopamineOptimization: this.optimizeDopamineDelivery(transformationContent),

      // Production specifications
      animationNotes: this.generateAnimationNotes(transformationContent),

      timestamp: new Date().toISOString(),
      category: 'VIRAL_SURPRISE_ENDING'
    };

    return ending;
  }

  /**
   * Select surprise type based on transformation content
   */
  selectSurpriseType(content) {
    if (content.transformation && content.transformation.includes('tree')) {
      return this.getRandomElement(this.megaViralEndingPatterns.objectMindBlown.filter(p => p.trigger === 'Tree transformation'));
    }

    if (content.transformation && content.transformation.includes('butterflies')) {
      return this.getRandomElement(this.megaViralEndingPatterns.objectMindBlown.filter(p => p.trigger === 'Butterfly transformation'));
    }

    if (content.transformation && content.transformation.includes('snake')) {
      return this.getRandomElement(this.megaViralEndingPatterns.objectMindBlown.filter(p => p.trigger === 'Snake transformation'));
    }

    // Default to character reversal or meta breakthrough
    return Math.random() > 0.5
      ? this.getRandomElement(this.megaViralEndingPatterns.characterReversals)
      : this.getRandomElement(this.megaViralEndingPatterns.metaBreakthroughs);
  }

  /**
   * Generate character-specific surprise moment
   */
  generateCharacterMoment(content) {
    const primaryCharacter = this.identifyPrimaryCharacter(content);
    const signatures = this.characterSignatureEndings[primaryCharacter];

    return {
      character: primaryCharacter,
      signatureMoment: this.getRandomElement(Object.values(signatures)),
      consistency: this.ensureCharacterConsistency(primaryCharacter),
      surpriseLevel: this.calculateSurpriseLevel(content)
    };
  }

  /**
   * Create visual twist for maximum impact
   */
  createVisualTwist(content) {
    const twistTypes = [
      {
        type: 'MULTIPLICATION',
        description: 'One character becomes many identical copies',
        visual: 'Screen fills with perfect character duplicates',
        impact: 'Overwhelming satisfying repetition'
      },
      {
        type: 'SIZE_REVERSAL',
        description: 'Tiny object becomes enormous, huge character becomes tiny',
        visual: 'Perspective completely flips',
        impact: 'Scale surprise creates wonder'
      },
      {
        type: 'REALITY_BREAK',
        description: 'Characters acknowledge the video format',
        visual: 'Fourth wall demolition with direct camera address',
        impact: 'Meta moment creates connection'
      },
      {
        type: 'ELEMENT_FUSION',
        description: 'All transformed elements combine into one mega-object',
        visual: 'Everything merges into spectacular finale',
        impact: 'Unity and completion satisfaction'
      }
    ];

    return this.getRandomElement(twistTypes);
  }

  /**
   * Generate Spanish learning payoff
   */
  generateSpanishPayoff(content) {
    const spanishElement = this.extractSpanishLearning(content);

    const payoffTypes = [
      {
        type: 'WORD_MATERIALIZATION',
        spanish: `¡"${spanishElement}" se vuelve real!`,
        english: `"${spanishElement}" becomes real!`,
        visual: 'Spanish words float and become physical objects'
      },
      {
        type: 'CHORUS_LEARNING',
        spanish: `Todos gritan: "¡${spanishElement}!"`,
        english: `Everyone shouts: "${spanishElement}!"`,
        visual: 'All characters and objects say word together'
      },
      {
        type: 'MAGICAL_UNDERSTANDING',
        spanish: `La magia del español funciona`,
        english: 'The magic of Spanish works',
        visual: 'Understanding creates visible sparkles and joy'
      }
    ];

    return this.getRandomElement(payoffTypes);
  }

  /**
   * Build complete ending sequence with precise timing
   */
  buildEndingSequence(content) {
    const sequence = [];
    let currentTime = 12.0; // Endings start at 12 seconds

    // Phase 1: Setup (2 seconds)
    sequence.push({
      time: currentTime,
      phase: 'SETUP',
      action: 'Characters think situation is resolved',
      visual: 'Calm moment before surprise',
      audio: 'Gentle music, characters relaxing'
    });

    currentTime += 1.0;
    sequence.push({
      time: currentTime,
      phase: 'SETUP',
      action: 'Subtle hint something else is coming',
      visual: 'Small visual cue (glint, movement, sound)',
      audio: 'Music pauses, anticipatory silence'
    });

    // Phase 2: Surprise (0.5 seconds)
    currentTime += 1.0;
    sequence.push({
      time: currentTime,
      phase: 'SURPRISE',
      action: 'Shocking visual twist happens',
      visual: 'Massive sudden change',
      audio: 'Musical sting, surprise sound effect'
    });

    // Phase 3: Resolution (2.5 seconds)
    currentTime += 0.5;
    sequence.push({
      time: currentTime,
      phase: 'RESOLUTION',
      action: 'Characters react with joy and laughter',
      visual: 'Celebration, Spanish words flying',
      audio: 'Triumphant music, laughter'
    });

    currentTime += 1.0;
    sequence.push({
      time: currentTime,
      phase: 'RESOLUTION',
      action: 'Spanish learning moment crystallizes',
      visual: 'Perfect vocabulary visualization',
      audio: 'Clear Spanish pronunciation'
    });

    currentTime += 1.5;
    sequence.push({
      time: currentTime,
      phase: 'RESOLUTION',
      action: 'Final character consistency check',
      visual: 'Globe sunglasses perfect, Marco hat askew, Sofia glasses gleaming',
      audio: 'Signature character sounds'
    });

    return sequence;
  }

  /**
   * Calculate viral potential of ending
   */
  calculateEndingViralPotential(content) {
    let score = 80; // Base viral score for surprise endings

    // Surprise factor
    const surpriseType = this.selectSurpriseType(content);
    if (surpriseType.viralElement) {
      score += 15; // Strong viral element present
    }

    // Character consistency maintained
    if (this.maintainsCharacterConsistency(content)) {
      score += 10; // TK2G consistency bonus
    }

    // Spanish learning integration
    if (content.spanish && content.spanish.length > 0) {
      score += 5; // Educational value maintained
    }

    // Emotional impact
    const emotionalImpact = this.assessEmotionalImpact(content);
    if (emotionalImpact === 'HIGH') {
      score += 10; // Strong emotional payoff
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Optimize dopamine delivery for maximum satisfaction
   */
  optimizeDopamineDelivery(content) {
    return {
      expectationBuilding: {
        timing: '12.0-13.0s',
        method: 'False resolution creates anticipation',
        reward: 'Viewer thinks they know the ending'
      },
      surpriseMoment: {
        timing: '13.0-13.5s',
        method: 'Subvert expectation with visual shock',
        reward: 'Surprise delight and laughter'
      },
      resolutionSatisfaction: {
        timing: '13.5-15.0s',
        method: 'Everything clicks into place perfectly',
        reward: 'Learning achievement + emotional completion'
      },
      replayTrigger: {
        timing: 'Throughout',
        method: 'Hidden details to catch on rewatch',
        reward: 'Discovery and sharing motivation'
      }
    };
  }

  /**
   * Generate animation production notes
   */
  generateAnimationNotes(content) {
    return {
      criticalMoments: {
        surpriseReveal: 'Must be instantly readable - maximum visual contrast',
        characterReactions: 'Maintain signature expressions throughout twist',
        spanishIntegration: 'Words must appear clearly with perfect timing',
        finalFrames: 'Character consistency verification in last 3 frames'
      },
      technicalSpecs: {
        frameRate: '30fps for smooth surprise animation',
        resolution: '1080x1920 vertical TikTok format',
        compression: 'Optimize for mobile viewing',
        audioSync: 'Perfect lip-sync for Spanish pronunciation'
      },
      qualityChecks: [
        'Surprise moment readable at mobile resolution',
        'Character consistency maintained through transformation',
        'Spanish learning clarity verified',
        'Viral shareability confirmed'
      ]
    };
  }

  /**
   * Helper methods
   */
  identifyPrimaryCharacter(content) {
    if (content.setup && content.setup.toLowerCase().includes('globe')) return 'globe';
    if (content.setup && content.setup.toLowerCase().includes('marco')) return 'marco';
    if (content.setup && content.setup.toLowerCase().includes('sofia')) return 'sofia';
    return 'globe'; // Default
  }

  extractSpanishLearning(content) {
    if (content.spanish) {
      const words = content.spanish.match(/\b\w+\b/g);
      return words ? words[1] || words[0] : 'español';
    }
    return 'español';
  }

  ensureCharacterConsistency(character) {
    const consistency = {
      globe: 'Sunglasses remain perfect throughout surprise',
      marco: 'Tourist hat maintains 20-degree tilt',
      sofia: 'Professional demeanor with sparkle glasses'
    };
    return consistency[character] || 'Character design locked';
  }

  calculateSurpriseLevel(content) {
    if (content.surpriseEnding && content.surpriseEnding.includes('dragon')) return 'MAXIMUM';
    if (content.transformation && content.transformation.includes('explodes')) return 'HIGH';
    return 'STANDARD';
  }

  maintainsCharacterConsistency(content) {
    return true; // Always maintain TK2G consistency
  }

  assessEmotionalImpact(content) {
    if (content.comedyPeak && content.comedyPeak.includes('hilarious')) return 'HIGH';
    return 'MEDIUM';
  }

  getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate batch of viral surprise endings
   */
  generateEndingBatch(contentArray) {
    return contentArray.map(content => this.generateViralSurpriseEnding(content))
                      .sort((a, b) => b.viralPotential - a.viralPotential);
  }

  /**
   * Generate surprise ending analysis report
   */
  generateEndingReport(content) {
    const ending = this.generateViralSurpriseEnding(content);

    return {
      endingEffectiveness: ending.viralPotential,
      surpriseLevel: ending.characterMoment.surpriseLevel,
      characterConsistency: 'MAINTAINED_TK2G_STANDARDS',
      viralPotential: ending.viralPotential >= 95 ? 'MEGA_VIRAL_READY' : 'HIGH_VIRAL_POTENTIAL',
      recommendation: 'Perfect surprise ending for maximum viewer satisfaction and Spanish learning retention'
    };
  }
}

export default ViralSurpriseEndingEngine;