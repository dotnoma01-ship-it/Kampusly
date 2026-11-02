import { useState } from "react";
import StudentSidebar from "../StudentSidebar";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Info,
  LockKeyhole,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./FundWallet.css";

const quickAmounts = [1000, 2000, 5000, 10000];

function formatMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function FundWallet() {
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = Number(amount);
  const serviceFee = 0;
  const totalAmount = numericAmount + serviceFee;

  function showNotice(message, type = "success") {
    setNotice(message);
    setNoticeType(type);
  }

  function handleAmountChange(event) {
    const value = event.target.value;

    if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      setNotice("");
    }
  }

  function handleQuickAmount(value) {
    setAmount(String(value));
    setNotice("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!numericAmount || numericAmount <= 0) {
      showNotice("Enter an amount greater than zero.", "error");
      return;
    }

    if (numericAmount < 100) {
      showNotice("The minimum funding amount is ₦:100.", "error");
      return;
    }

    if (numericAmount > 1000000) {
      showNotice(
        "The maximum funding amount for this form is ₦:1,000,000.",
        "error"
      );
      return;
    }

    setIsSubmitting(true);

    // Payment provider integration will be added later.
    window.setTimeout(() => {
      setIsSubmitting(false);

      showNotice(
        "The funding interface is ready, but payments are not connected yet. Your wallet has not been credited.",
        "error"
      );
    }, 600);
  }

  return (
    <div className="ks-dashboard">
      <div className="ks-dashboard-body">
        <StudentSidebar />
        <main className="ks-dashboard-main kfw-page">
          <div className="kfw-container">
        <header className="kfw-header">
          <button
            type="button"
            className="kfw-back-button"
            onClick={() => navigate("/student/wallet")}
            aria-label="Back to wallet"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <span className="kfw-eyebrow">WALLET SERVICES</span>
            <h1>Fund your wallet</h1>
            <p>Add money to your Kampusly wallet securely.</p>
          </div>
        </header>

        {notice && (
          <div
            className={`kfw-notice ${
              noticeType === "error" ? "kfw-notice-error" : ""
            }`}
            role="status"
          >
            {noticeType === "error" ? (
              <Info size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}

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

        <div className="kfw-layout">
          <section className="kfw-main-card">
            <div className="kfw-card-heading">
              <span className="kfw-heading-icon">
                <Wallet size={22} />
              </span>

              <div>
                <h2>How much would you like to add?</h2>
                <p>Choose an amount to continue.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="kfw-field-label" htmlFor="fund-amount">
                Funding amount
              </label>

              <div className="kfw-amount-input-wrap">
                <span className="kfw-currency-symbol">₦:</span>

                <input
                  id="fund-amount"
                  type="number"
                  min="100"
                  max="1000000"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  aria-describedby="fund-amount-help"
                />
              </div>

              <p className="kfw-field-help" id="fund-amount-help">
                Minimum ₦:100 · Maximum ₦:1,000,000
              </p>

              <div className="kfw-quick-amounts">
                {quickAmounts.map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      numericAmount === value
                        ? "kfw-quick-amount kfw-quick-amount-active"
                        : "kfw-quick-amount"
                    }
                    onClick={() => handleQuickAmount(value)}
                  >
                    ₦:{value.toLocaleString("en-NG")}
                  </button>
                ))}
              </div>

              <div className="kfw-divider" />

              <div className="kfw-payment-heading">
                <h3>Payment method</h3>
                <span>Choose how to pay</span>
              </div>

              <div className="kfw-payment-options">
                <button
                  type="button"
                  className={
                    paymentMethod === "card"
                      ? "kfw-payment-option kfw-payment-selected"
                      : "kfw-payment-option"
                  }
                  onClick={() => setPaymentMethod("card")}
                  aria-pressed={paymentMethod === "card"}
                >
                  <span className="kfw-payment-icon">
                    <CreditCard size={21} />
                  </span>

                  <span className="kfw-payment-copy">
                    <strong>Debit card</strong>
                    <small>Pay using your bank card</small>
                  </span>

                  <span className="kfw-radio" />
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "transfer"
                      ? "kfw-payment-option kfw-payment-selected"
                      : "kfw-payment-option"
                  }
                  onClick={() => setPaymentMethod("transfer")}
                  aria-pressed={paymentMethod === "transfer"}
                >
                  <span className="kfw-payment-icon kfw-transfer-icon">
                    <ArrowRight size={21} />
                  </span>

                  <span className="kfw-payment-copy">
                    <strong>Bank transfer</strong>
                    <small>Transfer from your bank account</small>
                  </span>

                  <span className="kfw-radio" />
                </button>
              </div>

              <div className="kfw-payment-info">
                <ShieldCheck size={18} />
                <p>
                  Your payment will be processed through a supported
                  payment provider once the payment integration is enabled.
                </p>
              </div>

              <button
                type="submit"
                className="kfw-submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Preparing..."
                ) : (
                  <>
                    Continue to payment <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="kfw-summary-column">
            <section className="kfw-summary-card">
              <span className="kfw-summary-eyebrow">FUNDING SUMMARY</span>

              <h2>{formatMoney(numericAmount > 0 ? numericAmount : 0)}</h2>

              <div className="kfw-summary-line">
                <span>Funding amount</span>
                <strong>
                  {formatMoney(numericAmount > 0 ? numericAmount : 0)}
                </strong>
              </div>

              <div className="kfw-summary-line">
                <span>Service fee</span>
                <strong>{formatMoney(serviceFee)}</strong>
              </div>

              <div className="kfw-summary-divider" />

              <div className="kfw-summary-total">
                <span>Total payment</span>
                <strong>
                  {formatMoney(numericAmount > 0 ? totalAmount : 0)}
                </strong>
              </div>

              <div className="kfw-summary-destination">
                <span className="kfw-destination-icon">
                  <Wallet size={19} />
                </span>

                <span>
                  <small>Funds will be added to</small>
                  <strong>Your Kampusly wallet</strong>
                </span>
              </div>
            </section>

            <section className="kfw-security-card">
              <span className="kfw-security-icon">
                <LockKeyhole size={20} />
              </span>

              <div>
                <h3>Security first</h3>
                <p>
                  Never share your card PIN, password, or one-time
                  verification code with anyone.
                </p>
              </div>
            </section>

            <button
              type="button"
              className="kfw-cancel-button"
              onClick={() => navigate("/student/wallet")}
            >
              Cancel and return to wallet
            </button>
          </aside>
        </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FundWallet;

