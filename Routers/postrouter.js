const router = require("express").Router();
const requiretoken = require('../middlewares/requiretoken')
const postcontroller = require('../Controllers/postController');

router.get('/all', requiretoken, postcontroller.getAllPosts);
router.post('/', requiretoken, postcontroller.createPostsController);
router.post('/like', requiretoken, postcontroller.likeandunlikePosts)
router.put('/', requiretoken, postcontroller.updatePostController);
router.delete('/', requiretoken, postcontroller.deletePostController);

module.exports = router;