const axios = require('axios');

// THE HUB
var apiKey = process.env.APIKEY_THEHUB;

exports.GET_DETAIL_STATUS = async (statusID) => {
  console.log('AXIOS GET_DETAIL_STATUS');
  try {
    const { data } = await axios({
      method: 'GET',
      baseURL: process.env.IP_THEHUB,
      url: `/api/Order/Statuses?APIKey=${apiKey}&api_key=${apiKey}`,
    });
    const detStatus = data.find((element) => element.ID == statusID);
    return detStatus;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.GET_ORDER = async (idOrder) => {
  try {
    console.log('AXIOS GET_ORDER');
    const { data } = await axios({
      method: 'GET',
      baseURL: process.env.IP_THEHUB,
      url: `/api/Order/${idOrder}?APIKey=${apiKey}&api_key=${apiKey}`,
    });
    return data;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.ADD_ORDER = async (v) => {
  try {
    console.log('AXIOS ADD_ORDER');
    const { data } = await axios({
      method: 'PUT',
      baseURL: process.env.IP_THEHUB,
      url: `/api/Order?APIKey=${apiKey}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: v,
    });
    return data;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.ADD_PRODUCT = async (v) => {
  try {
    console.log('AXIOS ADD_PRODUCT');
    const { data } = await axios({
      method: 'PUT',
      baseURL: process.env.IP_THEHUB,
      url: `/api/Product?APIKey=${apiKey}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: v,
    });
    return data;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

// MULTIVENDE

exports.TOKEN_MULTIVENDE = async (v) => {
  try {
    console.log('TOKEN_MULTIVENDE');
    await axios({
      method: 'POST',
      baseURL: process.env.IP_MULTIVENDE,
      url: '/oauth/access-token',
      headers: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      data: v,
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.POLLING = async (v) => {
  try {
    console.log('POLLING');
    console.log(
      `${process.env.IP_MULTIVENDE}/api/m/${process.env.MERCHANT_ID}/checkouts/light/p/1?_updated_at_from=${v.startData}&_updated_at_to=${v.endData}`
    );
    await axios({
      method: 'GET',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/m/${process.env.MERCHANT_ID}/checkouts/light/p/${v.page}?_updated_at_from=${v.startData}&_updated_at_to=${v.endData}`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.CHECKOUTS = async (v) => {
  try {
    console.log('CHECKOUTS DETAILS');
    console.log(`${process.env.IP_MULTIVENDE}/api/checkouts/${v.checkout_id}`);
    await axios({
      method: 'GET',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/checkouts/${v.checkout_id}`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.GET_ALL_PRODUCTS = async (v) => {
  try {
    console.log('GET_ALL_PRODUCTS');
    console.log(
      `${process.env.IP_MULTIVENDE}/api/m/${process.env.MERCHANT_ID}/products/p/${v.page}`
    );
    await axios({
      method: 'GET',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/m/${process.env.MERCHANT_ID}/products/p/${v.page}`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.GET_PRODUCT = async (v) => {
  try {
    console.log('GET_PRODUCT');
    console.log(`${process.env.IP_MULTIVENDE}/api/products/${v.productId}`);
    await axios({
      method: 'GET',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/products/${v.productId}`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.GET_PRODUCT_IMAGE = async (v) => {
  try {
    console.log('GET_PRODUCT_IMAGE');
    console.log(
      `${process.env.IP_MULTIVENDE}/api/products/${v.productId}/images`
    );
    await axios({
      method: 'GET',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/products/${v.productId}/images`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.GET_ORDER_STATUS_MULTIVENDE = async (v) => {
  try {
    console.log('GET_ORDER_STATUS_MULTIVENDE');
    console.log(`${process.env.IP_MULTIVENDE}/api/delivery-order-statuses`);
    await axios({
      method: 'GET',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/delivery-order-statuses`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

exports.UPDATE_ORDER_STATUS_VENDEMAS = async (v) => {
  try {
    console.log('UPDATE_ORDER_STATUS_VENDEMAS');
    console.log(
      `${process.env.IP_MULTIVENDE}/api/delivery-orders/${v.orderID}/change-delivery-status`
    );
    console.log(v);
    const input = {
      DeliveryOrderId: v.orderID,
      date: v.updateDate,
      DeliveryOrderStatusId: v.statusID,
      comment: v.comment,
    };
    await axios({
      method: 'PUT',
      baseURL: process.env.IP_MULTIVENDE,
      url: `/api/delivery-orders/${v.orderID}/change-delivery-status`,
      header: {
        'cache-control': 'no-cache',
        'Content-Type': 'application/json',
      },
      headers: { Authorization: `Bearer ${v.auth}` },
      data: input,
    })
      .then(async function (response) {
        console.log('STATUS:', response.status);
        output = { status: response.status, data: response.data };
      })
      .catch(async function (error) {
        console.log(error.message);
        var statusText;
        var status;
        if (error.response) {
          // La respuesta fue hecha y el servidor respondió con un código de estado
          status = error.response.status;
          statusText = error.response.data.name;
          console.log(statusText);
        } else {
          // La petición fue hecha pero no se recibió respuesta o algo paso al preparar la petición que lanzo un Error
          status = 400;
        }
        console.log('STATUS:', status);
        output = { status: status, message: statusText };
      });
    return output;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};
