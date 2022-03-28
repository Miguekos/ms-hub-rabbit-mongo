const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: ["http://127.0.0.1:8080", "http://localhost:8080"],
        methods: ["GET", "POST"],
        allowedHeaders: ["mshub-header"],
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("new cliente", socket.id);
});

module.exports = io.listen();