const express = require('express');
const router = express.Router();
const Tip = require('../models/Tip');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Send a tip
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, amount, message } = req.body;
    
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ success: false, message: 'You cannot tip yourself' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid tip amount' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found' });
    }

    const tip = await Tip.create({
      sender: req.user._id,
      receiver: receiverId,
      amount,
      message
    });

    res.status(201).json({ success: true, message: 'Tip sent successfully!', data: tip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get tips for a specific user
router.get('/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isSelf = req.user._id.toString() === targetUser._id.toString();
    const personalOnly = req.query.personalOnly === 'true';

    // Fetch all tips for the user
    // We populate sender to do filtering
    const allTips = await Tip.find({ receiver: req.params.userId })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 });

    const totalAmount = allTips.reduce((sum, tip) => sum + tip.amount, 0);

    // Filter visible tips
    const visibleTips = allTips.filter(tip => {
      const isSender = tip.sender && tip.sender._id.toString() === req.user._id.toString();
      
      // If personalOnly is requested (for TipModal), show only the tips sent by the logged-in user
      if (personalOnly) {
        return isSender;
      }
      
      // If not personalOnly (for Profile tab):
      // Creator sees all tips
      if (isSelf) return true;
      // Sender always sees their own tips, even if others are hidden
      if (isSender) return true;
      // If creator made tips public, everyone sees all tips
      if (targetUser.showTipsPublic) return true;
      
      return false; // hide other tips
    });

    const supporters = visibleTips.map(t => ({
      _id: t._id,
      senderId: {
        _id: t.sender?._id,
        username: t.sender?.name,
        profileImage: t.sender?.profileImage
      },
      amount: t.amount,
      createdAt: t.createdAt
    }));

    res.json({
      success: true,
      message: 'Tips fetched',
      data: {
        totalAmount,
        supporters
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
