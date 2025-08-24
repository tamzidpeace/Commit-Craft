# cmg README

This extension automatically generates commit messages using Gemini AI based on your staged Git changes.

## Features

- Automatically generates commit messages using Gemini AI
- Works with staged Git changes
- Inserts generated message directly into VS Code's commit message field
- Follows conventional commit format

## Requirements

- Git must be installed and available in your PATH
- A Gemini API key (free tier available)

## Extension Settings

This extension contributes the following settings:

* `cmg.apiKey`: Your Gemini API key

To set your API key:
1. Open VS Code settings (Ctrl/Cmd + ,)
2. Search for "Commit Message Generator"
3. Enter your Gemini API key in the "API key for Gemini AI" field

## Usage

1. Stage your changes in Git
2. Run the "Generate commit" command (Ctrl/Cmd + Shift + P, then type "Generate commit")
3. The extension will generate a commit message and insert it into the commit message field

## Known Issues

- May not work correctly with very large diffs
- Requires internet connection to access Gemini API

## Release Notes

### 0.0.1

Initial release of cmg
