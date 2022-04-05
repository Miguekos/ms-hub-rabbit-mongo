const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
    cors: {
        origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
        methods: ["GET", "POST"],
        allowedHeaders: ["hub-header"],
        credentials: true
    },
    'pingTimeout': 180000,
    'pingInterval': 25000,
});
global.io = io;
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
app.use(express.static(__dirname + '/public'));

// Load environment variables from .env file, where API keys and passwords are configured.
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Set up Global configuration access
// dotenv.config();

// Usamos body-parse para revisar el body cuando los request son post
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MIDDLEWARE
// app.use(cors());
const corsOption = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token']
};
app.use(cors(corsOption));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// CONTROLLERS
const { consumerOrderAdd, consumerOrderMDB, consumerOrderStatus } = require('./api/controllers/consumers')

// profix
const prefix = `api`

// router
app.use(`/${prefix}/`, require('./api/routes/general'));
app.use(`/${prefix}/`, require('./api/routes/user'));
app.use(`/${prefix}/`, require('./api/routes/auth'));
app.use(`/${prefix}/`, require('./api/routes/orders'));

// error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        error: {
            status: err.status || 500,
            message: err.message
        }
    })
})


// load queue
consumerOrderAdd()
consumerOrderMDB()
consumerOrderStatus()

// REGISTER HOST AND PORT
app.disable('x-powered-by');
app.set('port', process.env.PORT);
app.set('host', process.env.NODEJS_IP);

// SERVER ON.
http.listen(app.get('port'), app.get('host'), () => {
    console.log(`MS on http://${app.get('host')}:${app.get('port')}`);
});