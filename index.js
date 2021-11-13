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
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection("users");

        // get featuare car
        app.get('/featureCars', async (req, res) => {
            const result = await featureCarsCollection.find({}).toArray()
            res.send(result)
        })

        // get order details
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

        // get my order 
        app.get('/myorder/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const result = await orderPlacesCollection.find(query).toArray();
            res.send(result)
        })

        // delete order
        app.delete('/deleteOrder/:deleteId', async (req, res) => {
            const id = req.params.deleteId;
            const item = { _id: objectId(id) };
            const result = await orderPlacesCollection.deleteOne(item)
            res.send(result)
        })

        // review insert 
        app.post("/review", async (req, res) => {
            const data = req.body;
            const result = await reviewsCollection.insertOne(data)
            res.send(result)
        })

        // get review
        app.get("/review", async (req, res) => {
            const result = await reviewsCollection.find({}).toArray()
            res.send(result)
        })

        // manage orders
        app.get("/manageOrders", async (req, res) => {
            const result = await orderPlacesCollection.find({}).toArray()
            res.send(result)
        })

        // delete order
        app.delete("/deleteOrders/:id", async (req, res) => {
            const id = req.params.id;
            const item = { _id: objectId(id) };
            const result = await orderPlacesCollection.deleteOne(item)
            res.send(result)
        })

        // update status
        app.put("/handleStatus/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `Shipped`
                },
            };
            const result = await orderPlacesCollection.updateOne(filter, updateDoc, options);
        })

        // add product
        app.post("/addProduct", async (req, res) => {
            const data = req.body;
            const result = await featureCarsCollection.insertOne(data)
            res.send(result)
        })

        // delete product
        app.delete("/deleteProduct/:id", async (req, res) => {
            const id = req.params.id;
            const item = { _id: objectId(id) };
            const result = await featureCarsCollection.deleteOne(item)
            res.send(result)
        })

        // add user
        app.post("/user", async (req, res) => {
            const data = req.body;
            const result = await usersCollection.insertOne(data)
            res.send(result)
        })

        // admin  role
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        // find admin email
        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.send({ admin: isAdmin })
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