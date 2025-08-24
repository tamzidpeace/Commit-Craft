# Qwen Code Context for cmg Project

## Project Overview

This is a Visual Studio Code extension named "cmg". The primary purpose, based on the initial setup, appears to be providing a command to "Generate commit". The project is written in JavaScript and uses the VS Code Extension API. It will use gemini api to generate commit message. 

Key files:
- `package.json`: Manifest file defining the extension, its command (`cmg.commit`), and dependencies.
- `extension.js`: Main entry point for the extension logic. It registers the `cmg.commit` command.
- `test/extension.test.js`: Contains basic sample tests for the extension.
- `README.md`, `vsc-extension-quickstart.md`: Documentation for the extension structure and development.

## Building and Running

- **Install Dependencies**: `npm install` (though `vscode-test` is used for running tests, standard extensions might use `vscode` as a dev dependency, which is implied here).
- **Linting**: `npm run lint` (uses ESLint).
- **Testing**:
  - Prerequisites: Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner).
  - Run tests via the Testing view (`Ctrl/Cmd + ; A`) or using the hotkey.
  - Tests are defined in files matching `**.test.js` inside the `test` folder.
  - Command: `npm run test` (runs linting as a pretest step, then `vscode-test`).
- **Running/Debugging**:
  - Press `F5` in VS Code (with this project open) to launch a new VS Code window with the extension loaded for debugging.
  - Alternatively, the provided `.vscode/launch.json` configuration can be used to start the extension host.

## Development Conventions

- **Language**: JavaScript.
- **Entry Point**: `extension.js` contains `activate` and `deactivate` functions.
- **API**: Uses the `vscode` module for extension functionality.
- **Commands**: Defined in `package.json` under `contributes.commands` and implemented in `extension.js` using `vscode.commands.registerCommand`.
- **Testing**: Uses Mocha-style tests (based on `test/extension.test.js`). Test files are named `*.test.js`.
- **Configuration**: ESLint is configured via `eslint.config.mjs`.
- **VS Code Specifics**:
  - Activation events are currently empty (`[]`), meaning the extension activates on command execution.
  - The extension targets VS Code engine version `^1.103.0`.
  - Development dependencies include `@types/vscode`, `@types/mocha`, `@types/node`, and `eslint`.