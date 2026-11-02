import { useState } from "react";
import StudentSidebar from "../StudentSidebar";
import {
  ArrowLeft,
  ArrowDownLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  LockKeyhole,
  Wallet,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./WithdrawFunds.css";

const DEMO_BALANCE = 16500;

const initialBankAccounts = [
  {
    id: "bank-1",
    bankName: "Select a bank account",
    accountName: "",
    accountNumber: "",
  },
];

export default function WithdrawFunds() {
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [withdrawalRequested, setWithdrawalRequested] = useState(false);

  // Demo bank account list. Real accounts should come from a secure backend.
  const [bankAccounts] = useState(() => {
  try {
    const savedAccounts = JSON.parse(
      localStorage.getItem("kampuslyBankAccounts") || "[]"
    );

    return Array.isArray(savedAccounts) ? savedAccounts : [];
  } catch {
    return [];
  }
});

  const numericAmount = Number(amount) || 0;
  const selectedAccount = bankAccounts.find(
    (account) => account.id === selectedBank
  );

  const formatMoney = (value) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(value);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
    setErrors((previous) => ({ ...previous, amount: "" }));
    setNotice("");
  };

  const handleReview = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!amount || numericAmount <= 0) {
      nextErrors.amount = "Enter a valid withdrawal amount.";
    } else if (numericAmount < 1000) {
      nextErrors.amount = "The minimum withdrawal amount is â‚¦1,000.";
    } else if (numericAmount > DEMO_BALANCE) {
      nextErrors.amount = "Your withdrawal amount exceeds your demo balance.";
    }

    if (!selectedBank) {
      nextErrors.bank = "Please select a bank account.";
    }

    setErrors(nextErrors);
    setNotice("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setShowReview(true);
  };

  const handleConfirmWithdrawal = () => {
    setShowReview(false);
    setWithdrawalRequested(true);
    setNotice(
      "Demo withdrawal request created. No money has been transferred."
    );
  };

  const handleNewWithdrawal = () => {
    setAmount("");
    setSelectedBank("");
    setDescription("");
    setErrors({});
    setNotice("");
    setWithdrawalRequested(false);
  };

  return (
    <main className="withdraw-page">
      <div className="withdraw-container">
        <Link to="/student/wallet" className="withdraw-back">
          <ArrowLeft size={19} />
          <span>Back to wallet</span>
        </Link>

        <header className="withdraw-header">
          <div className="withdraw-title-icon">
            <ArrowDownLeft size={27} />
          </div>

          <div>
            <p className="withdraw-eyebrow">KAMPUSLY WALLET</p>
            <h1>Withdraw funds</h1>
            <p className="withdraw-subtitle">
              Request a withdrawal to your registered bank account.
            </p>
          </div>
        </header>

        <section className="withdraw-balance-card">
          <div className="withdraw-balance-top">
            <span>
              <Wallet size={17} />
              Available balance
            </span>
            <span className="withdraw-demo-badge">DEMO</span>
          </div>

          <h2>{formatMoney(DEMO_BALANCE)}</h2>

          <p>
            This is a demonstration balance. It is not connected to a real
            wallet.
          </p>
        </section>

        {notice && (
          <div
            className={`withdraw-notice ${
              withdrawalRequested ? "withdraw-notice-success" : ""
            }`}
            role="status"
          >
            {withdrawalRequested && <CheckCircle2 size={20} />}
            <span>{notice}</span>
          </div>
        )}

        {withdrawalRequested ? (
          <section className="withdraw-success-card">
            <div className="withdraw-success-icon">
              <CheckCircle2 size={34} />
            </div>

            <h2>Demo request completed</h2>

            <p>
              Your withdrawal flow has been tested successfully. No real
              withdrawal was submitted, and your wallet balance has not changed.
            </p>

            <div className="withdraw-success-summary">
              <span>Requested amount</span>
              <strong>{formatMoney(numericAmount)}</strong>

              <span>Destination</span>
              <strong>
                {selectedAccount?.bankName || "Demo bank account"}
              </strong>

              <span>Request status</span>
              <strong className="withdraw-status-demo">Demo only</strong>
            </div>

            <button
              type="button"
              className="withdraw-primary-button"
              onClick={handleNewWithdrawal}
            >
              Make another request
            </button>

            <Link
              to="/student/wallet"
              className="withdraw-secondary-button"
            >
              Return to wallet
            </Link>
          </section>
        ) : (
          <div className="withdraw-content-grid">
            <section className="withdraw-form-card">
              <div className="withdraw-section-heading">
                <div>
                  <h2>Withdrawal details</h2>
                  <p>Enter the amount you want to withdraw.</p>
                </div>
              </div>

              <form onSubmit={handleReview} noValidate>
                <div className="withdraw-field">
                  <label htmlFor="withdraw-amount">
                    Amount <span>*</span>
                  </label>

                  <div
                    className={`withdraw-amount-input ${
                      errors.amount ? "withdraw-input-error" : ""
                    }`}
                  >
                    <span>â‚¦</span>
                    <input
                      id="withdraw-amount"
                      type="number"
                      min="1000"
                      max={DEMO_BALANCE}
                      step="100"
                      placeholder="0.00"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setAmount(String(DEMO_BALANCE));
                        setErrors((previous) => ({
                          ...previous,
                          amount: "",
                        }));
                      }}
                    >
                      MAX
                    </button>
                  </div>

                  {errors.amount && (
                    <p className="withdraw-error-text">{errors.amount}</p>
                  )}

                  <p className="withdraw-field-hint">
                    Minimum withdrawal: â‚¦1,000
                  </p>
                </div>

                <div className="withdraw-field">
                  <label htmlFor="withdraw-bank">
                    Destination bank account <span>*</span>
                  </label>

                  <div className="withdraw-select-wrap">
                    <Building2 size={19} />
                    <select
                      id="withdraw-bank"
                      value={selectedBank}
                      className={errors.bank ? "withdraw-input-error" : ""}
                      onChange={(event) => {
                        setSelectedBank(event.target.value);
                        setErrors((previous) => ({
                          ...previous,
                          bank: "",
                        }));
                      }}
                    >
                      <option value="">Choose a bank account</option>
                      {bankAccounts
                        .filter((account) => account.accountNumber)
                        .map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.bankName} â€” {account.accountNumber}
                          </option>
                        ))}
                    </select>
                  </div>

                  {errors.bank && (
                    <p className="withdraw-error-text">{errors.bank}</p>
                  )}

                  {bankAccounts.every((account) => !account.accountNumber) && (
                    <div className="withdraw-no-bank">
                      <Info size={18} />
                      <div>
                        <strong>No bank account added yet</strong>
                        <p>
                          Add a verified bank account before requesting a real
                          withdrawal.
                        </p>
                        <Link to="/student/wallet/bank-account">
                          Add bank account <ChevronRight size={15} />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <div className="withdraw-field">
                  <label htmlFor="withdraw-description">
                    Description <span className="withdraw-optional">(optional)</span>
                  </label>

                  <textarea
                    id="withdraw-description"
                    rows="3"
                    maxLength="160"
                    placeholder="Add a note about this withdrawal..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />

                  <p className="withdraw-field-hint">
                    {description.length}/160 characters
                  </p>
                </div>

                <div className="withdraw-info-box">
                  <Clock3 size={19} />
                  <div>
                    <strong>Processing time</strong>
                    <p>
                      Actual processing times will depend on the payment
                      provider and bank once withdrawals are connected.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="withdraw-primary-button"
                  disabled={
                    !bankAccounts.some(
                      (account) =>
                        account.id === selectedBank && account.accountNumber
                    )
                  }
                >
                  Review withdrawal
                  <ChevronRight size={19} />
                </button>

                <p className="withdraw-secure-note">
                  <LockKeyhole size={15} />
                  Demo only â€” no money will be moved.
                </p>
              </form>
            </section>

            <aside className="withdraw-side-card">
              <h3>Before you withdraw</h3>

              <div className="withdraw-tip">
                <span>01</span>
                <p>Make sure your bank account details are correct.</p>
              </div>

              <div className="withdraw-tip">
                <span>02</span>
                <p>Check your available balance before requesting a withdrawal.</p>
              </div>

              <div className="withdraw-tip">
                <span>03</span>
                <p>Review the withdrawal details before confirming.</p>
              </div>

              <div className="withdraw-side-divider" />

              <div className="withdraw-fee-row">
                <span>Withdrawal fee</span>
                <strong>Not configured</strong>
              </div>

              <div className="withdraw-fee-row">
                <span>Minimum amount</span>
                <strong>â‚¦1,000</strong>
              </div>

              <div className="withdraw-side-note">
                <Info size={17} />
                <p>
                  Fees and limits must be confirmed when the real wallet
                  backend is implemented.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {showReview && (
        <div
          className="withdraw-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowReview(false);
            }
          }}
        >
          <section
            className="withdraw-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-review-title"
          >
            <button
              type="button"
              className="withdraw-modal-close"
              onClick={() => setShowReview(false)}
              aria-label="Close review"
            >
              <X size={21} />
            </button>

            <div className="withdraw-modal-icon">
              <ArrowDownLeft size={25} />
            </div>

            <h2 id="withdraw-review-title">Review withdrawal</h2>
            <p className="withdraw-modal-subtitle">
              Check these details before continuing.
            </p>

            <div className="withdraw-review-amount">
              <span>Withdrawal amount</span>
              <strong>{formatMoney(numericAmount)}</strong>
            </div>

            <div className="withdraw-review-row">
              <span>Destination bank</span>
              <strong>{selectedAccount?.bankName}</strong>
            </div>

            <div className="withdraw-review-row">
              <span>Account name</span>
              <strong>{selectedAccount?.accountName}</strong>
            </div>

            <div className="withdraw-review-row">
              <span>Account number</span>
              <strong>{selectedAccount?.accountNumber}</strong>
            </div>

            <div className="withdraw-review-row">
              <span>Description</span>
              <strong>{description.trim() || "Not provided"}</strong>
            </div>

            <div className="withdraw-demo-warning">
              This is a UI demonstration. Confirming will not transfer money
              or create a real withdrawal request.
            </div>

            <button
              type="button"
              className="withdraw-primary-button"
              onClick={handleConfirmWithdrawal}
            >
              Confirm demo request
            </button>

            <button
              type="button"
              className="withdraw-cancel-button"
              onClick={() => setShowReview(false)}
            >
              Go back and edit
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
