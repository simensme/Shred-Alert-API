const {Pool} = require('pg');
const POSTGRES_URL =
	process.env.POSTGRES_URL ||
	'postgres://postgres:1234@localhost:5432/shreddatabase';

const database = new Pool({
	connectionString: POSTGRES_URL,
});

async function updatePassword(newPassword, userId) {
	const user = await database.query(
		`
 UPDATE
  users
  SET password = $1
  FROM 
  users
  WHERE 
   id = $2
 `,
		[newPassword, userId]
	);
}

async function getUserByEmail(email) {
	const user = await database.query(
		`
    SELECT 
      * 
    FROM 
      users
    WHERE
      email = $1;

    `,
		[email]
	);

	return user.rows[0];
}

async function createUser(name, email, password) {
	database.query(
		`
  INSERT INTO
    users(name, email, password)
  VALUES
  ($1, $2, $3);
  `,
		[name, email, password]
	);
}

async function createMonitor(params, userId) {
	database.query(
		`
  INSERT INTO
    monitor
  VALUES
  (Default, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `,
		[
			userId,
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
			params.lon,
		]
	);
}

async function createAlerts(params, userId) {
	return new Promise((resolve, reject) => {
		database.query(
			`
    INSERT INTO
      alerts
    VALUES
    (Default, $1, $2, $3, $4)
    `,
			[
				userId,
				params.monitor_id,
				params.date_from,
				params.date_to,
				params.changed,
			],
			(error, result) => {
				if (error) {
					reject(error);
				}
				resolve(result);
			}
		);
	});
}

// Database Query which will be used to compare with 2-week forecast.

async function getMonitors(monitorID) {
	const monitor = await database.query(
		`
   SELECT 
     * 
   FROM 
     monitor
  WHERE
    id = $1

   `,
		[monitorID]
	);

	return monitor.rows[0];
}
async function deleteMonitor(id) {
	database.query(
		`
  DELETE FROM
    monitor
  WHERE
    id = $1;
  `,
		[id]
	);
}

async function delteAlert(id) {
	database.query(
		`
  DELETE FROM
    alerts
  WHERE
    id = $1;
  `,
		[id]
	);
}

async function getMonitorsByUserId(id) {
	const monitors = await database.query(
		`
  SELECT 
    *
  FROM
    monitor
  WHERE
  user_id = $1;
  `,
		[id]
	);

	return monitors.rows;
}

async function getAlertsByUserId(userId) {
	const alerts = await database.query(
		`
  SELECT
    *
  FROM
    alerts
  WHERE
   user_id = $1;
  `,
		[userId]
	);

	return alerts.rows;
}

module.exports = {
	getUserByEmail,
	createUser,
	createMonitor,
	deleteMonitor,
	getMonitors,
	getMonitorsByUserId,
	createAlerts,
	updatePassword,
	getAlertsByUserId,
};
