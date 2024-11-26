import * as vscode from 'vscode';

interface FileAccess {
    filePath: string;
    accessTime: Date;
}

interface FileGroup {
    groupName: string;
    files: FileAccess[];
}

interface ContextSummary {
    contextName: string;
    fileGroups: FileGroup[];
    switchTime: Date;
}

class ContextTracker {
    private activeFiles: FileAccess[] = [];
    private fileGroups: FileGroup[] = [];
    private contextSummaries: ContextSummary[] = [];
    private contextSwitchThreshold: number;
    private fileGroupThreshold: number;

    constructor() {
        this.contextSwitchThreshold = vscode.workspace.getConfiguration('windsurf').get('contextSwitchThreshold', 15);
        this.fileGroupThreshold = vscode.workspace.getConfiguration('windsurf').get('fileGroupThreshold', 30);
    }

    public trackFileAccess(filePath: string): void {
        const accessTime = new Date();
        this.activeFiles.push({ filePath, accessTime });
        this.groupRelatedFiles();
        this.detectContextSwitch();
    }

    private groupRelatedFiles(): void {
        const now = new Date();
        this.fileGroups = [];

        this.activeFiles.forEach(file => {
            const group = this.fileGroups.find(g => g.files.some(f => this.isWithinThreshold(f.accessTime, file.accessTime, this.fileGroupThreshold)));
            if (group) {
                group.files.push(file);
            } else {
                this.fileGroups.push({ groupName: `Group ${this.fileGroups.length + 1}`, files: [file] });
            }
        });
    }

    private detectContextSwitch(): void {
        const now = new Date();
        const lastAccess = this.activeFiles[this.activeFiles.length - 1].accessTime;
        const timeDiff = (now.getTime() - lastAccess.getTime()) / 60000;

        if (timeDiff > this.contextSwitchThreshold) {
            this.generateContextSummary();
            this.activeFiles = [];
        }
    }

    private generateContextSummary(): void {
        const contextName = `Context ${this.contextSummaries.length + 1}`;
        const switchTime = new Date();
        const summary: ContextSummary = {
            contextName,
            fileGroups: this.fileGroups,
            switchTime
        };
        this.contextSummaries.push(summary);
    }

    private isWithinThreshold(time1: Date, time2: Date, threshold: number): boolean {
        const timeDiff = Math.abs(time1.getTime() - time2.getTime()) / 60000;
        return timeDiff <= threshold;
    }

    public getContextSummaries(): ContextSummary[] {
        return this.contextSummaries;
    }
}

export default ContextTracker;
