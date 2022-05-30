const clienteMongo = require('../database/mongo')
const dotenv = require("dotenv");
const apis = require('../../utils/axios')
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const newProduct = async (data) => {
    try {
        console.log('New Product')
        var esquema = 'products'

        var inputAdd = {
            "SKU": "MY-TSHIRT-RED-SM-TEST",
            "ClientId": data.ProductId,
            "Name": "MY TSHIRT RED SMALL - TEST",
            "CustomsDescription": "Cotton Tshirt TEST",
            "EAN": "3546433",
            "UPC": "643636346",
            "LowStockAlertLevel": 20,
            "Weight": 1,
            "Height": 40,
            "Width": 20,
            "Depth": 1,
            "ImageURL": "https://cdn.shopify.com/s/files/1/0263/3007/1119/products/rosamesanueva.jpg?v=1634672333"
        };

        const product = await apis.ADD_PRODUCT(inputAdd)
        console.log(product)
        console.log('Rpta ProductId:', product.ProductId)

        const mdb = await clienteMongo.INSERT_ONE(esquema, {inProductId: data.ProductId, ...data, ...inputAdd, ...product})
        console.log('MDB:',mdb)

        if (mdb.status == false) {
            await clienteMongo.INSERT_ONE('log_error', {...data, error:mdb.message, type: 'Producto'})
            return {message: 'ERROR', data: mdb.status}
        } else { return {message: 'OK', data: product} }
        // else {
        //     await publishRabbitMq('ex_product', '', JSON.stringify({inProductId: data.ProductId, ...data}))
        //     return {message: 'OK', data}
        // }
    } catch (error) {
        console.log(error.message)
        return {message: 'ERROR', data: false}
    }
}
module.exports = {
    newProduct
}