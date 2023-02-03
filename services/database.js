
const {Pool} = require('pg');
const POSTGRES_URL = process.env.POSTGRES_URL;

const database = new Pool({
    connectionString: POSTGRES_URL
})

export async function testQuery(){
    const result = await database.query(`
    SELECT 
        * 
    FROM 
        users
    `);
    return result.rows[0]
}