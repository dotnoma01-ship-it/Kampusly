import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import {
  Home,
  Newspaper,
  Plus,
  MessageCircle,
  UserRound,
  Search,
  Utensils,
  ShoppingBag,
  Shirt,
  ShoppingBasket,
  ArrowUpRight,
  Bell,
  Clock3,
  Heart,
  MessageSquare,
  Bookmark,
  MoreHorizontal,
  Flag,
  ExternalLink,
  Trash2,
  Copy,
  Sparkles,
  Wallet,
  Package,
  ChevronRight,
  GraduationCap,
  X,
  RefreshCw,
  AlertCircle,
  ImagePlus,
} from "lucide-react";
import { apiRequest } from "../../lib/api";
import "./Dashboard.css";

const services = [
  {
    name: "Food & meals",
    description: "Discover meals around campus",
    icon: Utensils,
    color: "food",
  },
  {
    name: "Marketplace",
    description: "Buy and resell used products",
    icon: ShoppingBag,
    color: "market",
  },
  {
    name: "Laundry",
    description: "Find laundry services",
    icon: Shirt,
    color: "laundry",
  },
  {
    name: "Groceries",
    description: "Get your everyday essentials",
    icon: ShoppingBasket,
    color: "grocery",
  },
];

const initialActivity = [
  {
    id: 1,
    title: "Explore campus services",
    detail: "Discover food, laundry, groceries, and more.",
    icon: ShoppingBag,
  },
  {
    id: 2,
    title: "Join the conversation",
    detail: "See what other students are talking about.",
    icon: MessageCircle,
  },
];

function getStudentProfile() {
  let profile = {};

  try {
    const savedProfile = localStorage.getItem("kampuslyUser");

    if (savedProfile) {
      profile = JSON.parse(savedProfile);
    }

    if (!profile.name) {
      const oldProfile = localStorage.getItem("kampuslyProfile");

      if (oldProfile) {
        profile = { ...profile, ...JSON.parse(oldProfile) };
      }
    }
  } catch (error) {
    console.error("Could not read the saved Kampusly profile:", error);
  }

  return {
    ...profile,
    name:
      typeof profile.name === "string" && profile.name.trim()
        ? profile.name.trim()
        : localStorage.getItem("kampuslyName") || "Student",
    avatar:
      profile.avatar ||
      localStorage.getItem("kampuslyAvatar") ||
      "",
  };
}

function getInitials(name = "Student") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "S"
  );
}

function formatName(fullName = "") {
  return fullName.trim().split(/\s+/)[0] || "Student";
}

function formatPostTime(dateString) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Recently";

  const difference = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

function getPostImageUrl(image) {
  if (!image) return "";
  if (/^https?:\/\//i.test(image)) return image;

  const apiOrigin = (
    import.meta.env.VITE_API_URL || "http://localhost:5001/api"
  ).replace(/\/api\/?$/, "");

  return `${apiOrigin}${image.startsWith("/") ? "" : "/"}${image}`;
}
function formatBackendPost(post) {
  const author =
    post.author && typeof post.author === "object"
      ? post.author
      : {};

  const authorName = author.name || "Kampusly Student";

  const likes = Array.isArray(post.likes)
    ? post.likes
    : [];

  const comments = Array.isArray(post.comments)
    ? post.comments
    : [];

  return {
    id: post._id,
    name: authorName,
    initials: getInitials(authorName),
    avatar: author.avatar || "",
    time: formatPostTime(post.createdAt),
    category: post.category || "Campus life",
    text: post.text || "",
    images: Array.isArray(post.images) ? post.images : [],
    likes: typeof post.likesCount === "number"
      ? post.likesCount
      : likes.length,
    comments: typeof post.commentsCount === "number"
      ? post.commentsCount
      : comments.length,
    likedByMe: Boolean(post.likedByMe),
    savedByMe: Boolean(post.savedByMe),
    raw: post,
  };
}

function StudentAvatar({
  name,
  avatar,
  className = "",
  imageClassName = "",
}) {
  const [failedAvatar, setFailedAvatar] = useState("");

  if (avatar && failedAvatar !== avatar) {
    return (
      <img
        src={avatar}
        alt={`${name}'s profile`}
        className={`${className} ${imageClassName}`.trim()}
        onError={() => setFailedAvatar(avatar)}
      />
    );
  }

  return (
    <span
      className={className}
      role="img"
      aria-label={`${name}'s initials`}
    >
      {getInitials(name)}
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePage, setActivePage] = useState(() =>
    location.pathname === "/student/feed" ? "Campus Feed" : "Home"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const imageInputRef = useRef(null);
  const [notice, setNotice] = useState("");
  const [studentProfile, setStudentProfile] = useState(getStudentProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [likingPosts, setLikingPosts] = useState([]);
  const [openComments, setOpenComments] = useState([]);
const [commentInputs, setCommentInputs] = useState({});
const [submittingComments, setSubmittingComments] = useState([]);
  const [openPostMenu, setOpenPostMenu] = useState(null);
  const [reportPost, setReportPost] = useState(null);
  const [reportReason, setReportReason] = useState("inappropriate");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [deletePost, setDeletePost] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const postMenuRef = useRef(null);

  const studentName = formatName(studentProfile.name);
  const studentAvatar = studentProfile.avatar;
  const currentPath = location.pathname;

  const isWalletPage = currentPath.startsWith("/student/wallet");
  const isOrdersPage = currentPath === "/student/orders";

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");

    const token =
      localStorage.getItem("kampuslyToken") ||
      localStorage.getItem("token");

    if (!token) {
      setProfileLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await apiRequest("/auth/me");

      const user =
        response.user ||
        response.data?.user ||
        response.data ||
        null;

      if (!user) {
        throw new Error("The server did not return your account information.");
      }

      setStudentProfile((current) => ({
        ...current,
        ...user,
        name: user.name || current.name || "Student",
        avatar: user.avatar || current.avatar || "",
      }));

      localStorage.setItem("kampuslyUser", JSON.stringify(user));
    } catch (error) {
      setProfileError(
        error.message || "We could not load your account information."
      );
    } finally {
      setProfileLoading(false);
    }
  }, [navigate]);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError("");

    try {
      const response = await apiRequest("/posts?page=1&limit=20");

      if (!Array.isArray(response.posts)) {
        throw new Error("The server returned an unexpected posts response.");
      }

      const formattedPosts = response.posts.map(formatBackendPost);

      setPosts(formattedPosts);

      setLikedPosts(
        formattedPosts
          .filter((post) => post.likedByMe)
          .map((post) => post.id)
      );
      setSavedPosts(formattedPosts.filter((post) => post.savedByMe).map((post) => post.id));
    } catch (error) {
      setPostsError(
        error.message || "Unable to load campus posts. Please try again."
      );
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadProfile();
      loadPosts();
    });
  }, [loadProfile, loadPosts]);

  useEffect(() => {
    const syncProfile = () => {
      setStudentProfile((current) => ({
        ...current,
        ...getStudentProfile(),
      }));
    };

    window.addEventListener("focus", syncProfile);
    window.addEventListener("storage", syncProfile);

    return () => {
      window.removeEventListener("focus", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => navigate("/login", { replace: true });
    window.addEventListener("kampusly:session-expired", handleExpiredSession);
    return () => window.removeEventListener("kampusly:session-expired", handleExpiredSession);
  }, [navigate]);

  useEffect(() => {
    if (!openPostMenu) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!postMenuRef.current?.contains(event.target)) {
        setOpenPostMenu(null);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpenPostMenu(null);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openPostMenu]);

  function navigateTo(page) {
    setNotice("");

    const routes = {
      Home: "/student/dashboard",
      "Campus Feed": "/student/feed",
      Messages: "/student/messages",
      Profile: "/student/profile",
      Wallet: "/student/wallet",
      "My Orders": "/student/orders",
      Notifications: "/student/notifications",
      Services: "/student/services",
    };

    if (routes[page]) {
      navigate(routes[page]);
      return;
    }

    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleLike(postId) {
    const post = posts.find(
      (item) => String(item.id) === String(postId)
    );

    if (!post || !post.id || likingPosts.includes(postId)) return;

    setLikingPosts((current) => [...current, postId]);

    try {
      const response = await apiRequest(
        `/posts/${postId}/like`,
        { method: "POST" }
      );

      setLikedPosts((current) => {
        const withoutPost = current.filter(
          (id) => String(id) !== String(postId)
        );

        return response.liked
          ? [...withoutPost, postId]
          : withoutPost;
      });

      if (typeof response.likesCount === "number") {
        setPosts((current) =>
          current.map((item) =>
            String(item.id) === String(postId)
              ? { ...item, likes: response.likesCount }
              : item
          )
        );
      } else {
        await loadPosts();
      }
    } catch (error) {
      setNotice(error.message || "Could not update your like.");
    } finally {
      setLikingPosts((current) =>
        current.filter((id) => String(id) !== String(postId))
      );
    }
  }

async function submitComment(postId) {
const text = (commentInputs[postId] || "").trim();


if (!text) {
  setNotice("Please write a comment before submitting.");
  return;
}

if (text.length > 1000) {
  setNotice("Your comment cannot exceed 1000 characters.");
  return;
}

if (submittingComments.includes(postId)) {
  return;
}

setSubmittingComments((current) =>
  current.includes(postId) ? current : [...current, postId]
);

try {
  const response = await apiRequest(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

  if (Array.isArray(response.comments)) {
    setPosts((current) =>
      current.map((post) => {
        if (String(post.id) !== String(postId)) {
          return post;
        }

        return {
          ...post,
          comments: response.comments.length,
          raw: {
            ...(post.raw || {}),
            comments: response.comments,
          },
        };
      })
    );
  } else {
    await loadPosts();
  }

  setCommentInputs((current) => ({
    ...current,
    [postId]: "",
  }));

  setOpenComments((current) =>
    current.includes(postId) ? current : [...current, postId]
  );

  setNotice("Your comment was added successfully.");
} catch (error) {
  setNotice(
    error.message || "Could not submit your comment. Please try again."
  );
} finally {
  setSubmittingComments((current) =>
    current.filter((id) => String(id) !== String(postId))
  );
}

}

  async function toggleSave(postId) {
    try {
      const response = await apiRequest(`/posts/${postId}/save`, { method: "POST" });
      setSavedPosts((current) => response.saved
        ? [...current.filter((id) => String(id) !== String(postId)), postId]
        : current.filter((id) => String(id) !== String(postId)));
      setNotice(response.saved ? "Post saved." : "Post removed from saved posts.");
    } catch (error) {
      setNotice(error.message || "Could not update this saved post.");
    }
  }

  async function submitPostReport(event) {
    event.preventDefault();
    if (!reportPost || reportSubmitting) return;

    setReportSubmitting(true);
    try {
      const response = await apiRequest(`/posts/${reportPost.id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: reportReason, details: reportDetails.trim() }),
      });
      setReportPost(null);
      setReportDetails("");
      setNotice(response.message || "Your report was submitted for review.");
    } catch (error) {
      setNotice(error.message || "Could not submit this report.");
    } finally {
      setReportSubmitting(false);
    }
  }

  async function confirmDeletePost() {
    if (!deletePost || deleteSubmitting) return;

    setDeleteSubmitting(true);
    try {
      await apiRequest(`/posts/${deletePost.id}`, { method: "DELETE" });
      setPosts((current) => current.filter((post) => String(post.id) !== String(deletePost.id)));
      setLikedPosts((current) => current.filter((id) => String(id) !== String(deletePost.id)));
      setSavedPosts((current) => current.filter((id) => String(id) !== String(deletePost.id)));
      setDeletePost(null);
      setNotice("Post deleted.");
    } catch (error) {
      setNotice(error.message || "Could not delete this post.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  async function copyPostLink(postId) {
    const postUrl = new URL("/student/feed", window.location.origin);
    postUrl.hash = `post-${postId}`;

    try {
      await navigator.clipboard.writeText(postUrl.toString());
      setNotice("Post link copied.");
    } catch {
      setNotice("Could not copy the post link. Check clipboard permissions and try again.");
    }
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const remainingSlots = 4 - selectedImages.length;

    if (remainingSlots <= 0) {
      setNotice("You can upload a maximum of four images.");
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setNotice("Only JPG, PNG, and WEBP images are allowed.");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setNotice(`${file.name} exceeds the 5 MB image limit.`);
        continue;
      }

      validFiles.push(file);
    }

    const acceptedFiles = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      setNotice("Only four images can be added to one post.");
    }

    setSelectedImages((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  }

  function removeSelectedImage(index) {
    setSelectedImages((current) => {
      const imageToRemove = current[index];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }
  async function submitPost(event) {
    event.preventDefault();

    const text = newPost.trim();

    if (!text && selectedImages.length === 0) {
      setNotice("Write something or add an image before publishing your post.");
      return;
    }

    if (text.length > 3000) {
      setNotice("Your post cannot exceed 3,000 characters.");
      return;
    }

    if (publishing) return;

    setPublishing(true);
    setNotice("");

    try {
      let uploadedImages = [];

      if (selectedImages.length > 0) {
        const formData = new FormData();

        selectedImages.forEach(({ file }) => {
          formData.append("images", file);
        });

        const uploadResponse = await apiRequest("/posts/upload", {
          method: "POST",
          body: formData,
        });

        uploadedImages = uploadResponse.images || [];
      }

      const response = await apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify({
          text,
          category: "general",
          images: uploadedImages,
        }),
      });

      if (!response.post) {
        throw new Error("The server did not return your published post.");
      }

      const publishedPost = formatBackendPost(response.post);

      setPosts((current) => [publishedPost, ...current]);
      setNewPost("");
      setShowCreatePost(false);
      setActivePage("Campus Feed");
      setNotice("Your post has been published successfully.");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setNotice(error.message || "Your post could not be published.");
    } finally {
      setPublishing(false);
    }
  }

  const visiblePosts = posts.filter((post) => {
    const query = searchQuery.trim().toLowerCase();

    return (
      !query ||
      post.text.toLowerCase().includes(query) ||
      post.name.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    );
  });

  function renderPost(post) {
    const isLiked = likedPosts.some(
      (id) => String(id) === String(post.id)
    );

    const isSaved = savedPosts.includes(post.id);
    const isLiking = likingPosts.includes(post.id);

    return (
      <article className="ks-post-card" id={`post-${post.id}`} key={post.id}>
        <div className="ks-post-header">
          <StudentAvatar
            name={post.name}
            avatar={post.avatar}
            className="ks-avatar ks-post-avatar"
          />

          <div className="ks-post-author">
            {post.raw?.author?._id ? <button type="button" className="ks-post-author-link" onClick={() => navigate(`/student/users/${post.raw.author._id}`)}>{post.name}</button> : <strong>{post.name}</strong>}
            <span>
              <Clock3 size={13} /> {post.time}
            </span>
          </div>

          <button
            className="ks-icon-button ks-post-more"
            type="button"
            aria-label="Post options"
            aria-haspopup="menu"
            aria-expanded={openPostMenu === post.id}
            onClick={(event) => {
              event.stopPropagation();
              setOpenPostMenu((current) => current === post.id ? null : post.id);
            }}
          >
            <MoreHorizontal size={20} />
          </button>
          {openPostMenu === post.id && (
            <div
              ref={postMenuRef}
              className="ks-post-menu"
              role="menu"
              onClick={(event) => event.stopPropagation()}
            >
              {post.raw?.author?._id && (
                <button type="button" role="menuitem" onClick={() => {
                  setOpenPostMenu(null);
                  navigate(`/student/users/${post.raw.author._id}`);
                }}>
                  <ExternalLink size={16} /> View Profile
                </button>
              )}
              <button type="button" role="menuitem" onClick={() => {
                setOpenPostMenu(null);
                toggleSave(post.id);
              }}>
                <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Unsave Post" : "Save Post"}
              </button>
              <button type="button" role="menuitem" onClick={() => {
                setOpenPostMenu(null);
                copyPostLink(post.id);
              }}>
                <Copy size={16} /> Copy Post Link
              </button>
              {post.raw?.author?._id && String(post.raw.author._id) !== String(studentProfile.id) && (
                <button type="button" role="menuitem" onClick={() => {
                  setOpenPostMenu(null);
                  setReportPost(post);
                }}>
                  <Flag size={16} /> Report Post
                </button>
              )}
              {(String(post.raw?.author?._id) === String(studentProfile.id) || studentProfile.role === "admin") && (
                <button type="button" role="menuitem" className="is-danger" onClick={() => {
                  setOpenPostMenu(null);
                  setDeletePost(post);
                }}>
                  <Trash2 size={16} /> Delete Post
                </button>
              )}
            </div>
          )}
        </div>

        <span className="ks-post-category">{post.category}</span>

        <p className="ks-post-text">{post.text}</p>
        {post.images?.length > 0 && (
          <div className={`ks-post-image-gallery ks-image-count-${post.images.length}`}>
            {post.images.map((image, index) => (
              <img
                key={`${post.id}-image-${index}`}
                src={getPostImageUrl(image)}
                alt={`Post attachment ${index + 1}`}
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div className="ks-post-stats">
          <span>{post.likes} likes</span>
          <span>{post.comments} comments</span>
        </div>

        <div className="ks-post-actions">
          <button
            type="button"
            className={isLiked ? "ks-post-action is-active" : "ks-post-action"}
            onClick={() => toggleLike(post.id)}
            disabled={isLiking}
          >
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
            />
            {isLiking ? "Updating..." : "Like"}
          </button>

          <button
type="button"
className={
openComments.includes(post.id)
? "ks-post-action is-active"
: "ks-post-action"
}
onClick={() =>
setOpenComments((current) =>
current.includes(post.id)
? current.filter((id) => id !== post.id)
: [...current, post.id]
)
}
aria-expanded={openComments.includes(post.id)}

>

  <MessageSquare size={18} />
  Comment
</button>


          <button
            type="button"
            className={isSaved ? "ks-post-action is-active" : "ks-post-action"}
            onClick={() => toggleSave(post.id)}
          >
            <Bookmark
              size={18}
              fill={isSaved ? "currentColor" : "none"}
            />
            Save
          </button>
        </div>

        {openComments.includes(post.id) && (
          <section className="ks-comments-panel" aria-label="Post comments">
            <div className="ks-comments-list">
              {(post.raw?.comments || []).map((comment, index) => {
                const author =
                  comment.author && typeof comment.author === "object"
                    ? comment.author
                    : {};

                return (
                  <div
                    className="ks-comment-item"
                    key={comment._id || `${post.id}-comment-${index}`}
                  >
                    <strong>
                      {author.name ||
                        author.username ||
                        "Kampusly Student"}
                    </strong>

                    <p>{comment.text}</p>
                  </div>
                );
              })}

              {!(post.raw?.comments || []).length && (
                <p className="ks-comments-empty">
                  No comments yet. Start the conversation.
                </p>
              )}
            </div>

            <form
              className="ks-comment-form"
              onSubmit={(event) => {
                event.preventDefault();
                submitComment(post.id);
              }}
            >
              <input
                type="text"
                value={commentInputs[post.id] || ""}
                onChange={(event) =>
                  setCommentInputs((current) => ({
                    ...current,
                    [post.id]: event.target.value,
                  }))
                }
                maxLength={1000}
                placeholder="Write a comment..."
                aria-label="Write a comment"
              />

              <button
                type="submit"
                disabled={submittingComments.includes(post.id)}
              >
                {submittingComments.includes(post.id)
                  ? "Sending..."
                  : "Send"}
              </button>
            </form>
          </section>
        )}

      </article>
    );
  }

  function renderMainContent() {
    if (activePage === "Messages") {
      return (
        <section className="ks-placeholder-card">
          <span className="ks-placeholder-icon">
            <MessageCircle size={28} />
          </span>

          <h2>Your messages</h2>

          <p>
            Your conversations with sellers, service providers, and other
            students will appear here.
          </p>

          <span className="ks-coming-soon">
            Messaging interface still in development
          </span>
        </section>
      );
    }

    if (activePage === "Profile") {
      return (
        <section className="ks-placeholder-card">
          <span className="ks-placeholder-icon">
            <UserRound size={28} />
          </span>

          <h2>Your student profile</h2>

          <p>
            Manage your account information, posts, saved listings, and
            reviews.
          </p>

          {profileError && (
            <p role="alert">{profileError}</p>
          )}

          <button
            type="button"
            className="ks-primary-button"
            onClick={() => navigate("/student/profile")}
          >
            Open profile <ArrowUpRight size={17} />
          </button>
        </section>
      );
    }

    return (
      <>
        {activePage === "Home" && (
          <>
            <section className="ks-welcome-banner">
              <div
                className="ks-welcome-decoration"
                aria-hidden="true"
              />

              <span className="ks-welcome-eyebrow">
                <Sparkles size={15} />
                YOUR CAMPUS, CONNECTED
              </span>

              <h2>
                {profileLoading
                  ? "Loading your account..."
                  : `Good day, ${studentName}!`}
                <br />
                <span>What do you need today?</span>
              </h2>

              <p>
                Discover services, connect with students, and make campus
                life a little simpler.
              </p>

              {profileError && (
                <p role="status">
                  We couldn't refresh your profile. Showing the saved
                  account details instead.
                </p>
              )}

              <button
                type="button"
                className="ks-welcome-button"
                onClick={() => navigateTo("Campus Feed")}
              >
                Explore campus feed <ArrowUpRight size={17} />
              </button>
            </section>

            <section className="ks-services-section">
              <div className="ks-section-heading">
                <div>
                  <span className="ks-section-eyebrow">
                    MADE FOR YOUR EVERYDAY
                  </span>
                  <h2>Explore services</h2>
                </div>

                <button
                  type="button"
                  className="ks-text-button"
                  onClick={() => navigateTo("Services")}
                >
                  View all <ChevronRight size={17} />
                </button>
              </div>

              <div className="ks-services-grid">
                {services.map((service) => {
                  const Icon = service.icon;

                  return (
                    <button
                      type="button"
                      className="ks-service-card"
                      key={service.name}
                      onClick={() => navigateTo("Services")}
                    >
                      <span
                        className={`ks-service-icon ${service.color}`}
                      >
                        <Icon size={23} />
                      </span>

                      <span className="ks-service-title">
                        {service.name}
                      </span>

                      <span className="ks-service-description">
                        {service.description}
                      </span>

                      <ArrowUpRight
                        className="ks-service-arrow"
                        size={17}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}

        <section className="ks-feed-section">
          <div className="ks-section-heading ks-feed-heading">
            <div>
              <span className="ks-section-eyebrow">
                {activePage === "Home"
                  ? "AROUND YOUR CAMPUS"
                  : "YOUR COMMUNITY"}
              </span>

              <h2>
                {activePage === "Home"
                  ? "Campus highlights"
                  : "Campus feed"}
              </h2>
            </div>

            {activePage === "Home" && (
              <button
                type="button"
                className="ks-text-button"
                onClick={() => navigateTo("Campus Feed")}
              >
                See feed <ChevronRight size={17} />
              </button>
            )}
          </div>

          <form className="ks-create-post" onSubmit={submitPost}>
            <StudentAvatar
              name={studentName}
              avatar={studentAvatar}
              className="ks-avatar"
            />

            <button
              type="button"
              className="ks-create-post-trigger"
              onClick={() => setShowCreatePost(true)}
            >
              Share something with your campus...
            </button>

            <button
              type="button"
              className="ks-create-post-button"
              aria-label="Create a post"
              onClick={() => setShowCreatePost(true)}
            >
              <Plus size={21} />
            </button>
          </form>

          {activePage === "Campus Feed" && (
            <label className="ks-feed-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search campus posts..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>
          )}

          <div className="ks-post-list">
            {postsLoading ? (
              <div className="ks-empty-state" role="status">
                <RefreshCw size={22} />
                <h3>Loading campus posts...</h3>
                <p>Fetching the latest posts from Kampusly.</p>
              </div>
            ) : postsError ? (
              <div className="ks-empty-state" role="alert">
                <AlertCircle size={24} />
                <h3>Couldn't load campus posts</h3>
                <p>{postsError}</p>

                <button
                  type="button"
                  className="ks-primary-button"
                  onClick={loadPosts}
                >
                  Try again
                </button>
              </div>
            ) : visiblePosts.length > 0 ? (
              visiblePosts.map(renderPost)
            ) : (
              <div className="ks-empty-state">
                <Search size={24} />
                <h3>
                  {searchQuery.trim() ? "No posts found" : "No posts yet"}
                </h3>
                <p>
                  {searchQuery.trim()
                    ? "Try another search term."
                    : "Be the first to share something with your campus."}
                </p>
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="ks-dashboard">
      <header className="ks-topbar">
        <a
          className="ks-brand"
          href="/student/dashboard"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("Home");
          }}
        >
          <span className="ks-brand-mark">
            <GraduationCap size={23} />
          </span>

          <span>
            kampusly<span className="ks-brand-dot">.</span>
          </span>
        </a>

        <label className="ks-top-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search your campus..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigateTo("Campus Feed");
              }
            }}
          />

          <kbd>/</kbd>
        </label>

        <div className="ks-topbar-actions">
          <button
            type="button"
            className="ks-icon-button ks-notification-button"
            aria-label="Open notifications"
            title="Notifications"
            onClick={() => navigateTo("Notifications")}
          >
            <Bell size={20} />
            <span className="ks-notification-dot" />
          </button>

          <button
            type="button"
            className="ks-top-profile"
            onClick={() => navigateTo("Profile")}
            aria-label="Open profile"
          >
            <StudentAvatar
              name={studentName}
              avatar={studentAvatar}
              className="ks-avatar"
            />

            <span className="ks-top-profile-name">
              {studentName}
            </span>
          </button>
        </div>
      </header>

      <div className="ks-dashboard-body">
        <StudentSidebar />

        <main className="ks-dashboard-main">
          <div className="ks-page-heading">
            <div>
              <span className="ks-breadcrumb">
                Workspace / {activePage}
              </span>

              <h1>
                {activePage === "Home"
                  ? "Your campus space"
                  : activePage}
              </h1>
            </div>

            <button
              type="button"
              className="ks-primary-button"
              onClick={() => {
                setNotice("");
                setShowCreatePost(true);
              }}
            >
              <Plus size={18} />
              Create post
            </button>
          </div>

          {notice && (
            <div className="ks-notice" role="status">
              <span>{notice}</span>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {renderMainContent()}
        </main>

        <aside className="ks-right-panel">
          <section className="ks-side-panel-card">
            <div className="ks-side-panel-heading">
              <h3>Getting started</h3>
              <span className="ks-progress-count">1 of 3</span>
            </div>

            <div className="ks-progress-track">
              <span />
            </div>

            <p className="ks-panel-description">
              A few small steps to get the most out of Kampusly.
            </p>

            {initialActivity.map((activity) => {
              const Icon = activity.icon;

              return (
                <button
                  type="button"
                  className="ks-activity-item"
                  key={activity.id}
                  onClick={() =>
                    navigateTo(
                      activity.id === 1 ? "Services" : "Campus Feed"
                    )
                  }
                >
                  <span className="ks-activity-icon">
                    <Icon size={18} />
                  </span>

                  <span className="ks-activity-copy">
                    <strong>{activity.title}</strong>
                    <small>{activity.detail}</small>
                  </span>

                  <ChevronRight size={16} />
                </button>
              );
            })}
          </section>

          <section className="ks-side-panel-card ks-community-card">
            <span className="ks-community-icon">
              <GraduationCap size={24} />
            </span>

            <h3>Made for campus life</h3>

            <p>
              Discover, connect, and get everyday things done with Kampusly.
            </p>

            <button
              type="button"
              className="ks-text-button"
              onClick={() => navigateTo("Campus Feed")}
            >
              Explore community <ArrowUpRight size={16} />
            </button>
          </section>

          <p className="ks-panel-footer">
            Â© {new Date().getFullYear()} Kampusly
            <br />
            Campus Life, Simplified.
          </p>
        </aside>
      </div>

      <nav className="ks-bottom-nav" aria-label="Student navigation">
        <button
          type="button"
          className={`ks-bottom-link ${
            currentPath === "/student/dashboard" ? "active" : ""
          }`}
          onClick={() => navigateTo("Home")}
        >
          <Home size={21} />
          <span>Home</span>
        </button>

        <button
          type="button"
          className={`ks-bottom-link ${
            currentPath === "/student/feed" ? "active" : ""
          }`}
          onClick={() => navigateTo("Campus Feed")}
        >
          <Newspaper size={21} />
          <span>Feed</span>
        </button>

        <button
          type="button"
          className={`ks-bottom-link ${isWalletPage ? "active" : ""}`}
          onClick={() => navigateTo("Wallet")}
        >
          <Wallet size={21} />
          <span>Wallet</span>
        </button>

        <button
          type="button"
          className="ks-bottom-create"
          aria-label="Create post"
          onClick={() => {
            setNotice("");
            setShowCreatePost(true);
          }}
        >
          <Plus size={24} />
        </button>

        <button
          type="button"
          className={`ks-bottom-link ${isOrdersPage ? "active" : ""}`}
          onClick={() => navigateTo("My Orders")}
        >
          <Package size={21} />
          <span>My Orders</span>
        </button>

        <button
          type="button"
          className={`ks-bottom-link ${
            currentPath === "/student/messages" ? "active" : ""
          }`}
          onClick={() => navigateTo("Messages")}
        >
          <MessageCircle size={21} />
          <span>Messages</span>
        </button>

        <button
          type="button"
          className={`ks-bottom-link ${
            currentPath === "/student/profile" ? "active" : ""
          }`}
          onClick={() => navigateTo("Profile")}
        >
          <UserRound size={21} />
          <span>Profile</span>
        </button>
      </nav>

      {showCreatePost && (
        <div
          className="ks-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !publishing
            ) {
              setShowCreatePost(false);
            }
          }}
        >
          <section
            className="ks-create-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ks-create-modal-title"
          >
            <div className="ks-modal-heading">
              <div>
                <span className="ks-section-eyebrow">
                  CAMPUS COMMUNITY
                </span>

                <h2 id="ks-create-modal-title">Create a post</h2>
              </div>

              <button
                type="button"
                className="ks-icon-button"
                aria-label="Close create post"
                disabled={publishing}
                onClick={() => setShowCreatePost(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitPost}>
              <label
                className="ks-post-input-label"
                htmlFor="ks-new-post"
              >
                What's happening on your campus?
              </label>

              <div className="ks-modal-author">
                <StudentAvatar
                  name={studentName}
                  avatar={studentAvatar}
                  className="ks-avatar"
                />

                <span>{studentName}</span>
              </div>

              <textarea
                id="ks-new-post"
                rows={5}
                maxLength={3000}
                placeholder="Share an update, ask a question, or let students know what you need..."
                value={newPost}
                onChange={(event) => setNewPost(event.target.value)}
                autoFocus
                disabled={publishing}
              />

              <div className="ks-image-upload-section">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={handleImageSelection}
                  disabled={publishing || selectedImages.length >= 4}
                />

                <button
                  type="button"
                  className="ks-image-upload-button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={publishing || selectedImages.length >= 4}
                >
                  <ImagePlus size={18} />
                  Add photos
                  <span>{selectedImages.length}/4</span>
                </button>

                <p className="ks-image-upload-hint">
                  JPG, PNG or WEBP · Maximum 5 MB each
                </p>

                {selectedImages.length > 0 && (
                  <div className="ks-image-preview-grid">
                    {selectedImages.map((image, index) => (
                      <div className="ks-image-preview" key={image.preview}>
                        <img src={image.preview} alt={`Selected image ${index + 1}`} />

                        <button
                          type="button"
                          aria-label={`Remove image ${index + 1}`}
                          onClick={() => removeSelectedImage(index)}
                          disabled={publishing}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="ks-modal-footer">
                <span>{newPost.length}/3000 characters</span>

                <button
                  type="submit"
                  className="ks-primary-button"
                  disabled={publishing || (!newPost.trim() && selectedImages.length === 0)}
                >
                  {publishing ? (
                    <>
                      <RefreshCw size={17} />
                      Publishing...
                    </>
                  ) : (
                    <>
                      Publish post <ArrowUpRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {reportPost && (
        <div className="ks-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !reportSubmitting) setReportPost(null);
        }}>
          <section className="ks-action-modal" role="dialog" aria-modal="true" aria-labelledby="ks-report-title">
            <div className="ks-modal-heading">
              <div><span className="ks-section-eyebrow">CAMPUS COMMUNITY</span><h2 id="ks-report-title">Report post</h2></div>
              <button type="button" className="ks-icon-button" aria-label="Close report dialog" onClick={() => setReportPost(null)} disabled={reportSubmitting}><X size={20} /></button>
            </div>
            <p className="ks-action-modal-copy">Reports are sent to the Kampusly team for review.</p>
            <form onSubmit={submitPostReport}>
              <label className="ks-action-field" htmlFor="ks-report-reason">Reason
                <select id="ks-report-reason" value={reportReason} onChange={(event) => setReportReason(event.target.value)}>
                  <option value="spam">Spam</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="misinformation">False or misleading information</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="ks-action-field" htmlFor="ks-report-details">Additional details (optional)
                <textarea id="ks-report-details" rows={4} maxLength={500} value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} placeholder="Add context for the review team" />
              </label>
              <div className="ks-modal-footer">
                <span>{reportDetails.length}/500</span>
                <button className="ks-primary-button" type="submit" disabled={reportSubmitting}>{reportSubmitting ? "Submitting..." : "Submit report"}<Flag size={16} /></button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletePost && (
        <div className="ks-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deleteSubmitting) setDeletePost(null);
        }}>
          <section className="ks-action-modal" role="dialog" aria-modal="true" aria-labelledby="ks-delete-title">
            <div className="ks-modal-heading">
              <div><span className="ks-section-eyebrow">CAMPUS COMMUNITY</span><h2 id="ks-delete-title">Delete this post?</h2></div>
              <button type="button" className="ks-icon-button" aria-label="Close delete dialog" onClick={() => setDeletePost(null)} disabled={deleteSubmitting}><X size={20} /></button>
            </div>
            <p className="ks-action-modal-copy">This removes the post from the feed and cannot be undone.</p>
            <div className="ks-modal-footer">
              <button className="ks-secondary-button" type="button" onClick={() => setDeletePost(null)} disabled={deleteSubmitting}>Keep post</button>
              <button className="ks-danger-button" type="button" onClick={confirmDeletePost} disabled={deleteSubmitting}>{deleteSubmitting ? "Deleting..." : "Delete post"}<Trash2 size={16} /></button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}



