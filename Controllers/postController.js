const cloudinary = require('cloudinary').v2;
const Posts = require("../Models/Posts");
const User = require("../Models/User");
const { mapPostOutput } = require('../Utils/Utils');
const { success, error } = require("../Utils/responseWrapper");


const getAllPosts = async (req, res) => {
    try {
        console.log(req._id);
        return res.send(success(200, 'These are all posts'))
    } catch (e) {
        console.log(error(500, 'cannot get the posts ', e));
    }
}
const createPostsController = async (req, res) => {
    try {
        const { caption, postImg } = req.body;
        if (!caption || !postImg) {
            return res.send(error(400, 'Caption and Post image are required!!'))
        }
        const cloudImg = await cloudinary.uploader.upload(postImg, {
            folder: 'postImg'
        })
        const owner = req._id;
        const user = await User.findById(req._id);
        const post = await Posts.create({
            owner,
            caption,
            image: {
                publicId: cloudImg.public_id,
                url: cloudImg.secure_url,
            },
        })
        user.posts.push(post._id);
        await user.save();
        return res.json(success(200, { post }))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const likeandunlikePosts = async (req, res) => {
    try {
        const { postId } = req.body;
        const curUserId = req._id;
        const post = await Posts.findById(postId).populate('owner');
        console.log(post);
        if (!post) {
            return res.send(error(404, 'Post Not Found!!'))
        }
        if (post.likes.includes(curUserId)) {
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index, 1);

        }
        else {
            post.likes.push(curUserId);
        }
        await post.save();
        return res.send(success(200, { post: mapPostOutput(post, req._id) }))


    } catch (e) {
        return res.send(error(500, e.message));
    }
}
const updatePostController = async (req, res) => {
    try {
        const { postId, caption } = req.body;
        const curUserId = req._id;
        const post = await Posts.findById(postId);
        if (!post) {
            return res.send(error(404, "Post not found!!"))
        }
        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, "Only owner can update the post"))
        }
        if (caption) {
            post.caption = caption;
        }
        await post.save();
        return res.send(success(201, { post }));
    } catch (e) {
        return res.send(error(500, e.message));
    }

}
const deletePostController = async (req, res) => {
    try {
        const { postId } = req.body;
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);
        // console.log('curr user is ', curUser);
        const post = await Posts.findById(postId);
        // console.log('the post is ', post)
        if (!post) {
            return res.send(error(404, "Post not found!!"))
        }
        if (post.owner.toString() !== curUserId) {
            return res.send(error(403, "Only owner can update the post"))
        }
        const index = await curUser.posts.indexOf(postId);
        curUser.posts.splice(index, 1);
        await curUser.save();
        await post.deleteOne();
        return res.send(success(200, 'Post deleted successfully'))
    } catch (e) {
        return res.send(error(500, e.message));
    }
}
module.exports = {
    getAllPosts,
    createPostsController,
    likeandunlikePosts,
    updatePostController,
    deletePostController,
}