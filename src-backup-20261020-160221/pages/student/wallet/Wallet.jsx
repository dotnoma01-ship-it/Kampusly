import { useState } from "react";
import StudentSidebar from "../StudentSidebar";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  History,
  Plus,
  RefreshCw,
  Send,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Wallet.css";

const initialTransactions = [
  {
    id: "KMP-1001",
    name: "Wallet funding",
    description: "Wallet deposit",
    type: "credit",
    amount: 15000,
    date: "Today",
    status: "Successful",
  },
  {
    id: "KMP-1002",
    name: "Campus food purchase",
    description: "Payment to food vendor",
    type: "debit",
    amount: 3500,
    date: "Yesterday",
    status: "Successful",
  },
  {
    id: "KMP-1003",
    name: "Student transfer",
    description: "Money received",
    type: "credit",
    amount: 5000,
    date: "12 Oct 2026",
    status: "Successful",
  },
];

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function Wallet() {
  const navigate = useNavigate();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [transactions] = useState(initialTransactions);

  // Demo balance for the initial interface.
  // Connect this to the authenticated user's backend wallet later.
  const [balance] = useState(16500);

  const storedWalletNumber =
    localStorage.getItem("kampuslyWalletNumber") || "";

  const walletNumber = storedWalletNumber || "Not assigned yet";

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);

    window.setTimeout(() => {
      setNotice("");
    }, 3500);
  };

  const copyWalletNumber = async () => {
    if (!storedWalletNumber) {
      showNotice(
        "Your wallet number has not been assigned yet.",
        "error"
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(storedWalletNumber);
      showNotice("Wallet number copied successfully.");
    } catch {
      showNotice(
        "Unable to copy automatically. Please copy your wallet number manually.",
        "error"
      );
    }
  };

  const totalReceived = transactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalSpent = transactions
    .filter((transaction) => transaction.type === "debit")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const goTo = (path) => {
    navigate(path);
  };

  return (
    <div className="ks-dashboard">
      <div className="ks-dashboard-body">
        <StudentSidebar />
        <main className="ks-dashboard-main kw-page">
          <div className="kw-container">
        {/* Header */}
        <header className="kw-header">
          <button
            type="button"
            className="kw-back-button"
            onClick={() => navigate("/student/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={19} />
          </button>

          <div className="kw-header-title">
            <span className="kw-eyebrow">
              YOUR MONEY, IN ONE PLACE
            </span>

            <h1>My Wallet</h1>

            <p>
              Manage your balance and campus transactions.
            </p>
          </div>

          <button
            type="button"
            className="kw-history-button"
            onClick={() => goTo("/student/transactions")}
          >
            <History size={18} />
            <span>History</span>
          </button>
        </header>

        {/* Notifications */}
        {notice && (
          <div
            className={`kw-notice ${
              noticeType === "error" ? "kw-notice-error" : ""
            }`}
            role="status"
          >
            {noticeType === "error" ? (
              <X size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            <span>{notice}</span>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Balance Card */}
        <section className="kw-balance-card">
          <div className="kw-balance-card-top">
            <div className="kw-wallet-label">
              <span className="kw-wallet-icon">
                <WalletIcon size={22} />
              </span>

              <span>Available balance</span>
            </div>

            <button
              type="button"
              className="kw-visibility-button"
              onClick={() =>
                setBalanceVisible((visible) => !visible)
              }
              aria-label={
                balanceVisible ? "Hide balance" : "Show balance"
              }
            >
              {balanceVisible ? (
                <Eye size={19} />
              ) : (
                <EyeOff size={19} />
              )}
            </button>
          </div>

          <h2 className="kw-balance-amount">
            {balanceVisible
              ? formatMoney(balance)
              : "â‚¦ â€¢â€¢â€¢â€¢â€¢â€¢"}
          </h2>

          <div className="kw-wallet-number-row">
            <div>
              <span className="kw-wallet-number-label">
                Wallet number
              </span>

              <strong>{walletNumber}</strong>
            </div>

            <button
              type="button"
              className="kw-copy-button"
              onClick={copyWalletNumber}
              aria-label="Copy wallet number"
            >
              <Copy size={17} />
            </button>
          </div>

          <div className="kw-balance-decoration kw-decoration-one" />
          <div className="kw-balance-decoration kw-decoration-two" />
        </section>

        {/* Quick Actions */}
        <section className="kw-actions-section">
          <div className="kw-section-heading">
            <div>
              <span className="kw-eyebrow">
                QUICK ACTIONS
              </span>

              <h2>What would you like to do?</h2>
            </div>
          </div>

          <div className="kw-actions-grid">
            {/* Fund Wallet */}
            <button
              type="button"
              className="kw-action-card kw-action-fund"
              onClick={() =>
                goTo("/student/wallet/fund")
              }
            >
              <span className="kw-action-icon">
                <Plus size={23} />
              </span>

              <span className="kw-action-title">
                Fund wallet
              </span>

              <span className="kw-action-description">
                Add money to your wallet
              </span>

              <ArrowUpRight
                className="kw-action-arrow"
                size={19}
              />
            </button>

            {/* Unified Send Money */}
            <button
              type="button"
              className="kw-action-card"
              onClick={() =>
                goTo("/student/wallet/send")
              }
            >
              <span className="kw-action-icon kw-icon-blue">
                <Send size={22} />
              </span>

              <span className="kw-action-title">
                Send money
              </span>

              <span className="kw-action-description">
                Pay students or campus vendors
              </span>

              <ArrowUpRight
                className="kw-action-arrow"
                size={19}
              />
            </button>

            {/* Withdraw */}
            <button
              type="button"
              className="kw-action-card"
              onClick={() =>
                goTo("/student/wallet/withdraw")
              }
            >
              <span className="kw-action-icon kw-icon-orange">
                <ArrowUpRight size={22} />
              </span>

              <span className="kw-action-title">
                Withdraw
              </span>

              <span className="kw-action-description">
                Withdraw to your bank
              </span>

              <ArrowUpRight
                className="kw-action-arrow"
                size={19}
              />
            </button>

            {/* Transaction History */}
            <button
              type="button"
              className="kw-action-card"
              onClick={() =>
                goTo("/student/transactions")
              }
            >
              <span className="kw-action-icon kw-icon-purple">
                <CreditCard size={22} />
              </span>

              <span className="kw-action-title">
                Transactions
              </span>

              <span className="kw-action-description">
                View all wallet activity
              </span>

              <ArrowUpRight
                className="kw-action-arrow"
                size={19}
              />
            </button>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="kw-summary-grid">
          <article className="kw-summary-card">
            <span className="kw-summary-icon kw-summary-green">
              <ArrowDownLeft size={20} />
            </span>

            <div>
              <p>Total received</p>
              <h3>{formatMoney(totalReceived)}</h3>
            </div>
          </article>

          <article className="kw-summary-card">
            <span className="kw-summary-icon kw-summary-red">
              <ArrowUpRight size={20} />
            </span>

            <div>
              <p>Total spent</p>
              <h3>{formatMoney(totalSpent)}</h3>
            </div>
          </article>
        </section>

        {/* Recent Transactions */}
        <section className="kw-transactions-section">
          <div className="kw-transactions-heading">
            <div>
              <span className="kw-eyebrow">
                YOUR ACTIVITY
              </span>

              <h2>Recent transactions</h2>
            </div>

            <button
              type="button"
              className="kw-view-all"
              onClick={() =>
                goTo("/student/transactions")
              }
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          {transactions.length > 0 ? (
            <div className="kw-transactions-list">
              {transactions.slice(0, 5).map((transaction) => (
                <button
                  type="button"
                  className="kw-transaction-row"
                  key={transaction.id}
                  onClick={() =>
                    goTo(
                      `/student/transactions/${transaction.id}`
                    )
                  }
                >
                  <span
                    className={`kw-transaction-icon ${
                      transaction.type === "credit"
                        ? "kw-transaction-credit"
                        : "kw-transaction-debit"
                    }`}
                  >
                    {transaction.type === "credit" ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </span>

                  <span className="kw-transaction-info">
                    <strong>{transaction.name}</strong>

                    <span>{transaction.description}</span>

                    <small>{transaction.date}</small>
                  </span>

                  <span className="kw-transaction-amount">
                    <strong
                      className={
                        transaction.type === "credit"
                          ? "kw-amount-positive"
                          : "kw-amount-negative"
                      }
                    >
                      {transaction.type === "credit" ? "+" : "-"}
                      {formatMoney(transaction.amount)}
                    </strong>

                    <span className="kw-transaction-status">
                      <CheckCircle2 size={13} />
                      {transaction.status}
                    </span>
                  </span>

                  <ArrowRight
                    size={17}
                    className="kw-transaction-chevron"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="kw-empty-state">
              <span className="kw-empty-icon">
                <History size={26} />
              </span>

              <h3>No transactions yet</h3>

              <p>
                Your wallet activity will appear here when you
                start making transactions.
              </p>

              <button
                type="button"
                onClick={() =>
                  goTo("/student/wallet/fund")
                }
              >
                Fund your wallet <ArrowRight size={17} />
              </button>
            </div>
          )}
        </section>

        {/* Security Note */}
        <section className="kw-security-note">
          <span className="kw-security-icon">
            <CheckCircle2 size={20} />
          </span>

          <div>
            <h3>Your wallet, your control</h3>

            <p>
              Keep your account secure. Always confirm the
              recipient and amount before authorising a
              transaction.
            </p>
          </div>
        </section>

        {/* Refresh */}
        <button
          type="button"
          className="kw-refresh-button"
          onClick={() =>
            showNotice(
              "This demo wallet is using sample data. Live balance updates will be connected to the backend.",
              "success"
            )
          }
        >
          <RefreshCw size={15} />
          Refresh wallet
        </button>

        {/* Demo Disclaimer */}
        <div className="kw-demo-notice">
          <Clock3 size={15} />

          This wallet currently displays sample data. Real
          balances, transfers, and payments must be connected
          to the backend before use with real money.
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Wallet;

