// Parameterized variables for desired data.

// Get weather data from API
async function getWeatherData(fromYear, fromMonth, fromDay, fromH, fromMin, toYear, toMonth, toDate, toH, toMin, freq, lat, long) {
    // Get dates
    const dates = `${fromYear}-${fromMonth}-${fromDay}T${fromH}:${fromMin}:00Z--${toYear}-${toMonth}-${toDate}T${toH}:${toMin}:00Z:`;
    // Define time interval inside the weather alerts.
    const howFrequent = `PT${freq}H`;
    // Default parameters - WE MAY CHANGE THESE LATER.
    const PARAMS = 't_2m:C,precip_1h:mm,wind_speed_002m:ms';
    // Latitude and Longitude - should have these form Gmaps.
    const latLong = `${lat},${long}`;
    // Console.log that checks the API link is correctly formatted.
    console.log(`https://api.meteomatics.com/${dates}${howFrequent}${PARAMS}/${latLong}/json`);

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

    // Example of data we can get:
    // To get TEMPARATURE for EVERY HOUR in the interval:
    console.log(newData.data[0].coordinates[0]);

    // to get the PRECIPITATION for EVERY HOUR in the interval:
    console.log(newData.data[1].coordinates[0]);

    // to get the WIND SPEED for EVERY HOUR in the interval:
    console.log(newData.data[2].coordinates[0]);

    // ADD .dates[0]... etc - for specific HOURS.

    // Return value for frontend:
    return newData;
}

/*
// Test to call the above function.
getWeatherData('2023', '02', '09', '00', '13', '2023', '02', '10', '13', '00', '2', '59.92160104865082', '10.744014548914478');
*/


module.exports = {
    getWeatherData
};