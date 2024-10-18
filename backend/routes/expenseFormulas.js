const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Expense = require("../models/Expense");

const app = express();
// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// POST endpoint to save expense data
router.post("/create", async (req, res) => {
  try {
    // Assuming req.body contains the data you want to save
    const expenseData = new Expense(req.body);
    const savedExpense = await expenseData.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT endpoint to update expense data for the first document
router.put("/update", async (req, res) => {
  try {
    // Assuming req.body contains the updated data
    const updatedExpenseData = req.body;

    // Find the first document in the Expense collection
    const expenseToUpdate = await Expense.findOne();

    if (!expenseToUpdate) {
      return res.status(404).json({ error: "Expense document not found" });
    }

    // Update the document with the new data
    expenseToUpdate.set(updatedExpenseData);
    const savedExpense = await expenseToUpdate.save();

    res.status(200).json(savedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Define the route to fetch the first Expense document
router.get("/read", async (req, res) => {
  try {
    const expense = await Expense.findOne();

    // Check if a document exists
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    // If a document exists, send it as a response
    res.status(200).json(expense);
  } catch (error) {
    // Handle any errors that occur during the query or processing
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
