'use strict'
// Import module
const http = require('http');
const path = require('path');
const EventEmitter = require('events');
const express = require('express');
const socketio = require('socket.io');
const port = process.env.PORT || 5557;

//Utility
const axios = require('axios');
var convert = require('convert-units')

// Configure Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const events = new EventEmitter();

app.use(express.static(path.join(__dirname, 'public')));

/* 
    Api Keys Calls Limits
    # 0d85f22a01083416bbe9f43ed64ce491 # New 
    # 9baf99c72740d9bfafc2a4909e5b7a9b # Old 
*/
const url = "http://api.openweathermap.org/data/2.5/weather";
const api_key = "0d85f22a01083416bbe9f43ed64ce491";
const city = "Barcelona,ES";

const getTemp = Kelvin => {
    let convertCelsius = convert(Kelvin).from('K').to('C').toFixed(2);
    return Number(convertCelsius);
};

const getApiAndEmit = async socket => {
    try {
        const urlApistamp = `${url}?q=${city}&appid=${api_key}`;
        const res = await axios.get(urlApistamp);
        const { temp } = res.data.main;
        const temperature = getTemp(temp);

        events.emit('temperature', temperature);
    } catch (error) {
        console.error(`Error: ${error.code}`);
    }
};

io.on('connect', socket => {
    console.log('socked', socket.id);
    events.on('temperature', value => {
        socket.emit('temperature', value)
    });

    setInterval(
        () => getApiAndEmit(socket),
        1000
    );
});

server.listen(port, () => console.log(`Listening on port ${port}`));