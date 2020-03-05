
var sql = require('mssql');

export class DBConnect{

    // public config: any;

    // constructor(server: string, database: string, table: string, user:string, password: string) {

    //     this.config = {
    //         server,
    //         database,
    //         user,
    //         password,
    //         port:1433
    //     }
    // }

    //3.
    public loadEmployees() {
        var Connection = require('tedious').Connection;
        var Request = require('tedious').Request;
        var TYPES = require('tedious').TYPES;

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
                database: 'SampleDB'
            }
        }
        var connection = new Connection(config);

        // Attempt to connect and execute queries if connection goes through
        connection.on('connect', function(err: any) {
        if (err) {
            console.log(err);
        } else {
            console.log('Connected');
        }
        });
    }
}