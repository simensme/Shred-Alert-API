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

module.exports = {
    getWeatherData
};