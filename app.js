const express = require("express");
const dotenv = require("dotenv");
const schoolRoutes = require("./routes/schoolRoutes");

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", schoolRoutes);
app.get("/",(req,res)=>{
  res.send({
    message:"app is hosted successfully"
  })
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

