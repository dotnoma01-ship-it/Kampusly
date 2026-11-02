import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
Home,
Newspaper,
ShoppingBag,
Package,
MessageCircle,
Bell,
UserRound,
Wallet,
ReceiptText,
Sparkles,
LogOut,
} from "lucide-react";
import "./StudentSidebar.css";

const navigationGroups = [
{
label: "WORKSPACE",
items: [
{
name: "Home",
icon: Home,
path: "/student/dashboard",
},
{
name: "Campus Feed",
icon: Newspaper,
path: "/student/feed",
},
{
name: "Services",
icon: ShoppingBag,
path: "/student/services",
},
{
name: "My Orders",
icon: Package,
path: "/student/orders",
},
{
name: "Messages",
icon: MessageCircle,
path: "/student/messages",
},
{
name: "Notifications",
icon: Bell,
path: "/student/notifications",
},
],
},
{
label: "MY ACCOUNT",
items: [
{
name: "My Profile",
icon: UserRound,
path: "/student/profile",
},
{
name: "My Wallet",
icon: Wallet,
path: "/student/wallet",
},
{
name: "Transactions",
icon: ReceiptText,
path: "/student/transactions",
},
],
},
];

function isActiveRoute(pathname, itemPath) {
if (itemPath === "/student/dashboard") {
return pathname === itemPath;
}

if (itemPath === "/student/services") {
return pathname.startsWith("/student/services");
}

if (itemPath === "/student/wallet") {
return pathname.startsWith("/student/wallet");
}

if (itemPath === "/student/transactions") {
return pathname === itemPath;
}

return pathname === itemPath;
}

export default function StudentSidebar({ onNavigate }) {
const navigate = useNavigate();
const location = useLocation();

function handleNavigation(path) {
if (onNavigate) {
onNavigate();
}


navigate(path);


}

function handleLogout() {
// This only clears the current client session.
// Add your actual authentication logout flow here
// when the backend authentication is connected.
const confirmed = window.confirm(
"Are you sure you want to log out?"
);


if (!confirmed) return;

navigate("/login");


}

return ( <aside className="kampusly-sidebar">
<button
type="button"
className="kampusly-sidebar-brand"
onClick={() => handleNavigation("/student/dashboard")}
aria-label="Kampusly home"
> <span className="kampusly-sidebar-brand-mark"> <ShoppingBag size={22} /> </span>


    <span>
      kampusly<span className="kampusly-sidebar-brand-dot">.</span>
    </span>
  </button>

  <div className="kampusly-sidebar-navigation">
    {navigationGroups.map((group) => (
      <section
        className="kampusly-sidebar-group"
        key={group.label}
      >
        <h2 className="kampusly-sidebar-label">
          {group.label}
        </h2>

        {group.items.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(
            location.pathname,
            item.path
          );

          return (
            <button
              type="button"
              key={item.path}
              className={`kampusly-sidebar-link ${
                active ? "active" : ""
              }`}
              onClick={() => handleNavigation(item.path)}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.9} />

              <span>{item.name}</span>

              {active && (
                <span className="kampusly-sidebar-indicator" />
              )}
            </button>
          );
        })}
      </section>
    ))}
  </div>

  <div className="kampusly-sidebar-bottom">
    <div className="kampusly-sidebar-help">
      <span className="kampusly-sidebar-help-icon">
        <Sparkles size={18} />
      </span>

      <strong>Campus life, simplified.</strong>

      <p>Your campus community starts here.</p>
    </div>

    <button
      type="button"
      className="kampusly-sidebar-logout"
      onClick={handleLogout}
    >
      <LogOut size={18} />
      <span>Log out</span>
    </button>
  </div>
</aside>
);
}
