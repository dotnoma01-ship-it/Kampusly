import { useMemo, useState } from "react";
import { useCallback, useEffect } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Filter,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest, getStoredProfile } from "../../../lib/api";
import "./TransactionHistory.css";

const transactionTypes = [
  { value: "all", label: "All transactions" },
  { value: "funding", label: "Wallet funding" },
  { value: "sent", label: "Money sent" },
  { value: "received", label: "Money received" },
  { value: "withdrawal", label: "Withdrawals" },
];

const statusOptions = ["all", "Completed", "Pending", "Rejected", "Failed"];

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

function toDisplayTransaction(transaction, currentUserId) {
  const recipientId = getUserId(transaction.recipient);
  const isReceived = transaction.type === "deposit" ||
    (transaction.type === "transfer" && recipientId === currentUserId);
  const type = transaction.type === "deposit"
    ? "funding"
    : transaction.type === "withdrawal"
      ? "withdrawal"
      : isReceived ? "received" : "sent";
  const senderName = transaction.type === "deposit"
    ? "Kampusly"
    : getUserName(transaction.sender, "Not available");
  const recipientName = transaction.type === "deposit"
    ? "Your Kampusly wallet"
    : transaction.type === "withdrawal"
      ? transaction.withdrawalAccountName || transaction.withdrawalBankName || "Bank account"
      : getUserName(transaction.recipient, "Not available");

  return {
    id: transaction._id || transaction.id || transaction.reference,
    title: type === "funding" ? "Wallet funding" : type === "withdrawal"
      ? "Withdrawal" : type === "received" ? "Money received" : "Money sent",
    description: transaction.description || (type === "withdrawal"
      ? "Withdrawal to bank account" : type === "funding" ? "Wallet deposit" : "Wallet transfer"),
    type,
    direction: isReceived ? "received" : "sent",
    amount: Number(transaction.amount) || 0,
    status: formatStatus(transaction.status),
    date: transaction.createdAt,
    name: isReceived ? senderName : recipientName,
    reference: transaction.reference || "Not available",
    paymentMethod: transaction.type === "withdrawal" ? "Bank withdrawal"
      : transaction.type === "deposit" ? "Wallet funding" : "Kampusly Wallet",
    senderName,
    recipientName,
  };
}

function getTransactionIcon(transaction) {
  if (transaction.type === "funding") return Wallet;
  if (transaction.type === "withdrawal") return Banknote;
  if (transaction.direction === "received") return ArrowDownLeft;
  return ArrowUpRight;
}

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const currentUserId = getUserId(getStoredProfile());

  const loadTransactions = useCallback(async () => {
    setError("");

    try {
      const response = await apiRequest("/wallet");
      const records = Array.isArray(response.transactions) ? response.transactions : [];
      setTransactions(records.map((transaction) =>
        toDisplayTransaction(transaction, currentUserId)
      ));
    } catch (requestError) {
      setTransactions([]);
      setError(requestError.message || "Unable to load transaction history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    Promise.resolve().then(() => loadTransactions());
  }, [loadTransactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          transaction.title,
          transaction.description,
          transaction.name,
          transaction.reference,
          transaction.id,
        ].some((value) => value.toLowerCase().includes(normalizedSearch));

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        transaction.status.toLowerCase() === statusFilter.toLowerCase();

      const transactionDate = new Date(transaction.date);
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && transactionDate >= startOfToday) ||
        (dateFilter === "7days" &&
          transactionDate >=
            new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) ||
        (dateFilter === "30days" &&
          transactionDate >=
            new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [transactions, search, typeFilter, statusFilter, dateFilter]);

  const completedTransactions = transactions.filter(
    (transaction) => transaction.status === "Completed"
  );

  const moneyReceived = completedTransactions
    .filter((transaction) => transaction.direction === "received")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const moneySent = completedTransactions
    .filter((transaction) => transaction.direction === "sent")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const printReceipt = (transaction) => {
    const receiptWindow = window.open("", "_blank", "width=650,height=750");

    if (!receiptWindow) {
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kampusly Transaction Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 24px;
            color: #17251d;
          }
          .brand { color: #176b45; font-size: 28px; font-weight: 800; }
          .subtitle { color: #68766e; margin-bottom: 28px; }
          .amount {
            background: #edf8f0;
            padding: 24px;
            border-radius: 14px;
            text-align: center;
            margin-bottom: 24px;
          }
          .amount strong { display: block; font-size: 30px; margin-top: 10px; }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            padding: 13px 0;
            border-bottom: 1px solid #e6ece8;
          }
          .label { color: #68766e; }
          .value { font-weight: 600; text-align: right; overflow-wrap: anywhere; }
          .footer {
            text-align: center;
            margin-top: 32px;
            color: #68766e;
            font-size: 13px;
          }
          @media print { button { display: none; } body { margin: 0 auto; } }
        </style>
      </head>
      <body>
        <div class="brand">kampusly.</div>
        <p class="subtitle">Transaction receipt</p>
        <div class="amount">
          ${escapeHtml(transaction.status)}
          <strong>${formatMoney(transaction.amount)}</strong>
        </div>
        <div class="row"><span class="label">Transaction</span><span class="value">${escapeHtml(transaction.title)}</span></div>
        <div class="row"><span class="label">Description</span><span class="value">${escapeHtml(transaction.description)}</span></div>
        <div class="row"><span class="label">Sender</span><span class="value">${escapeHtml(transaction.senderName)}</span></div>
        <div class="row"><span class="label">Recipient</span><span class="value">${escapeHtml(transaction.recipientName)}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${escapeHtml(formatDate(transaction.date))}</span></div>
        <div class="row"><span class="label">Time</span><span class="value">${escapeHtml(formatTime(transaction.date))}</span></div>
        <div class="row"><span class="label">Payment method</span><span class="value">${escapeHtml(transaction.paymentMethod)}</span></div>
        <div class="row"><span class="label">Reference</span><span class="value">${escapeHtml(transaction.reference)}</span></div>
        <div class="footer">
          This receipt reflects the transaction status shown above.<br />
          Kampusly · Helping students help each other
        </div>
        <button onclick="window.print()">Print receipt</button>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  return (
    <main className="transaction-history-page">
      <div className="transaction-history-container">
        <div className="transaction-breadcrumb">
          <Link to="/student/wallet">
            <ArrowLeft size={17} />
            <span>Back to wallet</span>
          </Link>
        </div>

        <section className="transaction-page-heading">
          <div>
            <span className="transaction-eyebrow">YOUR WALLET</span>
            <h1>Transaction history</h1>
            <p>Keep track of money coming in and going out of your wallet.</p>
          </div>

          <div className="transaction-demo-label">
            <span />
            Live wallet records
          </div>
        </section>

        <section className="transaction-summary-grid">
          <article className="transaction-summary-card">
            <div className="transaction-summary-top">
              <span className="transaction-summary-icon total">
                <FileText size={21} />
              </span>
              <span className="transaction-summary-caption">All records</span>
            </div>
            <h2>{isLoading ? "—" : transactions.length}</h2>
            <p>Total transactions</p>
          </article>

          <article className="transaction-summary-card">
            <div className="transaction-summary-top">
              <span className="transaction-summary-icon incoming">
                <ArrowDownLeft size={21} />
              </span>
              <span className="transaction-summary-caption">Completed</span>
            </div>
            <h2>{isLoading || error ? "—" : formatMoney(moneyReceived)}</h2>
            <p>Money received</p>
          </article>

          <article className="transaction-summary-card">
            <div className="transaction-summary-top">
              <span className="transaction-summary-icon outgoing">
                <ArrowUpRight size={21} />
              </span>
              <span className="transaction-summary-caption">Completed</span>
            </div>
            <h2>{isLoading || error ? "—" : formatMoney(moneySent)}</h2>
            <p>Money sent</p>
          </article>
        </section>

        <section className="transaction-content-card">
          <div className="transaction-list-heading">
            <div>
              <h2>All transactions</h2>
              <p>
                {filteredTransactions.length}{" "}
                {filteredTransactions.length === 1 ? "record" : "records"} found
              </p>
            </div>

            <button
              type="button"
              className={`transaction-filter-toggle ${
                showFilters ? "active" : ""
              }`}
              onClick={() => setShowFilters((current) => !current)}
            >
              <Filter size={17} />
              Filters
              <ChevronDown
                size={16}
                className={showFilters ? "rotated" : ""}
              />
            </button>
          </div>

          <div className="transaction-search">
            <Search size={19} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, description or reference..."
              aria-label="Search transactions"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {showFilters && (
            <div className="transaction-filter-panel">
              <label>
                Transaction type
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  {transactionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All statuses" : status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Date range
                <select
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                >
                  <option value="all">Any time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                </select>
              </label>

              <button
                type="button"
                className="transaction-reset-button"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}

          <div className="transaction-table-header">
            <span>TRANSACTION</span>
            <span>DATE & TIME</span>
            <span>AMOUNT</span>
            <span>STATUS</span>
            <span />
          </div>

          <div className="transaction-rows">
            {isLoading ? (
              <div className="transaction-empty-state" role="status">
                <span>
                  <Clock3 size={25} />
                </span>
                <h3>Loading transaction history</h3>
                <p>Retrieving your wallet records.</p>
              </div>
            ) : error ? (
              <div className="transaction-empty-state" role="alert">
                <span>
                  <X size={25} />
                </span>
                <h3>Unable to load transactions</h3>
                <p>{error}</p>
                <button type="button" onClick={loadTransactions}>
                  Try again
                </button>
              </div>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction) => {
                  const TransactionIcon = getTransactionIcon(transaction);
                  const isIncoming = transaction.direction === "received";

                  return (
                    <button
                      type="button"
                      className="transaction-row"
                      key={transaction.id}
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="transaction-main-cell">
                        <span
                          className={`transaction-type-icon ${
                            isIncoming ? "incoming" : "outgoing"
                          }`}
                        >
                          <TransactionIcon size={20} />
                        </span>
                        <span className="transaction-main-text">
                          <strong>{transaction.title}</strong>
                          <small>{transaction.name}</small>
                        </span>
                      </div>

                      <div className="transaction-date-cell">
                        <strong>{formatDate(transaction.date)}</strong>
                        <small>{formatTime(transaction.date)}</small>
                      </div>

                      <div
                        className={`transaction-amount-cell ${
                          isIncoming ? "positive" : "negative"
                        }`}
                      >
                        <strong>
                          {isIncoming ? "+" : "-"}
                          {formatMoney(transaction.amount)}
                        </strong>
                      </div>

                      <div className="transaction-status-cell">
                        <span
                          className={`transaction-status-badge ${transaction.status.toLowerCase()}`}
                        >
                          {transaction.status === "Completed" && (
                            <CheckCircle2 size={13} />
                          )}
                          {transaction.status === "Pending" && (
                            <Clock3 size={13} />
                          )}
                          {transaction.status}
                        </span>
                      </div>

                      <span className="transaction-row-arrow">
                        <ArrowRight size={17} />
                      </span>
                    </button>
                  );
                })
            ) : (
              <div className="transaction-empty-state">
                <span>
                  <Search size={25} />
                </span>
                <h3>{transactions.length ? "No transactions found" : "No transactions yet"}</h3>
                <p>
                  {transactions.length
                    ? "Try changing your search or filters to find what you're looking for."
                    : "Your wallet activity will appear here when you make a transaction."}
                </p>
                {transactions.length > 0 && (
                  <button type="button" onClick={resetFilters}>
                    Clear search and filters
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="transaction-list-footer">
            <span>
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transaction records
            </span>
            <span className="transaction-footer-note">
              Wallet records
            </span>
          </div>
        </section>

        <div className="transaction-security-note">
          <span>
            <Wallet size={20} />
          </span>
          <div>
            <strong>Your money, your records</strong>
            <p>
              Your transaction history is loaded from your Kampusly wallet.
            </p>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <div
          className="transaction-modal-overlay"
          onClick={() => setSelectedTransaction(null)}
        >
          <section
            className="transaction-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="transaction-modal-header">
              <div>
                <span className="transaction-eyebrow">
                  TRANSACTION DETAILS
                </span>
                <h2 id="transaction-detail-title">Transaction receipt</h2>
              </div>
              <button
                type="button"
                className="transaction-modal-close"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close transaction details"
              >
                <X size={21} />
              </button>
            </div>

            <div className="transaction-detail-amount">
              <span
                className={`transaction-detail-icon ${
                  selectedTransaction.direction === "received"
                    ? "incoming"
                    : "outgoing"
                }`}
              >
                {selectedTransaction.direction === "received" ? (
                  <ArrowDownLeft size={25} />
                ) : (
                  <ArrowUpRight size={25} />
                )}
              </span>
              <span className="transaction-detail-type">
                {selectedTransaction.title}
              </span>
              <h3>
                {selectedTransaction.direction === "received" ? "+" : "-"}
                {formatMoney(selectedTransaction.amount)}
              </h3>
              <span
                className={`transaction-status-badge ${selectedTransaction.status.toLowerCase()}`}
              >
                {selectedTransaction.status}
              </span>
            </div>

              <div className="transaction-detail-list">
                <div>
                <span>Sender</span>
                <strong>{selectedTransaction.senderName}</strong>
              </div>
              <div>
                <span>Recipient</span>
                <strong>{selectedTransaction.recipientName}</strong>
              </div>
              <div>
                <span>Description</span>
                <strong>{selectedTransaction.description}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>{formatDate(selectedTransaction.date)}</strong>
              </div>
              <div>
                <span>Time</span>
                <strong>{formatTime(selectedTransaction.date)}</strong>
              </div>
              <div>
                <span>Payment method</span>
                <strong>{selectedTransaction.paymentMethod}</strong>
              </div>
              <div>
                <span>Reference number</span>
                <strong className="transaction-reference">
                  {selectedTransaction.reference}
                </strong>
              </div>
            </div>

            <div className="transaction-demo-warning">
              This receipt reflects the recorded transaction status. Pending,
              rejected, and failed transactions are not completed payments.
            </div>

            <button
              type="button"
              className="transaction-print-button"
              onClick={() => printReceipt(selectedTransaction)}
            >
              <Download size={18} />
              Print receipt
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default TransactionHistory;

