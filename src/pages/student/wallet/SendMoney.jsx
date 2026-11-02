import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
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
import { apiRequest } from "../../../lib/api";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function createIdempotencyKey() {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    throw new Error("Your browser cannot securely create a transfer request. Please update it and try again.");
  }

  return globalThis.crypto.randomUUID();
}

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
  const [wallet, setWallet] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [walletError, setWalletError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const transferKeyRef = useRef("");

  const paymentAmount = Number(amount) || 0;
  const deliveryAmount =
    recipientType === "vendor" ? Number(deliveryFee) || 0 : 0;
  const totalAmount = paymentAmount + deliveryAmount;

  const loadWallet = useCallback(async () => {
    setWalletError("");

    try {
      const response = await apiRequest("/wallet");
      setWallet(response.wallet || null);
    } catch (requestError) {
      setWallet(null);
      setWalletError(requestError.message || "Unable to load your wallet balance. Please try again.");
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadWallet());
  }, [loadWallet]);

  const clearTransferKey = () => {
    transferKeyRef.current = "";
  };

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
    clearTransferKey();
  };

  const handleFindRecipient = async () => {
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

    try {
      const response = await apiRequest(
        `/wallet/recipients/${encodeURIComponent(walletNumber.trim())}`
      );
      setRecipient(response.recipient || null);
      if (!response.recipient) {
        setErrors({ recipient: "Recipient wallet could not be verified." });
      }
    } catch (requestError) {
      setErrors({ recipient: requestError.message || "Recipient wallet could not be verified." });
    } finally {
      setIsSearching(false);
    }
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

    if (!amount || !Number.isSafeInteger(paymentAmount) || paymentAmount <= 0) {
      nextErrors.amount = "Enter a valid payment amount.";
    } else if (paymentAmount < 100) {
      nextErrors.amount = "The minimum payment is ₦100.";
    }

    if (
      recipientType === "vendor" &&
      deliveryFee !== "" &&
      (!Number.isSafeInteger(Number(deliveryFee)) ||
        Number(deliveryFee) < 0)
    ) {
      nextErrors.deliveryFee = "Enter a valid delivery fee.";
    }

    if (!Number.isSafeInteger(totalAmount)) {
      nextErrors.amount = "Enter a valid whole-number total.";
    }

    if (wallet && totalAmount > Number(wallet.balance || 0)) {
      nextErrors.amount =
        "The total payment exceeds your available wallet balance.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice("");

    if (!validateForm()) return;

    try {
      if (!transferKeyRef.current) {
        transferKeyRef.current = createIdempotencyKey();
      }
      setShowConfirmation(true);
    } catch (requestError) {
      showNotice(requestError.message, "error");
    }
  };

  const handleConfirm = async () => {
    if (isSubmitting || !recipient || !transferKeyRef.current) return;

    setIsSubmitting(true);
    setNotice("");

    try {
      const response = await apiRequest("/wallet/transfer", {
        method: "POST",
        headers: { "Idempotency-Key": transferKeyRef.current },
        body: JSON.stringify({
          walletNumber: recipient.walletNumber,
          amount: totalAmount,
          description: description.trim(),
        }),
      });

      setShowConfirmation(false);
      clearTransferKey();
      setAmount("");
      setDeliveryFee("");
      setDescription("");
      setRecipient(null);
      setWalletNumber("");
      showNotice(
        `Transfer ${response.transaction?.reference || "completed"} sent to ${response.recipient?.name || recipient.name}.`,
        "success"
      );
      await loadWallet();
    } catch (requestError) {
      showNotice(requestError.message || "Unable to complete the transfer. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
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
            <strong>Wallet transfers</strong>
            <p>
              Your balance and recipient details are verified before a transfer
              is submitted.
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
            <span>Available balance</span>
            <strong>
              {isLoadingWallet ? "Loading..." : wallet ? formatMoney(wallet.balance) : "—"}
            </strong>
          </div>

          <button
            type="button"
            onClick={() => navigate("/student/wallet")}
          >
            My wallet <ArrowRight size={15} />
          </button>
        </section>

        {walletError && (
          <div className="sm-notice sm-notice-error" role="alert">
            <Info size={18} />
            <span>{walletError}</span>
            <button type="button" onClick={() => { setIsLoadingWallet(true); loadWallet(); }}>
              Retry
            </button>
          </div>
        )}

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
                  clearTransferKey();
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
              <span>₦</span>
              <input
                id="sm-amount"
                type="number"
                min="100"
                step="1"
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  clearTransferKey();
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
                    clearTransferKey();
                    setErrors((previous) => ({
                      ...previous,
                      amount: "",
                    }));
                  }}
                >
                  ₦{value.toLocaleString("en-NG")}
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
                <span>₦</span>
                <input
                  id="sm-delivery-fee"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0.00"
                  value={deliveryFee}
                  onChange={(event) => {
                    setDeliveryFee(event.target.value);
                    clearTransferKey();
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
              onChange={(event) => {
                setDescription(event.target.value);
                clearTransferKey();
              }}
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

          <button
            type="submit"
            className="sm-submit-button"
            disabled={isLoadingWallet || !wallet}
          >
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
              Check these verified details before submitting your transfer.
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
              Transfers are processed by your Kampusly wallet. Confirm only if
              the recipient and amount are correct.
            </div>

            <button
              type="button"
              className="sm-submit-button"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Confirm transfer"} <CheckCircle2 size={18} />
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
