import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../StudentSidebar";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Info,
  LockKeyhole,
  Search,
  ShieldCheck,
  Store,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import "./SendMoney.css";

const DEMO_BALANCE = 16500;

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function SendMoney() {
  const navigate = useNavigate();

  const [recipientType, setRecipientType] = useState("student");
  const [walletNumber, setWalletNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [description, setDescription] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [errors, setErrors] = useState({});

  const paymentAmount = Number(amount) || 0;
  const deliveryAmount =
    recipientType === "vendor" ? Number(deliveryFee) || 0 : 0;
  const totalAmount = paymentAmount + deliveryAmount;

  const showNotice = (message, type = "info") => {
    setNotice(message);
    setNoticeType(type);
  };

  const changeRecipientType = (type) => {
    setRecipientType(type);
    setWalletNumber("");
    setRecipient(null);
    setDeliveryFee("");
    setErrors({});
    setNotice("");
  };

  const handleFindRecipient = () => {
    setNotice("");
    setRecipient(null);

    if (!walletNumber.trim()) {
      setErrors({
        walletNumber: "Please enter a wallet number.",
      });
      return;
    }

    setErrors({});
    setIsSearching(true);

    // Real recipient verification must be performed by the backend.
    window.setTimeout(() => {
      setIsSearching(false);
      showNotice(
        "Recipient lookup is not connected yet. No recipient has been verified.",
        "info"
      );
    }, 500);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!walletNumber.trim()) {
      nextErrors.walletNumber = "Enter the recipient's wallet number.";
    }

    if (!recipient) {
      nextErrors.recipient =
        "The recipient must be verified before a real payment can proceed.";
    }

    if (!amount || !Number.isFinite(Number(amount)) || paymentAmount <= 0) {
      nextErrors.amount = "Enter a valid payment amount.";
    } else if (paymentAmount < 100) {
      nextErrors.amount = "The minimum payment is â‚¦100.";
    }

    if (
      recipientType === "vendor" &&
      deliveryFee !== "" &&
      (!Number.isFinite(Number(deliveryFee)) ||
        Number(deliveryFee) < 0)
    ) {
      nextErrors.deliveryFee = "Enter a valid delivery fee.";
    }

    if (totalAmount > DEMO_BALANCE) {
      nextErrors.amount =
        "The total payment exceeds the displayed demo balance.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice("");

    if (!validateForm()) return;

    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);

    showNotice(
      "Demo only: no money was sent. Connect the Kampusly backend to verify recipients and process secure payments.",
      "info"
    );
  };

  return (
    <main className="sm-page">
      <div className="sm-container">
        <button
          type="button"
          className="sm-back-button"
          onClick={() => navigate("/student/wallet")}
        >
          <ArrowLeft size={18} />
          Back to Wallet
        </button>

        <header className="sm-header">
          <div className="sm-header-icon">
            <Wallet size={27} />
          </div>

          <div>
            <span className="sm-eyebrow">KAMPUSLY WALLET</span>
            <h1>Send Money</h1>
            <p>Pay students and campus vendors in one place.</p>
          </div>
        </header>

        <div className="sm-demo-banner">
          <Info size={20} />
          <div>
            <strong>Demo mode</strong>
            <p>
              This page is not connected to real wallet balances or payment
              processing. No money will be moved.
            </p>
          </div>
        </div>

        {notice && (
          <div
            className={`sm-notice sm-notice-${noticeType}`}
            role="status"
          >
            <Info size={18} />
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="sm-balance-card">
          <div className="sm-balance-icon">
            <Wallet size={22} />
          </div>

          <div>
            <span>Available demo balance</span>
            <strong>{formatMoney(DEMO_BALANCE)}</strong>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/wallet")}
          >
            My wallet <ArrowRight size={15} />
          </button>
        </section>

        <form className="sm-card" onSubmit={handleSubmit}>
          <div className="sm-section-heading">
            <div>
              <h2>Who are you paying?</h2>
              <p>Select the recipient type to continue.</p>
            </div>
          </div>

          <div className="sm-recipient-options">
            <button
              type="button"
              className={`sm-recipient-option ${
                recipientType === "student" ? "active" : ""
              }`}
              onClick={() => changeRecipientType("student")}
              aria-pressed={recipientType === "student"}
            >
              <span className="sm-option-icon sm-student-icon">
                <UserRound size={22} />
              </span>

              <span className="sm-option-text">
                <strong>Student</strong>
                <small>Send to another student</small>
              </span>

              <span className="sm-radio">
                {recipientType === "student" && <span />}
              </span>
            </button>

            <button
              type="button"
              className={`sm-recipient-option ${
                recipientType === "vendor" ? "active" : ""
              }`}
              onClick={() => changeRecipientType("vendor")}
              aria-pressed={recipientType === "vendor"}
            >
              <span className="sm-option-icon sm-vendor-icon">
                <Store size={22} />
              </span>

              <span className="sm-option-text">
                <strong>Vendor</strong>
                <small>Pay for goods or services</small>
              </span>

              <span className="sm-radio">
                {recipientType === "vendor" && <span />}
              </span>
            </button>
          </div>

          <div className="sm-field">
            <label htmlFor="sm-wallet-number">
              {recipientType === "student"
                ? "Student's wallet number"
                : "Vendor's wallet number"}
            </label>

            <div className="sm-input-with-button">
              <Wallet size={19} />

              <input
                id="sm-wallet-number"
                type="text"
                autoComplete="off"
                placeholder="Enter wallet number"
                value={walletNumber}
                onChange={(event) => {
                  setWalletNumber(event.target.value);
                  setRecipient(null);
                  setErrors((previous) => ({
                    ...previous,
                    walletNumber: "",
                    recipient: "",
                  }));
                  setNotice("");
                }}
              />

              <button
                type="button"
                className="sm-find-button"
                onClick={handleFindRecipient}
                disabled={isSearching}
              >
                <Search size={15} />
                {isSearching ? "Checking..." : "Find"}
              </button>
            </div>

            {errors.walletNumber && (
              <p className="sm-error">{errors.walletNumber}</p>
            )}

            {errors.recipient && (
              <p className="sm-error">{errors.recipient}</p>
            )}

            <small>
              Always verify the recipient's registered name before making
              payments.
            </small>
          </div>

          {recipient && (
            <div className="sm-verified-recipient">
              <div className="sm-verified-avatar">
                {recipientType === "student" ? (
                  <CircleUserRound size={24} />
                ) : (
                  <Store size={24} />
                )}
              </div>

              <div>
                <strong>{recipient.name}</strong>
                <span>{recipient.walletNumber}</span>
              </div>

              <CheckCircle2 size={20} />
            </div>
          )}

          <div className="sm-field">
            <label htmlFor="sm-amount">Amount to send</label>

            <div className="sm-amount-input">
              <span>â‚¦</span>
              <input
                id="sm-amount"
                type="number"
                min="100"
                step="1"
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setErrors((previous) => ({
                    ...previous,
                    amount: "",
                  }));
                }}
              />
            </div>

            {errors.amount && (
              <p className="sm-error">{errors.amount}</p>
            )}

            <div className="sm-quick-amounts">
              {[500, 1000, 2000, 5000].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => {
                    setAmount(String(value));
                    setErrors((previous) => ({
                      ...previous,
                      amount: "",
                    }));
                  }}
                >
                  â‚¦{value.toLocaleString("en-NG")}
                </button>
              ))}
            </div>
          </div>

          {recipientType === "vendor" && (
            <div className="sm-field">
              <label htmlFor="sm-delivery-fee">
                Delivery fee <span>(if applicable)</span>
              </label>

              <div className="sm-amount-input">
                <span>â‚¦</span>
                <input
                  id="sm-delivery-fee"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0.00"
                  value={deliveryFee}
                  onChange={(event) => {
                    setDeliveryFee(event.target.value);
                    setErrors((previous) => ({
                      ...previous,
                      deliveryFee: "",
                      amount: "",
                    }));
                  }}
                />
              </div>

              {errors.deliveryFee && (
                <p className="sm-error">{errors.deliveryFee}</p>
              )}

              <small>
                The delivery fee is included in the total payment.
              </small>
            </div>
          )}

          <div className="sm-field">
            <label htmlFor="sm-description">
              Payment description <span>(optional)</span>
            </label>

            <textarea
              id="sm-description"
              rows="3"
              maxLength="150"
              placeholder={
                recipientType === "student"
                  ? "e.g. Contribution for our group project"
                  : "e.g. Food order, laundry, or groceries"
              }
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <small className="sm-character-count">
              {description.length}/150 characters
            </small>
          </div>

          <section className="sm-summary">
            <h3>Payment summary</h3>

            <div>
              <span>Recipient type</span>
              <strong>
                {recipientType === "student" ? "Student" : "Vendor"}
              </strong>
            </div>

            <div>
              <span>Payment amount</span>
              <strong>{formatMoney(paymentAmount)}</strong>
            </div>

            {recipientType === "vendor" && (
              <div>
                <span>Delivery fee</span>
                <strong>{formatMoney(deliveryAmount)}</strong>
              </div>
            )}

            <div className="sm-summary-total">
              <span>Total deduction</span>
              <strong>{formatMoney(totalAmount)}</strong>
            </div>
          </section>

          <button type="submit" className="sm-submit-button">
            Review Payment <ArrowRight size={18} />
          </button>

          <p className="sm-security-note">
            <LockKeyhole size={15} />
            Real payments require verified recipients and secure backend
            processing.
          </p>
        </form>
      </div>

      {showConfirmation && (
        <div
          className="sm-modal-backdrop"
          onClick={() => setShowConfirmation(false)}
        >
          <section
            className="sm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sm-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sm-modal-icon">
              <ShieldCheck size={28} />
            </div>

            <h2 id="sm-confirm-title">Review your payment</h2>

            <p className="sm-modal-description">
              Check these details before continuing. This demonstration will
              not move any money.
            </p>

            <div className="sm-modal-details">
              <div>
                <span>Recipient type</span>
                <strong>
                  {recipientType === "student" ? "Student" : "Vendor"}
                </strong>
              </div>

              <div>
                <span>Wallet number</span>
                <strong>{walletNumber}</strong>
              </div>

              <div>
                <span>Payment amount</span>
                <strong>{formatMoney(paymentAmount)}</strong>
              </div>

              {recipientType === "vendor" && (
                <div>
                  <span>Delivery fee</span>
                  <strong>{formatMoney(deliveryAmount)}</strong>
                </div>
              )}

              <div className="sm-modal-total">
                <span>Total</span>
                <strong>{formatMoney(totalAmount)}</strong>
              </div>

              {description.trim() && (
                <div>
                  <span>Description</span>
                  <strong>{description.trim()}</strong>
                </div>
              )}
            </div>

            <div className="sm-modal-warning">
              Recipient verification and live payment processing are not
              connected. No money will be sent.
            </div>

            <button
              type="button"
              className="sm-submit-button"
              onClick={handleConfirm}
            >
              Finish Demo <CheckCircle2 size={18} />
            </button>

            <button
              type="button"
              className="sm-cancel-button"
              onClick={() => setShowConfirmation(false)}
            >
              Go back and edit
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default SendMoney;
