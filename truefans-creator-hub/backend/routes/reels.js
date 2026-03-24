const express = require('express');
const router = express.Router();
const Reel = require('../models/Reel');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all reels (latest first)
router.get('/all', async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, message: 'Reels fetched', data: reels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create reel
router.post('/', protect, upload.single('video'), async (req, res) => {
  try {
    const { caption } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video file is required for reels' });
    }

    let videoUrl = '';
    if (req.file.path.includes('cloudinary')) {
      videoUrl = req.file.path;
    } else {
      videoUrl = `/uploads/${req.file.filename}`;
    }

    const reel = await Reel.create({
      user: req.user._id,
      caption,
      videoUrl,
    });

    const populatedReel = await Reel.findById(reel._id).populate('user', 'name profileImage');
    res.status(201).json({ success: true, message: 'Reel created', data: populatedReel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle Reel Like
router.post('/:reelId/like', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const currentUserId = req.user._id.toString();
    const isLiked = reel.likes.some(id => id.toString() === currentUserId);

    if (isLiked) {
      // Unlike
      reel.likes = reel.likes.filter((id) => id.toString() !== currentUserId);
    } else {
      // Like
      reel.likes.push(req.user._id);
    }

    await reel.save();
    
    // Return updated populated likes
    const updatedReel = await Reel.findById(reel._id).populate('user', 'name profileImage');

    res.json({ 
      success: true, 
      message: isLiked ? 'Reel unliked' : 'Reel liked', 
      data: { isLiked: !isLiked, likes: updatedReel.likes } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
