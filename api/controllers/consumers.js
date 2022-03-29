const amqp = require("amqplib/callback_api");
const { publishRabbitMq } = require('../../utils/rabbitmq')
const clienteMongo = require('../database/mongo')
const apis = require('../../utils/axios')

var esquema = 'orders'

const consumerOrderAdd = async () => {
    amqp.connect(`${process.env.AMQP}`, function (err, conn) {
        if (err) { console.log(err); throw err;}
        conn.createChannel(function (err, ch) {
            if (err) { console.log(err); throw err;}
            var q = 'orderAdd_queue';
            ch.assertQueue(q); //Crea la cola si no existe

            // Procesar 1 por 1
            ch.prefetch(1);

            ch.consume(q, async function (msg) {
                try {
                    console.log('LOGICA DE REGISTRO DE ORDER')
                    const item = JSON.parse(msg.content.toString());
                    console.log(item);

                    await publishRabbitMq('ex_order_mdb', '', JSON.stringify(item))
                    ch.ack(msg);
                } catch (error) {
                    console.log("Error de cola: ", error.message);
                    ch.ack(msg);
                }
            }, {
                noAck: false
            });
        });
        // setTimeout(function() { conn.close(); }, 500);
    });
};

const consumerOrderMDB = async () => {
    amqp.connect(`${process.env.AMQP}`, function (err, conn) {
        if (err) { console.log(err); throw err;}
        conn.createChannel(function (err, ch) {
            if (err) { console.log(err); throw err;}
            var q = 'orderMDB_queue';
            ch.assertQueue(q); //Crea la cola si no existe

            // Procesar 1 por 1
            ch.prefetch(1);

            ch.consume(q, async function (msg) {
                try {
                    console.log('LOGICA DE MDB DE ORDER')
                    const item = JSON.parse(msg.content.toString());
                    //console.log(item);
                    const IDOrder = item.ID
                    const IDstatus = item.OrderStatusId
                    console.log('IDOrder',IDOrder)
                    console.log('IDstatus',IDstatus)
                    const mdb = await clienteMongo.UPDATE_ONE(esquema, {ID:IDOrder}, item) 
                    console.log(mdb)
                    switch (IDstatus) {
                        //case 1: // NEW PRUEBA
                        case 3: // CANCELLED
                        case 4: // DESPATCHED
                            console.log('ORDER FINISH')
                            ch.ack(msg);
                            break;
                        default:
                            console.log('ORDER EN PROCESO')
                            await publishRabbitMq('ex_order_await', '', JSON.stringify(item))
                            ch.ack(msg);
                            break;
                    }
                    // const response = await clienteMongo.INSERT_ONE('ordenes', item);
                    //ch.ack(msg);
                } catch (error) {
                    console.log("Error de cola: ", error.message);
                    ch.ack(msg);
                }
            }, {
                noAck: false
            });
        });
        // setTimeout(function() { conn.close(); }, 500);
    });
};

const consumerOrderStatus = async () => {
    amqp.connect(`${process.env.AMQP}`, function (err, conn) {
        if (err) { console.log(err); throw err;}
        conn.createChannel(function (err, ch) {
            if (err) { console.log(err); throw err;}
            var q = 'orderStatus_queue';
            ch.assertQueue(q); //Crea la cola si no existe

            // Procesar 1 por 1
            ch.prefetch(1);

            ch.consume(q, async function (msg) {
                try {
                    console.log('LOGICA DE CONSULTA DE ESTADO')
                    const item = JSON.parse(msg.content.toString());
                    //console.log(item);
                    console.log('IDOrder',item.ID)
                    const order = await apis.GET_ORDER(item.ID)
                    const IDstatus = order.OrderStatusId
                    console.log('IDstatus',IDstatus)
                    const datailStatus = await apis.GET_DETAIL_STATUS(IDstatus)
                    console.log(datailStatus)
                    const jsonMDB = {
                        ...item,
                        OrderStatusId: IDstatus,
                        datailStatus: datailStatus
                    }
                    await publishRabbitMq('ex_order_mdb', '', JSON.stringify(jsonMDB))
                    ch.ack(msg);
                } catch (error) {
                    console.log("Error de cola: ", error.message);
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
    consumerOrderAdd,
    consumerOrderMDB,
    consumerOrderStatus
};