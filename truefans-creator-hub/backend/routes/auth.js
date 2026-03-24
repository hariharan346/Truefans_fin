const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please add all fields' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    if (user) {
      res.status(201).json({
        success: true,
        message: 'Account created!',
        data: {
          _id: user.id, name: user.name, email: user.email, profileImage: user.profileImage, bio: user.bio,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user.id, name: user.name, email: user.email, profileImage: user.profileImage, bio: user.bio,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get own profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, message: 'Profile fetched', data: req.user });
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, profileImage, banner } = req.body;
    const user = await User.findById(req.user._id);

    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (banner !== undefined) user.banner = banner;

    await user.save();
    res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update settings
router.put('/settings', protect, async (req, res) => {
  try {
    const { accountType, showFollowersList, showTipsPublic, isLive } = req.body;
    const user = await User.findById(req.user._id);

    if (accountType) user.accountType = accountType;
    if (showFollowersList !== undefined) user.showFollowersList = showFollowersList;
    if (showTipsPublic !== undefined) user.showTipsPublic = showTipsPublic;
    if (isLive !== undefined) user.isLive = isLive;

    await user.save();
    res.json({ success: true, message: 'Settings updated', data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get Live users (Only return live users the current user follows)
router.get('/live', protect, async (req, res) => {
  try {
    const liveUsers = await User.find({ 
      isLive: true,
      followers: req.user._id // Must be a follower to see them live
    }).select('name profileImage email bio');
    
    res.json({ success: true, message: 'Live users fetched', data: liveUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Search Users
router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const regex = new RegExp(q, 'i');
    const users = await User.find({ 
      $and: [
        { _id: { $ne: req.user._id } },
        { $or: [{ name: regex }, { email: regex }] }
      ]
    })
    .select('name profileImage email accountType followers followRequests')
    .limit(20);

    const currentUserId = req.user._id.toString();

    const mappedUsers = users.map(user => {
      const u = user.toObject();
      return {
        ...u,
        isFollowing: u.followers.some(id => id.toString() === currentUserId),
        hasSentRequest: u.followRequests?.some(id => id.toString() === currentUserId) || false,
        followersCount: u.followers.length
      };
    });

    res.json({ success: true, message: 'Search results', data: mappedUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user profile by ID (Public / Privacy Aware)
router.get('/users/:id', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const isSelf = req.user._id.toString() === targetUser._id.toString();
    const isFollowing = targetUser.followers.includes(req.user._id);
    const isPublic = targetUser.accountType === 'public';

    if (!isSelf && !isPublic && !isFollowing) {
      // Return limited profile
      return res.json({
        success: true,
        message: 'Account is private',
        data: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          profileImage: targetUser.profileImage,
          banner: targetUser.banner,
          accountType: targetUser.accountType,
          isFollowing: false,
          followersCount: targetUser.followers.length,
          followingCount: targetUser.following.length,
          isPrivateVisible: false,
          hasSentRequest: targetUser.followRequests.includes(req.user._id)
        }
      });
    }

    // Return full profile
    res.json({
      success: true,
      message: 'Profile fetched',
      data: {
        ...targetUser.toObject(),
        isFollowing,
        isPrivateVisible: true,
        followersCount: targetUser.followers.length,
        followingCount: targetUser.following.length,
        hasSentRequest: targetUser.followRequests.includes(req.user._id)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Follow / Unfollow / Request logic
router.post('/users/:id/follow', protect, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    const currentIdStr = currentUser._id.toString();
    const isFollowing = targetUser.followers.some(id => id.toString() === currentIdStr);
    const hasRequested = targetUser.followRequests.some(id => id.toString() === currentIdStr);

    // Unfollow or Cancel Request
    if (isFollowing) {
      targetUser.followers.pull(currentUser._id);
      currentUser.following.pull(targetUser._id);
      await targetUser.save();
      await currentUser.save();
      return res.json({ success: true, message: 'Unfollowed user', data: { isFollowing: false, status: 'unfollowed' } });
    } else if (hasRequested) {
      targetUser.followRequests.pull(currentUser._id);
      await targetUser.save();
      return res.json({ success: true, message: 'Follow request cancelled', data: { isFollowing: false, status: 'cancelled' } });
    }

    // Follow or Send Request
    if (targetUser.accountType === 'private') {
      targetUser.followRequests.push(currentUser._id);
      await targetUser.save();
      return res.json({ success: true, message: 'Follow request sent', data: { isFollowing: false, status: 'requested' } });
    } else {
      targetUser.followers.push(currentUser._id);
      currentUser.following.push(targetUser._id);
      await targetUser.save();
      await currentUser.save();
      return res.json({ success: true, message: 'Started following', data: { isFollowing: true, status: 'following' } });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user profile network (followers and following populated lists)
router.get('/users/:id/network', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name profileImage email accountType followers followRequests')
      .populate('following', 'name profileImage email accountType followers followRequests');
      
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const isSelf = req.user._id.toString() === user._id.toString();
    const isFollowing = user.followers.some(f => f._id.toString() === req.user._id.toString());
    
    // Privacy checks
    if (!isSelf && !user.showFollowersList) {
       return res.json({ success: true, message: 'Network hidden', data: { followers: [], following: [], isHidden: true }});
    }
    if (!isSelf && user.accountType === 'private' && !isFollowing) {
       return res.json({ success: true, message: 'Account is private', data: { followers: [], following: [], isHidden: true }});
    }

    const currentUserId = req.user._id.toString();
    const mapUser = (u) => {
      const obj = u.toObject();
      return {
        ...obj,
        isFollowing: obj.followers?.some(id => id.toString() === currentUserId),
        followersCount: obj.followers?.length || 0,
        hasSentRequest: obj.followRequests?.some(id => id.toString() === currentUserId) || false
      };
    };

    res.json({ 
      success: true, 
      message: 'Network fetched', 
      data: {
        followers: user.followers.filter(u => u != null).map(mapUser),
        following: user.following.filter(u => u != null).map(mapUser),
        isHidden: false
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
