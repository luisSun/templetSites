const mysql = require('mysql');

// Create a connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pn'
});

async function executeQuery(sql, values) {
    return new Promise((resolve, reject) => {
        // Get a connection from the pool
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Erro ao obter conexão do pool:', err);
                return reject(err);
            }

            // Execute the query
            connection.query(sql, values, (error, results) => {
                // Release the connection back to the pool
                connection.release();

                if (error) {
                    console.error('Erro ao executar consulta:', error);
                    return reject(error);
                }

                resolve(results);
            });
        });
    });
}

module.exports = executeQuery;
