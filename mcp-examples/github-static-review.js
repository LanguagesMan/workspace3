#!/usr/bin/env node

/**
 * 🐙 GitHub MCP - Static Review and Architecture Guidelines
 * 
 * Enforce architectural guidelines (no direct file access bypassing service layer)
 * Run schema drift checks, ensure migrations keep Supabase in sync
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class GitHubStaticReview {
  constructor() {
    this.repoPath = process.env.REPO_PATH || '/Users/mindful/_projects/workspace3';
    this.outputDir = path.join(__dirname, '../evidence/github-review');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.reviewResults = [];
    this.architectureViolations = [];
    this.schemaDriftIssues = [];
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, this.timestamp), { recursive: true });
  }

  /**
   * 🏗️ Enforce Architectural Guidelines
   */
  async enforceArchitecturalGuidelines() {
    console.log('🏗️ Enforcing architectural guidelines...');
    
    const guidelines = [
      {
        name: 'no-direct-file-access',
        description: 'No direct file access bypassing service layer',
        patterns: [
          /fs\.readFileSync/,
          /fs\.writeFileSync/,
          /fs\.readFile/,
          /fs\.writeFile/,
          /require\(.*\.json\)/,
          /JSON\.parse\(fs\.readFileSync/
        ],
        allowedPaths: ['config/', 'lib/', 'middleware/'],
        severity: 'high'
      },
      {
        name: 'service-layer-pattern',
        description: 'All data access must go through service layer',
        patterns: [
          /database\.query/,
          /db\.query/,
          /supabase\.from/,
          /prisma\./,
          /mongoose\./
        ],
        requiredPaths: ['api/', 'lib/'],
        severity: 'high'
      },
      {
        name: 'error-handling',
        description: 'Proper error handling required',
        patterns: [
          /try\s*{[\s\S]*?}\s*catch/,
          /\.catch\(/,
          /throw new Error/,
          /console\.error/
        ],
        severity: 'medium'
      },
      {
        name: 'type-safety',
        description: 'TypeScript types required for API endpoints',
        patterns: [
          /interface\s+\w+/,
          /type\s+\w+/,
          /:\s*\w+/,
          /as\s+\w+/
        ],
        requiredPaths: ['api/', 'lib/'],
        severity: 'medium'
      }
    ];

    for (const guideline of guidelines) {
      await this.checkGuideline(guideline);
    }
  }

  async checkGuideline(guideline) {
    console.log(`  🔍 Checking ${guideline.name}...`);
    
    const violations = [];
    const files = await this.getRelevantFiles(guideline);
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const violationsInFile = this.findViolations(content, file, guideline);
        violations.push(...violationsInFile);
      } catch (error) {
        console.log(`Error reading file ${file}: ${error.message}`);
      }
    }
    
    if (violations.length > 0) {
      this.architectureViolations.push({
        guideline: guideline.name,
        description: guideline.description,
        severity: guideline.severity,
        violations: violations,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log(`  ✅ Found ${violations.length} violations for ${guideline.name}`);
  }

  async getRelevantFiles(guideline) {
    const allFiles = await this.getAllSourceFiles();
    
    if (guideline.allowedPaths) {
      return allFiles.filter(file => 
        guideline.allowedPaths.some(allowedPath => file.includes(allowedPath))
      );
    }
    
    if (guideline.requiredPaths) {
      return allFiles.filter(file => 
        guideline.requiredPaths.some(requiredPath => file.includes(requiredPath))
      );
    }
    
    return allFiles;
  }

  async getAllSourceFiles() {
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];
    const files = [];
    
    try {
      const { execSync } = require('child_process');
      const result = execSync(`find ${this.repoPath} -type f \\( ${extensions.map(ext => `-name "*${ext}"`).join(' -o ')} \\)`, { encoding: 'utf8' });
      files.push(...result.trim().split('\n').filter(f => f));
    } catch (error) {
      console.log('Error finding source files:', error.message);
    }
    
    return files;
  }

  findViolations(content, filePath, guideline) {
    const violations = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of guideline.patterns) {
        if (pattern.test(line)) {
          violations.push({
            file: filePath,
            line: i + 1,
            content: line.trim(),
            pattern: pattern.source,
            severity: guideline.severity
          });
        }
      }
    }
    
    return violations;
  }

  /**
   * 🗄️ Schema Drift Checks
   */
  async checkSchemaDrift() {
    console.log('🗄️ Checking schema drift...');
    
    const driftChecks = [
      {
        name: 'supabase-schema-sync',
        description: 'Ensure Supabase schema is in sync with migrations',
        check: () => this.checkSupabaseSchemaSync()
      },
      {
        name: 'migration-consistency',
        description: 'Check migration consistency',
        check: () => this.checkMigrationConsistency()
      },
      {
        name: 'type-definitions',
        description: 'Verify TypeScript type definitions match schema',
        check: () => this.checkTypeDefinitions()
      },
      {
        name: 'api-schema-validation',
        description: 'Validate API schema consistency',
        check: () => this.checkApiSchemaValidation()
      }
    ];

    for (const check of driftChecks) {
      try {
        const result = await check.check();
        if (result.issues && result.issues.length > 0) {
          this.schemaDriftIssues.push({
            check: check.name,
            description: check.description,
            issues: result.issues,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log(`Error in ${check.name}: ${error.message}`);
      }
    }
  }

  async checkSupabaseSchemaSync() {
    const issues = [];
    
    try {
      // Check if Supabase CLI is available
      const { execSync } = require('child_process');
      execSync('supabase --version', { stdio: 'pipe' });
      
      // Check for schema differences
      const schemaDiff = execSync('supabase db diff', { 
        cwd: this.repoPath, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (schemaDiff.trim()) {
        issues.push({
          type: 'schema_drift',
          message: 'Schema differences detected',
          details: schemaDiff,
          severity: 'high'
        });
      }
    } catch (error) {
      issues.push({
        type: 'supabase_cli_error',
        message: 'Supabase CLI not available or error occurred',
        details: error.message,
        severity: 'medium'
      });
    }
    
    return { issues };
  }

  async checkMigrationConsistency() {
    const issues = [];
    
    try {
      const migrationFiles = await this.getMigrationFiles();
      const schemaFiles = await this.getSchemaFiles();
      
      // Check for orphaned migrations
      for (const migration of migrationFiles) {
        const isReferenced = await this.isMigrationReferenced(migration, schemaFiles);
        if (!isReferenced) {
          issues.push({
            type: 'orphaned_migration',
            message: `Migration ${migration} is not referenced in schema`,
            file: migration,
            severity: 'medium'
          });
        }
      }
      
      // Check for missing migrations
      for (const schema of schemaFiles) {
        const hasMigration = await this.hasMigrationForSchema(schema, migrationFiles);
        if (!hasMigration) {
          issues.push({
            type: 'missing_migration',
            message: `Schema ${schema} has no corresponding migration`,
            file: schema,
            severity: 'high'
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'migration_check_error',
        message: 'Error checking migration consistency',
        details: error.message,
        severity: 'medium'
      });
    }
    
    return { issues };
  }

  async getMigrationFiles() {
    const migrationPaths = [
      'supabase/migrations/',
      'db/migrations/',
      'migrations/',
      'prisma/migrations/'
    ];
    
    const files = [];
    
    for (const migrationPath of migrationPaths) {
      try {
        const fullPath = path.join(this.repoPath, migrationPath);
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isFile() && (entry.name.endsWith('.sql') || entry.name.endsWith('.js'))) {
            files.push(path.join(fullPath, entry.name));
          }
        }
      } catch (error) {
        // Directory doesn't exist, continue
      }
    }
    
    return files;
  }

  async getSchemaFiles() {
    const schemaPaths = [
      'supabase/schema.sql',
      'db/schema.sql',
      'schema.sql',
      'prisma/schema.prisma'
    ];
    
    const files = [];
    
    for (const schemaPath of schemaPaths) {
      try {
        const fullPath = path.join(this.repoPath, schemaPath);
        await fs.access(fullPath);
        files.push(fullPath);
      } catch (error) {
        // File doesn't exist, continue
      }
    }
    
    return files;
  }

  async isMigrationReferenced(migrationFile, schemaFiles) {
    try {
      const migrationContent = await fs.readFile(migrationFile, 'utf8');
      
      for (const schemaFile of schemaFiles) {
        const schemaContent = await fs.readFile(schemaFile, 'utf8');
        
        // Simple check for migration content in schema
        const migrationLines = migrationContent.split('\n').filter(line => 
          line.trim() && !line.startsWith('--') && !line.startsWith('/*')
        );
        
        for (const line of migrationLines) {
          if (schemaContent.includes(line.trim())) {
            return true;
          }
        }
      }
    } catch (error) {
      console.log(`Error checking migration reference: ${error.message}`);
    }
    
    return false;
  }

  async hasMigrationForSchema(schemaFile, migrationFiles) {
    try {
      const schemaContent = await fs.readFile(schemaFile, 'utf8');
      
      // Extract table definitions
      const tableMatches = schemaContent.match(/CREATE TABLE\s+(\w+)/gi);
      if (!tableMatches) return true; // No tables to check
      
      for (const tableMatch of tableMatches) {
        const tableName = tableMatch.replace(/CREATE TABLE\s+/i, '').trim();
        
        // Check if any migration creates this table
        let hasMigration = false;
        for (const migrationFile of migrationFiles) {
          const migrationContent = await fs.readFile(migrationFile, 'utf8');
          if (migrationContent.includes(`CREATE TABLE ${tableName}`)) {
            hasMigration = true;
            break;
          }
        }
        
        if (!hasMigration) {
          return false;
        }
      }
    } catch (error) {
      console.log(`Error checking schema migration: ${error.message}`);
    }
    
    return true;
  }

  async checkTypeDefinitions() {
    const issues = [];
    
    try {
      // Check for TypeScript files
      const tsFiles = await this.getTypeScriptFiles();
      
      for (const tsFile of tsFiles) {
        const content = await fs.readFile(tsFile, 'utf8');
        
        // Check for database-related types
        if (content.includes('database') || content.includes('db') || content.includes('supabase')) {
          // Check for proper type definitions
          const hasInterface = /interface\s+\w+/.test(content);
          const hasType = /type\s+\w+/.test(content);
          
          if (!hasInterface && !hasType) {
            issues.push({
              type: 'missing_types',
              message: 'Database-related file missing type definitions',
              file: tsFile,
              severity: 'medium'
            });
          }
        }
      }
    } catch (error) {
      issues.push({
        type: 'type_check_error',
        message: 'Error checking type definitions',
        details: error.message,
        severity: 'low'
      });
    }
    
    return { issues };
  }

  async getTypeScriptFiles() {
    const files = [];
    
    try {
      const { execSync } = require('child_process');
      const result = execSync(`find ${this.repoPath} -name "*.ts" -o -name "*.tsx"`, { encoding: 'utf8' });
      files.push(...result.trim().split('\n').filter(f => f));
    } catch (error) {
      console.log('Error finding TypeScript files:', error.message);
    }
    
    return files;
  }

  async checkApiSchemaValidation() {
    const issues = [];
    
    try {
      // Check for API route files
      const apiFiles = await this.getApiFiles();
      
      for (const apiFile of apiFiles) {
        const content = await fs.readFile(apiFile, 'utf8');
        
        // Check for input validation
        const hasValidation = /zod|joi|yup|validator/.test(content);
        const hasTypeChecking = /: \w+/.test(content);
        
        if (!hasValidation && !hasTypeChecking) {
          issues.push({
            type: 'missing_validation',
            message: 'API endpoint missing input validation',
            file: apiFile,
            severity: 'high'
          });
        }
        
        // Check for error handling
        const hasErrorHandling = /try\s*{[\s\S]*?}\s*catch/.test(content);
        
        if (!hasErrorHandling) {
          issues.push({
            type: 'missing_error_handling',
            message: 'API endpoint missing error handling',
            file: apiFile,
            severity: 'medium'
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'api_check_error',
        message: 'Error checking API schema validation',
        details: error.message,
        severity: 'low'
      });
    }
    
    return { issues };
  }

  async getApiFiles() {
    const files = [];
    
    try {
      const { execSync } = require('child_process');
      const result = execSync(`find ${this.repoPath} -path "*/api/*" -name "*.js" -o -path "*/api/*" -name "*.ts"`, { encoding: 'utf8' });
      files.push(...result.trim().split('\n').filter(f => f));
    } catch (error) {
      console.log('Error finding API files:', error.message);
    }
    
    return files;
  }

  /**
   * 📊 Generate Review Report
   */
  async generateReviewReport() {
    console.log('📊 Generating review report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalArchitectureViolations: this.architectureViolations.length,
        totalSchemaDriftIssues: this.schemaDriftIssues.length,
        criticalIssues: this.getCriticalIssues().length,
        highPriorityIssues: this.getHighPriorityIssues().length,
        mediumPriorityIssues: this.getMediumPriorityIssues().length
      },
      architectureViolations: this.architectureViolations,
      schemaDriftIssues: this.schemaDriftIssues,
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps()
    };
    
    const reportPath = path.join(this.outputDir, this.timestamp, 'github-review-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Review report generated: ${reportPath}`);
    return report;
  }

  getCriticalIssues() {
    return [
      ...this.architectureViolations.filter(v => v.severity === 'critical'),
      ...this.schemaDriftIssues.filter(i => i.issues.some(issue => issue.severity === 'critical'))
    ];
  }

  getHighPriorityIssues() {
    return [
      ...this.architectureViolations.filter(v => v.severity === 'high'),
      ...this.schemaDriftIssues.filter(i => i.issues.some(issue => issue.severity === 'high'))
    ];
  }

  getMediumPriorityIssues() {
    return [
      ...this.architectureViolations.filter(v => v.severity === 'medium'),
      ...this.schemaDriftIssues.filter(i => i.issues.some(issue => issue.severity === 'medium'))
    ];
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Architecture recommendations
    if (this.architectureViolations.length > 0) {
      recommendations.push({
        type: 'architecture',
        priority: 'high',
        title: 'Fix Architectural Violations',
        description: `${this.architectureViolations.length} architectural violations found`,
        actions: [
          'Review and fix direct file access violations',
          'Implement proper service layer patterns',
          'Add proper error handling',
          'Ensure type safety in API endpoints'
        ]
      });
    }
    
    // Schema recommendations
    if (this.schemaDriftIssues.length > 0) {
      recommendations.push({
        type: 'schema',
        priority: 'high',
        title: 'Fix Schema Drift Issues',
        description: `${this.schemaDriftIssues.length} schema drift issues found`,
        actions: [
          'Sync Supabase schema with migrations',
          'Review migration consistency',
          'Update TypeScript type definitions',
          'Add API schema validation'
        ]
      });
    }
    
    return recommendations;
  }

  generateNextSteps() {
    const steps = [];
    
    if (this.architectureViolations.length > 0) {
      steps.push('Fix architectural violations before deployment');
    }
    
    if (this.schemaDriftIssues.length > 0) {
      steps.push('Resolve schema drift issues');
    }
    
    steps.push('Set up automated architecture checks in CI/CD');
    steps.push('Implement pre-commit hooks for code quality');
    steps.push('Schedule regular architecture reviews');
    
    return steps;
  }

  /**
   * 🚀 Main Execution
   */
  async run() {
    console.log('🐙 Starting GitHub Static Review...');
    
    await this.init();
    
    // Run all review components
    await this.enforceArchitecturalGuidelines();
    await this.checkSchemaDrift();
    await this.generateReviewReport();
    
    console.log('✅ GitHub Static Review Complete!');
    console.log(`📁 Results saved to: ${this.outputDir}/${this.timestamp}`);
  }
}

// Export for MCP usage
module.exports = GitHubStaticReview;

// Run if called directly
if (require.main === module) {
  const githubReview = new GitHubStaticReview();
  githubReview.run().catch(console.error);
}
