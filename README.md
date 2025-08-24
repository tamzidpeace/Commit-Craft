# CommitCraft README

This extension automatically generates detailed commit messages using AI (Gemini, OpenAI, Qwen, Claude, etc.) based on your staged Git changes.

## Features

- Automatically generates detailed commit messages using AI
- Supports multiple AI providers (Gemini, OpenAI, Qwen, Claude, etc.)
- Works with staged Git changes
- Inserts generated message directly into VS Code's commit message field
- Follows conventional commit format with subject and body

## Requirements

- Git must be installed and available in your PATH
- An API key for your chosen AI provider

## Extension Settings

This extension contributes the following settings:

* `commitcraft.apiKey`: Your API key for the selected AI provider
* `commitcraft.provider`: Select the AI provider for generating commit messages (default: gemini)

To set your API key:
1. Open VS Code settings (Ctrl/Cmd + ,)
2. Search for "CommitCraft"
3. Enter your API key in the "API key for the selected AI provider" field
4. Optionally, select your preferred AI provider

## Usage

1. Stage your changes in Git
2. Run the "Generate commit" command (Ctrl/Cmd + Shift + P, then type "Generate commit")
3. The extension will generate a commit message and insert it into the commit message field

## Known Issues

- May not work correctly with very large diffs
- Requires internet connection to access the AI API

## Release Notes

### v0.0.1-beta

Initial release of CommitCraft

Installable file link: [v0.0.1-beta.vsix](https://drive.google.com/file/d/13ZXemYwXiiZVI33CPh1z6wYAuqgzxwQ2/view?usp=sharing)
