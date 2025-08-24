import simpleGit, { SimpleGit } from 'simple-git';
import * as vscode from 'vscode';
import {
  GitNotFoundError,
  NoStagedChangesError,
  NoWorkspaceFolderError,
  NotAGitRepositoryError
} from './errors';

export interface GitService {
  getStagedDiff(): Promise<string>;
}

export class SimpleGitService implements GitService {
  private git: SimpleGit;

  constructor() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      throw new NoWorkspaceFolderError();
    }
    this.git = simpleGit(workspaceFolder.uri.fsPath);
  }

  async getStagedDiff(): Promise<string> {
    const isRepo: boolean = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new NotAGitRepositoryError();
    }

    const diff: string = await this.git.diff(["--staged"]);
    
    if (!diff || diff.trim() === "") {
      throw new NoStagedChangesError();
    }
    
    return diff;
  }
}