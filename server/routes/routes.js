const { parse } = require("dotenv");
const express = require("express");
const routes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require("mongodb").ObjectId;

routes.post("/productsmany", async (req, response) => {
  let db_connect = dbo.getDb("products");
  let myobj = req.body;

  db_connect.collection("products").insertMany(myobj, function (err, res) {
    if (err) throw err;
    response.status(200).send({ message: "Product added successfully" });
  });
});

routes.post("/products", async (req, response) => {
  let db_connect = dbo.getDb("products");
  let myobj = req.body;
  //sprawdz czy obiekt o takiej nazwie istnieje
  db_connect
    .collection("products")
    .findOne({ name: myobj.name }, function (err, res) {
      if (err) throw err;
      if (res) {
        response.status(400).send({ message: "Product already exists" });
      } else {
        db_connect.collection("products").insertOne(myobj, function (err, res) {
          if (err) throw err;
          response.status(200).send({ message: "Product added successfully" });
        });
      }
    });
});

routes.get("/products", async (req, res) => {
  let db_connect = dbo.getDb("products");

  let query = {};
  let sort = {};

  let sortField = req.query.sortField;
  let sortOrder = req.query.sortOrder;
  let filterField = req.query.filterField;
  let filterValue = req.query.filterValue;

  if (sortField && sortOrder) {
    sort[sortField] = parseInt(sortOrder);
  }

  if (filterField && filterValue) {
    query[filterField] = filterValue;
  }

  db_connect
    .collection("products")
    .find(query)
    .sort(sort)
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(result);
    });
});

routes.delete("/removeallproducts", async (req, res) => {
  let db_connect = dbo.getDb("products");
  db_connect.collection("products").deleteMany({}, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

routes.put("/products/:id", async (req, res) => {
  let db_connect = dbo.getDb("products");
  let myquery = { _id: ObjectId(req.params.id) };
  let newvalues = {
    $set: {
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
    },
  };
  db_connect
    .collection("products")
    .updateOne(myquery, newvalues, function (err, result) {
      if (err) throw err;
      res.send(result);
    });
});

routes.delete("/products/:id", async (req, res) => {
  let db_connect = dbo.getDb("products");
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("products").deleteOne(myquery, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});

routes.get("/totalvalue", async (req, res) => {
  let db_connect = dbo.getDb("products");
  db_connect
    .collection("products")
    .aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ])
    .toArray(function (err, result) {
      if (err) throw err;
      res.send(result[0]);
    });
});

module.exports = routes;
