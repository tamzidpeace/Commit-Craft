// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const simpleGit = require("simple-git");
const { GoogleGenAI } = require("@google/genai");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "CommitCraft" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "commitcraft.commit",
    async function () {
      // The code you place here will be executed every time your command is executed
      await generateAndInsertCommitMessage();
    }
  );

  // Register the command for the SCM button
  const generateCommitMessageDisposable = vscode.commands.registerCommand(
    "commitcraft.generateCommitMessage",
    async function () {
      // The code you place here will be executed every time your command is executed
      await generateAndInsertCommitMessage();
    }
  );

  /**
   * Generate and insert commit message
   * This function contains the core logic for generating and inserting commit messages
   */
  async function generateAndInsertCommitMessage() {
    try {
      // Get the API key and provider from configuration
      const config = vscode.workspace.getConfiguration("commitcraft");
      const apiKey = config.get("apiKey");
      const provider = config.get("provider") || "gemini"; // Default to 'gemini'

      if (!apiKey) {
        vscode.window.showErrorMessage(
          "Please set your API key in the CommitCraft extension settings."
        );
        return;
      }

      // Get the current workspace folder
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      // Initialize simple-git with the workspace path
      const git = simpleGit(workspaceFolder.uri.fsPath);

      // Check if the current directory is a Git repository
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        vscode.window.showErrorMessage(
          "Current workspace is not a Git repository"
        );
        return;
      }

      // Get staged changes
      const diff = await git.diff(["--staged"]);

      // Check if there are staged changes
      if (!diff || diff.trim() === "") {
        vscode.window.showInformationMessage(
          "No staged changes found. Please stage some changes first."
        );
        return;
      }

      // Show progress message with cancellation support
      const progressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: "CommitCraft",
        cancellable: true,
      };

      await vscode.window.withProgress(
        progressOptions,
        async (progress, token) => {
          token.onCancellationRequested(() => {
            console.log("User canceled the commit message generation");
          });

          progress.report({ message: "Analyzing staged changes..." });

          // Format the diff for better LLM consumption
          const formattedDiff = formatGitDiff(diff);

          progress.report({
            message: "Generating commit message with AI...",
            increment: 30,
          });

          // Generate commit message using LLM
          const commitMessage = await generateCommitMessage(
            formattedDiff,
            apiKey,
            provider
          );

          progress.report({
            message: "Inserting commit message...",
            increment: 60,
          });

          // Insert the commit message into VS Code's commit message input field
          await insertCommitMessage(commitMessage);

          progress.report({ message: "Done!", increment: 100 });

          // Display success message
          vscode.window.showInformationMessage(
            `Commit message generated and inserted: ${commitMessage}`
          );
        }
      );
    } catch (error) {
      console.error("Error:", error);
      // Provide more detailed error messages based on the error type
      if (error.code === "ENOENT") {
        vscode.window.showErrorMessage(
          "Git is not installed or not found in PATH"
        );
      } else if (error.message.includes("API Error")) {
        // This message will need to be updated when other providers are added
        vscode.window.showErrorMessage(
          `AI API Error (${provider}): ${error.message}`
        );
      } else {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  }

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
   * Generate commit message using an AI provider (currently only supports Gemini)
   * @param {string} diff
   * @param {string} apiKey
   * @param {string} provider
   * @returns {Promise<string>}
   */
  async function generateCommitMessage(diff, apiKey, provider) {
    try {
      // Create the prompt for the LLM
      const prompt = `Generate a detailed, informative git commit message for the following changes. Follow conventional commit format. The commit message should consist of a subject line (type: subject) followed by a blank line and then a body with bullet points describing the changes.

					Examples of good commit messages:

					refactor(discount): Use job for materialized view refresh instead of triggers

					This refactoring changes the mechanism for refreshing the \`discount_items\` materialized view from database triggers to a Laravel job. This provides more control and flexibility over the refresh process, improving maintainability and potentially performance.

					- **Removed database triggers**: The \`createRefreshFunctionAndTrigger\` and associated trigger drops have been removed from the migration.
					- **Introduced \`DiscountItemMaterializedViewRefreshJob\`**: A new job is responsible for concurrently refreshing the \`discount_items\` materialized view.
					- **Integrated job dispatching**: The \`DiscountItemMaterializedViewRefreshJob\` is now dispatched from \`DiscountStoreController\`, \`DiscountUpdateController\`, and \`DiscountStatusUpdateController\` whenever a discount is created, updated, or its status is changed. This ensures the materialized view remains up-to-date through the application layer.

					fix(discount): Refine product filtering and selection for discounts

					This commit introduces several improvements to the product filtering and selection mechanisms within the discount management feature, enhancing accuracy and user experience.

					- **Granular product filtering**: Refactored \`ProductRepository.php\` to allow explicit filtering of products based on \`stock_greater_than\` and \`price_greater_than\` criteria, providing more precise control over product eligibility for discounts.
					- **Accurate "Select All"**: Ensured that "Select All" operations in discount creation/editing forms (\`DiscountApplyOn.vue\`, \`EditDiscountApplyOn.vue\`) only include products that are in stock and have a valid retail price.
					- **Improved UX for suggestions**: Added \`pushState\` to prevent full page reloads when fetching suggestions in \`EditDiscountApplyOn.vue\`.
					- **Bug Fix**: Corrected a typo in \`Product.vue\` to ensure accurate comparison of discount IDs when checking if a product is already in another discount.

					feat(report): Exclude rewarded items from top-selling variants report

					This commit refines the "top-selling variants" report by excluding items that were given as rewards or freebies. This ensures that the report accurately reflects genuinely sold products and provides more meaningful insights into sales performance.

					- **Modified \`sale_overview\` materialized view**: Added an \`is_rewarded\` column to the \`sale_overview\` materialized view, derived from the \`meta_data\` of order items. This flag identifies products that were part of a reward or gift.
					- **Updated \`ProductRepository\`**: Applied a \`where('is_rewarded', false)\` filter to the \`topSellingVariants\` query, ensuring that only non-rewarded items are considered when calculating top-selling products.

					Guidelines:
					- Use present tense ("add" not "added")
					- Use imperative mood ("move" not "moves")
					- Start with a subject line (type: subject)
					- Follow with a blank line and a body explaining the changes with bullet points
					- Focus on the "what" and "why" not the "how"
					- Be detailed but concise

					Changes:
					${diff}

					Commit message:`;

      if (provider === "gemini") {
        // Initialize the Google Generative AI client
        const genAI = new GoogleGenAI({
          apiKey: apiKey,
        });

        // Generate content using the Gemini model
        const response = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
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
      } else {
        // Placeholder for other providers
        throw new Error(`AI provider '${provider}' is not yet implemented.`);
      }
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
  context.subscriptions.push(generateCommitMessageDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
