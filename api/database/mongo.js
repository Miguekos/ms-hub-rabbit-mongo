const mongoClient = require('mongodb').MongoClient;
const conexionMongo = process.env.IP_MONGO;
const dotenv = require("dotenv");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

exports.CLEAN = async (esquema) => {
    try {
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);

        await collection.drop((err, delOK) => {
            // if (err) throw err;
            if (delOK) console.log("Collection deleted");
            client.close();
        });
        return "Collection deleted";
    } catch (error) {
        console.log(error.message);
        return false;
    }
};


//FUNCION DE ACTUALIZAR JSON
exports.UPDATE_ONE = async (esquema, query, data) => {
    try {
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);

        const { result } = await collection.updateOne(query, {
            $set: {
                ...data,
                _updated: new Date(),
            },
        });
        client.close();
        return result;
    } catch (error) {
        console.log(error.message);
        return false;
    }
};

exports.INSERT_ONE = async (esquema, data) => {
    try {
        // console.log('data_insert', data);
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);
        const result = await collection.insertOne({
            ...data,
            _insert: new Date(),
        });
        client.close();
        return result.insertedId;
    } catch (error) {
        console.log(error.message);
        return {status: false, message: error.message};
    }
};

exports.GET_ONE = async (esquema, query) => {
    try {
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        // console.log('query ', query);
        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);
        const result = await collection.findOne(query);
        // console.log(result);
        const output = { codRes: result ? '00' : '01', ...result };
        client.close();
        return result;
    } catch (error) {
        console.log(error.message);
        return {status: false, message: error.message};
    }
};

exports.GET_ALL = async (esquema, query) => {
    try {
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('query ', query);
        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);
        const result = await collection.find(query).toArray();
        client.close();
        return result;
    } catch (error) {
        console.log(error.message);
        return {status: false, message: error.message};
    }
};

exports.DEL = async (esquema, query) => {
    try {
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('query ', query);
        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);
        const result = await collection.deleteOne(query);
        client.close();
        return result;
    } catch (error) {
        console.log(error.message);
        return {status: false, message: error.message};
    }
};

exports.GET_LOGS = async (esquema) => {
    try {
        const client = await mongoClient.connect(conexionMongo, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = client.db(`${process.env.DB}`);
        const collection = db.collection(esquema);
        const pipeline = [
            { $group: { _id: "$id", logs: { $push: "$$ROOT" } } }
        ];
        const result = await collection.aggregate(pipeline).toArray();
        client.close();
        return result;
    } catch (error) {
        console.log(error.message);
        return {status: false, message: error.message};
    }
};