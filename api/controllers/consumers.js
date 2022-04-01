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
                    console.log('* LOGICA DE REGISTRO DE ORDER')
                    const item = JSON.parse(msg.content.toString());
                    console.log('DeliveryOrderId: ',item.DeliveryOrderId);

                    var data = {
                        "OrderItems": [
                          {
                            "SKU": "002-003-0006-gra050",
                            "ProductId": 126,
                            "Quantity": 12,
                            "Details": "TEST - TEST",
                            "UnitPrice": 0,
                            "UnitPriceVat": 0,
                            "Discount": 0,
                            "OrderItemNameValues": [
                              {
                                "Name": "BUNDLE-ID",
                                "Value": "3024;1;a34f4bf9-5666-4b01-a3b8-5e45acae7255"
                              }
                            ],
                            "WarehouseId": 3,
                            "RequestedSerialNo": ""
                          }
                        ],
                        "OrderNameValues": [
                          {
                            "OrderId": 1283,
                            "Name": "SourceCourierServiceName",
                            "Value": "dokan_table_rate_shipping:Tabla de Tarifas",
                            "ID": 811,
                            "LastUpdated": "2022-03-19T23:15:46.8858258",
                            "LastUpdatedByUser": "SYSTEM-WOOCOMMERCE"
                          }
                        ],
                        "OrderNumber": item.DeliveryOrderId,
                        "ExternalOrderReference": "",
                        "Title": "",
                        "CompanyName": "",
                        "FirstName": "MIguel Angel TEST",
                        "LastName": "Rdriguez TEST",
                        "Address1": "Los Olivos -TEST",
                        "Address2": "",
                        "Address3": "",
                        "Town": "MAGDALENA DEL MAR",
                        "County": "LIMA",
                        "PostCode": ".",
                        "Country": "LIMA",
                        "CountryId": 399,
                        "Email": "miguekos1233@gmail.com",
                        "Phone": "965778450",
                        "Mobile": "",
                        "CourierService": "Next cod",
                        "CourierServiceTypeId": 10,
                        "Channel": "TEST",
                        "ChannelId": 13,
                        "Warehouse": "",
                        "WarehouseId": 3,
                        "Currency": "",
                        "CurrencyId": 27,
                        "DeliveryDate": "2022-03-28T01:15:02.257Z",
                        "DespatchDate": "2022-03-28T01:15:02.257Z",
                        "RequiredDeliveryDate": "2022-03-28T01:15:02.257Z",
                        "RequiredDespatchDate": "2022-03-28T01:15:02.257Z",
                        "Comments": "TEST",
                        "DeliveryNotes": "TEST",
                        "GiftMessages": "TEST",
                        "VATNumber": "string",
                        "EORINumber": "string",
                        "PIDNumber": "string",
                        "IOSSNumber": "string",
                        "OrderValue": 0,
                        "ShippingTotalExVat": 0,
                        "ShippingTotalVat": 0,
                        "DiscountTotalExVat": 0,
                        "DiscountTotalVat": 0,
                        "TotalVat": 0,
                        "ClientId": 5,
                        "NumberOfParcels": 0
                    };
                    const order = await apis.ADD_ORDER(data)
                    console.log('Rpta IDOrder:', order[0].OrderId)
                    const jsonMQ = {...item, ...data, ...order[0], ID:order[0].OrderId}
                    await publishRabbitMq('ex_order_mdb', '', JSON.stringify(jsonMQ))
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
                    console.log('* LOGICA DE MDB DE ORDER')
                    const item = JSON.parse(msg.content.toString());
                    const DeliveryOrderId = item.DeliveryOrderId
                    const IDstatus = item.OrderStatusId
                    console.log('DeliveryOrderId',DeliveryOrderId)
                    console.log('IDstatus',IDstatus)
                    const mdb = await clienteMongo.UPDATE_ONE(esquema, {DeliveryOrderId: DeliveryOrderId}, item) 
                    console.log(mdb)
                    switch (IDstatus) {
                        //case 9: // ONBACKORDER
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
                    console.log('* LOGICA DE CONSULTA DE ESTADO')
                    const item = JSON.parse(msg.content.toString());
                    //console.log(item);
                    console.log('IDOrder',item.ID)
                    const order = await apis.GET_ORDER(item.ID)
                    const IDstatus = order.OrderStatusId
                    console.log('New IDstatus',IDstatus)
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