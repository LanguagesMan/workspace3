#!/usr/bin/env node

/**
 * 🔍 Serena MCP - Audit Logs and Telemetry Analysis
 * 
 * Parse Sentry/Pino logs, flag spikes
 * Inspect ranking debug endpoints for anomalies
 * Suggest weight adjustments based on recent engagement stats
 */

const fs = require('fs').promises;
const path = require('path');
const { createReadStream } = require('fs');
const readline = require('readline');

class SerenaAnalysisMCP {
  constructor() {
    this.baseUrl = process.env.APP_URL || 'http://localhost:3000';
    this.outputDir = path.join(__dirname, '../evidence/serena-analysis');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.analysisResults = [];
    this.logSources = {
      sentry: [],
      pino: [],
      custom: []
    };
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, this.timestamp), { recursive: true });
  }

  /**
   * 📊 Parse Sentry/Pino Logs and Flag Spikes
   */
  async analyzeLogs() {
    console.log('🔍 Starting Log Analysis...');
    
    // Analyze different log sources
    await this.parseSentryLogs();
    await this.parsePinoLogs();
    await this.parseCustomLogs();
    
    // Detect anomalies and spikes
    await this.detectAnomalies();
    
    // Generate recommendations
    await this.generateRecommendations();
  }

  async parseSentryLogs() {
    console.log('📊 Parsing Sentry logs...');
    
    const sentryLogPaths = [
      'logs/sentry-errors.log',
      'logs/sentry-performance.log',
      'logs/sentry-transactions.log'
    ];

    for (const logPath of sentryLogPaths) {
      try {
        const logData = await this.readLogFile(logPath);
        if (logData.length > 0) {
          const parsedLogs = this.parseSentryFormat(logData);
          this.logSources.sentry.push(...parsedLogs);
        }
      } catch (error) {
        console.log(`Sentry log ${logPath} not found or empty`);
      }
    }
  }

  async parsePinoLogs() {
    console.log('📊 Parsing Pino logs...');
    
    const pinoLogPaths = [
      'logs/app.log',
      'logs/error.log',
      'logs/access.log'
    ];

    for (const logPath of pinoLogPaths) {
      try {
        const logData = await this.readLogFile(logPath);
        if (logData.length > 0) {
          const parsedLogs = this.parsePinoFormat(logData);
          this.logSources.pino.push(...parsedLogs);
        }
      } catch (error) {
        console.log(`Pino log ${logPath} not found or empty`);
      }
    }
  }

  async parseCustomLogs() {
    console.log('📊 Parsing custom application logs...');
    
    const customLogPaths = [
      'logs/feed-algorithm.log',
      'logs/user-engagement.log',
      'logs/video-performance.log',
      'logs/quiz-analytics.log'
    ];

    for (const logPath of customLogPaths) {
      try {
        const logData = await this.readLogFile(logPath);
        if (logData.length > 0) {
          const parsedLogs = this.parseCustomFormat(logData);
          this.logSources.custom.push(...parsedLogs);
        }
      } catch (error) {
        console.log(`Custom log ${logPath} not found or empty`);
      }
    }
  }

  async readLogFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return data.split('\n').filter(line => line.trim());
    } catch (error) {
      return [];
    }
  }

  parseSentryFormat(logLines) {
    return logLines.map(line => {
      try {
        const log = JSON.parse(line);
        return {
          type: 'sentry',
          timestamp: log.timestamp || log.time,
          level: log.level || 'error',
          message: log.message,
          error: log.error,
          user: log.user,
          tags: log.tags,
          context: log.context,
          fingerprint: log.fingerprint
        };
      } catch (error) {
        return {
          type: 'sentry',
          raw: line,
          parseError: error.message
        };
      }
    });
  }

  parsePinoFormat(logLines) {
    return logLines.map(line => {
      try {
        const log = JSON.parse(line);
        return {
          type: 'pino',
          timestamp: log.time,
          level: log.level,
          msg: log.msg,
          pid: log.pid,
          hostname: log.hostname,
          req: log.req,
          res: log.res,
          err: log.err
        };
      } catch (error) {
        return {
          type: 'pino',
          raw: line,
          parseError: error.message
        };
      }
    });
  }

  parseCustomFormat(logLines) {
    return logLines.map(line => {
      try {
        const log = JSON.parse(line);
        return {
          type: 'custom',
          timestamp: log.timestamp || log.time,
          level: log.level || 'info',
          component: log.component,
          action: log.action,
          userId: log.userId,
          sessionId: log.sessionId,
          metrics: log.metrics,
          metadata: log.metadata
        };
      } catch (error) {
        return {
          type: 'custom',
          raw: line,
          parseError: error.message
        };
      }
    });
  }

  /**
   * 🚨 Detect Anomalies and Spikes
   */
  async detectAnomalies() {
    console.log('🚨 Detecting anomalies and spikes...');
    
    const anomalies = [];
    
    // Analyze error rate spikes
    const errorSpikes = this.detectErrorSpikes();
    anomalies.push(...errorSpikes);
    
    // Analyze performance degradation
    const performanceIssues = this.detectPerformanceIssues();
    anomalies.push(...performanceIssues);
    
    // Analyze user engagement drops
    const engagementDrops = this.detectEngagementDrops();
    anomalies.push(...engagementDrops);
    
    // Analyze API response time spikes
    const apiSpikes = this.detectApiSpikes();
    anomalies.push(...apiSpikes);
    
    this.analysisResults.push({
      type: 'anomalies',
      timestamp: new Date().toISOString(),
      anomalies: anomalies,
      severity: this.calculateSeverity(anomalies)
    });
  }

  detectErrorSpikes() {
    const errors = [...this.logSources.sentry, ...this.logSources.pino, ...this.logSources.custom]
      .filter(log => log.level === 'error' || log.level === 'fatal');
    
    const errorCounts = this.groupByTimeWindow(errors, '5m');
    const spikes = [];
    
    for (let i = 1; i < errorCounts.length; i++) {
      const current = errorCounts[i].count;
      const previous = errorCounts[i - 1].count;
      const increase = (current - previous) / previous;
      
      if (increase > 2) { // 200% increase
        spikes.push({
          type: 'error_spike',
          timestamp: errorCounts[i].timestamp,
          currentCount: current,
          previousCount: previous,
          increasePercent: Math.round(increase * 100),
          severity: increase > 5 ? 'critical' : 'high'
        });
      }
    }
    
    return spikes;
  }

  detectPerformanceIssues() {
    const performanceLogs = this.logSources.custom.filter(log => 
      log.component === 'performance' || log.metrics?.responseTime
    );
    
    const issues = [];
    const responseTimes = performanceLogs.map(log => ({
      timestamp: log.timestamp,
      responseTime: log.metrics?.responseTime || 0
    }));
    
    // Detect slow response times
    const slowResponses = responseTimes.filter(rt => rt.responseTime > 2000);
    if (slowResponses.length > 0) {
      issues.push({
        type: 'performance_degradation',
        timestamp: new Date().toISOString(),
        slowResponses: slowResponses.length,
        averageResponseTime: this.calculateAverage(responseTimes.map(rt => rt.responseTime)),
        severity: slowResponses.length > 10 ? 'critical' : 'high'
      });
    }
    
    return issues;
  }

  detectEngagementDrops() {
    const engagementLogs = this.logSources.custom.filter(log => 
      log.component === 'engagement' || log.action === 'user_engagement'
    );
    
    const drops = [];
    const engagementByHour = this.groupByTimeWindow(engagementLogs, '1h');
    
    for (let i = 1; i < engagementByHour.length; i++) {
      const current = engagementByHour[i].count;
      const previous = engagementByHour[i - 1].count;
      const drop = (previous - current) / previous;
      
      if (drop > 0.3) { // 30% drop
        drops.push({
          type: 'engagement_drop',
          timestamp: engagementByHour[i].timestamp,
          currentEngagement: current,
          previousEngagement: previous,
          dropPercent: Math.round(drop * 100),
          severity: drop > 0.5 ? 'critical' : 'high'
        });
      }
    }
    
    return drops;
  }

  detectApiSpikes() {
    const apiLogs = this.logSources.pino.filter(log => 
      log.req && log.res
    );
    
    const spikes = [];
    const responseTimes = apiLogs.map(log => ({
      timestamp: log.timestamp,
      responseTime: log.res.responseTime || 0,
      statusCode: log.res.statusCode
    }));
    
    const apiCounts = this.groupByTimeWindow(responseTimes, '5m');
    
    for (let i = 1; i < apiCounts.length; i++) {
      const current = apiCounts[i].count;
      const previous = apiCounts[i - 1].count;
      const increase = (current - previous) / previous;
      
      if (increase > 1.5) { // 150% increase
        spikes.push({
          type: 'api_spike',
          timestamp: apiCounts[i].timestamp,
          currentRequests: current,
          previousRequests: previous,
          increasePercent: Math.round(increase * 100),
          severity: increase > 3 ? 'critical' : 'high'
        });
      }
    }
    
    return spikes;
  }

  groupByTimeWindow(logs, window) {
    const windows = {};
    const windowMs = this.getWindowMs(window);
    
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const windowStart = new Date(Math.floor(timestamp.getTime() / windowMs) * windowMs);
      const key = windowStart.toISOString();
      
      if (!windows[key]) {
        windows[key] = { timestamp: key, count: 0, logs: [] };
      }
      windows[key].count++;
      windows[key].logs.push(log);
    });
    
    return Object.values(windows).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  getWindowMs(window) {
    const windowMap = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return windowMap[window] || 60 * 1000;
  }

  calculateSeverity(anomalies) {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const highCount = anomalies.filter(a => a.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 3) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
  }

  calculateAverage(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  /**
   * 🎯 Inspect Ranking Debug Endpoints
   */
  async inspectRankingEndpoints() {
    console.log('🎯 Inspecting ranking debug endpoints...');
    
    const endpoints = [
      '/api/debug/ranking/weights',
      '/api/debug/ranking/algorithm',
      '/api/debug/ranking/performance',
      '/api/debug/ranking/user-preferences'
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.fetchEndpoint(`${this.baseUrl}${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          results.push({
            endpoint,
            status: 'healthy',
            data: data,
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            endpoint,
            status: 'error',
            statusCode: response.status,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        results.push({
          endpoint,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    this.analysisResults.push({
      type: 'ranking_endpoints',
      timestamp: new Date().toISOString(),
      results: results
    });
    
    return results;
  }

  async fetchEndpoint(url) {
    const fetch = require('node-fetch');
    return await fetch(url);
  }

  /**
   * ⚖️ Suggest Weight Adjustments
   */
  async suggestWeightAdjustments() {
    console.log('⚖️ Analyzing engagement stats for weight adjustments...');
    
    // Analyze recent engagement data
    const engagementData = await this.analyzeEngagementStats();
    
    // Analyze algorithm performance
    const algorithmPerformance = await this.analyzeAlgorithmPerformance();
    
    // Generate weight suggestions
    const suggestions = this.generateWeightSuggestions(engagementData, algorithmPerformance);
    
    this.analysisResults.push({
      type: 'weight_suggestions',
      timestamp: new Date().toISOString(),
      engagementData,
      algorithmPerformance,
      suggestions
    });
    
    return suggestions;
  }

  async analyzeEngagementStats() {
    const engagementLogs = this.logSources.custom.filter(log => 
      log.component === 'engagement' || log.action === 'user_engagement'
    );
    
    const stats = {
      totalEngagement: engagementLogs.length,
      averageEngagement: this.calculateAverage(engagementLogs.map(log => log.metrics?.engagementScore || 0)),
      engagementByType: this.groupBy(engagementLogs, 'action'),
      engagementByUser: this.groupBy(engagementLogs, 'userId'),
      timeDistribution: this.analyzeTimeDistribution(engagementLogs)
    };
    
    return stats;
  }

  async analyzeAlgorithmPerformance() {
    const algorithmLogs = this.logSources.custom.filter(log => 
      log.component === 'algorithm' || log.component === 'ranking'
    );
    
    const performance = {
      totalRecommendations: algorithmLogs.length,
      averageAccuracy: this.calculateAverage(algorithmLogs.map(log => log.metrics?.accuracy || 0)),
      averageRelevance: this.calculateAverage(algorithmLogs.map(log => log.metrics?.relevance || 0)),
      performanceByAlgorithm: this.groupBy(algorithmLogs, 'metadata.algorithm'),
      performanceByUserSegment: this.groupBy(algorithmLogs, 'metadata.userSegment')
    };
    
    return performance;
  }

  generateWeightSuggestions(engagementData, algorithmPerformance) {
    const suggestions = [];
    
    // Analyze engagement patterns
    if (engagementData.averageEngagement < 0.7) {
      suggestions.push({
        type: 'increase_engagement_weight',
        currentWeight: 'unknown',
        suggestedWeight: 'increase by 20%',
        reason: 'Low average engagement score detected',
        impact: 'high'
      });
    }
    
    // Analyze algorithm accuracy
    if (algorithmPerformance.averageAccuracy < 0.8) {
      suggestions.push({
        type: 'adjust_accuracy_weight',
        currentWeight: 'unknown',
        suggestedWeight: 'increase by 15%',
        reason: 'Algorithm accuracy below threshold',
        impact: 'medium'
      });
    }
    
    // Analyze user segment performance
    const segmentPerformance = algorithmPerformance.performanceByUserSegment;
    for (const [segment, performance] of Object.entries(segmentPerformance)) {
      if (performance.length > 0) {
        const avgAccuracy = this.calculateAverage(performance.map(p => p.metrics?.accuracy || 0));
        if (avgAccuracy < 0.75) {
          suggestions.push({
            type: 'segment_specific_adjustment',
            segment: segment,
            currentWeight: 'unknown',
            suggestedWeight: 'increase by 25%',
            reason: `Low accuracy for ${segment} segment`,
            impact: 'medium'
          });
        }
      }
    }
    
    return suggestions;
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const groupKey = this.getNestedValue(item, key);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  analyzeTimeDistribution(logs) {
    const hours = Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hours[hour]++;
    });
    
    return hours;
  }

  /**
   * 📊 Generate Recommendations
   */
  async generateRecommendations() {
    console.log('📊 Generating recommendations...');
    
    const recommendations = [];
    
    // Performance recommendations
    const performanceRecs = this.generatePerformanceRecommendations();
    recommendations.push(...performanceRecs);
    
    // Engagement recommendations
    const engagementRecs = this.generateEngagementRecommendations();
    recommendations.push(...engagementRecs);
    
    // Algorithm recommendations
    const algorithmRecs = this.generateAlgorithmRecommendations();
    recommendations.push(...algorithmRecs);
    
    // Security recommendations
    const securityRecs = this.generateSecurityRecommendations();
    recommendations.push(...securityRecs);
    
    this.analysisResults.push({
      type: 'recommendations',
      timestamp: new Date().toISOString(),
      recommendations: recommendations,
      priority: this.calculatePriority(recommendations)
    });
    
    return recommendations;
  }

  generatePerformanceRecommendations() {
    const recommendations = [];
    
    // Check for slow API responses
    const slowResponses = this.analysisResults
      .filter(result => result.type === 'anomalies')
      .flatMap(result => result.anomalies)
      .filter(anomaly => anomaly.type === 'performance_degradation');
    
    if (slowResponses.length > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Optimize API Response Times',
        description: 'Detected slow API responses affecting user experience',
        actions: [
          'Implement caching for frequently accessed data',
          'Optimize database queries',
          'Add CDN for static assets',
          'Implement request queuing'
        ],
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  generateEngagementRecommendations() {
    const recommendations = [];
    
    // Check for engagement drops
    const engagementDrops = this.analysisResults
      .filter(result => result.type === 'anomalies')
      .flatMap(result => result.anomalies)
      .filter(anomaly => anomaly.type === 'engagement_drop');
    
    if (engagementDrops.length > 0) {
      recommendations.push({
        category: 'engagement',
        priority: 'high',
        title: 'Address User Engagement Drops',
        description: 'Significant drops in user engagement detected',
        actions: [
          'Analyze user feedback and support tickets',
          'Review recent feature changes',
          'Implement A/B testing for engagement features',
          'Add user onboarding improvements'
        ],
        impact: 'high'
      });
    }
    
    return recommendations;
  }

  generateAlgorithmRecommendations() {
    const recommendations = [];
    
    // Check algorithm performance
    const algorithmIssues = this.analysisResults
      .filter(result => result.type === 'weight_suggestions')
      .flatMap(result => result.suggestions);
    
    if (algorithmIssues.length > 0) {
      recommendations.push({
        category: 'algorithm',
        priority: 'medium',
        title: 'Optimize Recommendation Algorithm',
        description: 'Algorithm performance can be improved',
        actions: [
          'Implement dynamic weight adjustment',
          'Add more user preference signals',
          'Improve content similarity scoring',
          'Add real-time feedback loops'
        ],
        impact: 'medium'
      });
    }
    
    return recommendations;
  }

  generateSecurityRecommendations() {
    const recommendations = [];
    
    // Check for security-related errors
    const securityErrors = [...this.logSources.sentry, ...this.logSources.pino]
      .filter(log => 
        log.message?.toLowerCase().includes('security') ||
        log.message?.toLowerCase().includes('auth') ||
        log.message?.toLowerCase().includes('unauthorized')
      );
    
    if (securityErrors.length > 0) {
      recommendations.push({
        category: 'security',
        priority: 'critical',
        title: 'Review Security Incidents',
        description: 'Security-related errors detected in logs',
        actions: [
          'Review authentication mechanisms',
          'Implement rate limiting',
          'Add security monitoring',
          'Conduct security audit'
        ],
        impact: 'critical'
      });
    }
    
    return recommendations;
  }

  calculatePriority(recommendations) {
    const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
    const highCount = recommendations.filter(r => r.priority === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
  }

  /**
   * 📈 Generate Analysis Report
   */
  async generateAnalysisReport() {
    console.log('📈 Generating analysis report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      analysis: {
        logSources: {
          sentry: this.logSources.sentry.length,
          pino: this.logSources.pino.length,
          custom: this.logSources.custom.length
        },
        anomalies: this.analysisResults.filter(r => r.type === 'anomalies').length,
        recommendations: this.analysisResults.filter(r => r.type === 'recommendations').length,
        weightSuggestions: this.analysisResults.filter(r => r.type === 'weight_suggestions').length
      },
      results: this.analysisResults,
      summary: {
        totalLogs: this.logSources.sentry.length + this.logSources.pino.length + this.logSources.custom.length,
        criticalIssues: this.analysisResults.filter(r => r.severity === 'critical').length,
        recommendations: this.analysisResults.filter(r => r.type === 'recommendations').flatMap(r => r.recommendations).length
      }
    };
    
    const reportPath = path.join(this.outputDir, this.timestamp, 'serena-analysis-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Analysis report generated: ${reportPath}`);
    return report;
  }

  /**
   * 🚀 Main Execution
   */
  async run() {
    console.log('🔍 Starting Serena Analysis MCP...');
    
    await this.init();
    
    // Run all analysis components
    await this.analyzeLogs();
    await this.inspectRankingEndpoints();
    await this.suggestWeightAdjustments();
    await this.generateRecommendations();
    
    // Generate final report
    await this.generateAnalysisReport();
    
    console.log('✅ Serena Analysis Complete!');
    console.log(`📁 Results saved to: ${this.outputDir}/${this.timestamp}`);
  }
}

// Export for MCP usage
module.exports = SerenaAnalysisMCP;

// Run if called directly
if (require.main === module) {
  const serenaMCP = new SerenaAnalysisMCP();
  serenaMCP.run().catch(console.error);
}
