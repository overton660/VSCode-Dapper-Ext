// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DBConnect } from './Controllers/DBConnect';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dapperextension" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.dapper', () => {
		// The code you place here will be executed every time your command is executed

		var Connection = require('tedious').Connection;
        var Request = require('tedious').Request;
		var TYPES = require('tedious').TYPES;
		var async = require('async');

        // Create connection to database
        var config = 
        {
            server: 'localhost',
            authentication: 
            {
                type: 'default',
                options: {
                    userName: 'SA', // update me
                    password: '<Password1>' // update me
                }
            },
            options: 
            {
                database: 'TestDB'
            }
        }
        var connection = new Connection(config);

        // Attempt to connect and execute queries if connection goes through
        connection.on('connect', function(err: any) {
        if (err) {
            console.log(err);
        } else {
			console.log('Connected');

			var request = new Request(
				'SELECT * FROM Inventory WHERE quantity > 152;',
				function(err:any, rowCount:Number, rows:any) {
				if (err) {
					//callback(err);
				} else {
					console.log(rowCount + ' row(s) returned');
					//callback(null);
				}
			});

			var result = "";
			request.on('row', function(columns: any) {
				columns.forEach(function(column:any) {
					if (column.value === null) {
						console.log('NULL');
					} else {
						result += column.value + " ";
					}
				});
				console.log(result);
				result = "";
			});

			connection.execSql(request);

        }
        });

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello New World!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}


