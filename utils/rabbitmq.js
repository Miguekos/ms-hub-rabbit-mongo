const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
let open = require("amqplib").connect(`${process.env.AMQP}`);

const publishRabbitMq = async (exchange, queue, mensaje) => {
    console.log('publishRabbitMq ',exchange)
    open
        .then(function (conn) {
            return conn.createChannel();
        })
        .then(function (ch) {
            ch.publish(exchange, queue, Buffer.from(mensaje));
            ch.close();
            return true;
        })
        .catch( e => {console.warn(e.message); return false});
};

module.exports = {
    publishRabbitMq
}
