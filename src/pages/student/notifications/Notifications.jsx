import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, Clock, MessageCircle, ShoppingBag, Wallet } from "lucide-react";
import { apiRequest } from "../../../lib/api";
import "./Notifications.css";

const iconFor = (type) => type === "message" ? MessageCircle : type === "wallet" ? Wallet : type === "order" ? ShoppingBag : Bell;
const titleFor = (notification) => notification.actor?.name || (notification.type === "wallet" ? "Wallet update" : "Kampusly update");
const timeFor = (value) => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadNotifications = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await apiRequest("/notifications"); setNotifications(Array.isArray(response.notifications) ? response.notifications : []); }
    catch (requestError) { setError(requestError.message || "Unable to load notifications."); }
    finally { setLoading(false); }
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visible = useMemo(() => notifications.filter((item) => filter !== "unread" || !item.read), [filter, notifications]);
  const markRead = async (id) => { try { await apiRequest(`/notifications/${id}/read`, { method: "PATCH" }); setNotifications((items) => items.map((item) => item._id === id ? { ...item, read: true } : item)); } catch (requestError) { setFeedback(requestError.message || "Could not mark this notification as read."); } };
  const markAllRead = async () => { try { await apiRequest("/notifications/read-all", { method: "PATCH" }); setNotifications((items) => items.map((item) => ({ ...item, read: true }))); setFeedback("All notifications marked as read."); } catch (requestError) { setFeedback(requestError.message || "Could not mark notifications as read."); } };
  return <div className="kampusly-notifications-page"><header className="notifications-header"><button type="button" className="notifications-back" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button><div className="notifications-header-title"><div className="notifications-header-icon"><Bell size={21} /></div><div><h1>Notifications</h1><p>Stay updated with your campus activity</p></div></div><button type="button" className="notifications-home-button" onClick={() => navigate("/student/dashboard")}>Home</button></header><main className="notifications-main"><section className="notifications-overview"><div><span className="notifications-eyebrow">YOUR UPDATES</span><h2>You&apos;re in the loop<span>.</span></h2><p>Important updates and activity from your Kampusly community.</p></div><div className="notifications-total"><span>{unreadCount}</span><p>Unread</p></div></section>{feedback && <div className="notifications-feedback" role="status"><span>{feedback}</span><button type="button" onClick={() => setFeedback("")}>Dismiss</button></div>}<section className="notifications-list-section"><div className="notifications-list-heading"><div className="notifications-tabs"><button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All <span>{notifications.length}</span></button><button type="button" className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>Unread <span>{unreadCount}</span></button></div><div className="notifications-actions"><button type="button" onClick={markAllRead} disabled={!unreadCount}><CheckCheck size={16} /><span>Mark all read</span></button></div></div>{loading ? <div className="notifications-empty"><Bell size={32} /><h3>Loading notifications...</h3></div> : error ? <div className="notifications-empty"><Bell size={32} /><h3>Couldn&apos;t load notifications</h3><p>{error}</p><button type="button" onClick={loadNotifications}>Try again</button></div> : visible.length ? <div className="notifications-list">{visible.map((notification) => { const Icon = iconFor(notification.type); return <article className={`notification-card ${notification.read ? "notification-read" : "notification-unread"}`} key={notification._id}><div className={`notification-item-icon notification-icon-${notification.type}`}><Icon size={21} /></div><div className="notification-item-content"><div className="notification-item-title"><h3>{titleFor(notification)}</h3>{!notification.read && <span className="notification-unread-dot" />}</div><p>{notification.message}</p><span className="notification-time"><Clock size={13} />{timeFor(notification.createdAt)}</span></div><div className="notification-item-actions">{!notification.read && <button type="button" className="notification-mark-read" onClick={() => markRead(notification._id)}>Mark read</button>}</div></article>; })}</div> : <div className="notifications-empty"><div className="notifications-empty-icon"><Bell size={32} /></div><h3>{filter === "unread" ? "You&apos;re all caught up!" : "No notifications yet"}</h3><p>{filter === "unread" ? "You&apos;ve read all your notifications." : "When there are updates to share, you&apos;ll find them here."}</p></div>}</section><p className="notifications-footer-note">Notifications are shown only for your signed-in account.</p></main></div>;
}
