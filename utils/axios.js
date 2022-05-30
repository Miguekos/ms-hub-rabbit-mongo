const axios = require("axios");

// THE HUB
var apiKey = process.env.APIKEY_THEHUB

exports.GET_DETAIL_STATUS = async statusID => {
    console.log('AXIOS GET_DETAIL_STATUS')
    try {
        const { data } = await axios({
            method: "GET",
            baseURL: 'https://api.mintsoft.co.uk',
            url: `/api/Order/Statuses?APIKey=${apiKey}&api_key=${apiKey}`
            
        });
        const detStatus = data.find(element => element.ID == statusID);
        return detStatus;
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
};

exports.GET_ORDER = async idOrder => {
    try {
        console.log('AXIOS GET_ORDER')
        const { data } = await axios({
            method: 'GET',
            baseURL: 'https://api.mintsoft.co.uk',
            url: `/api/Order/${idOrder}?APIKey=${apiKey}&api_key=${apiKey}`
        })
        return data;
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
};

exports.ADD_ORDER = async v => {
    try {
        console.log('AXIOS ADD_ORDER')
        const { data } = await axios({
            method: 'PUT',
            baseURL: 'https://api.mintsoft.co.uk',
            url: `/api/Order?APIKey=${apiKey}`,
            headers: { 
                'Content-Type': 'application/json'
            },
            data: v
        })
        return data;
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
};

exports.ADD_PRODUCT = async v => {
    try {
        console.log('AXIOS ADD_PRODUCT')
        const { data } = await axios({
            method: 'PUT',
            baseURL: 'https://api.mintsoft.co.uk',
            url: `/api/Product?APIKey=${apiKey}`,
            headers: { 
                'Content-Type': 'application/json'
            },
            data: v
        })
        return data;
    } catch (error) {
        console.log(error.message);
        return error.message;
    }
};
