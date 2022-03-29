const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const newOrder = async (data) => {
    try {
        console.log('New Order')
        var esquema = 'orders'
        const mdb = await clienteMongo.INSERT_ONE(esquema, data)
        console.log(mdb)
        if (mdb == false) {
            return {message: 'ERROR', data: mdb}
        } else {
            await publishRabbitMq('ex_order', '', JSON.stringify(data))
            return {message: 'OK', data}
        }
    } catch (error) {
        return error.message
    }
}
module.exports = {
    newOrder
}