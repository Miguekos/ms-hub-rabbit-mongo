const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
let open = require("amqplib").connect(`${process.env.AMQP}`);

const publishRabbitMq = async (exchange, queue, mensaje) => {

    open
        .then(function (conn) {
            return conn.createChannel();
        })
        .then(function (ch) {
            ch.publish(exchange, queue, Buffer.from(mensaje));
            return ch.close();
        })
        .catch(console.warn);
};

module.exports = {
    publishRabbitMq
}
