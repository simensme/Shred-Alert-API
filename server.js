const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {
	getUserByEmail,
	createUser,
	updatePassword,
	createAlerts,
	getAlertsByUserId,
	deleteAlert,
	createMonitor,
	getMonitors,
	getMonitorsByUserId,
	deleteMonitor,
} = require('./services/database');
const {getWeatherData} = require('./services/getWeatherData');
const {turnJsonToObjectArray} = require('./services/functions');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const APP_SECRET = 'søtt-griseri';

//getUserByEmail - login
//createUser - singup
//updatePassword - settings

//createAlerts - alert
//getAlertsByUserId - alert
//deleteAlert - alert

//createMonitor - monitor
//getMonitors - monitor
//getMonitorsByUserId - monitor
//deleteMonitor - monitor

app.post('/login', async (req, res) => {
	const {email, password} = req.body;

	try {
		const user = await getUserByEmail(email);

		if (!user) {
			res.status(401).send({error: 'Unknown user - not found'});
			return;
		}

		if (password !== user.password) {
			res.status(401).send({error: 'Wrong password!'});
			return;
		}

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
			},
			Buffer.from(APP_SECRET, 'base64')
		);

		res.json({token});
	} catch (error) {
		res.status(500).send({error: error.message});
	}
});

app.get('/session', async (req, res) => {
	const token = req.headers['x-token'];

	try {
		const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
		res.json({message: `You are logged in as ${payload.name}`});
	} catch (error) {
		res.status(401).send({error: 'Invalid token'});
	}
});

app.post('/createuser', async (req, res) => {
	const {name, email, password} = req.body;
	const newUser = await createUser(name, email, password);

	res.status(200).send({newUser});
});

app.post('updatepassword', async (req, res) => {
	const {token} = req.headers;
	const {newPassword} = req.body;
	try {
		const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
		const userId = payload.id;
		console.log(userId);
		await updatePassword(newPassword, userId);
	} catch (error) {
		res.status(500).send({error: error});
		console.log(error);
	}
});


const compareMonitorToAPI = async () => {
	// Get monitors for the monitor DB
	const waitedMonitors = await getMonitors(5);
	const minTemp = waitedMonitors.temp_min;
	const maxTemp = waitedMonitors.temp_max;
	const minWind = waitedMonitors.wind_min;
	const maxWind = waitedMonitors.wind_max;
	const minPrecip = Number(waitedMonitors.precip_min);
	const maxPrecip = Number(waitedMonitors.precip_max);
	// Clouds not used yet
	const minCloud = waitedMonitors.cloudcover_min;
	const maxCloud = waitedMonitors.cloudcover_max;

	// Latitude and Longitude from monitor DB
	const userLat = waitedMonitors.lat;
	const userLng = waitedMonitors.lng;

	// From Weather API
	const getWeather = await getWeatherData(userLat, userLng);
	const weatherToObjArr = await turnJsonToObjectArray(getWeather);
	//console.log(Object.values(weatherToObjArr[1].parameters[0]));

	let dateArray = [];
	let tempArray = [];
	let rainArray = [];
	let windArray = [];
	let cloudArray = [];

	let allArrays = [];
	let prevDate;

	// Current Date
	// console.log(allArrays[0].dateArray[0]);
	// Get the temperature of that particular date
	// console.log(Object.values(allArrays[0].tempArray[0]).toString());
  for (let i = 0; i < weatherToObjArr.length; i++) {
    if (Number(Object.values(weatherToObjArr[i].parameters[0])) >= minTemp 
    && Number(Object.values(weatherToObjArr[i].parameters[0])) <= maxTemp 
    && Number(Object.values(weatherToObjArr[i].parameters[1])) >= minPrecip 
    && Number(Object.values(weatherToObjArr[i].parameters[1])) <= maxPrecip 
    && Number(Object.values(weatherToObjArr[i].parameters[2])) >= minWind 
    && Number(Object.values(weatherToObjArr[i].parameters[2])) <= maxWind
    && Number(Object.values(weatherToObjArr[i].parameters[3])) >= minCloud
    && Number(Object.values(weatherToObjArr[i].parameters[3])) <= maxCloud) {
      if (!prevDate) {
        prevDate = new Date(weatherToObjArr[i].date.slice(0, 10));
      } else {
        const currDate = new Date(weatherToObjArr[i].date.slice(0, 10));
        const difference = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (difference > 1) {
          allArrays.push({dateArray, tempArray, rainArray, windArray, cloudArray});
          dateArray = [];
          tempArray = [];
          rainArray = [];
          windArray = [];
          cloudArray = [];
        }
        prevDate = currDate;
      }

      dateArray.push(weatherToObjArr[i].date.slice(0, 10));
      tempArray.push(weatherToObjArr[i].parameters[0]);
      rainArray.push(weatherToObjArr[i].parameters[1]);
      windArray.push(weatherToObjArr[i].parameters[2]);
      cloudArray.push(weatherToObjArr[i].parameters[3]);
    }
  }
  allArrays.push({dateArray, tempArray, rainArray, windArray, cloudArray});

  // For the comparison
  console.log(allArrays)

 // console.log(allArrays[1].dateArray[0]);
  
 // console.log(Object.values(allArrays[1].tempArray[0]).toString());
 // console.log(Object.values(allArrays[1].rainArray[0]).toString());
  //console.log(Object.values(allArrays[1].windArray[0]).toString());
 // console.log(Object.values(allArrays[1].cloudArray[0]).toString());

  return allArrays;
};

compareMonitorToAPI();




//CreateNewAlert in database
app.post('/createAlert', async (req, res) => {
	const params = req.body;
	try {
		const newAlert = await createAlerts(params, userId);
		res.status(200).send({newAlert});
	} catch (error) {
		res.status(500).send({error: error});
		console.log(error);
	}
});

//Hente alerts basert på bruker-id
app.get('/', async (req, res) => {
	const token = req.headers.token;
	const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
	const userId = payload.id;

	const userAlerts = await getAlertsByUserId(userId);

	res.send(userAlerts);
});

app.delete('/', async (req, res) => {
	//Hente alert Id fra den enkelte alert
	//hentes gjennom state til headers eller body
	//kjøre delete fuksjon med alertID
	//deleteAlert (alertID)
});

/* 
POST FUNKSJON: for å opprette nye monitorer */
app.post('/createmonitor', async (req, res) => {
	const token = req.headers.token;
	const params = req.body;

	try {
		const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
		const userId = payload.id;
		createMonitor(params, userId);
	} catch (error) {
		res.status(500).send({error: error});
		console.log(error);
	}
});

app.get('/monitors', async (req, res) => {
	const token = req.headers.token;
	const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
	const userId = payload.id;
	const userMonitors = await getMonitorsByUserId(userId);

	res.send(userMonitors);
});

app.delete('/monitors', async (req, res) => {
	//Hente monitor Id fra den enkelte monitor
	//hentes gjennom state til headers eller body
	//kjøre delete fuksjon med monitorID
	//deleteMonitor(monitorId)
});

// Listening to server
app.listen(PORT, () => {
	console.log(`The application is now listening to ${PORT}`);
});
