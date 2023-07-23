const router = require("express").Router();
const requiretoken = require('../middlewares/requiretoken');
const userController = require('../Controllers/userController')

router.post('/follow', requiretoken, userController.followOrUnfollowController)
router.get('/getFeedData', requiretoken, userController.getPostsOfFollowing)
router.get('/getMyPosts', requiretoken, userController.getMyPosts)
router.get('/getUserPosts', requiretoken, userController.getUserPosts);
router.delete('/', requiretoken, userController.deleteUserController);
router.get('/getMyInfo', requiretoken, userController.getMyInfo);
router.put('/', requiretoken, userController.updateUserProfile);
router.post('/getUserProfile', requiretoken, userController.getUserProfile);
module.exports = router;