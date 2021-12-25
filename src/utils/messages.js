const generateMessage = (username , text) => {
    return {
        username,
        text,
        sent: new Date().getTime()
    }
}

const generateLocation = (username , location) => {

    return {
        username,
        location,
        sent: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation
}