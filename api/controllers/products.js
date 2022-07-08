const clienteMongo = require('../database/mongo')
const dotenv = require("dotenv");
const apis = require('../../utils/axios')
const multivende = require("../helpers/functions/multivende")

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const newProduct = async (data) => {
    try {
        console.log('New Product')
        var esquema = 'products'
        const detailProd = await multivende.DETAIL_PRODUCT(data)
        var inputAdd = {
            "SKU": detailProd.data.code,
            "ClientId": 3,
            "Name": detailProd.data.name,
            "CustomsDescription": detailProd.data.description,
            "EAN": "3547001",
            "UPC": "643636348",
            "LowStockAlertLevel": 20,
            "Weight": detailProd.data.ProductVersions[0].weight,
            "Height": detailProd.data.ProductVersions[0].height,
            "Width": detailProd.data.ProductVersions[0].width,
            "Depth": 1,
            "ImageURL": detailProd.data.url
        };

        console.log(inputAdd)
        const product = await apis.ADD_PRODUCT(inputAdd)
        console.log(product)
        console.log('Rpta ProductId:', product.ProductId)

        const mdb = await clienteMongo.INSERT_ONE(esquema, { ID: data.ProductId, ...data, inputTheHub: inputAdd, addTheHub: product})
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