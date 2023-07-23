const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        require: true,
        select: false,
    },
    name: {
        type: String,
        require: true,
    },
    avatar: {
        publicId: String,
        url: String,
    },
    bio: {
        type: String,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    followings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'posts',
        }
    ]
}
    , {
        timestamps: true,
    });
module.exports = mongoose.model('user', userSchema);