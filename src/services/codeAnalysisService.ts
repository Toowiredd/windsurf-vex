import * as vscode from 'vscode';
import { CodeReference, Context, Memory } from '../types';

export interface CodeAnalysis {
    summary: string;
    complexity: number;
    dependencies: string[];
    suggestedTags: string[];
    codeReferences: CodeReference[];
}

export class CodeAnalysisService {
    constructor() {}

    public analyzeCode(text: string, filePath: string): CodeAnalysis {
        // Basic implementation - can be enhanced with more sophisticated analysis
        const lines = text.split('\n');
        const dependencies = this.extractDependencies(lines);
        const complexity = this.calculateComplexity(text);
        const tags = this.suggestTags(text, dependencies);
        
        return {
            summary: this.generateSummary(text, dependencies),
            complexity,
            dependencies,
            suggestedTags: tags,
            codeReferences: [{
                filePath,
                startLine: 0,
                endLine: lines.length - 1
            }]
        };
    }

    public async analyzeFileForContext(document: vscode.TextDocument, context: Context): Promise<Memory> {
        const analysis = this.analyzeCode(document.getText(), document.fileName);
        
        return {
            id: '', // Will be set by ContextManager
            content: analysis.summary,
            contextId: context.id,
            references: [analysis.codeReferences[0]],
            tags: new Set(analysis.suggestedTags),
            createdAt: new Date(),
            updatedAt: new Date(),
            importance: this.calculateImportance(analysis),
            confidence: 0.8,
        };
    }

    private extractDependencies(lines: string[]): string[] {
        const dependencies: Set<string> = new Set();
        const importRegex = /import\s+(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
        const requireRegex = /require\s*\(['"]([^'"]+)['"]\)/g;

        lines.forEach(line => {
            let match;
            while ((match = importRegex.exec(line)) !== null) {
                dependencies.add(match[1]);
            }
            while ((match = requireRegex.exec(line)) !== null) {
                dependencies.add(match[1]);
            }
        });

        return Array.from(dependencies);
    }

    private calculateComplexity(text: string): number {
        // Simple complexity calculation based on code patterns
        let complexity = 0;
        
        // Count control structures
        complexity += (text.match(/if|while|for|switch/g) || []).length;
        
        // Count function definitions
        complexity += (text.match(/function|=>/g) || []).length;
        
        // Count class definitions
        complexity += (text.match(/class\s+\w+/g) || []).length * 2;
        
        return complexity;
    }

    private suggestTags(text: string, dependencies: string[]): string[] {
        const tags: Set<string> = new Set();

        // Add language-specific tags
        if (text.includes('React')) tags.add('react');
        if (text.includes('useState') || text.includes('useEffect')) tags.add('react-hooks');
        if (text.includes('export class')) tags.add('class-based');
        if (text.includes('interface')) tags.add('typescript');
        
        // Add dependency-based tags
        dependencies.forEach(dep => {
            if (dep.startsWith('@types/')) tags.add('typescript');
            if (dep.includes('test')) tags.add('testing');
            if (dep.includes('react')) tags.add('react');
        });

        return Array.from(tags);
    }

    private generateSummary(text: string, dependencies: string[]): string {
        const lines = text.split('\n');
        const classMatch = text.match(/class\s+(\w+)/);
        const functionMatches = text.match(/function\s+(\w+)/g);
        
        let summary = '';
        
        if (classMatch) {
            summary += `Class ${classMatch[1]} `;
        }
        
        if (functionMatches) {
            summary += `with ${functionMatches.length} function(s) `;
        }
        
        if (dependencies.length > 0) {
            summary += `using ${dependencies.join(', ')} `;
        }
        
        summary += `(${lines.length} lines)`;
        
        return summary.trim();
    }

    private calculateImportance(analysis: CodeAnalysis): number {
        // Calculate importance based on various factors
        let importance = 1;
        
        // More complex code is typically more important
        importance += Math.min(analysis.complexity / 10, 2);
        
        // More dependencies might indicate more critical code
        importance += Math.min(analysis.dependencies.length / 5, 1);
        
        // Cap importance at 5
        return Math.min(importance, 5);
    }
}
