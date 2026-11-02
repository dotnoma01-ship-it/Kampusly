import { useEffect, useState } from "react";
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
Sparkles,
Wallet,
Package,
ChevronRight,
GraduationCap,
X,
} from "lucide-react";
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
description: "Buy and sell campus essentials",
icon: ShoppingBag,
color: "market",
},
{
name: "Laundry",
description: "Find trusted laundry services",
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

const initialPosts = [
{
id: 1,
name: "Campus Community",
initials: "CC",
avatar: "",
time: "12 minutes ago",
category: "Campus life",
text: "Welcome to Kampusly! Use this space to discover what is happening around your campus, ask questions, share helpful information, and connect with other students.",
likes: 12,
comments: 4,
},
{
id: 2,
name: "Student Marketplace",
initials: "SM",
avatar: "",
time: "35 minutes ago",
category: "Marketplace",
text: "Looking for something you need for school or your hostel? Explore campus listings and connect directly with sellers.",
likes: 8,
comments: 2,
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
const savedProfile = localStorage.getItem("kampuslyProfile");


if (savedProfile) {
  profile = JSON.parse(savedProfile);
}


} catch (error) {
console.error("Could not load Kampusly profile:", error);
}

return {
name:
typeof profile.name === "string" && profile.name.trim()
? profile.name.trim()
: localStorage.getItem("kampuslyName") || "Student",
avatar: localStorage.getItem("kampuslyAvatar") || "",
};
}

function getInitials(name) {
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

function formatName(fullName) {
return fullName.trim().split(/\s+/)[0] || "Student";
}

function StudentAvatar({
name,
avatar,
className = "",
imageClassName = "",
}) {
const [imageFailed, setImageFailed] = useState(false);

useEffect(() => {
setImageFailed(false);
}, [avatar]);

if (avatar && !imageFailed) {
return (
<img
src={avatar}
alt={`${name}'s profile`}
className={`${className} ${imageClassName}`.trim()}
onError={() => setImageFailed(true)}
/>
);
}

return (
<span
className={className}
role="img"
aria-label={`${name}'s initials`}
>
{getInitials(name)} </span>
);
}

export default function Dashboard() {
const navigate = useNavigate();
const location = useLocation();

const [activePage, setActivePage] = useState("Home");
const [searchQuery, setSearchQuery] = useState("");
const [likedPosts, setLikedPosts] = useState([]);
const [savedPosts, setSavedPosts] = useState([]);
const [posts, setPosts] = useState(initialPosts);
const [showCreatePost, setShowCreatePost] = useState(false);
const [newPost, setNewPost] = useState("");
const [notice, setNotice] = useState("");
const [studentProfile, setStudentProfile] = useState(getStudentProfile);

const studentName = formatName(studentProfile.name);
const studentAvatar = studentProfile.avatar;
const currentPath = location.pathname;

const isWalletPage = currentPath.startsWith("/student/wallet");
const isOrdersPage = currentPath === "/student/orders";

// Keep the dashboard synchronised with the saved student profile.
useEffect(() => {
const syncProfile = () => {
setStudentProfile(getStudentProfile());
};


window.addEventListener("focus", syncProfile);
window.addEventListener("storage", syncProfile);
document.addEventListener("visibilitychange", syncProfile);

return () => {
  window.removeEventListener("focus", syncProfile);
  window.removeEventListener("storage", syncProfile);
  document.removeEventListener("visibilitychange", syncProfile);
};


}, []);

// Navigate between existing student pages.
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

function toggleLike(postId) {
setLikedPosts((current) =>
current.includes(postId)
? current.filter((id) => id !== postId)
: [...current, postId]
);
}

function toggleSave(postId) {
setSavedPosts((current) =>
current.includes(postId)
? current.filter((id) => id !== postId)
: [...current, postId]
);
}

function submitPost(event) {
event.preventDefault();


const text = newPost.trim();

if (!text) {
  setNotice("Write something before publishing your post.");
  return;
}

const profile = getStudentProfile();
const currentName = formatName(profile.name);

const post = {
  id: Date.now(),
  name: currentName,
  initials: getInitials(currentName),
  avatar: profile.avatar,
  time: "Just now",
  category: "Campus life",
  text,
  likes: 0,
  comments: 0,
};

setPosts((current) => [post, ...current]);
setNewPost("");
setShowCreatePost(false);
setActivePage("Campus Feed");
setNotice("Your post has been added to this preview.");

window.scrollTo({ top: 0, behavior: "smooth" });


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
const isLiked = likedPosts.includes(post.id);
const isSaved = savedPosts.includes(post.id);


return (
  <article className="ks-post-card" key={post.id}>
    <div className="ks-post-header">
      <StudentAvatar
        name={post.name}
        avatar={post.avatar}
        className="ks-avatar ks-post-avatar"
      />

      <div className="ks-post-author">
        <strong>{post.name}</strong>

        <span>
          <Clock3 size={13} /> {post.time}
        </span>
      </div>

      <button
        className="ks-icon-button ks-post-more"
        type="button"
        aria-label="Post options"
        onClick={() =>
          setNotice(
            "Post reporting and other options will be available when connected to the backend."
          )
        }
      >
        <MoreHorizontal size={20} />
      </button>
    </div>

    <span className="ks-post-category">{post.category}</span>

    <p className="ks-post-text">{post.text}</p>

    <div className="ks-post-stats">
      <span>{post.likes + (isLiked ? 1 : 0)} likes</span>
      <span>{post.comments} comments</span>
    </div>

    <div className="ks-post-actions">
      <button
        type="button"
        className={
          isLiked ? "ks-post-action is-active" : "ks-post-action"
        }
        onClick={() => toggleLike(post.id)}
      >
        <Heart
          size={18}
          fill={isLiked ? "currentColor" : "none"}
        />
        Like
      </button>

      <button
        type="button"
        className="ks-post-action"
        onClick={() =>
          setNotice(
            "Comments will be available when the campus feed backend is connected."
          )
        }
      >
        <MessageSquare size={18} />
        Comment
      </button>

      <button
        type="button"
        className={
          isSaved ? "ks-post-action is-active" : "ks-post-action"
        }
        onClick={() => toggleSave(post.id)}
      >
        <Bookmark
          size={18}
          fill={isSaved ? "currentColor" : "none"}
        />
        Save
      </button>
    </div>
  </article>
);


}

function renderMainContent() {
if (activePage === "Messages") {
return ( <section className="ks-placeholder-card"> <span className="ks-placeholder-icon"> <MessageCircle size={28} /> </span>


      <h2>Your messages</h2>

      <p>
        Your conversations with sellers, service providers, and
        other students will appear here.
      </p>

      <span className="ks-coming-soon">
        Messaging is not connected yet
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
        Your personal information, posts, saved listings, and reviews
        will be managed here.
      </p>

      <button
        type="button"
        className="ks-primary-button"
        onClick={() => navigateTo("Profile")}
      >
        Open profile
        <ArrowUpRight size={17} />
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
            Good day, {studentName}!
            <br />
            <span>What do you need today?</span>
          </h2>

          <p>
            Discover services, connect with students, and make campus
            life a little simpler.
          </p>

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
        {visiblePosts.length > 0 ? (
          visiblePosts.map(renderPost)
        ) : (
          <div className="ks-empty-state">
            <Search size={24} />
            <h3>No posts found</h3>
            <p>Try another search term.</p>
          </div>
        )}
      </div>
    </section>
  </>
);


}

return ( <div className="ks-dashboard"> <header className="ks-topbar">
<a
className="ks-brand"
href="/student/dashboard"
onClick={(event) => {
event.preventDefault();
navigateTo("Home");
}}
> <span className="ks-brand-mark"> <GraduationCap size={23} /> </span>


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
    {/* Reusable desktop sidebar */}
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
          Discover, connect, and get everyday things done with
          Kampusly.
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
        © {new Date().getFullYear()} Kampusly
        <br />
        Campus Life, Simplified.
      </p>
    </aside>
  </div>

  {/* Mobile bottom navigation */}
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
      className={`ks-bottom-link ${
        isWalletPage ? "active" : ""
      }`}
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
      className={`ks-bottom-link ${
        isOrdersPage ? "active" : ""
      }`}
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

  {/* Create-post modal */}
  {showCreatePost && (
    <div
      className="ks-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
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
            maxLength={2000}
            placeholder="Share an update, ask a question, or let students know what you need..."
            value={newPost}
            onChange={(event) => setNewPost(event.target.value)}
            autoFocus
          />

          <div className="ks-modal-footer">
            <span>{newPost.length}/2000 characters</span>

            <button
              type="submit"
              className="ks-primary-button"
            >
              Publish post <ArrowUpRight size={17} />
            </button>
          </div>
        </form>
      </section>
    </div>
  )}
</div>


);
}
