const mongoose = require("mongoose");
const mongooseuri =
	"mongodb+srv://pp150549:K2DhuPQtCFvXxVyv@cluster0.yy1qhxs.mongodb.net/?retryWrites=true&w=majority";
module.exports = () => {
	try {
		mongoose.connect(mongooseuri,
			{
				// useNewUrlParser: true,
				// useUnifiedTopology: true,
			},
		).then(console.log("MongoDB Connected"));
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};
