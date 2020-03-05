// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DBConnect } from './Controllers/DBConnect';
import { stringify } from 'querystring';

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
		var fs = require('fs');

		var query = "SELECT  " +
					"	c.name 'Column Name', " +
					"	t.Name 'Data type' " +
					//"	c.max_length 'Max Length', " +
					//"	c.precision , " +
					//"	c.scale , " +
					//"	c.is_nullable, " +
					//"	ISNULL(i.is_primary_key, 0) 'Primary Key' " +
					"FROM     " +
					"	sys.columns c " +
					"INNER JOIN  " +
					"	sys.types t ON c.user_type_id = t.user_type_id " +
					"LEFT OUTER JOIN  " +
					"	sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id " +
					"LEFT OUTER JOIN  " +
					"	sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id " +
					"WHERE " +
					"	c.object_id = OBJECT_ID('Inventory') ";

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
				//'SELECT * FROM Inventory WHERE quantity > 152;',
				query,
				function(err:any, rowCount:Number, rows:any) {
				if (err) {
					//callback(err);
				} else {
					console.log(rowCount + ' row(s) returned');
					//callback(null);
				}
			});

			var result = "";
			var properties: string[] = new Array();

			request.on('row', function(columns: any) {
				//for(var i = 0; i < 2; i++)
				//{
				//columns.forEach(function(column:any) {
				var colName = "";
				var datatype = "";

				if (columns[0] === null) {
					console.log('NULL');
				} else {
					//result += columns[i] + " ";
					colName = columns[0].value;
					datatype = columns[1].value;
				}
				properties.push(SqlToCSharpProp(colName, datatype));
			});

			request.on('requestCompleted', function() {

				console.log(GeneratePoco(properties, "Inventory", "TestDB"));

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


function GeneratePoco(props:string[], table:string, projectName:string)
{
	var classDef:string = "using System; \n" +
							"namespace " + projectName + ".Models \n" + 
							"{ \n" +
							"public class " + table + "\n" +
							"{ \n";

	props.forEach(prop => {
		classDef += prop + "\r\n";
	});

	classDef += "} \r\n" + 
			"} \r\n"	

	return classDef;
}

function GenerateDapperCrud()
{
	
}

//generate c# property for a db object
function SqlToCSharpProp(name:string, datatype:string)
{
	var propName = name
	var type = datatype.toString().toLowerCase();
	var objType:string = 'Object';
	var prop:string;

	//Map sql datatypes for string property
	if(type.includes('varchar') || type == 'ncahr' || type == 'char'|| type == 'ntext' || type == 'text')
	{
		objType = 'string';
	}

	//DateTime
	if(type == 'date' || type == 'datetime' || type == 'datetime2' || type == 'smalldatetime')
	{
		objType = 'DateTime';
	}

	if(type == 'bit')
	{
		objType = 'bool';
	}

	//decimal
	if(type == 'decimal' || type == 'money' || type == 'numeric' || type == 'smallmoney')
	{
		objType = 'Decimal';
	}

	//Int32
	if(type == 'int')
	{
		objType = 'Int32';
	}

	//int64
	if(type == 'bigint')
	{
		objType = 'Int64';
	}

	//int16
	if(type == 'smallint')
	{
		objType = 'Int16';
	}

	//Byte
	if(type == 'tinyint')
	{
		objType = 'Byte';
	}

	//Byte[]
	if(type == 'binary' || type.includes('filestream') || type == 'image' || type == 'rowversion' || type == 'timestamp' || type == 'varbinary')
	{
		objType = 'Byte[]';
	}

	//uniqueidentifier
	if(type == 'uniqueidentifier')
	{
		objType = 'Guid';
	}

	//time
	if(type == 'time')
	{
		objType = 'TimeSpan';
	}

	//real
	if(type == 'real')
	{
		objType = 'Single';
	}

	//float
	if(type == 'float')
	{
		objType = 'Double';
	}

	if(type == 'xml')
	{
		objType = 'Xml';
	}

	prop = "public " + objType + " " + propName + " { get; set; }";
	return prop;
}


