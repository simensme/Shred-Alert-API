const { getMonitors } = require("./database");
const { turnJsonToObjectArray } = require("./functions");

// Parameterized variables for desired data.

async function getWeatherData(lat, long) {
    // Get dates
  
    // Simplify below code:
    // Todays date, month and year
    const today = new Date();
    const yyyy = today.getFullYear();
    const yyyyStrNow = yyyy.toString();
    const mmStrNow = ("0" + (today.getMonth() + 1 /*Because months start at 0*/)).slice(-2);
    const ddStrNow = ("0" + today.getDate()).slice(-2);
    const hoursNow = ("0" + today.getHours()).slice(-2);
    const minutesNow = ("0" + today.getMinutes()).slice(-2);
  
    // 14 Days forward
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const yyyyFuture = futureDate.getFullYear();
    const yyyyStrFuture = yyyyFuture.toString();
    const mmStrFuture = ("0" + (futureDate.getMonth() + 1 /*Because months start at 0*/)).slice(-2);
    const ddStrFuture = ("0" + futureDate.getDate()).slice(-2);
    const hoursFuture = ("0" + futureDate.getHours()).slice(-2);
    const minutesFuture = ("0" + futureDate.getMinutes()).slice(-2);
  
    // Adding date variables in string:
    const dates = `${yyyyStrNow}-${mmStrNow}-${ddStrNow}T${hoursNow}:${minutesNow}:00Z--${yyyyStrFuture}-${mmStrFuture}-${ddStrFuture}T${hoursFuture}:${minutesFuture}:00Z:`;
    // Time interval: every 1 Hour:
    const howFrequent = `PT24H`;
    // Default parameters - WE MAY CHANGE THESE LATER.
    const PARAMS = 't_2m:C,precip_1h:mm,wind_speed_002m:ms,total_cloud_cover:p'; 
    // Latitude and Longitude - should have these form Gmaps.
    const latLong = `${lat},${long}`;
  
    // Login and authorization to API:
    const username = 'studentbrights_hansen';
    const password = '94ih9BSkiA';
    const headers = {
      'Authorization': 'Basic ' + new Buffer.from(username + ':' + password).toString('base64')
    };
  
    // Fetching data from API:
    const newData = await fetch(`https://api.meteomatics.com/${dates}${howFrequent}/${PARAMS}/${latLong}/json`, {
      method: 'GET',
      headers
    })
      .then(res => res.json())
      .then(data => {
        const weatherdata = data;
        return weatherdata;
      })
      .catch(err => console.log('something went wrong', err));
  
    // Return value to compare
    return newData;
  }

  const compareMonitorToAPI = async () => {
    // Get monitors for the monitor DB
    const waitedMonitors = await getMonitors(12);
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
  
    let alertData = [];
    let prevDate;
  
    // Current Date
    // console.log(alertData[0].dateArray[0]);
    // Get the temperature of that particular date
    // console.log(Object.values(alertData[0].tempArray[0]).toString());
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
            alertData.push({dateArray, tempArray, rainArray, windArray, cloudArray});
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
    alertData.push({dateArray, tempArray, rainArray, windArray, cloudArray});
  
    // For the comparison
    console.log(alertData)
  
   // console.log(alertData[1].dateArray[0]);
    
   // console.log(Object.values(alertData[1].tempArray[0]).toString());
   // console.log(Object.values(alertData[1].rainArray[0]).toString());
    //console.log(Object.values(alertData[1].windArray[0]).toString());
   // console.log(Object.values(alertData[1].cloudArray[0]).toString());
  
    return alertData;
  };
  

module.exports = {
    compareMonitorToAPI,
};