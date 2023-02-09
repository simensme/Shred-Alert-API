
function turnJsonToObjectArray(result) {

    let dates = result.data[0].coordinates[0].dates.map(date => {
        return date.date
    }, [])

    let allParams = result.data.map(param => {
        return param.parameter
    })

    let allValues = result.data.map(param => {
        let values = param.coordinates[0].dates.map(param => {
            return param.value;
        })
        return values
    })

    let everything = dates.map((date, i) => {
        let paramWithValue = allParams.map((param, indexparam) => {
            let value = allValues.map((value) => {
                return value[i]
            })

            return {
                [param]: value[indexparam]
            }

        })
        return {
            date: date,
            parameters: paramWithValue

        }
    }, [])
    return everything;
}

module.exports = {
    turnJsonToObjectArray
}