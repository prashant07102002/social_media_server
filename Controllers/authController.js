const user = require('../Models/User');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { error, success } = require('../Utils/responseWrapper');

const signupController = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.send(error(400, "Either name or email or password missing!!"))
            return;
        }
        const existing_user = await user.findOne({ email });
        if (existing_user) {
            res.send(error(409, "User already exist!!"))
            // res.status(409).send("User already exist!!")
            return;
        }
        const hashedpassword = await bcrypt.hash(password, 10);
        const User = await user.create({
            name,
            email,
            password: hashedpassword,
        })
        await User.save();

        // return res.status(201).json({
        //     User,
        // })
        return res.send(success(201, "User created successfully"))
    } catch (e) {
        res.send(error(500, e.message));
    }
}
const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.send(error(400, "Either email or password missing!!"))
            // res.status(400).send("Either email or password missing!!");
            return;
        }
        const existing_user = await user.findOne({ email }).select('+password');
        if (!existing_user) {
            res.send(error(409, "User doesn't exist!!"))
            // res.status(404).send("User doesn't exists!!")
            return;
        }
        const matched = await bcrypt.compare(password, existing_user.password);
        if (!matched) {
            res.send(error(203, "Incorrect email Id or password!!"))
            // res.status(203).send("Incorrect email Id or password!!")
        }
        const accessToken = generateAccessToken({
            _id: existing_user._id,
        })
        const refreshToken = generaterefreshAccessToken({
            _id: existing_user._id,
        })
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
        })
        // return res.json({ accessToken });
        return res.send(success(200, {
            accessToken
        }))
    } catch (e) {
        console.log(e);
    }
}
const logoutController = async (req, res) => {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        })
        return res.send(success(200, 'User logged Out'))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const generateAccessTokenController = async (req, res) => {
    // console.log('hello requset is', req)
    const cookies = req.cookies;
    // console.log("the cookie is ", cookies)
    // console.log(cookies.jwt);
    if (!cookies.jwt) {
        res.send(error(401, "Refresh token in cookie is required!!"))
        // res.status(401).send("Refresh token in cookie is required!!")
    }
    const refreshToken = cookies.jwt;
    // console.log("the refresh token is", refreshToken)

    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_ACCESS_TOKEN_PRIVATE_KEY);
        const _id = decode._id;
        const accessToken = generateAccessToken({ _id });
        // res.status(201).json({ accessToken });
        res.send(success(201, {
            accessToken
        }))
    } catch (e) {
        console.log(e);

        return res.send(error(401, "Invalid Refresh Access Key!!"))
        // res.status(401).send("Invalid Refresh Access Key!!")
    }

}

const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: '1y',
        });
        return token;
    } catch (e) {
        console.log(e);
    }
}
const generaterefreshAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_ACCESS_TOKEN_PRIVATE_KEY, {
            expiresIn: '1y',
        });
        return token;
    } catch (e) {
        console.log(e);
    }
}
module.exports = {
    signupController, loginController, generateAccessTokenController, logoutController
}