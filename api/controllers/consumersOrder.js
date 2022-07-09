const amqp = require('amqplib/callback_api');
const moment = require('moment');
const { publishRabbitMq } = require('../../utils/rabbitmq');
const clienteMongo = require('../database/mongo');
const apis = require('../../utils/axios');
const multivende = require('../helpers/functions/multivende');

var esquema = 'orders';

const consumerOrderAdd = async () => {
  amqp.connect(`${process.env.AMQP}`, function (err, conn) {
    if (err) {
      console.log(err);
      throw err;
    }
    conn.createChannel(function (err, ch) {
      if (err) {
        console.log(err);
        throw err;
      }
      var q = 'orderAdd_queue';
      ch.assertQueue(q); //Crea la cola si no existe

      // Procesar 1 por 1
      ch.prefetch(1);

      ch.consume(
        q,
        async function (msg) {
          try {
            console.log('* LOGICA DE REGISTRO DE ORDER');
            const item = JSON.parse(msg.content.toString());
            //console.log('DeliveryOrderId: ',item.DeliveryOrderId);
            console.log('CheckoutId: ', item._id);

            // VERIFICAR SECUENCIAL
            const year = moment().format('YYYY');
            const _idSeq = `${year}_order_multivende`;
            const collectionSeq = 'sequence';
            const secuencial = await clienteMongo.GET_ONE(collectionSeq, {
              _id: _idSeq,
            });
            console.log(JSON.stringify(secuencial));
            if (secuencial.response === false) {
              const jsonSeq = {
                _id: _idSeq,
                detail: `Sequence ${year} de orders multivende`,
                seq: 1,
              };
              const seq = await clienteMongo.INSERT_ONE(collectionSeq, jsonSeq);
            }
            const sequence = await clienteMongo.GET_NEXT_SEQUENCE(
              _idSeq,
              collectionSeq
            );
            console.log('sequence:', sequence);

            var OrderItems = [];
            const arrayProd = item.CheckoutItems;
            for (let i = 0; i < arrayProd.length; i++) {
              const SKU = arrayProd[i].ProductVersion.Product.code;
              const Quantity = arrayProd[i].count;
              const jsonProd = {
                SKU: SKU,
                Quantity: Quantity,
                WarehouseId: 3,
              };
              OrderItems.push(jsonProd);
            }
            var data = {
              OrderItems: OrderItems,
              OrderNumber: item._id,
              FirstName: item.Client.name,
              LastName: item.Client.lastName,
              Address1: 'Los Olivos -TEST',
              Town: 'MAGDALENA DEL MAR',
              County: 'LIMA',
              PostCode: '.',
              Country: 'LIMA',
              CountryId: 399,
              ChannelId: 13,
              CourierService: 'Next cod',
              Warehouse: '',
              WarehouseId: 3,
              Comments: item.comment,
              ClientId: 5,
            };
            console.log('DATA PARA INSERTAR: ', data);
            const order = await apis.ADD_ORDER(data);
            console.log(order[0]);
            console.log('Rpta IDOrder:', order[0].OrderId);
            const jsonMQ = {
              ...item,
              inputTheHub: data,
              addTheHub: order[0],
              OrderId: order[0].OrderId,
              OrderStatusId: order[0].OrderStatusId,
            };
            await publishRabbitMq('ex_order_mdb', '', JSON.stringify(jsonMQ));
            ch.ack(msg);
          } catch (error) {
            console.log('Error de cola: ', error.message);
            ch.ack(msg);
          }
        },
        {
          noAck: false,
        }
      );
    });
    // setTimeout(function() { conn.close(); }, 500);
  });
};

const consumerOrderMDB = async () => {
  amqp.connect(`${process.env.AMQP}`, function (err, conn) {
    if (err) {
      console.log(err);
      throw err;
    }
    conn.createChannel(function (err, ch) {
      if (err) {
        console.log(err);
        throw err;
      }
      var q = 'orderMDB_queue';
      ch.assertQueue(q); //Crea la cola si no existe

      // Procesar 1 por 1
      ch.prefetch(1);

      ch.consume(
        q,
        async function (msg) {
          try {
            console.log('* LOGICA DE MDB DE ORDER');
            const item = JSON.parse(msg.content.toString());
            const checkoutId = item._id;
            const IDstatus = item.OrderStatusId;
            console.log('CheckoutId', checkoutId);
            console.log('IDstatus', IDstatus);
            const mdb = await clienteMongo.UPDATE_ONE(
              esquema,
              { _id: checkoutId },
              item
            );
            console.log(mdb);
            switch (IDstatus) {
              case 0: // ERROR
              case 3: // CANCELLED
              case 4: // DESPATCHED
                console.log('ORDER FINISH');
                ch.ack(msg);
                break;
              default:
                console.log('ORDER EN PROCESO');
                await publishRabbitMq(
                  'ex_order_await',
                  '',
                  JSON.stringify(item)
                );
                ch.ack(msg);
                break;
            }
            // const response = await clienteMongo.INSERT_ONE('ordenes', item);
            //ch.ack(msg);
          } catch (error) {
            console.log('Error de cola: ', error.message);
            ch.ack(msg);
          }
        },
        {
          noAck: false,
        }
      );
    });
    // setTimeout(function() { conn.close(); }, 500);
  });
};

const consumerOrderStatus = async () => {
  amqp.connect(`${process.env.AMQP}`, function (err, conn) {
    if (err) {
      console.log(err);
      throw err;
    }
    conn.createChannel(function (err, ch) {
      if (err) {
        console.log(err);
        throw err;
      }
      var q = 'orderStatus_queue';
      ch.assertQueue(q); //Crea la cola si no existe

      // Procesar 1 por 1
      ch.prefetch(1);

      ch.consume(
        q,
        async function (msg) {
          try {
            console.log('* LOGICA DE CONSULTA DE ESTADO');
            const item = JSON.parse(msg.content.toString());
            //console.log(item);
            const checkoutId = item._id;
            console.log('CheckoutId', checkoutId);
            console.log('IDOrder', item.OrderId);
            const order = await apis.GET_ORDER(item.OrderId);
            const IDstatus = order.OrderStatusId ? order.OrderStatusId : 0;
            console.log('New IDstatus', IDstatus);
            const dateilStatus = await apis.GET_DETAIL_STATUS(IDstatus);
            console.log(dateilStatus);
            const jsonMDB = {
              ...item,
              OrderStatusId: IDstatus,
              dateilStatus: dateilStatus,
            };
            await publishRabbitMq('ex_order_mdb', '', JSON.stringify(jsonMDB));

            const deliveryID =
              item.DeliveryOrderInCheckouts[0].DeliveryOrder._id;
            console.log('DELIVERYYYYYYYYYYY ID:', deliveryID);

            const jsonUpdStatus = {
              orderID: deliveryID,
              status: dateilStatus.ExternalName,
              comment: dateilStatus.ExternalName,
            };
            const update = await multivende.UPDATE_STATUS(jsonUpdStatus);
            console.log(update);
            ch.ack(msg);
          } catch (error) {
            console.log('Error de cola: ', error.message);
            ch.ack(msg);
          }
        },
        {
          noAck: false,
        }
      );
    });
    // setTimeout(function() { conn.close(); }, 500);
  });
};

module.exports = {
  consumerOrderAdd,
  consumerOrderMDB,
  consumerOrderStatus,
};
