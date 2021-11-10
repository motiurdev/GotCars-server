const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const objectId = require('mongodb').ObjectId;

const app = express()
const port = process.env.PORT || 5000;

// middleware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aobjx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("carDB");
        const featureCarsCollection = database.collection("featureCars");
        const orderPlacesCollection = database.collection("orderPlaces");

        app.get('/featureCars', async (req, res) => {
            const result = await featureCarsCollection.find({}).toArray()
            res.send(result)
        })

        app.get('/orderPage/:id', async (req, res) => {
            const id = req.params.id;
            const item = { _id: objectId(id) }
            const result = await featureCarsCollection.findOne(item)
            res.send(result)
        })

        // insert orderPlace
        app.post('/orderPlace', async (req, res) => {
            const data = req.body;
            const result = await orderPlacesCollection.insertOne(data)
            res.send(result)
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening to port ${port}`)
})