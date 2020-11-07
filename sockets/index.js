var http = require('http'),
    fs = require('fs'), index = "<html><body>Listening</body></html>";
const request = require("request"), URL = "http://localhost:1337";


var PORT = 8000;
var HOST = '0.0.0.0';
// var HOST = '34.209.64.150';

// send html content to all requests
var app = http.createServer(function (req, res) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
});

var io = require('socket.io')(app, { origins: '*:*' });

io.sockets.on('connection', function (socket) {
    console.log("connected");

    socket.on('joinTripUpdates', function (data) {
        socket.join("trip" + data.tripId);
        console.log(io.sockets.adapter.rooms);
    });

    socket.on('joinMessageUpdates', function (data) {
        socket.join("message" + data.groupId);
        console.log(io.sockets.adapter.rooms);
    });

    socket.on('updateLocation', function (data) {

        var options = {
            method: 'POST',
            url: URL + '/socket/parents/updateLocation',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: data,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            getTripMap(data.tripId).then((payload) => {
                var room = "trip" + data.tripId;
                io.sockets.in(room).emit('tripStatusChanged', payload);
            });
        });

    });


    socket.on('markPresent', function (data) {

        var options = {
            method: 'POST',
            url: URL + '/socket/trip/markPresent',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: data,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            getTripMap(data.tripId).then((payload) => {
                var room = "trip" + data.tripId;
                console.log(room);
                io.sockets.in(room).emit('tripStatusChanged', payload);

            });
        });
    })

    socket.on('addMessage', function (data) {
        var options = {
            method: 'POST',
            url: URL + '/api/messages/add',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: data,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(response.body);
            var room = "message" + data.groupId;
            io.sockets.in(room).emit('newMessageListener', response.body.data);
        })
    });


    socket.on('readMessage', function (data) {
        var options = {
            method: 'POST',
            url: URL + '/api/messages/read',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: data,
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
        })
    });

    socket.on('disconnect', function () {
        console.log('User disconnected');
        console.log(io.sockets.adapter.rooms);
    });

});


function getTripMap(tripId) {
    return new Promise(function (resolve, reject) {
        var options = {
            method: 'GET',
            url: URL + '/api/group/tripMap/' + tripId,
            headers:
            {
                'Content-Type': 'application/json'
            },
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            resolve(response.body);

        });
    })
}

app.listen(PORT, HOST, () => {
    console.log('Server running at ' + app.address().address + ':' + app.address().port + '/');
});

