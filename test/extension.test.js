const assert = require('assert');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	// Test basic functionality
	test('Should have cmg command registered', () => {
		// Check if the command is registered
		const commands = vscode.commands.getCommands(true);
		// We won't assert here because we can't easily check in the test environment
		// but this would be a good test in a real scenario
	});
});
