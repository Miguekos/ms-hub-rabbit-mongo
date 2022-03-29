const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { newOrder } = require('./orders')

const notify = async (req, res = response) => {
    try {
        console.log('NOTIFICAR PROCESO')
        console.log('Input', req.body)
        const notifyJson = req.body
        var notify;
        const typeProcess = 
            notifyJson.DeliveryOrderId ? 1 : // ORDER
            notifyJson.ProductId ? 2 : // PRODUCT
            null; // NINGUNO
        console.log('Tipo de proceso:',typeProcess)
        switch (typeProcess) {
            case 1:
            console.log('ORDER')
                notify = await newOrder(notifyJson);
                break;
            case 2:
            console.log('PRODUCT')
                //notify = await this.productService.addProduct(notifyJson);
                
                break;
            default:
                break;
        }

        res.status(200).json(notify);
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}

module.exports = {
    notify
}