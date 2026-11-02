import { ArrowLeft, MessageCircle, Package, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

export default function MyOrders() {
  const navigate = useNavigate();

  return (
    <main className="kampusly-orders">
      <div className="orders-container">
        <header className="orders-header">
          <button
            type="button"
            className="orders-back-button"
            onClick={() => navigate("/student/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="orders-heading">
            <span className="orders-eyebrow">YOUR ACTIVITY</span>
            <h1>My Orders</h1>
            <p>Purchases will appear here when ordering is available.</p>
          </div>

          <div className="orders-header-icon">
            <ShoppingBag size={24} />
          </div>
        </header>

        <section className="orders-content" aria-labelledby="orders-empty-title">
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <Package size={34} />
            </div>
            <h2 id="orders-empty-title">No orders yet</h2>
            <p>
              Kampusly listings do not currently have a checkout or order
              workflow. Contacting a seller does not create a purchase record.
            </p>
            <button type="button" onClick={() => navigate("/student/services")}>
              Explore services
            </button>
          </div>

          <div className="orders-help-card">
            <div className="orders-help-icon">
              <MessageCircle size={22} />
            </div>
            <div>
              <h3>Already discussing a listing?</h3>
              <p>Continue your conversation with the seller in Kampusly messages.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/student/messages")}
              aria-label="Open messages"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
