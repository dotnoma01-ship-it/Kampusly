import { useState } from "react";
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
X,
} from "lucide-react";
import "./StudentSidebar.css";
import { clearSession } from "../../lib/api";

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
const [showLogoutModal, setShowLogoutModal] = useState(false);

function handleNavigation(path) {
if (onNavigate) {
onNavigate();
}


navigate(path);


}

function handleLogout() {
setShowLogoutModal(true);
}

function confirmLogout() {
clearSession();


setShowLogoutModal(false);
navigate("/login", { replace: true });


}

return (
<> <aside className="kampusly-sidebar">
<button
type="button"
className="kampusly-sidebar-brand"
onClick={() => handleNavigation("/student/dashboard")}
aria-label="Kampusly home"
> <span className="kampusly-sidebar-brand-mark"> <ShoppingBag size={22} /> </span>


      <span>
        kampusly
        <span className="kampusly-sidebar-brand-dot">.</span>
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

  {showLogoutModal && (
    <div
      className="kampusly-logout-overlay"
      onClick={() => setShowLogoutModal(false)}
    >
      <div
        className="kampusly-logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kampusly-logout-title"
        aria-describedby="kampusly-logout-description"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="kampusly-logout-close"
          onClick={() => setShowLogoutModal(false)}
          aria-label="Close logout confirmation"
        >
          <X size={20} />
        </button>

        <div className="kampusly-logout-icon">
          <LogOut size={25} />
        </div>

        <h2 id="kampusly-logout-title">Log out?</h2>

        <p id="kampusly-logout-description">
          Are you sure you want to log out of your Kampusly account?
        </p>

        <div className="kampusly-logout-actions">
          <button
            type="button"
            className="kampusly-logout-cancel"
            onClick={() => setShowLogoutModal(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="kampusly-logout-confirm"
            onClick={confirmLogout}
          >
            Yes, log out
          </button>
        </div>
      </div>
    </div>
  )}
</>

);
}
