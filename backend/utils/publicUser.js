module.exports = function publicUser(user) {
  if (!user) return null;

  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio || "",
    avatar: user.avatar || "",
    location: user.location || "",
    department: user.department || "",
    faculty: user.faculty || "",
    matricNumber: user.matricNumber || "",
    website: user.website || "",
    interests: user.interests || [],
    role: user.role,
    followersCount: user.followers?.length || 0,
    followingCount: user.following?.length || 0,
    createdAt: user.createdAt
  };
};
