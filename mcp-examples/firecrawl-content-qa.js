#!/usr/bin/env node

/**
 * 🔥 Firecrawl MCP - Content QA and Compliance Monitoring
 * 
 * Periodically crawl new articles/news and verify ingestion metadata
 * Cross-check licensing markers, update the compliance dashboard
 */

const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

class FirecrawlContentQA {
  constructor() {
    this.firecrawlApiKey = process.env.FIRECRAWL_API_KEY || 'fc-5c92f42486554494b59214b4fc48a38b';
    this.firecrawlBaseUrl = 'https://api.firecrawl.dev/v1';
    this.outputDir = path.join(__dirname, '../evidence/firecrawl-qa');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.qaResults = [];
    this.complianceData = [];
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, this.timestamp), { recursive: true });
  }

  /**
   * 📰 Crawl New Articles and News
   */
  async crawlNewContent() {
    console.log('📰 Starting content crawling...');
    
    const contentSources = [
      {
        name: 'language-learning-news',
        urls: [
          'https://www.bbc.com/learningenglish',
          'https://www.voanews.com/learning-english',
          'https://www.englishcentral.com/blog',
          'https://www.fluentu.com/blog'
        ]
      },
      {
        name: 'tech-education-news',
        urls: [
          'https://techcrunch.com/category/education',
          'https://www.educationtechnology.com',
          'https://www.edsurge.com',
          'https://www.classcentral.com'
        ]
      },
      {
        name: 'language-research',
        urls: [
          'https://www.cambridge.org/core/journals/language-teaching',
          'https://www.tandfonline.com/journals/rllt',
          'https://www.jstor.org/journal/langteach',
          'https://www.linguisticsociety.org'
        ]
      }
    ];

    for (const source of contentSources) {
      await this.crawlSource(source);
    }
  }

  async crawlSource(source) {
    console.log(`📰 Crawling ${source.name}...`);
    
    const results = [];
    
    for (const url of source.urls) {
      try {
        const crawlResult = await this.crawlUrl(url);
        if (crawlResult) {
          results.push(crawlResult);
        }
      } catch (error) {
        console.log(`Error crawling ${url}: ${error.message}`);
      }
    }
    
    // Save source results
    const sourcePath = path.join(this.outputDir, this.timestamp, `${source.name}-results.json`);
    await fs.writeFile(sourcePath, JSON.stringify(results, null, 2));
    
    this.qaResults.push({
      source: source.name,
      timestamp: new Date().toISOString(),
      results: results,
      totalArticles: results.length
    });
  }

  async crawlUrl(url) {
    try {
      const response = await fetch(`${this.firecrawlBaseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown', 'html'],
          onlyMainContent: true,
          includeTags: ['article', 'news', 'blog'],
          excludeTags: ['nav', 'footer', 'sidebar', 'ads']
        })
      });

      if (!response.ok) {
        throw new Error(`Firecrawl API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and validate the crawled content
      const processedContent = await this.processCrawledContent(data, url);
      
      return processedContent;
    } catch (error) {
      console.log(`Failed to crawl ${url}: ${error.message}`);
      return null;
    }
  }

  async processCrawledContent(crawlData, originalUrl) {
    const content = {
      url: originalUrl,
      title: crawlData.metadata?.title || 'Untitled',
      description: crawlData.metadata?.description || '',
      author: crawlData.metadata?.author || 'Unknown',
      publishedDate: crawlData.metadata?.publishedTime || new Date().toISOString(),
      language: crawlData.metadata?.language || 'en',
      content: crawlData.markdown || crawlData.html || '',
      wordCount: this.countWords(crawlData.markdown || crawlData.html || ''),
      readingTime: this.calculateReadingTime(crawlData.markdown || crawlData.html || ''),
      topics: this.extractTopics(crawlData.markdown || crawlData.html || ''),
      sentiment: this.analyzeSentiment(crawlData.markdown || crawlData.html || ''),
      qualityScore: this.calculateQualityScore(crawlData),
      compliance: await this.checkCompliance(crawlData, originalUrl),
      timestamp: new Date().toISOString()
    };

    return content;
  }

  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }

  extractTopics(text) {
    // Simple topic extraction based on keywords
    const topics = [];
    const topicKeywords = {
      'language-learning': ['language', 'learning', 'english', 'grammar', 'vocabulary', 'pronunciation'],
      'technology': ['technology', 'tech', 'digital', 'app', 'software', 'AI', 'machine learning'],
      'education': ['education', 'teaching', 'learning', 'student', 'course', 'curriculum'],
      'culture': ['culture', 'cultural', 'tradition', 'custom', 'society', 'community']
    };

    const lowerText = text.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length > 0) {
        topics.push({
          topic: topic,
          confidence: matches.length / keywords.length,
          matchedKeywords: matches
        });
      }
    }

    return topics;
  }

  analyzeSentiment(text) {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'beneficial'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'negative', 'harmful', 'problem', 'issue'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', score: positiveCount / (positiveCount + negativeCount) };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', score: negativeCount / (positiveCount + negativeCount) };
    } else {
      return { sentiment: 'neutral', score: 0.5 };
    }
  }

  calculateQualityScore(crawlData) {
    let score = 0;
    
    // Title quality
    if (crawlData.metadata?.title && crawlData.metadata.title.length > 10) {
      score += 20;
    }
    
    // Description quality
    if (crawlData.metadata?.description && crawlData.metadata.description.length > 50) {
      score += 20;
    }
    
    // Content length
    const contentLength = (crawlData.markdown || crawlData.html || '').length;
    if (contentLength > 500) score += 20;
    if (contentLength > 1000) score += 10;
    
    // Author information
    if (crawlData.metadata?.author) {
      score += 15;
    }
    
    // Published date
    if (crawlData.metadata?.publishedTime) {
      score += 15;
    }
    
    return Math.min(score, 100);
  }

  /**
   * ⚖️ Check Compliance and Licensing
   */
  async checkCompliance(crawlData, url) {
    const compliance = {
      hasLicense: false,
      licenseType: null,
      copyright: null,
      attribution: null,
      commercialUse: false,
      modifications: false,
      distribution: false,
      complianceScore: 0,
      issues: [],
      recommendations: []
    };

    const content = crawlData.markdown || crawlData.html || '';
    const metadata = crawlData.metadata || {};

    // Check for license information
    const licensePatterns = [
      /creative commons/i,
      /cc-by/i,
      /cc-by-sa/i,
      /cc-by-nc/i,
      /mit license/i,
      /apache license/i,
      /gnu gpl/i,
      /open source/i,
      /public domain/i
    ];

    for (const pattern of licensePatterns) {
      if (pattern.test(content) || pattern.test(JSON.stringify(metadata))) {
        compliance.hasLicense = true;
        compliance.licenseType = pattern.source;
        break;
      }
    }

    // Check for copyright information
    const copyrightPattern = /copyright|©|\(c\)/i;
    if (copyrightPattern.test(content)) {
      compliance.copyright = 'detected';
    }

    // Check for attribution requirements
    const attributionPattern = /attribution|credit|source|author/i;
    if (attributionPattern.test(content)) {
      compliance.attribution = 'required';
    }

    // Check for commercial use restrictions
    const commercialPattern = /non-commercial|nc|no commercial/i;
    if (commercialPattern.test(content)) {
      compliance.commercialUse = false;
    } else {
      compliance.commercialUse = true;
    }

    // Check for modification restrictions
    const modificationPattern = /no derivatives|nd|no modifications/i;
    if (modificationPattern.test(content)) {
      compliance.modifications = false;
    } else {
      compliance.modifications = true;
    }

    // Calculate compliance score
    compliance.complianceScore = this.calculateComplianceScore(compliance);

    // Generate recommendations
    compliance.recommendations = this.generateComplianceRecommendations(compliance);

    return compliance;
  }

  calculateComplianceScore(compliance) {
    let score = 0;
    
    if (compliance.hasLicense) score += 30;
    if (compliance.copyright) score += 20;
    if (compliance.attribution) score += 20;
    if (compliance.commercialUse) score += 15;
    if (compliance.modifications) score += 15;
    
    return score;
  }

  generateComplianceRecommendations(compliance) {
    const recommendations = [];
    
    if (!compliance.hasLicense) {
      recommendations.push({
        type: 'license',
        priority: 'high',
        message: 'No license information found. Consider adding appropriate licensing.',
        action: 'Add license information to content metadata'
      });
    }
    
    if (!compliance.copyright) {
      recommendations.push({
        type: 'copyright',
        priority: 'medium',
        message: 'No copyright information detected.',
        action: 'Add copyright notice if applicable'
      });
    }
    
    if (!compliance.attribution) {
      recommendations.push({
        type: 'attribution',
        priority: 'medium',
        message: 'No attribution requirements specified.',
        action: 'Clarify attribution requirements'
      });
    }
    
    return recommendations;
  }

  /**
   * 📊 Update Compliance Dashboard
   */
  async updateComplianceDashboard() {
    console.log('📊 Updating compliance dashboard...');
    
    const dashboard = {
      timestamp: new Date().toISOString(),
      summary: {
        totalContent: this.qaResults.length,
        compliantContent: this.qaResults.filter(result => 
          result.results.some(content => content.compliance.complianceScore > 70)
        ).length,
        nonCompliantContent: this.qaResults.filter(result => 
          result.results.some(content => content.compliance.complianceScore < 50)
        ).length,
        averageComplianceScore: this.calculateAverageComplianceScore()
      },
      sources: this.qaResults.map(result => ({
        source: result.source,
        totalArticles: result.totalArticles,
        averageQuality: this.calculateAverageQuality(result.results),
        complianceRate: this.calculateComplianceRate(result.results)
      })),
      issues: this.identifyComplianceIssues(),
      recommendations: this.generateDashboardRecommendations()
    };

    // Save dashboard data
    const dashboardPath = path.join(this.outputDir, this.timestamp, 'compliance-dashboard.json');
    await fs.writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
    
    console.log(`📊 Compliance dashboard updated: ${dashboardPath}`);
    return dashboard;
  }

  calculateAverageComplianceScore() {
    const allContent = this.qaResults.flatMap(result => result.results);
    if (allContent.length === 0) return 0;
    
    const totalScore = allContent.reduce((sum, content) => 
      sum + content.compliance.complianceScore, 0
    );
    
    return totalScore / allContent.length;
  }

  calculateAverageQuality(results) {
    if (results.length === 0) return 0;
    
    const totalQuality = results.reduce((sum, result) => sum + result.qualityScore, 0);
    return totalQuality / results.length;
  }

  calculateComplianceRate(results) {
    if (results.length === 0) return 0;
    
    const compliantCount = results.filter(result => 
      result.compliance.complianceScore > 70
    ).length;
    
    return (compliantCount / results.length) * 100;
  }

  identifyComplianceIssues() {
    const issues = [];
    const allContent = this.qaResults.flatMap(result => result.results);
    
    // Group issues by type
    const issueTypes = {
      'no-license': allContent.filter(content => !content.compliance.hasLicense).length,
      'no-copyright': allContent.filter(content => !content.compliance.copyright).length,
      'no-attribution': allContent.filter(content => !content.compliance.attribution).length,
      'low-quality': allContent.filter(content => content.qualityScore < 50).length
    };
    
    for (const [type, count] of Object.entries(issueTypes)) {
      if (count > 0) {
        issues.push({
          type: type,
          count: count,
          percentage: (count / allContent.length) * 100,
          severity: count > allContent.length * 0.3 ? 'high' : 'medium'
        });
      }
    }
    
    return issues;
  }

  generateDashboardRecommendations() {
    const recommendations = [];
    const issues = this.identifyComplianceIssues();
    
    for (const issue of issues) {
      if (issue.type === 'no-license' && issue.percentage > 50) {
        recommendations.push({
          type: 'license',
          priority: 'high',
          title: 'Implement License Management System',
          description: 'High percentage of content without license information',
          actions: [
            'Add license selection to content upload form',
            'Implement automatic license detection',
            'Create license compliance checklist',
            'Train content creators on licensing'
          ]
        });
      }
      
      if (issue.type === 'low-quality' && issue.percentage > 30) {
        recommendations.push({
          type: 'quality',
          priority: 'medium',
          title: 'Improve Content Quality Standards',
          description: 'Significant portion of content has low quality scores',
          actions: [
            'Implement content quality guidelines',
            'Add quality scoring to content review process',
            'Provide content creation training',
            'Implement automated quality checks'
          ]
        });
      }
    }
    
    return recommendations;
  }

  /**
   * 🔍 Verify Ingestion Metadata
   */
  async verifyIngestionMetadata() {
    console.log('🔍 Verifying ingestion metadata...');
    
    const verificationResults = [];
    
    for (const result of this.qaResults) {
      for (const content of result.results) {
        const verification = {
          url: content.url,
          title: content.title,
          metadata: {
            hasTitle: !!content.title,
            hasDescription: !!content.description,
            hasAuthor: !!content.author,
            hasPublishedDate: !!content.publishedDate,
            hasLanguage: !!content.language,
            wordCount: content.wordCount,
            readingTime: content.readingTime
          },
          quality: {
            titleLength: content.title.length,
            descriptionLength: content.description.length,
            contentLength: content.content.length,
            qualityScore: content.qualityScore
          },
          compliance: content.compliance,
          issues: [],
          recommendations: []
        };
        
        // Check for missing metadata
        if (!content.title) {
          verification.issues.push('Missing title');
        }
        if (!content.description) {
          verification.issues.push('Missing description');
        }
        if (!content.author) {
          verification.issues.push('Missing author');
        }
        if (!content.publishedDate) {
          verification.issues.push('Missing published date');
        }
        
        // Check quality thresholds
        if (content.qualityScore < 50) {
          verification.issues.push('Low quality score');
        }
        if (content.wordCount < 100) {
          verification.issues.push('Content too short');
        }
        if (content.compliance.complianceScore < 50) {
          verification.issues.push('Low compliance score');
        }
        
        // Generate recommendations
        if (verification.issues.length > 0) {
          verification.recommendations.push('Review and improve content metadata');
        }
        if (content.qualityScore < 70) {
          verification.recommendations.push('Improve content quality');
        }
        if (content.compliance.complianceScore < 70) {
          verification.recommendations.push('Address compliance issues');
        }
        
        verificationResults.push(verification);
      }
    }
    
    // Save verification results
    const verificationPath = path.join(this.outputDir, this.timestamp, 'ingestion-verification.json');
    await fs.writeFile(verificationPath, JSON.stringify(verificationResults, null, 2));
    
    console.log(`🔍 Ingestion verification complete: ${verificationPath}`);
    return verificationResults;
  }

  /**
   * 📈 Generate QA Report
   */
  async generateQAReport() {
    console.log('📈 Generating QA report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSources: this.qaResults.length,
        totalArticles: this.qaResults.reduce((sum, result) => sum + result.totalArticles, 0),
        averageQuality: this.calculateOverallAverageQuality(),
        complianceRate: this.calculateOverallComplianceRate(),
        topTopics: this.identifyTopTopics(),
        sentimentDistribution: this.analyzeSentimentDistribution()
      },
      sources: this.qaResults.map(result => ({
        source: result.source,
        articles: result.totalArticles,
        averageQuality: this.calculateAverageQuality(result.results),
        complianceRate: this.calculateComplianceRate(result.results)
      })),
      recommendations: this.generateOverallRecommendations(),
      nextSteps: this.generateNextSteps()
    };
    
    const reportPath = path.join(this.outputDir, this.timestamp, 'firecrawl-qa-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📈 QA report generated: ${reportPath}`);
    return report;
  }

  calculateOverallAverageQuality() {
    const allContent = this.qaResults.flatMap(result => result.results);
    if (allContent.length === 0) return 0;
    
    const totalQuality = allContent.reduce((sum, content) => sum + content.qualityScore, 0);
    return totalQuality / allContent.length;
  }

  calculateOverallComplianceRate() {
    const allContent = this.qaResults.flatMap(result => result.results);
    if (allContent.length === 0) return 0;
    
    const compliantCount = allContent.filter(content => 
      content.compliance.complianceScore > 70
    ).length;
    
    return (compliantCount / allContent.length) * 100;
  }

  identifyTopTopics() {
    const allContent = this.qaResults.flatMap(result => result.results);
    const topicCounts = {};
    
    allContent.forEach(content => {
      content.topics.forEach(topic => {
        if (!topicCounts[topic.topic]) {
          topicCounts[topic.topic] = 0;
        }
        topicCounts[topic.topic]++;
      });
    });
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }

  analyzeSentimentDistribution() {
    const allContent = this.qaResults.flatMap(result => result.results);
    const sentiments = allContent.map(content => content.sentiment.sentiment);
    
    const distribution = {
      positive: sentiments.filter(s => s === 'positive').length,
      negative: sentiments.filter(s => s === 'negative').length,
      neutral: sentiments.filter(s => s === 'neutral').length
    };
    
    return distribution;
  }

  generateOverallRecommendations() {
    const recommendations = [];
    
    const averageQuality = this.calculateOverallAverageQuality();
    const complianceRate = this.calculateOverallComplianceRate();
    
    if (averageQuality < 70) {
      recommendations.push({
        type: 'quality',
        priority: 'high',
        title: 'Improve Content Quality',
        description: `Average quality score is ${averageQuality.toFixed(1)}%`,
        actions: [
          'Implement content quality guidelines',
          'Add quality scoring to review process',
          'Provide content creation training'
        ]
      });
    }
    
    if (complianceRate < 80) {
      recommendations.push({
        type: 'compliance',
        priority: 'high',
        title: 'Improve Compliance Rate',
        description: `Compliance rate is ${complianceRate.toFixed(1)}%`,
        actions: [
          'Implement license management system',
          'Add compliance checks to content pipeline',
          'Train content creators on licensing'
        ]
      });
    }
    
    return recommendations;
  }

  generateNextSteps() {
    return [
      'Review compliance dashboard for critical issues',
      'Implement recommended quality improvements',
      'Set up automated compliance monitoring',
      'Schedule regular content QA reviews',
      'Update content creation guidelines'
    ];
  }

  /**
   * 🚀 Main Execution
   */
  async run() {
    console.log('🔥 Starting Firecrawl Content QA...');
    
    await this.init();
    
    // Run all QA components
    await this.crawlNewContent();
    await this.updateComplianceDashboard();
    await this.verifyIngestionMetadata();
    await this.generateQAReport();
    
    console.log('✅ Firecrawl Content QA Complete!');
    console.log(`📁 Results saved to: ${this.outputDir}/${this.timestamp}`);
  }
}

// Export for MCP usage
module.exports = FirecrawlContentQA;

// Run if called directly
if (require.main === module) {
  const firecrawlQA = new FirecrawlContentQA();
  firecrawlQA.run().catch(console.error);
}
