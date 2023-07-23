const mongoose = require("mongoose");
const mongooseuri = process.env.MONGOOSE_URL;
module.exports = () => {
	try {
		mongoose.connect(mongooseuri,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		).then(console.log("MongoDB Connected"));
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
