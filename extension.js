// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const simpleGit = require('simple-git');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cmg" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('cmg.commit', async function () {
		// The code you place here will be executed every time your command is executed

		try {
			// Get the current workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder found');
				return;
			}

			// Initialize simple-git with the workspace path
			const git = simpleGit(workspaceFolder.uri.fsPath);

			// Check if the current directory is a Git repository
			const isRepo = await git.checkIsRepo();
			if (!isRepo) {
				vscode.window.showErrorMessage('Current workspace is not a Git repository');
				return;
			}

			// Get staged changes
			const diff = await git.diff(['--staged']);

			// Check if there are staged changes
			if (!diff || diff.trim() === '') {
				vscode.window.showInformationMessage('No staged changes found. Please stage some changes first.');
				return;
			}

			// Format the changes for better readability
			const formattedChanges = formatGitDiff(diff);
			
			// Display the formatted staged changes
			vscode.window.showInformationMessage(`Staged changes found. Ready to generate commit message.`);
			
			// For now, we'll show the formatted changes in the console
			console.log('Formatted changes for LLM:', formattedChanges);
		} catch (error) {
			console.error('Error:', error);
			vscode.window.showErrorMessage(`Error: ${error.message}`);
		}
	});

	/**
	 * Format git diff output for better LLM consumption
	 * @param {string} diff
	 * @returns {string}
	 */
	function formatGitDiff(diff) {
		// For now, we'll just return the diff as is
		// Later, we might want to format it more nicely
		return diff;
	}

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
