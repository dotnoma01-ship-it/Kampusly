import { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import FollowButton from "./FollowButton";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Camera,
  Heart,
  Image,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Share2,
  Smile,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import "./CampusFeed.css";

const initialPosts = [
  {
    id: 1,
    name: "Amara Johnson",
    initials: "AJ",
    role: "Student",
    time: "12 min ago",
    category: "Campus Life",
    content:
      "There's something special about meeting people who share your dreams. Keep showing up for yourself, keep learning, and remember that your journey is your own. 🌱",
    likes: 24,
    comments: 8,
    liked: false,
    saved: false,
    color: "green",
  },
  {
    id: 2,
    name: "Daniel Okafor",
    initials: "DO",
    role: "Student",
    time: "35 min ago",
    category: "Discussion",
    content:
      "Quick question for everyone: what's one skill you're learning outside your course this semester? I'm currently learning UI/UX design and would love to hear yours!",
    likes: 17,
    comments: 12,
    liked: false,
    saved: false,
    color: "orange",
  },
  {
    id: 3,
    name: "Blessing Adeyemi",
    initials: "BA",
    role: "Student",
    time: "1 hour ago",
    category: "Opportunities",
    content:
      "Reminder: your next big opportunity might come from a conversation with someone sitting right beside you. Network, collaborate, and support one another. 🤝",
    likes: 31,
    comments: 5,
    liked: false,
    saved: false,
    color: "purple",
  },
];

const categories = ["For You", "Following", "Trending"];

function CampusFeed() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeCategory, setActiveCategory] = useState("For You");
  const [searchQuery, setSearchQuery] = useState("");
  const [postText, setPostText] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [notice, setNotice] = useState("");
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState({});

  function toggleLike(postId) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.likes + (post.liked ? -1 : 1),
            }
          : post
      )
    );
  }

  function toggleSave(postId) {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, saved: !post.saved }
          : post
      )
    );

    const post = posts.find((item) => item.id === postId);

    setNotice(
      post?.saved
        ? "Post removed from your saved posts."
        : "Post saved successfully."
    );
  }

  function createPost(event) {
    event.preventDefault();

    const content = postText.trim();

    if (!content) {
      setNotice("Please write something before publishing.");
      return;
    }

    const newPost = {
      id: Date.now(),
      name: localStorage.getItem("kampuslyName") || "You",
      initials: getInitials(
        localStorage.getItem("kampuslyName") || "You"
      ),
      role: "Student",
      time: "Just now",
      category: "Campus Life",
      content,
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      color: "green",
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setPostText("");
    setShowComposer(false);
    setActiveCategory("For You");
    setNotice("Your post has been published in this session.");
  }

  function addComment(event, postId) {
    event.preventDefault();

    const content = commentText.trim();

    if (!content) {
      setNotice("Write a comment before sending.");
      return;
    }

    setComments((currentComments) => ({
      ...currentComments,
      [postId]: [
        ...(currentComments[postId] || []),
        {
          id: Date.now(),
          text: content,
        },
      ],
    }));

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    );

    setCommentText("");
    setNotice("Comment added for this session.");
  }

  function sharePost(post) {
    if (navigator.share) {
      navigator
        .share({
          title: `Kampusly post by ${post.name}`,
          text: post.content,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(post.content)
        .then(() => setNotice("Post text copied to clipboard."))
        .catch(() => setNotice("Unable to copy this post."));
    } else {
      setNotice("Sharing is not supported in this browser.");
    }
  }

  function getInitials(name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  const visiblePosts = posts.filter((post) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      post.content.toLowerCase().includes(query) ||
      post.name.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query);

    const matchesCategory =
      activeCategory !== "Trending" || post.likes >= 20;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="cf-page">
      <header className="cf-header">
        <div className="cf-header-inner">
          <a href="/student/dashboard" className="cf-back-link">
            <ArrowLeft size={20} />
          </a>

          <a href="/student/dashboard" className="cf-brand">
            <span className="cf-brand-icon">K</span>
            <span>
              <strong>kampusly</strong>
              <small>Campus Life, Simplified.</small>
            </span>
          </a>

          <div className="cf-header-actions">
            <button
              type="button"
              className="cf-icon-button"
              aria-label="Search posts"
              onClick={() =>
                document
                  .getElementById("cf-search")
                  ?.focus()
              }
            >
              <Search size={21} />
            </button>

            <button
              type="button"
              className="cf-icon-button"
              aria-label="Notifications"
              onClick={() =>
                setNotice("Notifications will be available soon.")
              }
            >
              <Bell size={21} />
            </button>

            <button
              type="button"
              className="cf-header-create"
              onClick={() => setShowComposer(true)}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="cf-layout">
        <aside className="cf-left-sidebar">
          <div className="cf-sidebar-card">
            <p className="cf-sidebar-label">YOUR COMMUNITY</p>

            <button
              type="button"
              className="cf-sidebar-link active"
            >
              <Users size={19} />
              Campus Feed
            </button>

            <button
              type="button"
              className="cf-sidebar-link"
              onClick={() =>
                setNotice("Following will be available soon.")
              }
            >
              <Heart size={19} />
              Following
            </button>

            <button
              type="button"
              className="cf-sidebar-link"
              onClick={() =>
                setNotice("Saved posts are available in this session.")
              }
            >
              <Bookmark size={19} />
              Saved posts
            </button>

            <button
              type="button"
              className="cf-sidebar-link"
              onClick={() =>
                setNotice("Communities will be available soon.")
              }
            >
              <Users size={19} />
              Communities
            </button>
          </div>

          <div className="cf-sidebar-tip">
            <span className="cf-tip-icon">
              <TrendingUp size={21} />
            </span>

            <h3>Your voice matters.</h3>

            <p>
              Share ideas, ask questions, and make campus life better
              for everyone.
            </p>

            <button
              type="button"
              onClick={() => setShowComposer(true)}
            >
              Create a post <Plus size={15} />
            </button>
          </div>
        </aside>

        <section className="cf-main">
          <div className="cf-page-heading">
            <div>
              <span className="cf-eyebrow">THE CAMPUS COMMUNITY</span>
              <h1>Campus Feed</h1>
              <p>
                Discover conversations, share ideas, and connect with
                your community.
              </p>
            </div>

            <div className="cf-online-badge">
              <span />
              Your community
            </div>
          </div>

          <div className="cf-search-box">
            <Search size={20} />

            <input
              id="cf-search"
              type="search"
              placeholder="Search posts, people, or topics..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />
          </div>

          <div className="cf-feed-tabs">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={
                  activeCategory === category ? "active" : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category === "Trending" && (
                  <TrendingUp size={16} />
                )}

                {category}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="cf-quick-composer"
            onClick={() => setShowComposer(true)}
          >
            <div className="cf-avatar cf-avatar-green">
              {getInitials(
                localStorage.getItem("kampuslyName") || "You"
              )}
            </div>

            <span>What's happening on campus?</span>

            <div className="cf-quick-add">
              <Plus size={19} />
            </div>
          </button>

          <div className="cf-post-list">
            {visiblePosts.map((post) => (
              <article className="cf-post-card" key={post.id}>
                <div className="cf-post-header">
                  <div
                    className={`cf-avatar cf-avatar-${post.color}`}
                  >
                    {post.initials}
                  </div>

                  <div className="cf-post-author">
                    <h3>{post.name}</h3>
                    <p>
                      {post.role}
                      <span>·</span>
                      {post.time}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="cf-post-more"
                    aria-label="More post options"
                    onClick={() =>
                      setNotice(
                        "More post options will be available soon."
                      )
                    }
                  >
                    <MoreHorizontal size={22} />
                  </button>
                </div>

                <span className="cf-post-category">
                  {post.category}
                </span>

                <p className="cf-post-content">{post.content}</p>

                <div className="cf-post-stats">
                  <span>
                    <Heart size={15} />
                    {post.likes} likes
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveCommentPost(
                        activeCommentPost === post.id
                          ? null
                          : post.id
                      )
                    }
                  >
                    {post.comments} comments
                  </button>
                </div>

                <div className="cf-post-actions">
                  <button
                    type="button"
                    className={post.liked ? "liked" : ""}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart
                      size={19}
                      fill={post.liked ? "currentColor" : "none"}
                    />
                    Like
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveCommentPost(
                        activeCommentPost === post.id
                          ? null
                          : post.id
                      )
                    }
                  >
                    <MessageCircle size={19} />
                    Comment
                  </button>

                  <button
                    type="button"
                    onClick={() => sharePost(post)}
                  >
                    <Share2 size={19} />
                    Share
                  </button>

                  <button
                    type="button"
                    className={post.saved ? "saved" : ""}
                    aria-label={
                      post.saved ? "Unsave post" : "Save post"
                    }
                    onClick={() => toggleSave(post.id)}
                  >
                    <Bookmark
                      size={19}
                      fill={post.saved ? "currentColor" : "none"}
                    />
                  </button>
                </div>

                {activeCommentPost === post.id && (
                  <div className="cf-comments">
                    {(comments[post.id] || []).map((comment) => (
                      <div
                        className="cf-comment"
                        key={comment.id}
                      >
                        <div className="cf-comment-avatar">
                          YOU
                        </div>

                        <p>{comment.text}</p>
                      </div>
                    ))}

                    <form
                      className="cf-comment-form"
                      onSubmit={(event) =>
                        addComment(event, post.id)
                      }
                    >
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(event) =>
                          setCommentText(event.target.value)
                        }
                        aria-label="Write a comment"
                      />

                      <button
                        type="submit"
                        aria-label="Send comment"
                      >
                        <Send size={17} />
                      </button>
                    </form>
                  </div>
                )}
              </article>
            ))}

            {visiblePosts.length === 0 && (
              <div className="cf-empty-state">
                <Search size={30} />

                <h3>No posts found</h3>

                <p>
                  Try another search term or switch to a different
                  feed category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("For You");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <p className="cf-demo-note">
            <span /> You're viewing a preview of the Kampusly community.
          </p>
        </section>

        <aside className="cf-right-sidebar">
          <div className="cf-trending-card">
            <div className="cf-right-card-heading">
              <h2>Trending topics</h2>
              <TrendingUp size={19} />
            </div>

            <button
              type="button"
              className="cf-topic"
              onClick={() => setSearchQuery("opportunity")}
            >
              <span className="cf-topic-icon lime">
                <TrendingUp size={17} />
              </span>

              <span>
                <strong>#StudentOpportunities</strong>
                <small>Career and growth</small>
              </span>
            </button>

            <button
              type="button"
              className="cf-topic"
              onClick={() => setSearchQuery("campus")}
            >
              <span className="cf-topic-icon green">
                <Users size={17} />
              </span>

              <span>
                <strong>#CampusLife</strong>
                <small>Community conversations</small>
              </span>
            </button>

            <button
              type="button"
              className="cf-topic"
              onClick={() => setSearchQuery("skill")}
            >
              <span className="cf-topic-icon orange">
                <Smile size={17} />
              </span>

              <span>
                <strong>#LearnSomethingNew</strong>
                <small>Skills and development</small>
              </span>
            </button>
          </div>

          <div className="cf-guidelines-card">
            <div className="cf-guidelines-icon">
              <Heart size={21} />
            </div>

            <h3>Keep it respectful.</h3>

            <p>
              Kampusly is a community for everyone. Be kind, share
              responsibly, and help others feel welcome.
            </p>

            <button
              type="button"
              onClick={() =>
                setNotice(
                  "Community guidelines will be published soon."
                )
              }
            >
              Community guidelines
            </button>
          </div>

          <div className="cf-footer-links">
            <span>About</span>
            <span>Privacy</span>
            <span>Terms</span>
            <p>© 2026 Kampusly</p>
          </div>
        </aside>
      </div>

      {showComposer && (
        <div
          className="cf-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowComposer(false);
            }
          }}
        >
          <section
            className="cf-composer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cf-composer-title"
          >
            <div className="cf-modal-header">
              <div>
                <span className="cf-eyebrow">YOUR COMMUNITY</span>
                <h2 id="cf-composer-title">Create a post</h2>
              </div>

              <button
                type="button"
                className="cf-icon-button"
                aria-label="Close composer"
                onClick={() => setShowComposer(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={createPost}>
              <div className="cf-composer-user">
                <div className="cf-avatar cf-avatar-green">
                  {getInitials(
                    localStorage.getItem("kampuslyName") || "You"
                  )}
                </div>

                <div>
                  <strong>
                    {localStorage.getItem("kampuslyName") || "You"}
                  </strong>
                  <span>Sharing with the community</span>
                </div>
              </div>

              <textarea
                autoFocus
                rows={5}
                maxLength={1000}
                placeholder="What's happening on campus?"
                value={postText}
                onChange={(event) =>
                  setPostText(event.target.value)
                }
              />

              <div className="cf-composer-tools">
                <span>
                  <Image size={18} />
                  Photos coming soon
                </span>

                <span>
                  <Camera size={18} />
                  <span className="cf-character-count">
                    {postText.length}/1000
                  </span>
                </span>
              </div>

              <button
                type="submit"
                className="cf-publish-button"
              >
                Publish post <ArrowLeft size={17} />
              </button>
            </form>
          </section>
        </div>
      )}

      {notice && (
        <div className="cf-toast" role="status">
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
    </main>
  );
}

export default CampusFeed;