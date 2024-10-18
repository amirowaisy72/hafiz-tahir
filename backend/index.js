const connecToMongoose = require("./db");
const express = require("express");
const app = express();
connecToMongoose();
var cors = require("cors");

app.use(express.json());
app.use(cors());

//Available Routes
app.use("/accounts", require("./routes/accounts.js"));
app.use("/debitcredit", require("./routes/debitcredit.js"));
app.use("/cashpoints", require("./routes/cashpoints.js"));
app.use("/cashdebitcredit", require("./routes/cashdebitcredit.js"));
app.use("/stock", require("./routes/stock.js"));
app.use("/invoice", require("./routes/invoice.js"));
app.use("/todaytimeline", require("./routes/todaytimeline.js"));
app.use("/expenseFormulas", require("./routes/expenseFormulas.js"));
app.use("/adminRoles", require("./routes/adminRoles.js"));
app.use("/address", require("./routes/address.js"));

app.listen(5000, () => {
  console.log("listening at port 5000");
});

