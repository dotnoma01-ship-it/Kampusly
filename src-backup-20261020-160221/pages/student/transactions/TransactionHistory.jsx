import { useMemo, useState } from "react";
import StudentSidebar from "../StudentSidebar";
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
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./TransactionHistory.css";

const demoTransactions = [
  {
    id: "TXN-20261019-001",
    title: "Wallet funding",
    description: "Wallet top-up",
    type: "funding",
    direction: "received",
    amount: 10000,
    status: "Successful",
    date: "2026-10-19T09:30:00",
    name: "Wallet Funding",
    reference: "KMP-FND-10001",
    paymentMethod: "Bank transfer",
  },
  {
    id: "TXN-20261018-002",
    title: "Money sent",
    description: "Transfer to student",
    type: "sent",
    direction: "sent",
    amount: 2500,
    status: "Successful",
    date: "2026-10-18T14:15:00",
    name: "Daniel Okafor",
    reference: "KMP-SND-10002",
    paymentMethod: "Kampusly Wallet",
  },
  {
    id: "TXN-20261017-003",
    title: "Vendor payment",
    description: "Food purchase",
    type: "vendor",
    direction: "sent",
    amount: 3500,
    status: "Successful",
    date: "2026-10-17T12:45:00",
    name: "Fresh Bites",
    reference: "KMP-VND-10003",
    paymentMethod: "Kampusly Wallet",
  },
  {
    id: "TXN-20261016-004",
    title: "Money received",
    description: "Transfer received",
    type: "received",
    direction: "received",
    amount: 5000,
    status: "Successful",
    date: "2026-10-16T16:20:00",
    name: "Grace Adeyemi",
    reference: "KMP-RCV-10004",
    paymentMethod: "Kampusly Wallet",
  },
  {
    id: "TXN-20261015-005",
    title: "Withdrawal",
    description: "Withdrawal to bank account",
    type: "withdrawal",
    direction: "sent",
    amount: 2000,
    status: "Pending",
    date: "2026-10-15T10:10:00",
    name: "Personal bank account",
    reference: "KMP-WTH-10005",
    paymentMethod: "Bank transfer",
  },
  {
    id: "TXN-20261014-006",
    title: "Wallet funding",
    description: "Wallet top-up",
    type: "funding",
    direction: "received",
    amount: 1500,
    status: "Failed",
    date: "2026-10-14T08:40:00",
    name: "Wallet Funding",
    reference: "KMP-FND-10006",
    paymentMethod: "Bank transfer",
  },
];

const transactionTypes = [
  { value: "all", label: "All transactions" },
  { value: "funding", label: "Wallet funding" },
  { value: "sent", label: "Money sent" },
  { value: "received", label: "Money received" },
  { value: "vendor", label: "Vendor payments" },
  { value: "withdrawal", label: "Withdrawals" },
];

const statusOptions = ["all", "Successful", "Pending", "Failed"];

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

function getTransactionIcon(transaction) {
  if (transaction.type === "funding") return Wallet;
  if (transaction.type === "withdrawal") return Banknote;
  if (transaction.type === "vendor") return ShoppingBag;
  if (transaction.direction === "received") return ArrowDownLeft;
  return ArrowUpRight;
}

function TransactionHistory() {
  const [transactions] = useState(demoTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const successfulTransactions = transactions.filter(
    (transaction) => transaction.status === "Successful"
  );

  const moneyReceived = successfulTransactions
    .filter((transaction) => transaction.direction === "received")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const moneySent = successfulTransactions
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
        <p class="subtitle">Transaction receipt Â· DEMO</p>
        <div class="amount">
          ${transaction.status}
          <strong>${formatMoney(transaction.amount)}</strong>
        </div>
        <div class="row"><span class="label">Transaction</span><span class="value">${transaction.title}</span></div>
        <div class="row"><span class="label">Name</span><span class="value">${transaction.name}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">${formatDate(transaction.date)}</span></div>
        <div class="row"><span class="label">Time</span><span class="value">${formatTime(transaction.date)}</span></div>
        <div class="row"><span class="label">Payment method</span><span class="value">${transaction.paymentMethod}</span></div>
        <div class="row"><span class="label">Reference</span><span class="value">${transaction.reference}</span></div>
        <div class="footer">
          This receipt contains sample demonstration data. It is not proof of an actual payment.<br />
          Kampusly Â· Helping students help each other
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
            Demo transactions
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
            <h2>{transactions.length}</h2>
            <p>Total transactions</p>
          </article>

          <article className="transaction-summary-card">
            <div className="transaction-summary-top">
              <span className="transaction-summary-icon incoming">
                <ArrowDownLeft size={21} />
              </span>
              <span className="transaction-summary-caption">Successful</span>
            </div>
            <h2>{formatMoney(moneyReceived)}</h2>
            <p>Money received</p>
          </article>

          <article className="transaction-summary-card">
            <div className="transaction-summary-top">
              <span className="transaction-summary-icon outgoing">
                <ArrowUpRight size={21} />
              </span>
              <span className="transaction-summary-caption">Successful</span>
            </div>
            <h2>{formatMoney(moneySent)}</h2>
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
            {filteredTransactions.length > 0 ? (
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
                          {transaction.status === "Successful" && (
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
                <h3>No transactions found</h3>
                <p>
                  Try changing your search or filters to find what you're
                  looking for.
                </p>
                <button type="button" onClick={resetFilters}>
                  Clear search and filters
                </button>
              </div>
            )}
          </div>

          <div className="transaction-list-footer">
            <span>
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              demo transactions
            </span>
            <span className="transaction-footer-note">
              Sample data only
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
              When the wallet backend is connected, this page will display your
              actual transactions and verified payment statuses.
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
                <span>Recipient / sender</span>
                <strong>{selectedTransaction.name}</strong>
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
              This is a sample transaction for demonstration purposes. It does
              not represent a real payment.
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

