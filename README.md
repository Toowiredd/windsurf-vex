# Windsurf Vex

A personal context memory management app for Windsurf.

## Features

- 🧠 Automatic context tracking
- 📁 Smart file grouping
- 🔄 Context switch detection
- 📊 Visual context representation
- ⚡ Quick context switching
- 🎯 Focus mode

## Development

### GitHub Copilot Prompts

Use these prompts with GitHub Copilot to help build features:

1. **Context Tracking**
   ```typescript
   // @copilot-prompt: Create a class to track active files and detect context switches
   // - Track file access times
   // - Group related files
   // - Detect context switches
   // - Generate context summaries
   ```

2. **TreeView Provider**
   ```typescript
   // @copilot-prompt: Create a TreeView provider for the Windsurf Vex sidebar
   // - Show current context
   // - Display file groups
   // - Show context history
   // - Add context actions
   ```

3. **Settings Management**
   ```typescript
   // @copilot-prompt: Create a settings manager for Windsurf Vex configuration
   // - Load/save settings
   // - Validate settings
   // - Apply setting changes
   // - Handle workspace settings
   ```

4. **File Watcher**
   ```typescript
   // @copilot-prompt: Create a file watcher to track file changes
   // - Watch workspace files
   // - Handle file events
   // - Update context
   // - Manage exclusions
   ```

### Workspace Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/windsurf-vex.git
   cd windsurf-vex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open in VS Code:
   ```bash
   code .
   ```

4. Start development:
   ```bash
   npm run watch
   ```

### Project Structure

```
windsurf-vex/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── windsurf/              # Core Windsurf Vex functionality
│   │   ├── manager.ts        # Main manager class
│   │   ├── tracker.ts        # Context tracking
│   │   └── types.ts         # Type definitions
│   ├── views/               # UI components
│   │   ├── contextView.ts   # Context sidebar
│   │   └── historyView.ts   # History view
│   └── utils/              # Utility functions
├── .github/
│   └── workflows/          # GitHub Actions
└── .vscode/               # VS Code settings
```

### CI/CD

The project uses GitHub Actions for CI/CD:

- Automatic builds on push/PR
- Linting and testing
- Automatic publishing on main
- Concurrent build prevention
- Dependency caching

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Create a PR

## Using the "Context Review & Next Steps" Feature

The "Context Review & Next Steps" feature helps you review recent activities, assess your progress, and plan your next steps effectively. Here's how to use it:

1. **Access the Feature:**
   - Open the Quick Action Menu in VS Code.
   - Select "Context Review & Next Steps" from the list of actions.

2. **Review Recent Activities:**
   - The feature will display the number of recent conversations and interactions.

3. **Assess Progress:**
   - It will show the current roadmap items and any blockers you might have.

4. **Plan Next Steps:**
   - It provides a summary of the next steps based on your recent interactions.

This feature is designed to give you a quick overview of your current context and help you plan your workflow efficiently.

## License

MIT License - see LICENSE for details
