import { useState } from "react";
import StudentSidebar from "../StudentSidebar";
import { useCallback, useEffect, useMemo } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
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
import { apiRequest, getStoredProfile } from "../../../lib/api";
import "./Wallet.css";

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatTransactionDate(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatStatus(status) {
  if (!status) return "Unknown";
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

function getUserId(user) {
  if (!user) return "";
  if (typeof user === "string") return user;
  return String(user._id || user.id || "");
}

function getUserName(user, fallback) {
  if (!user || typeof user === "string") return fallback;
  return user.name || user.username || fallback;
}

function Wallet() {
  const navigate = useNavigate();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const currentUserId = getUserId(getStoredProfile());

  const loadWallet = useCallback(async ({ refreshing = false } = {}) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);

    setError("");

    try {
      const response = await apiRequest("/wallet");
      setWallet(response.wallet || null);
      setTransactions(Array.isArray(response.transactions) ? response.transactions : []);
    } catch (requestError) {
      setWallet(null);
      setTransactions([]);
      setError(requestError.message || "Unable to load your wallet. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadWallet());
  }, [loadWallet]);

  const displayedTransactions = useMemo(() => transactions.map((transaction) => {
    const recipientId = getUserId(transaction.recipient);
    const isCredit = transaction.type === "deposit" ||
      (transaction.type === "transfer" && recipientId === currentUserId);
    const name = transaction.type === "transfer"
      ? isCredit
        ? `From ${getUserName(transaction.sender, "Kampusly user")}`
        : `To ${getUserName(transaction.recipient, "Kampusly user")}`
      : transaction.type === "withdrawal"
        ? "Withdrawal request"
        : "Wallet funding";

    return {
      id: transaction._id || transaction.id || transaction.reference,
      name,
      description: transaction.description || (transaction.type === "withdrawal"
        ? "Withdrawal to your bank account"
        : transaction.type === "deposit" ? "Wallet deposit" : "Wallet transfer"),
      type: isCredit ? "credit" : "debit",
      amount: Number(transaction.amount) || 0,
      date: formatTransactionDate(transaction.createdAt),
      status: formatStatus(transaction.status),
    };
  }), [currentUserId, transactions]);

  const balance = Number(wallet?.balance) || 0;
  const walletNumber = wallet?.walletNumber || "Not assigned yet";

  const showNotice = (message, type = "success") => {
    setNotice(message);
    setNoticeType(type);

    window.setTimeout(() => {
      setNotice("");
    }, 3500);
  };

  const copyWalletNumber = async () => {
    if (!wallet?.walletNumber) {
      showNotice(
        "Your wallet number has not been assigned yet.",
        "error"
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(wallet.walletNumber);
      showNotice("Wallet number copied successfully.");
    } catch {
      showNotice(
        "Unable to copy automatically. Please copy your wallet number manually.",
        "error"
      );
    }
  };

  const totalReceived = displayedTransactions
    .filter((transaction) => transaction.type === "credit")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalSpent = displayedTransactions
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
              ? isLoading
                ? "Loading..."
                : wallet
                  ? formatMoney(balance)
                  : "—"
              : "â‚¦ â€¢â€¢â€¢â€¢â€¢â€¢"}
          </h2>

          <div className="kw-wallet-number-row">
            <div>
              <span className="kw-wallet-number-label">
                Wallet number
              </span>

              <strong>{isLoading ? "Loading..." : walletNumber}</strong>
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
              <h3>{wallet ? formatMoney(totalReceived) : "—"}</h3>
            </div>
          </article>

          <article className="kw-summary-card">
            <span className="kw-summary-icon kw-summary-red">
              <ArrowUpRight size={20} />
            </span>

            <div>
              <p>Total spent</p>
              <h3>{wallet ? formatMoney(totalSpent) : "—"}</h3>
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

          {isLoading ? (
            <div className="kw-empty-state" role="status">
              <span className="kw-empty-icon">
                <RefreshCw size={26} />
              </span>

              <h3>Loading wallet activity</h3>

              <p>Retrieving your balance and recent transactions.</p>
            </div>
          ) : error ? (
            <div className="kw-empty-state" role="alert">
              <span className="kw-empty-icon">
                <X size={26} />
              </span>

              <h3>Unable to load your wallet</h3>

              <p>{error}</p>

              <button type="button" onClick={() => loadWallet()}>
                Try again <RefreshCw size={17} />
              </button>
            </div>
          ) : displayedTransactions.length > 0 ? (
            <div className="kw-transactions-list">
              {displayedTransactions.slice(0, 5).map((transaction) => (
                <button
                  type="button"
                  className="kw-transaction-row"
                  key={transaction.id}
                  onClick={() => goTo("/student/transactions")}
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
            loadWallet({ refreshing: true })
          }
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw size={15} />
          {isRefreshing ? "Refreshing..." : "Refresh wallet"}
        </button>

        {/* Wallet status */}
        <div className="kw-demo-notice">
          <CheckCircle2 size={15} />

          Your balance and transaction activity are loaded from your Kampusly wallet.
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Wallet;

