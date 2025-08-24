import * as vscode from 'vscode';
import {
  CONFIGURATION_SECTION,
  COMMAND_GENERATE_COMMIT,
  COMMAND_GENERATE_COMMIT_MESSAGE,
  DEFAULT_PROVIDER,
  EXTENSION_NAME
} from './src/constants';
import {
  ApiKeyNotSetError,
  GitNotFoundError,
  NoStagedChangesError,
  NoWorkspaceFolderError,
  NotAGitRepositoryError
} from './src/errors';
import { CommitMessageGenerator } from './src/aiService';
import { SimpleGitService } from './src/gitService';
import { VsCodeServiceImpl } from './src/vscodeService';

let isGenerating = false;

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
  console.log(`Congratulations, your extension "${EXTENSION_NAME}" is now active!`);

  const disposable = vscode.commands.registerCommand(
    COMMAND_GENERATE_COMMIT,
    async function () {
      if (isGenerating) {
        vscode.window.showErrorMessage(`${EXTENSION_NAME} is already generating a commit message.`);
        return;
      }
      await generateAndInsertCommitMessage();
    }
  );

  const generateCommitMessageDisposable = vscode.commands.registerCommand(
    COMMAND_GENERATE_COMMIT_MESSAGE,
    async function () {
      if (isGenerating) {
        vscode.window.showErrorMessage(`${EXTENSION_NAME} is already generating a commit message.`);
        return;
      }
      await generateAndInsertCommitMessage();
    }
  );

  async function generateAndInsertCommitMessage() {
    isGenerating = true;
    try {
      const config = vscode.workspace.getConfiguration(CONFIGURATION_SECTION);
      const apiKey: string | undefined = config.get("apiKey");
      const provider: string = config.get("provider") || DEFAULT_PROVIDER;

      if (!apiKey) {
        throw new ApiKeyNotSetError();
      }

      const gitService = new SimpleGitService();
      const diff: string = await gitService.getStagedDiff();

      const progressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: EXTENSION_NAME,
        cancellable: true,
      };

      await vscode.window.withProgress(
        progressOptions,
        async (progress, token) => {
          token.onCancellationRequested(() => {
            console.log("User canceled the commit message generation");
            isGenerating = false;
          });

          progress.report({ message: "Analyzing staged changes..." });

          // For now, we'll just return the diff as is
          // Later, we might want to format it more nicely
          const formattedDiff: string = diff;

          progress.report({
            message: "Generating commit message with AI...",
            increment: 30,
          });

          const aiService = new CommitMessageGenerator();
          const commitMessage: string = await aiService.generateCommitMessage(
            formattedDiff,
            apiKey,
            provider
          );

          progress.report({
            message: "Inserting commit message...",
            increment: 60,
          });

          const vscodeService = new VsCodeServiceImpl();
          await vscodeService.insertCommitMessage(commitMessage);

          progress.report({ message: "Done!", increment: 100 });

          vscode.window.showInformationMessage(
            `Commit message generated and inserted: ${commitMessage}`
          );
        }
      );
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof GitNotFoundError) {
        vscode.window.showErrorMessage(error.message);
      } else if (error instanceof NoWorkspaceFolderError) {
        vscode.window.showErrorMessage(error.message);
      } else if (error instanceof NotAGitRepositoryError) {
        vscode.window.showErrorMessage(error.message);
      } else if (error instanceof NoStagedChangesError) {
        vscode.window.showInformationMessage(error.message);
      } else if (error instanceof ApiKeyNotSetError) {
        vscode.window.showErrorMessage(error.message);
      } else if (error instanceof Error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      } else {
        vscode.window.showErrorMessage(`Unknown error occurred`);
      }
    } finally {
      isGenerating = false;
    }
  }

  context.subscriptions.push(disposable);
  context.subscriptions.push(generateCommitMessageDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}