const amqp = require("amqplib/callback_api");
const { publishRabbitMq } = require('../../utils/rabbitmq')
const clienteMongo = require('../database/mongo')
const { get_request } = require('../../utils/axios')
const mongoClient = require('../database/mongo')
const { ObjectID } = require('mongodb');
const dotenv = require("dotenv");
// const io = require('../../utils/socket')

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const consumer_rabbitMQ = async () => {
    amqp.connect(`${process.env.AMQP}`, function (err, conn) {
        if (err) {
            console.log(err);
            throw err;
            // return;
        }
        conn.createChannel(function (err, ch) {
            if (err) {
                console.log(err);
                throw err;
            }
            var q = 'ordenes';
            ch.assertQueue(q); //Crea la cola si no existe

            // Procesar 1 por 1
            ch.prefetch(1);

            ch.consume(q, async function (msg) {
                try {
                    const item = JSON.parse(msg.content.toString());
                    console.log("Logs Consumido", item);
                    // const response = await clienteMongo.INSERT_ONE('ordenes', item);
                    ch.ack(msg);
                } catch (error) {
                    console.log("Error de cola: ", error);
                    ch.ack(msg);
                }
            }, {
                noAck: false
            });
        });
        // setTimeout(function() { conn.close(); }, 500);
    });
};

module.exports = {
    consumer_rabbitMQ
};