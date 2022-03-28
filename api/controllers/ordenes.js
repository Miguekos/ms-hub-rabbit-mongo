const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const getHello = async (req, res = response) => {
    try {
        const body = {
            name: 'Miguel'
        }
        await clienteMongo.INSERT_ONE('ordenes', body)
        await publishRabbitMq('', 'ordenes', JSON.stringify(body))
        res.json({
            result: 'Hello World..!!'
        });
    } catch (error) {
        res.status(404).json({
            ok: false,
            msg: 'Error de envio de data'
        });
    }
}


module.exports = {
    getHello
}