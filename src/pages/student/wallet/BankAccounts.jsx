import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
  Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../../lib/api";
import "./BankAccounts.css";

const NIGERIAN_BANKS = [
  "Access Bank",
  "Access Bank (Diamond)",
  "Carbon",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Globus Bank",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Jaiz Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint Microfinance Bank",
  "OPay",
  "PalmPay",
  "Parallex Bank",
  "Polaris Bank",
  "PremiumTrust Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "TAJBank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Other",
];

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const loadAccounts = useCallback(async () => {
    setLoadError("");
    try {
      const response = await apiRequest("/wallet/bank-accounts");
      setAccounts(Array.isArray(response.accounts) ? response.accounts : []);
    } catch (error) {
      setLoadError(error.message || "Unable to load saved accounts.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadAccounts);
  }, [loadAccounts]);

  const resetForm = () => {
    setForm({
      bankName: "",
      accountNumber: "",
      accountName: "",
    });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setNotice(null);
    setForm({
      bankName: "",
      accountNumber: "",
      accountName: "",
    });
    setErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (account) => {
    setNotice(null);
    setForm({
      bankName: account.bankName,
      accountNumber: "",
      accountName: account.accountName,
    });
    setErrors({});
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "accountNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setNotice(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (!form.bankName) {
      nextErrors.bankName = "Please select a bank.";
    }

    if (!/^\d{10}$/.test(form.accountNumber)) {
      nextErrors.accountNumber = "Enter a valid 10-digit account number.";
    }

    if (form.accountName.trim().length < 3) {
      nextErrors.accountName = "Enter the account holder's name.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const accountDetails = {
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      accountName: form.accountName.trim(),
    };

    try {
      const response = editingId
        ? await apiRequest(`/wallet/bank-accounts/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(accountDetails),
        })
        : await apiRequest("/wallet/bank-accounts", {
          method: "POST",
          body: JSON.stringify(accountDetails),
        });
      setAccounts((current) => editingId
        ? current.map((account) => account.id === editingId ? response.account : account)
        : [response.account, ...current]);
      resetForm();
      setNotice({ type: "success", text: editingId ? "Bank account details updated." : "Bank account added successfully." });
    } catch (error) {
      setNotice({ type: "error", text: error.message || "Bank account could not be saved." });
    }
  };

  const confirmDelete = async () => {
    try {
      await apiRequest(`/wallet/bank-accounts/${deleteId}`, { method: "DELETE" });
      setAccounts((current) => current.filter((account) => account.id !== deleteId));
      setDeleteId(null);
      setNotice({ type: "success", text: "Bank account removed successfully." });
    } catch (error) {
      setDeleteId(null);
      setNotice({ type: "error", text: error.message || "Bank account could not be removed." });
    }
  };

  const maskAccountNumber = (number) => {
    return `•••• •••• ${number || "----"}`;
  };

  return (
    <main className="bank-page">
      <div className="bank-container">
        <Link to="/student/wallet" className="bank-back-link">
          <ArrowLeft size={18} />
          Back to wallet
        </Link>

        <header className="bank-header">
          <div className="bank-header-icon">
            <Building2 size={27} />
          </div>

          <div>
            <p className="bank-eyebrow">KAMPUSLY WALLET</p>
            <h1>Bank accounts</h1>
            <p className="bank-subtitle">
              Manage the accounts you want to use for withdrawals.
            </p>
          </div>
        </header>

        <section className="bank-security-banner">
          <div className="bank-security-icon">
            <ShieldCheck size={23} />
          </div>

          <div>
            <h3>Keep your account details safe</h3>
            <p>
              Only add a bank account you own or are authorized to use.
              Always double-check the account details before withdrawing.
            </p>
          </div>

          <LockKeyhole className="bank-security-lock" size={21} />
        </section>

        {notice && (
          <div
            className={`bank-notice bank-notice-${notice.type}`}
            role="status"
          >
            <CheckCircle2 size={19} />
            <span>{notice.text}</span>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="bank-list-card">
          <div className="bank-list-heading">
            <div>
              <h2>Saved accounts</h2>
              <p>
                {accounts.length}{" "}
                {accounts.length === 1 ? "account" : "accounts"} saved
              </p>
            </div>

            {!showForm && (
              <button
                type="button"
                className="bank-add-button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add account
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="bank-empty-state" role="status"><p>Loading saved accounts...</p></div>
          ) : loadError ? (
            <div className="bank-empty-state" role="alert"><h3>Accounts could not be loaded</h3><p>{loadError}</p><button type="button" className="bank-add-button" onClick={() => { setIsLoading(true); loadAccounts(); }}>Retry</button></div>
          ) : accounts.length === 0 && !showForm ? (
            <div className="bank-empty-state">
              <div className="bank-empty-icon">
                <CreditCard size={31} />
              </div>

              <h3>No bank accounts yet</h3>

              <p>
                Add a bank account so you can select it when requesting a
                withdrawal.
              </p>

              <button
                type="button"
                className="bank-add-button"
                onClick={openAddForm}
              >
                <Plus size={18} />
                Add your first account
              </button>
            </div>
          ) : (
            <div className="bank-account-list">
              {accounts.map((account) => (
                <article className="bank-account-item" key={account.id}>
                  <div className="bank-account-logo">
                    <Building2 size={23} />
                  </div>

                  <div className="bank-account-details">
                    <h3>{account.bankName}</h3>
                    <p className="bank-account-number">
                      {maskAccountNumber(account.last4)}
                    </p>
                    <p className="bank-account-holder">
                      <UserRound size={14} />
                      {account.accountName}
                    </p>
                  </div>

                  <div className="bank-account-actions">
                    <button
                      type="button"
                      className="bank-edit-button"
                      onClick={() => openEditForm(account)}
                      aria-label={`Edit ${account.bankName} account`}
                      title="Edit account"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="bank-delete-button"
                      onClick={() => setDeleteId(account.id)}
                      aria-label={`Delete ${account.bankName} account`}
                      title="Delete account"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {showForm && (
          <section className="bank-form-card">
            <div className="bank-form-heading">
              <div>
                <h2>{editingId ? "Edit bank account" : "Add bank account"}</h2>
                <p>
                  Enter your bank details carefully. Kampusly does not verify
                  account ownership.
                </p>
              </div>

              <button
                type="button"
                className="bank-close-form"
                onClick={resetForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="bank-form-field">
                <label htmlFor="bank-name">
                  Bank name <span>*</span>
                </label>

                <div className="bank-select-wrap">
                  <Building2 size={18} />

                  <select
                    id="bank-name"
                    name="bankName"
                    value={form.bankName}
                    onChange={handleInputChange}
                    className={errors.bankName ? "bank-field-error" : ""}
                  >
                    <option value="">Select your bank</option>

                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>

                {errors.bankName && (
                  <p className="bank-error-text">{errors.bankName}</p>
                )}
              </div>

              <div className="bank-form-field">
                <label htmlFor="bank-account-number">
                  Account number <span>*</span>
                </label>

                <input
                  id="bank-account-number"
                  type="text"
                  name="accountNumber"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={editingId ? "Enter the new 10-digit account number" : "Enter your 10-digit account number"}
                  value={form.accountNumber}
                  onChange={handleInputChange}
                  className={
                    errors.accountNumber ? "bank-field-error" : ""
                  }
                />

                {errors.accountNumber ? (
                  <p className="bank-error-text">{errors.accountNumber}</p>
                ) : (
                  <p className="bank-field-hint">
                    Enter all 10 digits without spaces.
                  </p>
                )}
              </div>

              <div className="bank-form-field">
                <label htmlFor="bank-account-name">
                  Account holder's name <span>*</span>
                </label>

                <input
                  id="bank-account-name"
                  type="text"
                  name="accountName"
                  autoComplete="name"
                  placeholder="Enter the name registered with your bank"
                  value={form.accountName}
                  onChange={handleInputChange}
                  className={errors.accountName ? "bank-field-error" : ""}
                />

                {errors.accountName ? (
                  <p className="bank-error-text">{errors.accountName}</p>
                ) : (
                  <p className="bank-field-hint">
                    Enter the name exactly as it appears on your bank account.
                  </p>
                )}
              </div>

              <div className="bank-verification-notice">
                <ShieldCheck size={20} />
                <p>
                  <strong>Verification is not available.</strong> Account
                  details are encrypted on the server and are not sent to a
                  bank. No payout provider is connected.
                </p>
              </div>

              <div className="bank-form-actions">
                <button
                  type="button"
                  className="bank-cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button type="submit" className="bank-save-button">
                  {editingId ? "Save changes" : "Save bank account"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div className="bank-footer-note">
          <LockKeyhole size={16} />
          <p>Full account numbers are encrypted at rest and are never returned by the API.</p>
        </div>
      </div>

      {deleteId && (
        <div
          className="bank-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteId(null);
            }
          }}
        >
          <section
            className="bank-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bank-delete-title"
          >
            <div className="bank-delete-modal-icon">
              <Trash2 size={25} />
            </div>

            <h2 id="bank-delete-title">Remove bank account?</h2>

            <p>
              This account will be removed from your saved accounts in this
              browser. This action cannot be undone.
            </p>

            <div className="bank-confirm-actions">
              <button
                type="button"
                className="bank-cancel-button"
                onClick={() => setDeleteId(null)}
              >
                Keep account
              </button>

              <button
                type="button"
                className="bank-confirm-delete-button"
                onClick={confirmDelete}
              >
                Remove account
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
