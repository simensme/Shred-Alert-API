
const {Pool} = require('pg');
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://postgres:1234@localhost:3333/shreddatabase';

const database = new Pool({
    connectionString: POSTGRES_URL
})

async function testQuery(){
    const result = await database.query(`
    SELECT 
        * 
    FROM 
        users
    `);
    return result.rows[0]
};

module.exports = {
    testQuery
}