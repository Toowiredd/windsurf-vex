# Cascade for VS Code

ADHD-friendly context tracking and project organization for Visual Studio Code.

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
   // @copilot-prompt: Create a TreeView provider for the Cascade sidebar
   // - Show current context
   // - Display file groups
   // - Show context history
   // - Add context actions
   ```

3. **Settings Management**
   ```typescript
   // @copilot-prompt: Create a settings manager for Cascade configuration
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
   git clone https://github.com/yourusername/cascade-vscode.git
   cd cascade-vscode
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
cascade-vscode/
├── src/
│   ├── extension.ts           # Extension entry point
│   ├── cascade/              # Core Cascade functionality
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

## License

MIT License - see LICENSE for details

## TreeView Provider

The TreeView provider for the Cascade sidebar includes the following features:

- Show current context
- Display file groups
- Show context history
- Add context actions

### Usage

1. Open the Cascade sidebar in VS Code.
2. The current context, file groups, and context history will be displayed.
3. Use the context actions to manage your contexts.
