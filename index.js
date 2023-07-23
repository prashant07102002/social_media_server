const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require('cors');
// const bodyParser = require('body-parser');
// const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '100mb' }));
dotenv.config("./.env");
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUNDINARY_API_SECRET
});
const dbConnect = require("./dbConnect");
const authrouter = require("./Routers/authrouter")
const postrouter = require("./Routers/postrouter")
const userrouter = require("./Routers/userrouter")
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(morgan('common'));
app.use(cookieParser());
app.use(cors({
	credentials: true,
	origin: process.env.CORS_ORIGIN,
}))

app.use("/auth", authrouter);
app.use("/posts", postrouter);
app.use("/user", userrouter);

app.get("/", (req, res) => {
	res.status(200).send("Ok from server");
});

dbConnect();
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
	console.log("Listening to Port ", PORT);
});

