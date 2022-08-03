const constructMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    };
};

const constructLocationMessage = (username, latitude, longitude) => {
    return {
        username,
        locationUrl: `https://www.google.com/maps/?q=${latitude},${longitude}`,
        createdAt: new Date().getTime()
    };
};

module.exports = {
    constructMessage,
    constructLocationMessage
};