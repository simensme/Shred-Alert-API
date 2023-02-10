const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser, createMonitor, getMonitors } = require('./services/database');
const { getWeatherData } = require('./services/getWeatherData');
const { turnJsonToObjectArray } = require('./services/functions');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

const APP_SECRET = 'søtt-griseri';


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await getUserByEmail(email);

    if (!user) {
      res.status(401).send({ error: 'Unknown user - not found' });
      return;
    }

    if (password !== user.password) {
      res.status(401).send({ error: 'Wrong password!' });
      return;
    }

    const token = jwt.sign({
      id: user.id,
      email: user.email
    }, Buffer.from(APP_SECRET, 'base64'));

    res.json({ token });

  } catch (error) {
    res.status(500).send({ error: error.message })
  }
});


app.get('/session', async (req, res) => {
  const token = req.headers['x-token'];

  try {
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
    res.json({ message: `You are logged in as ${payload.name}` });
  } catch (error) {
    res.status(401).send({ error: 'Invalid token' });
  }
});

app.post('/createuser', async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = await createUser(name, email, password);

  res.status(200).send({ newUser });
});



// Get weather data test

const compareMonitorToAPI = async () => {

  // Get monitors for the monitor DB
  const waitedMonitors = await getMonitors(3);
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
  let allArrays = [];
  let prevDate;
  
  for (let i = 0; i < weatherToObjArr.length; i++) {
    if (Number(Object.values(weatherToObjArr[i].parameters[0])) >= minTemp 
    && Number(Object.values(weatherToObjArr[i].parameters[0])) <= maxTemp 
    && Number(Object.values(weatherToObjArr[i].parameters[1])) >= minPrecip 
    && Number(Object.values(weatherToObjArr[i].parameters[1])) <= maxPrecip 
    && Number(Object.values(weatherToObjArr[i].parameters[2])) >= minWind 
    && Number(Object.values(weatherToObjArr[i].parameters[2])) <= maxWind) {
      if (!prevDate) {
        prevDate = new Date(weatherToObjArr[i].date.slice(0, 10));
      } else {
        const currDate = new Date(weatherToObjArr[i].date.slice(0, 10));
        const difference = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (difference > 1) {
          allArrays.push({dateArray, tempArray});
          dateArray = [];
          tempArray = [];
        }
        prevDate = currDate;
      }
      dateArray.push(weatherToObjArr[i].date.slice(0, 10));
      tempArray.push(weatherToObjArr[i].parameters[0]);
    }
  }
  allArrays.push({dateArray, tempArray});

  console.log(allArrays);
  // Current Date
  console.log(allArrays[0].dateArray[1]);
  // Get the temperature of that particular date
  console.log(Object.values(allArrays[0].tempArray[1]).toString());

};

compareMonitorToAPI();







/* 
POST FUNKSJON: for å opprette nye monitorer */
app.post('/createmonitor', async (req, res) =>{
  const token = req.headers.token;
  const params = req.body;
 
  try{   
    const payload = jwt.verify(token, Buffer.from(APP_SECRET, 'Base64'));
    const userId = payload.id;
    createMonitor(params, userId);
 }catch(error){
   res.status(500).send({error: error});
   console.log(error);
}
});




// Listening to server
app.listen(PORT, () => {
  console.log(`The application is now listening to ${PORT}`)
});