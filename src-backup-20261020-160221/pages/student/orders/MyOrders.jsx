import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Package,
  Search,
  ShoppingBag,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  CalendarDays,
  X,
  ReceiptText,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

const sampleOrders = [
  {
    id: "KMP-20261001",
    item: "Wireless Bluetooth Earbuds",
    description: "Black wireless earbuds with charging case",
    vendor: "Campus Gadgets",
    category: "Electronics",
    quantity: 1,
    price: 8500,
    deliveryFee: 700,
    status: "Delivered",
    date: "2026-10-15",
    deliveryAddress: "Campus collection point",
    icon: "🎧",
  },
  {
    id: "KMP-20261002",
    item: "Second-hand Engineering Textbook",
    description: "Used textbook in good condition",
    vendor: "Daniel's Student Store",
    category: "School Items",
    quantity: 1,
    price: 4500,
    deliveryFee: 500,
    status: "In Transit",
    date: "2026-10-18",
    deliveryAddress: "Student collection point",
    icon: "📚",
  },
  {
    id: "KMP-20261003",
    item: "Classic White Sneakers",
    description: "Pre-owned sneakers, size 42",
    vendor: "Tomi's Closet",
    category: "Fashion",
    quantity: 1,
    price: 12000,
    deliveryFee: 1000,
    status: "Pending",
    date: "2026-10-19",
    deliveryAddress: "Campus collection point",
    icon: "👟",
  },
  {
    id: "KMP-20261004",
    item: "Scientific Calculator",
    description: "Used scientific calculator in working condition",
    vendor: "Student Resale Hub",
    category: "School Items",
    quantity: 1,
    price: 6500,
    deliveryFee: 500,
    status: "Cancelled",
    date: "2026-10-12",
    deliveryAddress: "Campus collection point",
    icon: "🧮",
  },
];

const filters = ["All Orders", "Pending", "In Transit", "Delivered", "Cancelled"];

function formatMoney(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusIcon(status) {
  switch (status) {
    case "Pending":
      return <Clock3 size={15} />;
    case "In Transit":
      return <Truck size={15} />;
    case "Delivered":
      return <CheckCircle2 size={15} />;
    case "Cancelled":
      return <XCircle size={15} />;
    default:
      return <Package size={15} />;
  }
}

export default function MyOrders() {
  const navigate = useNavigate();

  const [orders] = useState(sampleOrders);
  const [activeFilter, setActiveFilter] = useState("All Orders");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All Orders" || order.status === activeFilter;

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        order.id.toLowerCase().includes(searchText) ||
        order.item.toLowerCase().includes(searchText) ||
        order.vendor.toLowerCase().includes(searchText) ||
        order.category.toLowerCase().includes(searchText);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, search]);

  const counts = {
    "All Orders": orders.length,
    Pending: orders.filter((order) => order.status === "Pending").length,
    "In Transit": orders.filter((order) => order.status === "In Transit").length,
    Delivered: orders.filter((order) => order.status === "Delivered").length,
    Cancelled: orders.filter((order) => order.status === "Cancelled").length,
  };

  function handleReorder(order) {
    setSelectedOrder(null);
    navigate("/student/feed", {
      state: {
        reorderItem: {
          name: order.item,
          vendor: order.vendor,
          price: order.price,
        },
      },
    });
  }

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
            <p>Keep track of the items you get from fellow students.</p>
          </div>

          <div className="orders-header-icon">
            <ShoppingBag size={24} />
          </div>
        </header>

        <section className="orders-summary" aria-label="Order summary">
          <div className="orders-summary-card">
            <div className="orders-summary-icon total">
              <Package size={21} />
            </div>
            <div>
              <span>Total orders</span>
              <strong>{counts["All Orders"]}</strong>
            </div>
          </div>

          <div className="orders-summary-card">
            <div className="orders-summary-icon pending">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Pending</span>
              <strong>{counts.Pending}</strong>
            </div>
          </div>

          <div className="orders-summary-card">
            <div className="orders-summary-icon transit">
              <Truck size={21} />
            </div>
            <div>
              <span>In transit</span>
              <strong>{counts["In Transit"]}</strong>
            </div>
          </div>

          <div className="orders-summary-card">
            <div className="orders-summary-icon delivered">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Delivered</span>
              <strong>{counts.Delivered}</strong>
            </div>
          </div>
        </section>

        <section className="orders-content">
          <div className="orders-section-heading">
            <div>
              <h2>Your purchases</h2>
              <p>View and manage your order activity.</p>
            </div>

            <span className="orders-count">
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          <div className="orders-search">
            <Search size={19} />
            <input
              type="search"
              placeholder="Search by item, vendor or order ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search orders"
            />

            {search && (
              <button
                type="button"
                className="orders-clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="orders-filters" aria-label="Filter orders">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`orders-filter ${
                  activeFilter === filter ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
                <span>{counts[filter]}</span>
              </button>
            ))}
          </div>

          {filteredOrders.length > 0 ? (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <article className="order-card" key={order.id}>
                  <div className="order-product-icon" aria-hidden="true">
                    {order.icon}
                  </div>

                  <div className="order-main">
                    <div className="order-card-top">
                      <span className="order-id">{order.id}</span>

                      <span
                        className={`order-status ${order.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <h3>{order.item}</h3>
                    <p className="order-vendor">
                      From <strong>{order.vendor}</strong>
                    </p>

                    <div className="order-meta">
                      <span>
                        <CalendarDays size={14} />
                        {formatDate(order.date)}
                      </span>

                      <span>
                        <Package size={14} />
                        Qty: {order.quantity}
                      </span>
                    </div>

                    <div className="order-card-bottom">
                      <div className="order-price">
                        <span>Total amount</span>
                        <strong>
                          {formatMoney(order.price + order.deliveryFee)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="order-details-button"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View details
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="orders-empty">
              <div className="orders-empty-icon">
                <Package size={34} />
              </div>

              <h3>No orders found</h3>

              <p>
                {search
                  ? "Try another search term or clear your search."
                  : "There are no orders in this category yet."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveFilter("All Orders");
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="orders-help-card">
            <div className="orders-help-icon">
              <ReceiptText size={22} />
            </div>
            <div>
              <h3>Need help with an order?</h3>
              <p>
                Contact the seller through Kampusly messages if you have a
                question about an item or delivery.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/student/messages")}
              aria-label="Open messages"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      </div>

      {selectedOrder && (
        <div
          className="order-modal-backdrop"
          onClick={() => setSelectedOrder(null)}
        >
          <section
            className="order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <span>ORDER DETAILS</span>
                <h2 id="order-modal-title">{selectedOrder.id}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="order-modal-product">
              <div className="order-product-icon large" aria-hidden="true">
                {selectedOrder.icon}
              </div>

              <div>
                <h3>{selectedOrder.item}</h3>
                <p>{selectedOrder.description}</p>
                <span
                  className={`order-status ${selectedOrder.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="order-modal-details">
              <div>
                <span>Seller</span>
                <strong>{selectedOrder.vendor}</strong>
              </div>

              <div>
                <span>Order date</span>
                <strong>{formatDate(selectedOrder.date)}</strong>
              </div>

              <div>
                <span>Quantity</span>
                <strong>{selectedOrder.quantity}</strong>
              </div>

              <div>
                <span>Delivery location</span>
                <strong className="order-location">
                  <MapPin size={15} />
                  {selectedOrder.deliveryAddress}
                </strong>
              </div>
            </div>

            <div className="order-price-breakdown">
              <div>
                <span>Item price</span>
                <span>{formatMoney(selectedOrder.price)}</span>
              </div>

              <div>
                <span>Delivery fee</span>
                <span>{formatMoney(selectedOrder.deliveryFee)}</span>
              </div>

              <div className="order-total-row">
                <strong>Total</strong>
                <strong>
                  {formatMoney(
                    selectedOrder.price + selectedOrder.deliveryFee
                  )}
                </strong>
              </div>
            </div>

            <div className="order-modal-actions">
              {selectedOrder.status === "Delivered" && (
                <button
                  type="button"
                  className="order-reorder-button"
                  onClick={() => handleReorder(selectedOrder)}
                >
                  <RotateCcw size={17} />
                  Find item again
                </button>
              )}

              <button
                type="button"
                className="order-close-button"
                onClick={() => setSelectedOrder(null)}
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
