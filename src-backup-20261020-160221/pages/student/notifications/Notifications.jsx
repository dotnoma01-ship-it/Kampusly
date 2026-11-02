import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../StudentSidebar";
import {
ArrowLeft,
Bell,
MessageCircle,
ShoppingBag,
Wallet,
CheckCheck,
Trash2,
Clock,
ArrowRight,
} from "lucide-react";
import "./Notifications.css";

const initialNotifications = [
{
id: 1,
type: "message",
title: "Stay connected",
message:
"Messages from other students will appear here when your messaging features are connected.",
time: "Welcome",
read: false,
},
{
id: 2,
type: "community",
title: "Your campus community",
message:
"Discover items, share useful resources, and connect with fellow students on the campus feed.",
time: "Welcome",
read: false,
},
{
id: 3,
type: "wallet",
title: "Wallet updates",
message:
"Keep an eye on your wallet and transaction history for updates when wallet services are connected.",
time: "Welcome",
read: false,
},
];

function Notifications() {
const navigate = useNavigate();

const [notifications, setNotifications] = useState(initialNotifications);
const [filter, setFilter] = useState("all");
const [feedback, setFeedback] = useState("");

const unreadCount = notifications.filter(
(notification) => !notification.read
).length;

const filteredNotifications = notifications.filter((notification) => {
if (filter === "unread") return !notification.read;
return true;
});

const markAllAsRead = () => {
setNotifications((current) =>
current.map((notification) => ({ ...notification, read: true }))
);
setFeedback("All notifications marked as read.");
};

const markAsRead = (id) => {
setNotifications((current) =>
current.map((notification) =>
notification.id === id
? { ...notification, read: true }
: notification
)
);
};

const removeNotification = (id) => {
setNotifications((current) =>
current.filter((notification) => notification.id !== id)
);
setFeedback("Notification removed.");
};

const clearAll = () => {
setNotifications([]);
setFeedback("Notifications cleared.");
};

const getIcon = (type) => {
if (type === "message") return MessageCircle;
if (type === "wallet") return Wallet;
if (type === "order") return ShoppingBag;
return Bell;
};

return ( <div className="kampusly-notifications-page"> <header className="notifications-header">
<button
type="button"
className="notifications-back"
onClick={() => navigate(-1)}
aria-label="Go back"
> <ArrowLeft size={20} /> </button>

```
    <div className="notifications-header-title">
      <div className="notifications-header-icon">
        <Bell size={21} />
      </div>
      <div>
        <h1>Notifications</h1>
        <p>Stay updated with your campus activity</p>
      </div>
    </div>

    <button
      type="button"
      className="notifications-home-button"
      onClick={() => navigate("/student/dashboard")}
    >
      Home
    </button>
  </header>

  <main className="notifications-main">
    <section className="notifications-overview">
      <div>
        <span className="notifications-eyebrow">YOUR UPDATES</span>
        <h2>
          You're in the loop<span>.</span>
        </h2>
        <p>Important updates and activity from your Kampusly community.</p>
      </div>

      <div className="notifications-total">
        <span>{unreadCount}</span>
        <p>Unread</p>
      </div>
    </section>

    {feedback && (
      <div className="notifications-feedback" role="status">
        <span>{feedback}</span>
        <button type="button" onClick={() => setFeedback("")}>
          Dismiss
        </button>
      </div>
    )}

    <section className="notifications-list-section">
      <div className="notifications-list-heading">
        <div className="notifications-tabs">
          <button
            type="button"
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
            <span>{notifications.length}</span>
          </button>

          <button
            type="button"
            className={filter === "unread" ? "active" : ""}
            onClick={() => setFilter("unread")}
          >
            Unread
            <span>{unreadCount}</span>
          </button>
        </div>

        <div className="notifications-actions">
          <button type="button" onClick={markAllAsRead}>
            <CheckCheck size={16} />
            <span>Mark all read</span>
          </button>

          <button
            type="button"
            className="notifications-clear-button"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={16} />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.type);

            return (
              <article
                className={`notification-card ${
                  notification.read ? "notification-read" : "notification-unread"
                }`}
                key={notification.id}
              >
                <div
                  className={`notification-item-icon notification-icon-${notification.type}`}
                >
                  <Icon size={21} />
                </div>

                <div className="notification-item-content">
                  <div className="notification-item-title">
                    <h3>{notification.title}</h3>
                    {!notification.read && (
                      <span className="notification-unread-dot" />
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    <Clock size={13} />
                    {notification.time}
                  </span>
                </div>

                <div className="notification-item-actions">
                  {!notification.read && (
                    <button
                      type="button"
                      className="notification-mark-read"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark read
                    </button>
                  )}

                  <button
                    type="button"
                    className="notification-remove"
                    onClick={() => removeNotification(notification.id)}
                    aria-label={`Remove ${notification.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="notifications-empty">
          <div className="notifications-empty-icon">
            <Bell size={32} />
          </div>
          <h3>
            {filter === "unread"
              ? "You're all caught up!"
              : "No notifications yet"}
          </h3>
          <p>
            {filter === "unread"
              ? "You've read all your notifications."
              : "When there are updates to share, you'll find them here."}
          </p>

          {filter === "unread" && notifications.length > 0 && (
            <button type="button" onClick={() => setFilter("all")}>
              View all notifications
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </section>

    <p className="notifications-footer-note">
      These are sample notifications. Live alerts will require backend
      integration.
    </p>
  </main>
</div>


);
}

export default Notifications;

