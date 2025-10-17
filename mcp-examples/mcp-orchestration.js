#!/usr/bin/env node

/**
 * 🎯 MCP Orchestration - Smart Testing and Monitoring System
 * 
 * Orchestrates all MCPs for comprehensive testing and monitoring:
 * - Playwright MCP (eyes-on-glass coverage)
 * - Serena MCP (audit logs and telemetry)
 * - Firecrawl MCP (content QA and compliance)
 * - GitHub MCP (architectural guidelines and schema drift)
 * - Integration Test Suites (regression testing)
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class MCPOrchestration {
  constructor() {
    this.baseUrl = process.env.APP_URL || 'http://localhost:3000';
    this.outputDir = path.join(__dirname, '../evidence/mcp-orchestration');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.orchestrationResults = [];
    this.mcpStatus = {};
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, this.timestamp), { recursive: true });
    
    console.log('🎯 MCP Orchestration System Initialized');
    console.log(`📁 Output directory: ${this.outputDir}/${this.timestamp}`);
  }

  /**
   * 🚀 Run All MCPs in Smart Sequence
   */
  async runAllMCPs() {
    console.log('🚀 Starting MCP Orchestration...');
    
    const mcpSequence = [
      {
        name: 'playwright-persona-flows',
        description: 'Eyes-on-glass coverage with persona flows',
        module: './playwright-persona-flows.js',
        priority: 'high',
        dependencies: []
      },
      {
        name: 'serena-analysis',
        description: 'Audit logs and telemetry analysis',
        module: './serena-analysis-mcp.js',
        priority: 'high',
        dependencies: []
      },
      {
        name: 'firecrawl-content-qa',
        description: 'Content QA and compliance monitoring',
        module: './firecrawl-content-qa.js',
        priority: 'medium',
        dependencies: []
      },
      {
        name: 'github-static-review',
        description: 'Architectural guidelines and schema drift',
        module: './github-static-review.js',
        priority: 'high',
        dependencies: []
      },
      {
        name: 'integration-test-suites',
        description: 'Regression testing and visual diffs',
        module: './integration-test-suites.js',
        priority: 'high',
        dependencies: ['playwright-persona-flows']
      }
    ];

    // Run MCPs in priority order
    const sortedMCPs = mcpSequence.sort((a, b) => {
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    for (const mcp of sortedMCPs) {
      await this.runMCP(mcp);
    }

    // Generate orchestration report
    await this.generateOrchestrationReport();
  }

  async runMCP(mcp) {
    console.log(`\n🎯 Running ${mcp.name}...`);
    console.log(`   Description: ${mcp.description}`);
    console.log(`   Priority: ${mcp.priority}`);
    
    const startTime = Date.now();
    
    try {
      // Check dependencies
      if (mcp.dependencies.length > 0) {
        const unmetDeps = mcp.dependencies.filter(dep => !this.mcpStatus[dep]?.completed);
        if (unmetDeps.length > 0) {
          console.log(`   ⏳ Waiting for dependencies: ${unmetDeps.join(', ')}`);
          await this.waitForDependencies(unmetDeps);
        }
      }

      // Run the MCP
      const result = await this.executeMCP(mcp);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.mcpStatus[mcp.name] = {
        completed: true,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: duration,
        result: result,
        status: 'success'
      };
      
      console.log(`   ✅ ${mcp.name} completed in ${duration}ms`);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.mcpStatus[mcp.name] = {
        completed: false,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        duration: duration,
        error: error.message,
        status: 'failed'
      };
      
      console.log(`   ❌ ${mcp.name} failed: ${error.message}`);
    }
  }

  async executeMCP(mcp) {
    const modulePath = path.join(__dirname, mcp.module);
    
    try {
      // Check if module exists
      await fs.access(modulePath);
      
      // Execute the module
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const child = spawn('node', [modulePath], {
          cwd: __dirname,
          stdio: 'inherit'
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve({ exitCode: 0, message: 'MCP executed successfully' });
          } else {
            reject(new Error(`MCP exited with code ${code}`));
          }
        });
        
        child.on('error', (error) => {
          reject(error);
        });
      });
      
    } catch (error) {
      throw new Error(`Failed to execute ${mcp.name}: ${error.message}`);
    }
  }

  async waitForDependencies(dependencies) {
    const maxWaitTime = 300000; // 5 minutes
    const checkInterval = 5000; // 5 seconds
    let waited = 0;
    
    while (waited < maxWaitTime) {
      const unmetDeps = dependencies.filter(dep => !this.mcpStatus[dep]?.completed);
      
      if (unmetDeps.length === 0) {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }
    
    throw new Error(`Timeout waiting for dependencies: ${dependencies.join(', ')}`);
  }

  /**
   * 📊 Generate Orchestration Report
   */
  async generateOrchestrationReport() {
    console.log('\n📊 Generating orchestration report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      orchestration: {
        totalMCPs: Object.keys(this.mcpStatus).length,
        completed: Object.values(this.mcpStatus).filter(status => status.completed).length,
        failed: Object.values(this.mcpStatus).filter(status => !status.completed).length,
        totalDuration: Object.values(this.mcpStatus).reduce((sum, status) => sum + status.duration, 0)
      },
      mcpStatus: this.mcpStatus,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };

    const reportPath = path.join(this.outputDir, this.timestamp, 'mcp-orchestration-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Orchestration report generated: ${reportPath}`);
    return report;
  }

  generateSummary() {
    const completed = Object.values(this.mcpStatus).filter(status => status.completed);
    const failed = Object.values(this.mcpStatus).filter(status => !status.completed);
    
    return {
      successRate: (completed.length / Object.keys(this.mcpStatus).length) * 100,
      averageDuration: completed.reduce((sum, status) => sum + status.duration, 0) / completed.length,
      fastestMCP: completed.reduce((fastest, status) => 
        status.duration < fastest.duration ? status : fastest, completed[0] || { duration: Infinity }),
      slowestMCP: completed.reduce((slowest, status) => 
        status.duration > slowest.duration ? status : slowest, completed[0] || { duration: 0 }),
      criticalFailures: failed.filter(status => status.error?.includes('critical')).length
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for failed MCPs
    const failedMCPs = Object.entries(this.mcpStatus).filter(([name, status]) => !status.completed);
    
    if (failedMCPs.length > 0) {
      recommendations.push({
        type: 'failed_mcps',
        priority: 'high',
        title: 'Address Failed MCPs',
        description: `${failedMCPs.length} MCPs failed during execution`,
        actions: failedMCPs.map(([name, status]) => ({
          mcp: name,
          error: status.error,
          action: `Fix ${name} and re-run`
        }))
      });
    }
    
    // Check for slow MCPs
    const slowMCPs = Object.entries(this.mcpStatus)
      .filter(([name, status]) => status.completed && status.duration > 60000) // > 1 minute
      .map(([name, status]) => ({ name, duration: status.duration }));
    
    if (slowMCPs.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Optimize Slow MCPs',
        description: `${slowMCPs.length} MCPs took longer than 1 minute`,
        actions: slowMCPs.map(mcp => ({
          mcp: mcp.name,
          duration: mcp.duration,
          action: `Optimize ${mcp.name} performance`
        }))
      });
    }
    
    // Check for dependency issues
    const dependencyIssues = Object.entries(this.mcpStatus)
      .filter(([name, status]) => status.error?.includes('dependency'));
    
    if (dependencyIssues.length > 0) {
      recommendations.push({
        type: 'dependencies',
        priority: 'high',
        title: 'Fix Dependency Issues',
        description: `${dependencyIssues.length} MCPs failed due to dependencies`,
        actions: dependencyIssues.map(([name, status]) => ({
          mcp: name,
          error: status.error,
          action: `Resolve dependencies for ${name}`
        }))
      });
    }
    
    return recommendations;
  }

  generateNextSteps() {
    const steps = [];
    
    // Immediate steps
    const failedMCPs = Object.entries(this.mcpStatus).filter(([name, status]) => !status.completed);
    if (failedMCPs.length > 0) {
      steps.push('Fix failed MCPs and re-run orchestration');
    }
    
    // Optimization steps
    const slowMCPs = Object.entries(this.mcpStatus)
      .filter(([name, status]) => status.completed && status.duration > 60000);
    if (slowMCPs.length > 0) {
      steps.push('Optimize slow MCPs for better performance');
    }
    
    // Monitoring steps
    steps.push('Set up automated MCP orchestration in CI/CD');
    steps.push('Implement MCP health monitoring');
    steps.push('Schedule regular MCP orchestration runs');
    steps.push('Create MCP performance dashboards');
    
    return steps;
  }

  /**
   * 🔄 Run Specific MCP Subset
   */
  async runMCPSubset(mcpNames) {
    console.log(`🔄 Running MCP subset: ${mcpNames.join(', ')}`);
    
    const availableMCPs = {
      'playwright-persona-flows': './playwright-persona-flows.js',
      'serena-analysis': './serena-analysis-mcp.js',
      'firecrawl-content-qa': './firecrawl-content-qa.js',
      'github-static-review': './github-static-review.js',
      'integration-test-suites': './integration-test-suites.js'
    };
    
    for (const mcpName of mcpNames) {
      if (availableMCPs[mcpName]) {
        const mcp = {
          name: mcpName,
          description: `Custom run of ${mcpName}`,
          module: availableMCPs[mcpName],
          priority: 'medium',
          dependencies: []
        };
        
        await this.runMCP(mcp);
      } else {
        console.log(`❌ Unknown MCP: ${mcpName}`);
      }
    }
  }

  /**
   * 📈 Generate MCP Health Dashboard
   */
  async generateHealthDashboard() {
    console.log('📈 Generating MCP health dashboard...');
    
    const dashboard = {
      timestamp: new Date().toISOString(),
      health: {
        overall: this.calculateOverallHealth(),
        mcpHealth: this.calculateMCPHealth(),
        performance: this.calculatePerformanceMetrics(),
        reliability: this.calculateReliabilityMetrics()
      },
      trends: this.analyzeTrends(),
      alerts: this.generateAlerts()
    };

    const dashboardPath = path.join(this.outputDir, this.timestamp, 'mcp-health-dashboard.json');
    await fs.writeFile(dashboardPath, JSON.stringify(dashboard, null, 2));
    
    console.log(`📈 Health dashboard generated: ${dashboardPath}`);
    return dashboard;
  }

  calculateOverallHealth() {
    const totalMCPs = Object.keys(this.mcpStatus).length;
    const healthyMCPs = Object.values(this.mcpStatus).filter(status => 
      status.completed && status.duration < 120000 // < 2 minutes
    ).length;
    
    return {
      score: (healthyMCPs / totalMCPs) * 100,
      status: healthyMCPs / totalMCPs > 0.8 ? 'healthy' : 'degraded',
      totalMCPs,
      healthyMCPs
    };
  }

  calculateMCPHealth() {
    return Object.entries(this.mcpStatus).map(([name, status]) => ({
      name,
      health: status.completed ? 'healthy' : 'unhealthy',
      duration: status.duration,
      lastRun: status.endTime,
      error: status.error || null
    }));
  }

  calculatePerformanceMetrics() {
    const completedMCPs = Object.values(this.mcpStatus).filter(status => status.completed);
    
    if (completedMCPs.length === 0) return { average: 0, min: 0, max: 0 };
    
    const durations = completedMCPs.map(status => status.duration);
    
    return {
      average: durations.reduce((sum, duration) => sum + duration, 0) / durations.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      median: durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]
    };
  }

  calculateReliabilityMetrics() {
    const totalRuns = Object.keys(this.mcpStatus).length;
    const successfulRuns = Object.values(this.mcpStatus).filter(status => status.completed).length;
    
    return {
      successRate: (successfulRuns / totalRuns) * 100,
      failureRate: ((totalRuns - successfulRuns) / totalRuns) * 100,
      totalRuns,
      successfulRuns
    };
  }

  analyzeTrends() {
    // This would analyze historical data if available
    return {
      performanceTrend: 'stable',
      reliabilityTrend: 'stable',
      recommendations: []
    };
  }

  generateAlerts() {
    const alerts = [];
    
    // Performance alerts
    const slowMCPs = Object.entries(this.mcpStatus)
      .filter(([name, status]) => status.completed && status.duration > 120000);
    
    if (slowMCPs.length > 0) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `${slowMCPs.length} MCPs are running slowly`,
        mcpNames: slowMCPs.map(([name]) => name)
      });
    }
    
    // Failure alerts
    const failedMCPs = Object.entries(this.mcpStatus)
      .filter(([name, status]) => !status.completed);
    
    if (failedMCPs.length > 0) {
      alerts.push({
        type: 'failure',
        severity: 'critical',
        message: `${failedMCPs.length} MCPs failed`,
        mcpNames: failedMCPs.map(([name]) => name)
      });
    }
    
    return alerts;
  }

  /**
   * 🚀 Main Execution
   */
  async run() {
    console.log('🎯 Starting MCP Orchestration System...');
    
    await this.init();
    
    // Run all MCPs
    await this.runAllMCPs();
    
    // Generate health dashboard
    await this.generateHealthDashboard();
    
    console.log('\n✅ MCP Orchestration Complete!');
    console.log(`📁 Results saved to: ${this.outputDir}/${this.timestamp}`);
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Orchestration Summary:');
    console.log('========================');
    
    const completed = Object.values(this.mcpStatus).filter(status => status.completed);
    const failed = Object.values(this.mcpStatus).filter(status => !status.completed);
    
    console.log(`✅ Completed: ${completed.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`⏱️  Total Duration: ${Object.values(this.mcpStatus).reduce((sum, status) => sum + status.duration, 0)}ms`);
    
    if (failed.length > 0) {
      console.log('\n❌ Failed MCPs:');
      failed.forEach((status, index) => {
        console.log(`   ${index + 1}. ${Object.keys(this.mcpStatus)[Object.values(this.mcpStatus).indexOf(status)]}: ${status.error}`);
      });
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Review the orchestration report');
    console.log('2. Fix any failed MCPs');
    console.log('3. Set up automated orchestration');
    console.log('4. Monitor MCP health regularly');
  }
}

// Export for MCP usage
module.exports = MCPOrchestration;

// Run if called directly
if (require.main === module) {
  const orchestration = new MCPOrchestration();
  orchestration.run().catch(console.error);
}
