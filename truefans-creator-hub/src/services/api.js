import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth ---
export async function loginUser(email, password) {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      localStorage.setItem('userId', response.data.data._id || response.data.data.id);
    }
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Login failed' };
  }
}

export async function registerUser(name, email, password) {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      localStorage.setItem('userId', response.data.data._id || response.data.data.id);
    }
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Registration failed' };
  }
}

export async function getProfile() {
  try {
    const response = await api.get('/auth/profile');
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      localStorage.setItem('userId', response.data.data._id || response.data.data.id);
    }
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to fetch profile' };
  }
}

export function logoutUser() {
  localStorage.removeItem('token');
}

// --- Creator / User Settings ---
export async function getCreatorProfile(id) {
  try {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to fetch creator profile' };
  }
}

export async function getUserNetwork(id) {
  try {
    const response = await api.get(`/auth/users/${id}/network`);
    return response.data;
  } catch (error) {
    return { data: { followers: [], following: [], isHidden: true }, success: false, message: 'Failed to fetch network' };
  }
}

export async function updateCreatorProfile(updates) {
  try {
    const response = await api.put('/auth/profile', updates);
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to update profile' };
  }
}

export async function followCreator(creatorId) {
  try {
    const response = await api.post(`/auth/users/${creatorId}/follow`);
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Follow action failed' };
  }
}

export async function getLiveUsers() {
  try {
    const response = await api.get('/auth/live');
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: 'Failed to fetch live users' };
  }
}

// --- Posts ---
export async function getAllPosts() {
  try {
    const response = await api.get('/posts/all');
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: 'Failed to fetch posts' };
  }
}

export async function getCreatorPosts(creatorId) {
  try {
    const response = await api.get(`/posts/user/${creatorId}`);
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: 'Failed to fetch user posts' };
  }
}

export async function createPost(content, file) {
  try {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (file) formData.append('media', file);

    const response = await api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to create post' };
  }
}

export async function likePost(postId) {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to like post' };
  }
}

// --- Reels ---
export async function getAllReels() {
  try {
    const response = await api.get('/reels/all');
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: 'Failed to fetch reels' };
  }
}

export async function getReels() {
  // Alias for backward compatibility if needed, though getAllReels is preferred now
  return getAllReels();
}

export async function createReel(caption, file) {
  try {
    const formData = new FormData();
    if (caption) formData.append('caption', caption);
    if (file) formData.append('video', file);

    const response = await api.post('/reels', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to create reel' };
  }
}

export async function likeReel(reelId) {
  try {
    const response = await api.post(`/reels/${reelId}/like`);
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to like reel' };
  }
}

// --- Tips ---
export async function sendTip(receiverId, amount, message = "") {
  try {
    const response = await api.post('/tips/send', { receiverId, amount, message });
    return response.data;
  } catch (error) {
    return { data: null, success: false, message: error.response?.data?.message || 'Failed to send tip' };
  }
}

export async function getRecentTips(creatorId, personalOnly = false) {
  try {
    const response = await api.get(`/tips/${creatorId}?personalOnly=${personalOnly}`);
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: 'Failed to fetch tips' };
  }
}

export async function searchUsers(query) {
  try {
    const response = await api.get(`/auth/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    return { data: [], success: false, message: error.response?.data?.message || 'Search failed' };
  }
}