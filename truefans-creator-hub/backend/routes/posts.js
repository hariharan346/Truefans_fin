const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all posts (latest first)
router.get('/all', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name profileImage email accountType')
      .populate('likes', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, message: 'Posts fetched', data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create post
router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    const { content } = req.body;
    let mediaUrl = '';
    let mediaType = '';

    if (req.file) {
      if (req.file.path.includes('cloudinary')) {
        mediaUrl = req.file.path;
      } else {
        mediaUrl = `/uploads/${req.file.filename}`;
      }
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      mediaUrl,
      mediaType,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage currentAccountType')
      .populate('likes', 'name profileImage');
    res.status(201).json({ success: true, message: 'Post created', data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get posts for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name profileImage')
      .populate('likes', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, message: 'User posts fetched', data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle Post Like
router.post('/:postId/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const currentUserId = req.user._id.toString();
    const isLiked = post.likes.some(id => id.toString() === currentUserId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== currentUserId);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    
    // Return updated populated likes
    const updatedPost = await Post.findById(post._id).populate('likes', 'name profileImage');

    res.json({ 
      success: true, 
      message: isLiked ? 'Post unliked' : 'Post liked', 
      data: { isLiked: !isLiked, likes: updatedPost.likes } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
