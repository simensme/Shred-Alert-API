// Parameterized variables for desired data.

// Get weather data from API
async function getWeatherData(lat, long) {
    // Get dates

    // Simplify below code:
    // Todays date, month and year
    const today = new Date();
    const yyyy = today.getFullYear();
    const yyyyStrNow = yyyy.toString();
    const mmStrNow = ("0" + (today.getMonth() + 1/*Because months start at 0*/)).slice(-2);
    const ddStrNow = ("0" + today.getDate()).slice(-2);
    const hoursNow = ("0" + today.getHours()).slice(-2);
    const minutesNow = ("0" + today.getMinutes()).slice(-2);
    // console.log(yyyyStrNow);
    // console.log(mmStrNow);
    // console.log(ddStrNow);
    // console.log(hoursNow);
    // console.log(minutesNow);

    // 14 Days forward
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const yyyyFuture = futureDate.getFullYear();
    const yyyyStrFuture = yyyyFuture.toString();
    const mmStrFuture = ("0" + (futureDate.getMonth() + 1/*Because months start at 0*/)).slice(-2);
    const ddStrFuture = ("0" + futureDate.getDate()).slice(-2);
    const hoursFuture = ("0" + futureDate.getHours()).slice(-2);
    const minutesFuture = ("0" + futureDate.getMinutes()).slice(-2);
    // console.log(yyyyStrFuture);
    // console.log(mmStrFuture);
    // console.log(ddStrFuture);
    // console.log(hoursFuture);
    // console.log(minutesFuture);

    // Adding date variables in string:
    const dates = `${yyyyStrNow}-${mmStrNow}-${ddStrNow}T${hoursNow}:${minutesNow}:00Z--${yyyyStrFuture}-${mmStrFuture}-${ddStrFuture}T${hoursFuture}:${minutesFuture}:00Z:`;
    // Time interval: every 1 Hour:
    const howFrequent = `PT24H`;
    // Default parameters - WE MAY CHANGE THESE LATER.
    const PARAMS = 't_2m:C,precip_1h:mm,wind_speed_002m:ms';
    // Latitude and Longitude - should have these form Gmaps.
    const latLong = `${lat},${long}`;
    // Console.log that checks the API link is correctly formatted.
    // console.log(`https://api.meteomatics.com/${dates}${howFrequent}${PARAMS}/${latLong}/json`);

    // Login and authorization to API:
    const username = 'studentbrights_hansen';
    const password = '94ih9BSkiA';
    let headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));

    // Fetching data from API:
    const newData = await fetch(`https://api.meteomatics.com/${dates}${howFrequent}/${PARAMS}/${latLong}/json`, {
        method: 'GET', headers
    }).then(res => res.json())
        .then(data => {
            const weatherdata = data;
            return weatherdata;
        }).catch(err => console.log('something went wrong', err));

        /*
    // Example of data we can get:
    // To get TEMPARATURE for EVERY HOUR in the interval:
    console.log(newData.data[0].coordinates[0]);

    // to get the PRECIPITATION for EVERY HOUR in the interval:
    console.log(newData.data[1].coordinates[0]);

    // to get the WIND SPEED for EVERY HOUR in the interval:
    console.log(newData.data[2].coordinates[0]);
*/
// console.log(newData.data[0].coordinates[0].dates[0]);

    // ADD .dates[0]... etc - for specific HOURS.

    // Return value to compare
   
    return newData;

}

module.exports = {
    getWeatherData
};