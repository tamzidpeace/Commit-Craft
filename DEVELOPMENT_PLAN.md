# VS Code Extension Development Plan: Commit Message Generator

## Project Overview
This extension will automatically generate commit messages using an LLM (Gemini) based on staged Git changes. The extension will:
1. Check for staged Git changes
2. Send those changes to an LLM
3. Generate a commit message
4. Insert the message into VS Code's commit message input field

## Technology Stack
- Language: JavaScript
- VS Code Extension API
- Git commands (via Node.js child processes)
- Gemini API for LLM integration

## Development Steps

### Phase 1: Basic Git Integration
1. Modify the extension to detect Git repository
2. Check for staged changes using Git commands
3. Display staged changes in a message box for verification

### Phase 2: LLM Integration
1. Set up Gemini API access
2. Create API client to send requests
3. Format staged changes for LLM prompt
4. Receive and parse LLM response

### Phase 3: Commit Message Integration
1. Find VS Code's commit message input field
2. Insert generated message into the field
3. Handle errors and edge cases

### Phase 4: Configuration and Polish
1. Add configuration for API key
2. Create user settings
3. Add error handling and user feedback
4. Update documentation

## Detailed Task Breakdown

### Task 1: Environment Setup
- [x] Verify VS Code extension development environment
- [x] Install required dependencies (simple-git)
- [x] Set up debugging configuration

### Task 2: Git Repository Detection
- [x] Check if current workspace is a Git repository
- [x] Handle non-Git repositories gracefully
- [x] Display appropriate error messages

### Task 3: Staged Changes Retrieval
- [x] Execute `git diff --staged` command
- [x] Parse the output to extract file changes
- [x] Handle case when no changes are staged
- [x] Format changes for LLM consumption

### Task 4: Gemini API Setup
- [x] Register for Gemini API key
- [x] Install required HTTP client libraries (Google Generative AI)
- [x] Create API client module
- [x] Handle API authentication

### Task 5: LLM Prompt Engineering
- [x] Design prompt template for commit message generation
- [x] Format Git diff output for prompt
- [x] Define expected LLM response format
- [x] Handle different types of changes (additions, deletions, modifications)

### Task 6: Commit Message Insertion
- [x] Research VS Code API for accessing commit message field
- [x] Implement message insertion logic
- [x] Handle focus and interaction with Git UI
- [x] Add fallback for different VS Code versions

### Task 7: Configuration Management
- [x] Add extension settings for API key
- [x] Implement settings UI
- [x] Add validation for API key
- [x] Store API key securely

### Task 8: Error Handling and User Feedback
- [x] Implement comprehensive error handling
- [x] Add progress indicators
- [x] Provide informative error messages
- [x] Add success notifications

### Task 9: UI Enhancements
- [x] Add button above commit message input
- [x] Implement progress reporting during generation
- [x] Add cancellation support

### Task 10: Testing
- [x] Create test cases for Git operations
- [x] Test LLM integration with mock responses
- [x] Verify commit message insertion
- [x] Test error scenarios

### Task 11: Documentation
- [x] Update README with extension features
- [x] Add installation instructions
- [x] Document configuration steps
- [x] Add usage examples

## Implementation Approach
We'll implement this extension incrementally, testing each phase before moving to the next. This will ensure that we have a working solution at each step and can identify issues early.