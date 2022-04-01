const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const newOrder = async (data) => {
    try {
        console.log('New Order')
        var esquema = 'orders'
        const mdb = await clienteMongo.INSERT_ONE(esquema, data)
        console.log('MDB:',mdb)
        if (mdb.status == false) {
            await clienteMongo.INSERT_ONE('log_error', {...data, error:mdb.message})
            return {message: 'ERROR', data: mdb.status}
        } else {
            await publishRabbitMq('ex_order', '', JSON.stringify(data))
            return {message: 'OK', data}
        }
    } catch (error) {
        console.log(error.message)
        return {message: 'ERROR', data: false}
    }
}
module.exports = {
    newOrder
}