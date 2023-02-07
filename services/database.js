
const {Pool} = require('pg');
const POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://postgres:1234@localhost:5432/shreddatabase';

const database = new Pool({
    connectionString: POSTGRES_URL
})


async function getUserByEmail(email){
   const user = await database.query(`
    SELECT 
      * 
    FROM 
      users
    WHERE
      email = $1;

    `, [email]);
    
    return user.rows[0];
}

async function createUser(name, email, password){
  database.query(`
  INSERT INTO
    users(name, email, password)
  VALUES
  ($1, $2, $3);
  `, [name, email, password]);
}

module.exports = {
    getUserByEmail,
    createUser,

}