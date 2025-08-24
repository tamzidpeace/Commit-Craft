export class GitNotFoundError extends Error {
  constructor() {
    super("Git is not installed or not found in PATH");
    this.name = "GitNotFoundError";
  }
}

export class NoStagedChangesError extends Error {
  constructor() {
    super("No staged changes found. Please stage some changes first.");
    this.name = "NoStagedChangesError";
  }
}

export class NoWorkspaceFolderError extends Error {
  constructor() {
    super("No workspace folder found");
    this.name = "NoWorkspaceFolderError";
  }
}

export class NotAGitRepositoryError extends Error {
  constructor() {
    super("Current workspace is not a Git repository");
    this.name = "NotAGitRepositoryError";
  }
}

export class ApiKeyNotSetError extends Error {
  constructor() {
    super("Please set your API key in the CommitCraft extension settings.");
    this.name = "ApiKeyNotSetError";
  }
}

export class GitExtensionNotFoundError extends Error {
  constructor() {
    super("Git extension not found");
    this.name = "GitExtensionNotFoundError";
  }
}

export class NoGitRepositoryFoundError extends Error {
  constructor() {
    super("No Git repository found");
    this.name = "NoGitRepositoryFoundError";
  }
}

export class AiProviderNotImplementedError extends Error {
  constructor(provider: string) {
    super(`AI provider '${provider}' is not yet implemented.`);
    this.name = "AiProviderNotImplementedError";
  }
}

export class UnexpectedApiResponseFormatError extends Error {
  constructor() {
    super("Unexpected API response format");
    this.name = "UnexpectedApiResponseFormatError";
  }
}