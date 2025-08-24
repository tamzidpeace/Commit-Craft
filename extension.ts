import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';
import { GoogleGenAI } from '@google/genai';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "CommitCraft" is now active!');

  const disposable = vscode.commands.registerCommand(
    "commitcraft.commit",
    async function () {
      await generateAndInsertCommitMessage();
    }
  );

  const generateCommitMessageDisposable = vscode.commands.registerCommand(
    "commitcraft.generateCommitMessage",
    async function () {
      await generateAndInsertCommitMessage();
    }
  );

  async function generateAndInsertCommitMessage() {
    // Define provider outside the try block to ensure it's accessible in the catch block
    // Initialize with a default value to avoid "used before being assigned" error
    let provider: string = "gemini"; 
    
    try {
      const config = vscode.workspace.getConfiguration("commitcraft");
      const apiKey: string | undefined = config.get("apiKey");
      provider = config.get("provider") || "gemini"; // Default to 'gemini'

      if (!apiKey) {
        vscode.window.showErrorMessage(
          "Please set your API key in the CommitCraft extension settings."
        );
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found");
        return;
      }

      const git: SimpleGit = simpleGit(workspaceFolder.uri.fsPath);

      const isRepo: boolean = await git.checkIsRepo();
      if (!isRepo) {
        vscode.window.showErrorMessage(
          "Current workspace is not a Git repository"
        );
        return;
      }

      const diff: string = await git.diff(["--staged"]);

      if (!diff || diff.trim() === "") {
        vscode.window.showInformationMessage(
          "No staged changes found. Please stage some changes first."
        );
        return;
      }

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

          const formattedDiff: string = formatGitDiff(diff);

          progress.report({
            message: "Generating commit message with AI...",
            increment: 30,
          });

          const commitMessage: string = await generateCommitMessage(
            formattedDiff,
            apiKey,
            provider
          );

          progress.report({
            message: "Inserting commit message...",
            increment: 60,
          });

          await insertCommitMessage(commitMessage);

          progress.report({ message: "Done!", increment: 100 });

          vscode.window.showInformationMessage(
            `Commit message generated and inserted: ${commitMessage}`
          );
        }
      );
    } catch (error) {
      console.error("Error:", error);
      // Type guard for NodeJS.ErrnoException to access 'code' property
      if (error instanceof Error && 'code' in error && error.code === "ENOENT") {
        vscode.window.showErrorMessage(
          "Git is not installed or not found in PATH"
        );
      } else if (error instanceof Error && error.message.includes("API Error")) {
        // 'provider' is now accessible here and has a default value
        vscode.window.showErrorMessage(
          `AI API Error (${provider}): ${error.message}`
        );
      } else if (error instanceof Error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      } else {
        vscode.window.showErrorMessage(`Unknown error occurred`);
      }
    }
  }

  /**
   * Format git diff output for better LLM consumption
   * @param {string} diff
   * @returns {string}
   */
  function formatGitDiff(diff: string): string {
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
  async function generateCommitMessage(diff: string, apiKey: string, provider: string): Promise<string> {
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
          let commitMessage: string = response.text.trim();
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
      if (error instanceof Error && error.message.includes("API Error")) {
        throw new Error(`API Error: ${error.message}`);
      } else if (error instanceof Error) {
        throw new Error(`Network Error: ${error.message}`);
      } else {
        throw new Error(`Unknown API error occurred`);
      }
    }
  }

  /**
   * Insert commit message into VS Code's commit message input field
   * @param {string} commitMessage
   */
  async function insertCommitMessage(commitMessage: string) {
    try {
      // Get the Git extension
      const gitExtension = vscode.extensions.getExtension("vscode.git");

      if (gitExtension) {
        // Activate the extension if it's not already activated
        const gitAPI = gitExtension.isActive
          ? gitExtension.exports.getAPI(1)
          : (await gitExtension.activate()).getAPI(1);

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
      if (error instanceof Error) {
        throw new Error(`Failed to insert commit message: ${error.message}`);
      } else {
        throw new Error(`Failed to insert commit message: Unknown error`);
      }
    }
  }

  context.subscriptions.push(disposable);
  context.subscriptions.push(generateCommitMessageDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}