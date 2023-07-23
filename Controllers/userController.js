const Posts = require("../Models/Posts");
const User = require("../Models/User");
const { mapPostOutput } = require("../Utils/Utils");
const { error, success } = require("../Utils/responseWrapper");
const cloudinary = require('cloudinary').v2;
const followOrUnfollowController = async (req, res) => {
    try {
        const { userIdToFollow } = req.body;
        const curUserId = req._id;
        const userToFollow = await User.findById(userIdToFollow);
        const curUser = await User.findById(curUserId);
        if (curUserId === userIdToFollow) {
            return res.send(error(409, 'you cannot follow yourself'))
        }
        if (!userToFollow) {
            return res.send(error(404, 'User to follow not found'));
        }
        if (curUser.followings.includes(userIdToFollow)) {
            const followingIndex = curUser.followings.indexOf(userIdToFollow);
            curUser.followings.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(curUserId);
            userToFollow.followers.splice(followerIndex, 1);
        }
        else {
            curUser.followings.push(userIdToFollow);
            userToFollow.followers.push(curUserId);
        }
        await curUser.save();
        await userToFollow.save();
        return res.send(success(200, { user: userToFollow }));

    } catch (e) {
        return res.send(error(500, e.message));
    }

}
const getPostsOfFollowing = async (req, res) => {
    try {
        const curUserId = req._id;
        const curUser = await User.findById(curUserId).populate('followings');

        const fullPosts = await Posts.find({
            'owner': {
                '$in': curUser.followings
            }
        }).populate('owner')
        const posts = fullPosts.map(item => mapPostOutput(item, curUserId)).reverse();
        const followingIds = curUser.followings.map(item => item._id)
        // console.log("followingIds are : ", followingIds);
        followingIds.push(req._id)
        // console.log("again following ids are : ", followingIds);
        const suggesstion = await User.find({
            _id: {
                $nin: followingIds
            }
        })
        // console.log("the new suggesstion are : ", suggesstion);

        return res.send(success(200, { ...curUser._doc, suggesstion, posts }));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const getMyPosts = async (req, res) => {
    try {
        const curUserId = req._id;
        const allUserPosts = await Posts.find({
            owner: curUserId
        }).populate('likes')
        return res.send(success(200, { allUserPosts }))

    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getUserPosts = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.send(error(400, 'User Id is required!!'))
        }
        const allUserPosts = await Posts.find({
            owner: userId
        }).populate('likes')
        return res.send(success(200, { allUserPosts }))

    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const deleteUserController = async (req, res) => {
    try {
        const curUserId = req._id;
        console.log("enter in")
        const curUser = await User.findById(curUserId);
        await Posts.deleteMany({
            owner: curUserId
        })
        //delete myself from followings of my followers
        curUser.followers.forEach(async followerId => {
            const followerUser = await User.findById(followerId);
            const index = followerUser.followings.indexOf(curUserId);
            followerUser.followings.splice(index, 1);
            await followerUser.save();
        })
        //delete myself from followers of my followings
        curUser.followings.forEach(async followingId => {
            const followingUser = await User.findById(followingId);
            const index = followingUser.followers.indexOf(curUserId);
            followingUser.followers.splice(index, 1);
            await followingUser.save();
        })
        //removing my self from likes to those posts which i liked
        const allPosts = await Posts.find();
        allPosts.forEach(async post => {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);
            await post.save();
        })

        await curUser.deleteOne();
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
        })
        console.log("done");
        return res.send(success(200, 'User Deleted'));
    } catch (e) {
        return res.send(error(500, e.message));
    }
}

const getMyInfo = async (req, res) => {
    try {
        const user = await User.findById(req._id);
        res.send(success(200, { user }))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const updateUserProfile = async (req, res) => {
    try {
        const { name, bio, userImg } = req.body;
        const user = await User.findById(req._id);
        if (name) {
            user.name = name;
        }
        if (bio) {
            user.bio = bio;
        }

        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: 'profileImg'
            })
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id
            }
        }
        await user.save();
        return res.send(success(200, { user }))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'
            }
        });
        // console.log("seeing the user posts in controller ", user.posts);
        const fullPosts = user.posts;
        const posts = fullPosts.map(item => mapPostOutput(item, userId)).reverse();
        return res.send(success(200, { ...user._doc, posts }))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
module.exports = {
    followOrUnfollowController,
    getPostsOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteUserController,
    getMyInfo,
    updateUserProfile,
    getUserProfile,
}