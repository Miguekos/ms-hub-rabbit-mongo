const clienteMongo = require('../database/mongo')
const { publishRabbitMq } = require('../../utils/rabbitmq')
const multivende = require("../helpers/functions/multivende")
const apis = require('../../utils/axios')
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const newOrder = async (data) => {
    try {
        console.log('New Order')
        const token = await multivende.TOKEN_OAUTH({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            type: 2
        })

        if (token.status == 200) {
            const auth = token.data.token

            const jsonDetail = { 
                data: data,
                checkoutId: data.CheckoutId, 
                auth, 
                channel : 'WEBHOOK'
            } 
            const rptaCheckout = await multivende.POLLING_DETAILS(jsonDetail)
            return rptaCheckout
        } else {
            await clienteMongo.INSERT_ONE('log_error', {...token, type: 'Order'})
            return token
        }
    } catch (error) {
        console.log(error.message)
        return {message: 'ERROR', data: false}
    }
}
module.exports = {
    newOrder
}