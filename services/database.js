
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

async function createMonitor(params, userId){
  database.query(`
  INSERT INTO
    monitor
  VALUES
  (Default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `, [userId,
      params.shredName,
      params.minTemp,
      params.maxTemp,
      params.minWind,
      params.maxWind,
      params.minDownPour,
      params.maxDownPour,
      params.minClouds,
      params.maxClouds,
      params.lat,
      params.lon      
    ]);
};


// Database Query which will be used to compare with 2-week forecast.

async function getMonitors(monitorID){
  const monitor = await database.query(`
   SELECT 
     * 
   FROM 
     monitor
  WHERE
    id = $1

   `, [monitorID]);
   
   return monitor.rows[0];
}





module.exports = {
    getUserByEmail,
    createUser,
    createMonitor,
    getMonitors
}

