import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowLeft, Building2, CheckCircle2, Clock3, Info, LockKeyhole, Wallet, X } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../../lib/api";
import "./WithdrawFunds.css";

function formatMoney(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(value) || 0);
}

export default function WithdrawFunds() {
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [requestCreated, setRequestCreated] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedAccount = bankAccounts.find((account) => account.id === selectedBank);
  const numericAmount = Number(amount) || 0;

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [walletResponse, accountResponse] = await Promise.all([
        apiRequest("/wallet"),
        apiRequest("/wallet/bank-accounts"),
      ]);
      setWallet(walletResponse.wallet || null);
      setBankAccounts(Array.isArray(accountResponse.accounts) ? accountResponse.accounts : []);
    } catch (error) {
      setLoadError(error.message || "Unable to load wallet and bank account details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);

  function handleReview(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!Number.isSafeInteger(numericAmount) || numericAmount < 1000) {
      nextErrors.amount = "Enter a whole-number amount of at least ₦1,000.";
    } else if (numericAmount > Number(wallet?.balance || 0)) {
      nextErrors.amount = "The amount exceeds your available wallet balance.";
    }
    if (!selectedAccount) nextErrors.bank = "Choose one of your saved bank accounts.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) setShowReview(true);
  }

  async function submitWithdrawal() {
    if (!selectedAccount || submitting) return;
    setSubmitting(true);
    setNotice("");
    try {
      const response = await apiRequest("/wallet/withdrawals", {
        method: "POST",
        body: JSON.stringify({
          amount: numericAmount,
          bankAccountId: selectedAccount.id,
          description: description.trim(),
        }),
      });
      setRequestCreated(response.transaction || null);
      setShowReview(false);
      setAmount("");
      setDescription("");
      setNotice("Request submitted for review. No payout has been made; payout processing is not enabled.");
      await loadData();
    } catch (error) {
      setNotice(error.message || "Withdrawal request could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="withdraw-page">
      <div className="withdraw-container">
        <Link to="/student/wallet" className="withdraw-back"><ArrowLeft size={19} /><span>Back to wallet</span></Link>
        <header className="withdraw-header">
          <div className="withdraw-title-icon"><ArrowDownLeft size={27} /></div>
          <div><p className="withdraw-eyebrow">KAMPUSLY WALLET</p><h1>Withdraw funds</h1><p className="withdraw-subtitle">Submit a request for review. Bank payouts are not enabled.</p></div>
        </header>

        {loading ? (
          <section className="withdraw-balance-card" role="status"><p>Loading wallet and saved bank accounts...</p></section>
        ) : loadError ? (
          <div className="withdraw-notice" role="alert"><Info size={20} /><span>{loadError}</span><button type="button" onClick={loadData}>Retry</button></div>
        ) : (
          <>
            <section className="withdraw-balance-card">
              <div className="withdraw-balance-top"><span><Wallet size={17} />Available balance</span></div>
              <h2>{formatMoney(wallet?.balance)}</h2>
              <p>Requests reserve funds for review. They do not initiate an external bank payout.</p>
            </section>

            {notice && <div className="withdraw-notice" role="status"><Info size={20} /><span>{notice}</span></div>}

            {requestCreated ? (
              <section className="withdraw-success-card">
                <div className="withdraw-success-icon"><CheckCircle2 size={34} /></div>
                <h2>Request submitted</h2>
                <p>Your request is pending review. No bank payout provider is connected.</p>
                <div className="withdraw-success-summary"><span>Reference</span><strong>{requestCreated.reference}</strong><span>Amount</span><strong>{formatMoney(requestCreated.amount)}</strong><span>Status</span><strong>Pending review</strong></div>
                <button type="button" className="withdraw-primary-button" onClick={() => setRequestCreated(null)}>Done</button>
              </section>
            ) : (
              <section className="withdraw-form-card">
                <div className="withdraw-section-heading"><div><h2>Withdrawal request</h2><p>Choose an account saved to your Kampusly profile.</p></div></div>
                <form onSubmit={handleReview} noValidate>
                  <div className="withdraw-field">
                    <label htmlFor="withdraw-amount">Amount <span>*</span></label>
                    <div className={`withdraw-amount-input ${errors.amount ? "withdraw-input-error" : ""}`}>
                      <span>₦</span><input id="withdraw-amount" type="number" min="1000" max={wallet?.balance || 0} step="1" placeholder="0" value={amount} onChange={(event) => { setAmount(event.target.value); setErrors((current) => ({ ...current, amount: "" })); }} />
                    </div>
                    {errors.amount && <p className="withdraw-error-text">{errors.amount}</p>}
                    <p className="withdraw-field-hint">Minimum request: ₦1,000</p>
                  </div>
                  <div className="withdraw-field">
                    <label htmlFor="withdraw-bank">Destination account <span>*</span></label>
                    <div className="withdraw-select-wrap"><Building2 size={19} /><select id="withdraw-bank" value={selectedBank} className={errors.bank ? "withdraw-input-error" : ""} onChange={(event) => { setSelectedBank(event.target.value); setErrors((current) => ({ ...current, bank: "" })); }}><option value="">Choose a saved bank account</option>{bankAccounts.map((account) => <option key={account.id} value={account.id}>{account.bankName} •••• {account.last4}</option>)}</select></div>
                    {errors.bank && <p className="withdraw-error-text">{errors.bank}</p>}
                    {!bankAccounts.length && <div className="withdraw-no-bank"><Info size={18} /><div><strong>No saved bank account</strong><p>Add an account to your profile first.</p><Link to="/student/wallet/bank-account">Manage bank accounts</Link></div></div>}
                  </div>
                  <div className="withdraw-field"><label htmlFor="withdraw-description">Request note <span className="withdraw-optional">(optional)</span></label><textarea id="withdraw-description" rows="3" maxLength="300" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a note for the review team" /><p className="withdraw-field-hint">{description.length}/300 characters</p></div>
                  <div className="withdraw-info-box"><Clock3 size={19} /><div><strong>Review only</strong><p>Requests may be reviewed by an administrator. Approval cannot pay out funds until a verified provider is integrated.</p></div></div>
                  <button type="submit" className="withdraw-primary-button" disabled={!wallet || !bankAccounts.length}>Review request</button>
                  <p className="withdraw-secure-note"><LockKeyhole size={15} />Full account numbers are encrypted and never shown here.</p>
                </form>
              </section>
            )}
          </>
        )}
      </div>

      {showReview && selectedAccount && (
        <div className="withdraw-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setShowReview(false); }}>
          <section className="withdraw-review-modal" role="dialog" aria-modal="true" aria-labelledby="withdraw-review-title">
            <button type="button" className="withdraw-modal-close" onClick={() => setShowReview(false)} aria-label="Close review" disabled={submitting}><X size={21} /></button>
            <div className="withdraw-modal-icon"><ArrowDownLeft size={25} /></div>
            <h2 id="withdraw-review-title">Review request</h2>
            <p className="withdraw-modal-subtitle">This creates a request for review only. No payout will be sent.</p>
            <div className="withdraw-review-amount"><span>Request amount</span><strong>{formatMoney(numericAmount)}</strong></div>
            <div className="withdraw-review-row"><span>Bank</span><strong>{selectedAccount.bankName}</strong></div>
            <div className="withdraw-review-row"><span>Account name</span><strong>{selectedAccount.accountName}</strong></div>
            <div className="withdraw-review-row"><span>Account number</span><strong>•••• {selectedAccount.last4}</strong></div>
            <div className="withdraw-demo-warning">Payouts are disabled until a verified provider is configured.</div>
            <button type="button" className="withdraw-primary-button" onClick={submitWithdrawal} disabled={submitting}>{submitting ? "Submitting..." : "Submit request"}</button>
            <button type="button" className="withdraw-cancel-button" onClick={() => setShowReview(false)} disabled={submitting}>Go back and edit</button>
          </section>
        </div>
      )}
    </main>
  );
}
