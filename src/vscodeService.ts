import * as vscode from 'vscode';
import {
  GitExtensionNotFoundError,
  NoGitRepositoryFoundError
} from './errors';

export interface VsCodeService {
  insertCommitMessage(commitMessage: string): Promise<void>;
}

export class VsCodeServiceImpl implements VsCodeService {
  async insertCommitMessage(commitMessage: string): Promise<void> {
    const gitExtension = vscode.extensions.getExtension("vscode.git");

    if (gitExtension) {
      const gitAPI = gitExtension.isActive
        ? gitExtension.exports.getAPI(1)
        : (await gitExtension.activate()).getAPI(1);

      const repository = gitAPI.repositories[0];

      if (repository) {
        repository.inputBox.value = commitMessage;
      } else {
        throw new NoGitRepositoryFoundError();
      }
    } else {
      throw new GitExtensionNotFoundError();
    }
  }
}