const { Pool } = require("pg");
const POSTGRES_URL =
  process.env.POSTGRES_URL ||
  "postgres://postgres:1234@localhost:5432/shREDalert";

const database = new Pool({
  connectionString: POSTGRES_URL,
});

async function updatePassword(oldPassword, newPassword, userId) {
  console.log(oldPassword, newPassword);

  database.query(
    `
  UPDATE
    users
  SET 
    password = $2
  WHERE 
    id = $3 AND password = $1;
 `,
    [oldPassword, newPassword, userId]
  );
}

//createAlerts - alert
//getAlertsByUserId - alert
//deleteAlert - alert

//createMonitor - monitor
//getMonitors - monitor
//getMonitorsByUserId - monitor
//deleteMonitor - monitor

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
  const alerts = database.query(
    `
  INSERT INTO
    users(name, email, password)
  VALUES
  ($1, $2, $3);
  `,
    [name, email, password]
  );
  return alerts.rows;
}

async function getAlertsbyId(userId) {
  database.query(
    `
		SELECT 
			* 
		FROM 
			alert
		JOIN 
			monitor 
		
		ON 
			alert.monitor_id = monitor.id
		WHERE 
			user_id = $1

		`,
    [userId]
  );
}

async function createAlertsFromMonitorCheck(alertArray) {
  alertArray.forEach((alert) => {
    if (alert.dateArray.length < 1) {
      return;
    } else {
      database.query(
        `
        INSERT INTO
          alert
        VALUES
          (DEFAULT, $1, $2, $3, $4, $5)
        `,
        [
          alert.userId,
          alert.monitorId,
          alert.dateArray[0],
          alert.dateArray[alert.dateArray.length - 1],
          false,
        ]
      );
    }
  });
}

async function deleteAlert(id) {
  database.query(
    `
  DELETE FROM
    alert
  WHERE
    id = $1;
  `,
    [id]
  );
}

async function getAlertsByUserId(id) {
  const alerts = await database.query(
    `
  SELECT
   alert.id, 
   alert.user_id, 
   alert.monitor_id, 
   alert.date_from, 
   alert.date_to, 
   alert.changed,
   monitor.shredName,
   monitor.lat,
   monitor.lng
  FROM
    alert
  JOIN
    monitor
  ON
  alert.monitor_id = monitor.id
  WHERE
   alert.user_id = $1
  ORDER BY
    date_from ASC;
  `,
    [id]
  );
  return alerts.rows;
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
      params.lng,
    ]
  );
}

// Database Query which will be used to compare with 2-week forecast.
async function getMonitor(monitorID) {
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

async function deleteMonitor(id) {
  database
    .query(
      `
  DELETE FROM 
  alert
  WHERE
  monitor_id = $1;
  `,
      [id]
    )
    .then(
      database.query(
        `
  DELETE FROM
    monitor
  WHERE
    id = $1;
  `,
        [id]
      )
    );
}

async function getAllMonitors() {
  const monitorList = await database.query(`
  SELECT
    *
  FROM
    monitor;
  `);

  return monitorList.rows;
}

module.exports = {
  getUserByEmail,
  createUser,
  createMonitor,
  deleteMonitor,
  getMonitor,
  getAllMonitors,
  getMonitorsByUserId,
  createAlertsFromMonitorCheck,
  updatePassword,
  getAlertsByUserId,
  deleteAlert,
  getAlertsbyId,
};
