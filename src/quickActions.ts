import * as vscode from 'vscode';
import { ConversationService, InteractionService, RoadmapService } from './services/interfaces';

let conversationService: ConversationService;
let interactionService: InteractionService;
let roadmapService: RoadmapService;

async function contextReviewAndNextSteps() {
    if (!conversationService) {
        conversationService = new ConversationService();
        interactionService = new InteractionService();
        roadmapService = new RoadmapService();
    }

    // Review Recent Activities
    const recentConversations = await conversationService.getRecentConversations(5);
    const recentInteractions = await interactionService.getNextSteps();

    // Assess Progress
    const roadmapItems = await roadmapService.getRoadmap();
    const blockers = await roadmapService.getBlockers();

    // Plan Next Steps
    const nextSteps = await interactionService.getNextSteps();

    // Display Summary
    vscode.window.showInformationMessage(`Recent Activities: ${recentConversations.length} conversations, ${recentInteractions.length} interactions.`);
    vscode.window.showInformationMessage(`Roadmap: ${roadmapItems.length} items, ${blockers.length} blockers.`);
    vscode.window.showInformationMessage(`Next Steps: ${nextSteps.join(', ')}`);
}

export function showQuickActionMenu() {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = [
        { label: 'Track AI Interaction', description: 'Log a new interaction with the AI' },
        { label: 'Context Review & Next Steps', description: 'Review recent activities and plan next steps' },
        { label: 'Switch Project Context', description: 'Change the active project context' },
        { label: 'View Roadmap', description: 'Open the project roadmap' }
    ];

    quickPick.onDidChangeSelection(selection => {
        if (selection[0]) {
            switch (selection[0].label) {
                case 'Track AI Interaction':
                    vscode.window.showInformationMessage('Track AI Interaction selected');
                    break;
                case 'Context Review & Next Steps':
                    contextReviewAndNextSteps();
                    break;
                case 'Switch Project Context':
                    vscode.window.showInformationMessage('Switch Project Context selected');
                    break;
                case 'View Roadmap':
                    vscode.window.showInformationMessage('View Roadmap selected');
                    break;
            }
            quickPick.hide();
        }
    });

    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
}
