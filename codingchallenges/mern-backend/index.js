const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const Transaction = require("../mern-backend/models/Transaction"); // Import Transaction model

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS

mongoose
  .connect("mongodb://localhost:27017/transactions", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Route to initialize database from third-party API
app.get("/initialize", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);
    res.send("Database initialized");
  } catch (err) {
    res.status(500).send("Error initializing database");
  }
});

// List Transactions with Search and Pagination
app.get("/transactions", async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const query = {
    dateOfSale: { $regex: `-${month}-`, $options: "i" },
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
    ];
  }

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total, page, perPage });
  } catch (err) {
    res.status(500).send("Error fetching transactions");
  }
});

// Statistics
app.get("/statistics", async (req, res) => {
  const { month } = req.query;
  try {
    const transactions = await Transaction.find({
      dateOfSale: { $regex: `-${month}-`, $options: "i" },
    });
    const totalSale = transactions.reduce((sum, t) => sum + t.price, 0);
    const soldItems = transactions.filter((t) => t.sold).length;
    const notSoldItems = transactions.length - soldItems;
    res.json({ totalSale, soldItems, notSoldItems });
  } catch (err) {
    res.status(500).send("Error fetching statistics");
  }
});

// Bar Chart Data
app.get("/bar-chart", async (req, res) => {
  const { month } = req.query;
  const priceRanges = {
    "0-100": 0,
    "101-200": 0,
    "201-300": 0,
    "301-400": 0,
    "401-500": 0,
    "501-600": 0,
    "601-700": 0,
    "701-800": 0,
    "801-900": 0,
    "901-above": 0,
  };

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $regex: `-${month}-`, $options: "i" },
    });
    transactions.forEach((t) => {
      if (t.price <= 100) priceRanges["0-100"]++;
      else if (t.price <= 200) priceRanges["101-200"]++;
      else if (t.price <= 300) priceRanges["201-300"]++;
      else if (t.price <= 400) priceRanges["301-400"]++;
      else if (t.price <= 500) priceRanges["401-500"]++;
      else if (t.price <= 600) priceRanges["501-600"]++;
      else if (t.price <= 700) priceRanges["601-700"]++;
      else if (t.price <= 800) priceRanges["701-800"]++;
      else if (t.price <= 900) priceRanges["801-900"]++;
      else priceRanges["901-above"]++;
    });
    res.json(priceRanges);
  } catch (err) {
    res.status(500).send("Error fetching bar chart data");
  }
});

// Pie Chart Data
app.get("/pie-chart", async (req, res) => {
  const { month } = req.query;
  try {
    const transactions = await Transaction.find({
      dateOfSale: { $regex: `-${month}-`, $options: "i" },
    });
    const categoryCount = {};
    transactions.forEach((t) => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });
    res.json(categoryCount);
  } catch (err) {
    res.status(500).send("Error fetching pie chart data");
  }
});

// Combined Data
app.get("/combined-data", async (req, res) => {
  const { month } = req.query;
  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      Transaction.find({ dateOfSale: { $regex: `-${month}-`, $options: "i" } }),
      (async () => {
        const transactions = await Transaction.find({
          dateOfSale: { $regex: `-${month}-`, $options: "i" },
        });
        const totalSale = transactions.reduce((sum, t) => sum + t.price, 0);
        const soldItems = transactions.filter((t) => t.sold).length;
        const notSoldItems = transactions.length - soldItems;
        return { totalSale, soldItems, notSoldItems };
      })(),
      (async () => {
        const priceRanges = {
          "0-100": 0,
          "101-200": 0,
          "201-300": 0,
          "301-400": 0,
          "401-500": 0,
          "501-600": 0,
          "601-700": 0,
          "701-800": 0,
          "801-900": 0,
          "901-above": 0,
        };
        const transactions = await Transaction.find({
          dateOfSale: { $regex: `-${month}-`, $options: "i" },
        });
        transactions.forEach((t) => {
          if (t.price <= 100) priceRanges["0-100"]++;
          else if (t.price <= 200) priceRanges["101-200"]++;
          else if (t.price <= 300) priceRanges["201-300"]++;
          else if (t.price <= 400) priceRanges["301-400"]++;
          else if (t.price <= 500) priceRanges["401-500"]++;
          else if (t.price <= 600) priceRanges["501-600"]++;
          else if (t.price <= 700) priceRanges["601-700"]++;
          else if (t.price <= 800) priceRanges["701-800"]++;
          else if (t.price <= 900) priceRanges["801-900"]++;
          else priceRanges["901-above"]++;
        });
        return priceRanges;
      })(),
      (async () => {
        const transactions = await Transaction.find({
          dateOfSale: { $regex: `-${month}-`, $options: "i" },
        });
        const categoryCount = {};
        transactions.forEach((t) => {
          categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
        });
        return categoryCount;
      })(),
    ]);

    res.json({ transactions, statistics, barChart, pieChart });
  } catch (err) {
    res.status(500).send("Error fetching combined data");
  }
});
