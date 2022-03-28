const axios = require('axios');
const clienteMongo = require('../api/database/mongo')

const get_request = async (data) => {
    // console.log('GET Request');
    try {
        const request = await axios.get(
            `https://dog.ceo/api/breeds/image/random`
        );

        return request.data

    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    get_request
}