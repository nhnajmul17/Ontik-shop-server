const express = require('express')
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config()


const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3zfz5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {

    try {
        await client.connect();
        const database = client.db("teck_shop");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders")
        const usersCollection = database.collection("users")
        const addtoCartCollection = database.collection('addtoCart')

        //GET Products APi
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({})
            const products = await cursor.toArray();
            res.send(products)

        })


        //addtocart
        app.post('/addtocart', async (req, res) => {
            const cursor = req.body
            const result = await addtoCartCollection.insertOne(cursor);
            res.send(result)
        })

        //load a specific user cart-orders
        app.get('/addtocart/:email', async (req, res) => {
            const email = req.params.email
            const result = await addtoCartCollection.find({ email: email }).toArray()
            res.send(result)
        })

        //delete items from cart
        app.delete('/addtocart/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await addtoCartCollection.deleteOne(query)
            res.send(result)
        })

        //delete all cart item for an user
        app.delete('/ordercart/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await addtoCartCollection.deleteMany(query)
            res.send(result)
        })

        /*   //used Post to get data from keys
          app.post('/products/bykeys', async (req, res) => {
              const keys = (req.body);
              const query = { key: { $in: keys } }
              const products = await productCollection.find(query).toArray();
              res.json(products)
          })
   */



        //ADD Ordesrs APi

        app.post('/orders', async (req, res) => {
            const order = req.body
            order.createdAt = new Date();
            const result = await orderCollection.insertOne(order);
            res.json(result)
        })
        //Get Orders APi
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders)

        })



        //save User in data base
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user);
            res.send(result)
        })




    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)





app.get('/', (req, res) => {
    res.send('This is Tech Shop Server')
})

app.listen(port, () => {
    console.log('Running on port', port);
})