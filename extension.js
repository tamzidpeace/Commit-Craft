// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const simpleGit = require('simple-git');
const { GoogleGenAI } = require('@google/genai');

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
			// Get the API key from configuration
			const config = vscode.workspace.getConfiguration('cmg');
			const apiKey = config.get('apiKey');

			if (!apiKey) {
				vscode.window.showErrorMessage('Please set your Gemini API key in the extension settings.');
				return;
			}

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

			// Show progress message
			vscode.window.showInformationMessage('Generating commit message using Gemini AI...');

			// Format the diff for better LLM consumption
			const formattedDiff = formatGitDiff(diff);

			// Generate commit message using LLM
			const commitMessage = await generateCommitMessage(formattedDiff, apiKey);
			
			// Insert the commit message into VS Code's commit message input field
			await insertCommitMessage(commitMessage);
			
			// Display success message
			vscode.window.showInformationMessage(`Commit message generated and inserted: ${commitMessage}`);
		} catch (error) {
			console.error('Error:', error);
			// Provide more detailed error messages based on the error type
			if (error.code === 'ENOENT') {
				vscode.window.showErrorMessage('Git is not installed or not found in PATH');
			} else if (error.message.includes('API Error')) {
				vscode.window.showErrorMessage(`Gemini API Error: ${error.message}`);
			} else {
				vscode.window.showErrorMessage(`Error: ${error.message}`);
			}
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

  /**
   * Generate commit message using Gemini AI
   * @param {string} diff
   * @param {string} apiKey
   * @returns {Promise<string>}
   */
  async function generateCommitMessage(diff, apiKey) {
    try {
      // Create the prompt for the LLM
      const prompt = `Generate a concise, informative git commit message for the following changes. Follow conventional commit format (type: subject).

Examples of good commit messages:
- fix: resolve null pointer exception in user authentication
- feat: add user profile update functionality
- docs: update API documentation for user endpoints
- refactor: optimize database query performance

Guidelines:
- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Keep it concise (less than 72 characters)
- Focus on the "what" and "why" not the "how"

Changes:
${diff}

Commit message:`;

      // Initialize the Google Generative AI client
      const genAI = new GoogleGenAI({
        apiKey: apiKey
      });

      // Generate content using the Gemini model
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      // Extract the commit message from the response
      if (response && response.text) {
        // Clean up the response to get just the commit message
        let commitMessage = response.text.trim();
        // Remove any markdown formatting if present
        commitMessage = commitMessage.replace(/^["']|["']$/g, "");
        return commitMessage;
      }

      throw new Error("Unexpected API response format");
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        throw new Error(
          `API Error: ${error.response.status} - ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else {
        throw new Error(`Network Error: ${error.message}`);
      }
    }
  }

  /**
   * Insert commit message into VS Code's commit message input field
   * @param {string} commitMessage
   */
  async function insertCommitMessage(commitMessage) {
    try {
      // Get the Git extension
      const gitExtension = vscode.extensions.getExtension("vscode.git");

      if (gitExtension) {
        // Activate the extension if it's not already activated
        const gitAPI = gitExtension.isActive
          ? gitExtension.exports.getAPI(1)
          : await gitExtension.activate().then((api) => api.getAPI(1));

        // Get the active repository (assuming single repository)
        const repository = gitAPI.repositories[0];

        if (repository) {
          // Set the commit message in the input box
          repository.inputBox.value = commitMessage;
        } else {
          throw new Error("No Git repository found");
        }
      } else {
        throw new Error("Git extension not found");
      }
    } catch (error) {
      console.error("Error inserting commit message:", error);
      throw new Error(`Failed to insert commit message: ${error.message}`);
    }
  }

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
