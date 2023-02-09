// Parameterized variables for desired data.

// The time period for which you want the data
const getDates = (fromYear, fromMonth, fromDay, fromH, fromMin, toYear, toMonth, toDate, toH, toMin) => {
    const dates = `${fromYear}-${fromMonth}-${fromDay}T${fromH}:${fromMin}:00Z--${toYear}-${toMonth}-${toDate}T${toH}:${toMin}:00Z:`;
    console.log(dates);
    return dates;
}
/*
// Example
getDates('2023', '02', '09', '00', '13', '2023', '02', '10', '13', '00');
*/

// How often do you want the data
const frequency = T => {
    const howFrequent = `PT${T}H`;
    console.log(howFrequent);
    return howFrequent;
}
/*
// Example
frequency('2');
*/

//Parameters that are to be included.
// C for Celcius at 2m height
// Precip_1h => precipitation for the past hour in mm.
// Wind speed__2m, wind speed in meter per second.
const PARAMS = 't_2m:C,precip_1h:mm,wind_speed_002m:ms';


// RECEIVE GOOGLE COORDINATES HERE.
const getCoordinates = (lat, long) => {
    const latLong = `${lat},${long}`;
    console.log(latLong);
    return latLong;
}
/*
getCoordinates('59.92160104865082', '10.744014548914478');
*/

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


getWeatherData('2023', '02', '09', '00', '13', '2023', '02', '10', '13', '00', '2', '59.92160104865082', '10.744014548914478');



module.exports = {
    getWeatherData
}