
const express = require("express");
const cors=require("cors");
require("dotenv").config();
const app=express();
const port=process.env.port|| 5000;


 //const courses=require("./data/courseDetails.json");
 //const books=require("./data/Book.json");
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const uri = "mongodb://localhost:27017/";

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bikot.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
  
      const userCollection = client.db("usersDbBootcamp").collection("users");
      const userCollection_category = client.db("usersDbBootcamp").collection("category");
      const userCollection_product = client.db("usersDbBootcamp").collection("products");
      const userCollection_purchase = client.db("usersDbBootcamp").collection("purchase");
      app.get("/users", async (req, res) => {
        const query = userCollection.find();
        const result = await query.toArray();
        res.send(result);
      });
  
      app.get("/user/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.findOne(query);
        console.log(result);
        res.send(result);
      });
       // Fetch a user by Firebase uid
       app.get("/users/:uid", async (req, res) => {
        try {
          const userUid = req.params.uid;
      
          // Find the user by uid (not _id)
          const user = await userCollection.findOne({ uid: userUid });
      
          if (!user) {
            return res.status(404).send({ error: "User not found" });
          }
      
          // Send the found user data
          res.send(user);
        } catch (error) {
          console.error("Error fetching user:", error);
          res.status(500).send({ error: "Internal server error" });
        }
      });
      
  
      app.post("/users", async (req, res) => {
        const users = req.body;
        users.isAdmin = false;
        users.isBlock = false;
        console.log(users);
        const result = await userCollection.insertOne(users);
        res.send(result);
      });
//ALL category Collection
      const getNextCategoryId = async () => {
        const lastCategory = await userCollection_category
          .find({})
          .sort({ id: -1 }) // Sort by `id` in descending order to get the last category
          .limit(1)         // Limit the result to 1 document
          .toArray();       // Convert the result to an array
      
        if (lastCategory.length > 0) {
          return lastCategory[0].id + 1; 
        } else {
          return 1; 
        }
      };

      app.post("/categories", async (req, res) => {
        const categories = req.body;
        // Get the next category ID
        const nextId = await getNextCategoryId();

        // Create a new category object with the incremented ID
         const newCategory = { ...categories, id: nextId };
        console.log(newCategory);
        const result = await userCollection_category.insertOne(newCategory);
        res.send(result);
      });

      app.get("/categories", async (req, res) => {
        const query = userCollection_category.find();
        const result = await query.toArray();
        res.send(result);
      });


  //All product Collection

  const getNextProductId = async () => {
    const lastCategory = await userCollection_category
      .find({})
      .sort({ id: -1 }) // Sort by `id` in descending order to get the last category
      .limit(1)         // Limit the result to 1 document
      .toArray();       // Convert the result to an array
  
    if (lastCategory.length > 0) {
      return lastCategory[0].id + 1; 
    } else {
      return 1; 
    }
  };

  app.post("/products", async (req, res) => {
    const products = req.body;
    // Get the next category ID
    const nextId = await getNextProductId();

    // Create a new category object with the incremented ID
     const newProduct = { ...products, id: nextId };
    console.log(newProduct);
    const result = await userCollection_product.insertOne(newProduct);
    res.send(result);
  });

  app.get("/products", async (req, res) => {
    const query = userCollection_product.find();
    const result = await query.toArray();
    res.send(result);
  });
  app.get("/products/category/:category?", async (req, res) => {
    // Extract category from the URL parameter
    const category = req.params.category;

    // Initialize the query object
    let query = {};

    // If the category is provided, add it to the query
    if (category) {
        query.category = { $regex: category, $options: 'i' }; // Case-insensitive search
    }

    try {
        // Query the database based on the constructed query object
        const result = await userCollection_product.find(query).toArray();
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Error fetching products", error });
    }
});

app.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the user by uid (not _id)
    const product = await userCollection_product.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).send({ error: "User not found" });
    }

    // Send the found user data
    res.send(product);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//Purchase details

app.post("/puchase", async (req, res) => {
  const purchaseDetails = req.body;
  console.log(purchaseDetails);
  const result = await userCollection_purchase.insertOne(purchaseDetails);
  res.send(result);
});
  
      app.put("/user/:id", async (req, res) => {
        const id = req.params.id;
        const user = req.body;
        console.log(id, user);
  
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
  
        const updatedUser = {
          $set: {
            name: user.name,
            email: user.email,
          },
        };
  
        const result = await userCollection.updateOne(
          filter,
          updatedUser,
          option
        );
        res.send(result);
      });
  
      app.delete("/user/:id", async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
      });
  
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } finally {
      // Ensures that the client will close when you finish/error
      //await client.close();
    }
  }
  run().catch((error) => console.log(error));


  app.get('/',(req,res)=>{
    res.send('new portal server is running');
});


// app.get('/books',(req,res)=>{
//     res.send(books);
//    });

// app.get('/books/:id',(req,res)=>{
//     const id = parseInt(req.params.id); 
//     const selectedBook = books.find((book) => book.bookId === id);
//     res.send(selectedBook);
//    });

// app.get('/courses',(req,res)=>{
//     res.send(courses);
//    });

// app.get('/courses/:id',(req,res)=>{
//     const id = req.params.id; 
//     const selectedCourse = courses.find((course) => course._id === id);
//     res.send(selectedCourse);
//    });  

app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
});
