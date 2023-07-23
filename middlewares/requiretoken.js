const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { error } = require('../Utils/responseWrapper');
const User = require('../Models/User');
dotenv.config('./.env')
module.exports = async (req, res, next) => {
	try {
		if (
			!req.headers ||
			!req.headers.authorization ||
			!req.headers.authorization.startsWith("Bearer")
		) {
			return res.send(error(401, "Authorization header is required!!"))
			// res.status(401).send("Authorization header is required!!");
		}
	} catch (e) {
		console.log(e);
	}

	const accessToken = req.headers.authorization.split(" ")[1];
	try {

		const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_PRIVATE_KEY);
		// console.log(decode)
		// console.log(decode._id);
		req._id = decode._id;
		const user = await User.findById(req._id);
		if (!user) {
			return res.send(error(404, 'User not found'))
		}
		next();
	} catch (e) {
		console.log(e);
		return res.send(error(401, "Invalid Access Key!!"))
		// res.status(401).send("Invalid Access Key!!")
	}

	// console.log("These a access token we get ", accessToken);
	// next();
};
