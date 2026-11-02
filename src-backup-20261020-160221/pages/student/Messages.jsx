import { useMemo, useState } from "react";
import StudentSidebar from "./StudentSidebar";
import {
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  Image,
  Info,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react";

import "./Messages.css";

const initialChats = [
  {
    id: 1,
    name: "Amara Johnson",
    role: "Student",
    avatar: "AJ",
    color: "green",
    online: true,
    unread: 2,
    lastMessage: "Thank you! I'll check it out.",
    time: "10:42 AM",
    messages: [
      {
        id: 1,
        text: "Hey! Have you seen the new items on Kampusly?",
        time: "10:35 AM",
        mine: false,
      },
      {
        id: 2,
        text: "Not yet. What did you find?",
        time: "10:38 AM",
        mine: true,
      },
      {
        id: 3,
        text: "Someone is selling really nice accessories!",
        time: "10:40 AM",
        mine: false,
      },
      {
        id: 4,
        text: "Thank you! I'll check it out.",
        time: "10:42 AM",
        mine: false,
      },
    ],
  },
  {
    id: 2,
    name: "Daniel Okafor",
    role: "Seller",
    avatar: "DO",
    color: "orange",
    online: true,
    unread: 0,
    lastMessage: "The black one is still available.",
    time: "9:56 AM",
    messages: [
      {
        id: 1,
        text: "Hello, I'm interested in the backpack you listed.",
        time: "9:50 AM",
        mine: true,
      },
      {
        id: 2,
        text: "Hi! Thanks for reaching out.",
        time: "9:52 AM",
        mine: false,
      },
      {
        id: 3,
        text: "The black one is still available.",
        time: "9:56 AM",
        mine: false,
      },
    ],
  },
  {
    id: 3,
    name: "FreshBite Kitchen",
    role: "Food Vendor",
    avatar: "FB",
    color: "red",
    online: true,
    unread: 1,
    lastMessage: "Your order will be ready shortly.",
    time: "9:30 AM",
    messages: [
      {
        id: 1,
        text: "Good morning! Can I order rice and chicken?",
        time: "9:20 AM",
        mine: true,
      },
      {
        id: 2,
        text: "Good morning! Yes, that is available.",
        time: "9:23 AM",
        mine: false,
      },
      {
        id: 3,
        text: "Your order will be ready shortly.",
        time: "9:30 AM",
        mine: false,
      },
    ],
  },
  {
    id: 4,
    name: "Blessing Adeyemi",
    role: "Student",
    avatar: "BA",
    color: "purple",
    online: false,
    unread: 0,
    lastMessage: "See you at the library!",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        text: "Are you studying at the library today?",
        time: "Yesterday",
        mine: false,
      },
      {
        id: 2,
        text: "Yes, I'll be there in the afternoon.",
        time: "Yesterday",
        mine: true,
      },
      {
        id: 3,
        text: "See you at the library!",
        time: "Yesterday",
        mine: false,
      },
    ],
  },
  {
    id: 5,
    name: "CleanWear Laundry",
    role: "Laundry Service",
    avatar: "CW",
    color: "blue",
    online: false,
    unread: 0,
    lastMessage: "We offer same-day service.",
    time: "Yesterday",
    messages: [
      {
        id: 1,
        text: "Do you offer same-day laundry?",
        time: "Yesterday",
        mine: true,
      },
      {
        id: 2,
        text: "Yes! We offer same-day service.",
        time: "Yesterday",
        mine: false,
      },
    ],
  },
];

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Messages() {
  const [chats, setChats] = useState(initialChats);
  const [activeChatId, setActiveChatId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [notice, setNotice] = useState("");
  const [showChatList, setShowChatList] = useState(true);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return chats;

    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(query) ||
        chat.role.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  function openChat(chatId) {
    setActiveChatId(chatId);
    setShowChatList(false);
    setShowDetails(false);

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === chatId ? { ...chat, unread: 0 } : chat
      )
    );

    setNotice("");
  }

  function sendMessage(event) {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !activeChat) return;

    const newMessage = {
      id: Date.now(),
      text,
      time: formatTime(),
      mine: true,
    };

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: text,
              time: newMessage.time,
            }
          : chat
      )
    );

    setMessageText("");
    setNotice("Message added to this conversation.");
  }

  function showUnavailableFeature(feature) {
    setNotice(`${feature} will be available in a future update.`);
  }

  return (
    <main className="km-page">
      <header className="km-topbar">
        <a href="/student/dashboard" className="km-brand">
          <span className="km-brand-icon">K</span>

          <span>
            <strong>kampusly</strong>
            <small>Campus Life, Simplified.</small>
          </span>
        </a>

        <a href="/student/dashboard" className="km-back-link">
          <ArrowLeft size={17} />
          <span>Dashboard</span>
        </a>
      </header>

      <section className="km-workspace">
        <aside
          className={`km-sidebar ${
            !showChatList ? "km-sidebar-mobile-hidden" : ""
          }`}
        >
          <div className="km-sidebar-heading">
            <div>
              <span className="km-eyebrow">YOUR CONNECTIONS</span>
              <h1>Messages</h1>
              <p>Stay connected with your campus community.</p>
            </div>

            <button
              type="button"
              className="km-icon-button"
              aria-label="New conversation"
              onClick={() =>
                showUnavailableFeature("Starting a new conversation")
              }
            >
              <MessageCircle size={20} />
            </button>
          </div>

          <label className="km-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search conversations"
            />

            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </label>

          <div className="km-list-label">
            <span>ALL MESSAGES</span>
            <span>{filteredChats.length}</span>
          </div>

          <div className="km-chat-list">
            {filteredChats.map((chat) => {
              const lastMessage =
                chat.messages[chat.messages.length - 1];

              return (
                <button
                  type="button"
                  key={chat.id}
                  className={`km-chat-item ${
                    activeChatId === chat.id ? "km-chat-item-active" : ""
                  }`}
                  onClick={() => openChat(chat.id)}
                >
                  <span className={`km-avatar km-avatar-${chat.color}`}>
                    {chat.avatar}

                    {chat.online && (
                      <span className="km-online-dot" />
                    )}
                  </span>

                  <span className="km-chat-preview">
                    <span className="km-chat-first-line">
                      <strong>{chat.name}</strong>
                      <small>{chat.time}</small>
                    </span>

                    <span className="km-chat-role">{chat.role}</span>

                    <span className="km-chat-last-line">
                      <span>
                        {lastMessage?.mine ? "You: " : ""}
                        {chat.lastMessage}
                      </span>

                      {chat.unread > 0 && (
                        <span className="km-unread-count">
                          {chat.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}

            {filteredChats.length === 0 && (
              <div className="km-empty-search">
                <Search size={25} />
                <strong>No conversations found</strong>
                <p>Try searching for a different name or keyword.</p>
              </div>
            )}
          </div>

          <div className="km-sidebar-footer">
            <span className="km-footer-indicator" />
            <span>Campus connections, all in one place.</span>
          </div>
        </aside>

        <section
          className={`km-conversation ${
            showChatList ? "km-conversation-mobile-hidden" : ""
          }`}
        >
          {activeChat ? (
            <>
              <header className="km-conversation-header">
                <button
                  type="button"
                  className="km-mobile-back km-icon-button"
                  aria-label="Back to conversations"
                  onClick={() => setShowChatList(true)}
                >
                  <ArrowLeft size={20} />
                </button>

                <span
                  className={`km-avatar km-avatar-${activeChat.color}`}
                >
                  {activeChat.avatar}

                  {activeChat.online && (
                    <span className="km-online-dot" />
                  )}
                </span>

                <div className="km-contact-info">
                  <strong>{activeChat.name}</strong>

                  <span>
                    <span
                      className={
                        activeChat.online
                          ? "km-status-online"
                          : "km-status-offline"
                      }
                    />
                    {activeChat.online ? "Online" : "Offline"} ·{" "}
                    {activeChat.role}
                  </span>
                </div>

                <div className="km-header-actions">
                  <button
                    type="button"
                    className="km-icon-button"
                    aria-label="Voice call"
                    onClick={() => showUnavailableFeature("Voice calls")}
                  >
                    <Phone size={19} />
                  </button>

                  <button
                    type="button"
                    className="km-icon-button"
                    aria-label="Video call"
                    onClick={() => showUnavailableFeature("Video calls")}
                  >
                    <Video size={20} />
                  </button>

                  <button
                    type="button"
                    className={`km-icon-button ${
                      showDetails ? "km-icon-button-selected" : ""
                    }`}
                    aria-label="Conversation information"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    <Info size={20} />
                  </button>
                </div>
              </header>

              {showDetails && (
                <div className="km-contact-details">
                  <span
                    className={`km-avatar km-avatar-${activeChat.color}`}
                  >
                    {activeChat.avatar}
                  </span>

                  <strong>{activeChat.name}</strong>
                  <span>{activeChat.role}</span>

                  <p>
                    Connect with your campus community through Kampusly.
                  </p>
                </div>
              )}

              <div className="km-message-area">
                <div className="km-conversation-intro">
                  <span
                    className={`km-avatar km-avatar-large km-avatar-${activeChat.color}`}
                  >
                    {activeChat.avatar}
                  </span>

                  <h2>{activeChat.name}</h2>
                  <span className="km-contact-role">
                    {activeChat.role}
                  </span>

                  <p>
                    This is the beginning of your conversation with{" "}
                    {activeChat.name}.
                  </p>
                </div>

                <div className="km-date-divider">
                  <span>Conversation history</span>
                </div>

                <div className="km-message-list">
                  {activeChat.messages.map((message, index) => {
                    const previousMessage =
                      activeChat.messages[index - 1];

                    const showSender =
                      !previousMessage ||
                      previousMessage.mine !== message.mine;

                    return (
                      <div
                        key={message.id}
                        className={`km-message-row ${
                          message.mine ? "km-message-row-mine" : ""
                        }`}
                      >
                        {!message.mine && (
                          <span
                            className={`km-message-mini-avatar ${
                              showSender ? "" : "km-avatar-invisible"
                            }`}
                          >
                            {activeChat.avatar}
                          </span>
                        )}

                        <div className="km-message-content">
                          {showSender && !message.mine && (
                            <span className="km-message-sender">
                              {activeChat.name}
                            </span>
                          )}

                          <div
                            className={`km-message-bubble ${
                              message.mine
                                ? "km-message-bubble-mine"
                                : ""
                            }`}
                          >
                            {message.text}
                          </div>

                          <span className="km-message-time">
                            {message.time}

                            {message.mine && (
                              <CheckCheck
                                size={14}
                                className="km-message-check"
                              />
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="km-composer-section">
                {notice && (
                  <div className="km-message-notice" role="status">
                    <span>{notice}</span>

                    <button
                      type="button"
                      aria-label="Dismiss notification"
                      onClick={() => setNotice("")}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                <form
                  className="km-composer"
                  onSubmit={sendMessage}
                >
                  <button
                    type="button"
                    className="km-composer-action"
                    aria-label="Attach file"
                    onClick={() =>
                      showUnavailableFeature("File attachments")
                    }
                  >
                    <Paperclip size={20} />
                  </button>

                  <button
                    type="button"
                    className="km-composer-action km-composer-image"
                    aria-label="Attach image"
                    onClick={() =>
                      showUnavailableFeature("Image sharing")
                    }
                  >
                    <Image size={20} />
                  </button>

                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    aria-label="Message text"
                    maxLength={2000}
                  />

                  <button
                    type="button"
                    className="km-composer-action km-composer-emoji"
                    aria-label="Emoji picker"
                    onClick={() =>
                      showUnavailableFeature("Emoji picker")
                    }
                  >
                    <Smile size={20} />
                  </button>

                  <button
                    type="submit"
                    className="km-send-button"
                    aria-label="Send message"
                    disabled={!messageText.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>

                <p className="km-composer-hint">
                  Keep your conversations friendly and respectful.
                </p>
              </div>
            </>
          ) : (
            <div className="km-empty-conversation">
              <MessageCircle size={38} />
              <h2>No conversation selected</h2>
              <p>Choose a conversation to start messaging.</p>
            </div>
          )}
        </section>

        {activeChat && showDetails && (
          <aside className="km-details-sidebar">
            <div className="km-details-heading">
              <strong>Contact details</strong>

              <button
                type="button"
                className="km-icon-button"
                aria-label="Close contact details"
                onClick={() => setShowDetails(false)}
              >
                <X size={19} />
              </button>
            </div>

            <span
              className={`km-avatar km-avatar-profile km-avatar-${activeChat.color}`}
            >
              {activeChat.avatar}
            </span>

            <h3>{activeChat.name}</h3>
            <p>{activeChat.role}</p>

            <div className="km-details-divider" />

            <span className="km-details-label">CAMPUS CONNECTION</span>
            <p className="km-details-description">
              Connect, communicate, and make campus life easier with
              Kampusly.
            </p>

            <div className="km-details-note">
              <Info size={17} />
              <span>
                Profile details and contact actions will be connected to
                the Kampusly backend later.
              </span>
            </div>
          </aside>
        )}
      </section>

      <footer className="km-page-footer">
        <span>© {new Date().getFullYear()} Kampusly</span>
        <span>Campus Life, Simplified.</span>
      </footer>
    </main>
  );
}