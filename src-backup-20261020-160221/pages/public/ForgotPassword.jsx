import { useState } from "react";
import { Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
GraduationCap,
Mail,
ShieldCheck,
CheckCircle2,
AlertCircle,
} from "lucide-react";

export default function ForgotPassword() {
const [email, setEmail] = useState("");
const [error, setError] = useState("");
const [success, setSuccess] = useState(false);

const handleSubmit = (event) => {
event.preventDefault();
setError("");
setSuccess(false);

```
const trimmedEmail = email.trim();

if (!trimmedEmail) {
  setError("Please enter your email address.");
  return;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(trimmedEmail)) {
  setError("Please enter a valid email address.");
  return;
}

// Password-reset functionality will be connected to the backend later.
setSuccess(true);
```

};

return ( <main className="forgot-page"> <header className="forgot-header"> <Link to="/" className="forgot-brand" aria-label="Kampusly home"> <span className="forgot-brand-icon"> <GraduationCap size={25} strokeWidth={2.2} /> </span> <span> <span className="forgot-brand-name">kampusly</span> <span className="forgot-brand-tagline">
Campus Life, Simplified. </span> </span> </Link>

```
    <Link to="/login" className="forgot-back-link">
      <ArrowLeft size={16} />
      <span>Back to login</span>
    </Link>
  </header>

  <section className="forgot-content">
    <div className="forgot-illustration" aria-hidden="true">
      <div className="forgot-illustration-circle">
        <Mail size={43} strokeWidth={1.7} />
        <span className="forgot-illustration-shield">
          <ShieldCheck size={23} />
        </span>
      </div>
    </div>

    <div className="forgot-heading">
      <span className="forgot-eyebrow">ACCOUNT RECOVERY</span>
      <h1>Forgot your password?</h1>
      <p>
        It happens. Enter the email address associated with your account,
        and we&apos;ll help you get back into Kampusly.
      </p>
    </div>

    <div className="forgot-form-card">
      {success ? (
        <div className="forgot-success-state" role="status">
          <div className="forgot-success-icon">
            <CheckCircle2 size={30} />
          </div>

          <h2>Request received!</h2>

          <p>
            Your email has been validated. Password-reset emails will be
            available when Kampusly is connected to its backend.
          </p>

          <button
            type="button"
            className="forgot-submit-button"
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
          >
            Try another email
            <ArrowRight size={17} />
          </button>

          <Link to="/login" className="forgot-return-link">
            <ArrowLeft size={16} />
            Return to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="forgot-field">
            <label htmlFor="forgot-email">Email address</label>

            <div className="forgot-input-wrap">
              <Mail size={19} aria-hidden="true" />

              <input
                id="forgot-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                }}
                autoComplete="email"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "forgot-error" : undefined}
              />
            </div>
          </div>

          {error && (
            <div
              className="forgot-error-message"
              id="forgot-error"
              role="alert"
            >
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="forgot-submit-button">
            Send reset instructions
            <ArrowRight size={17} />
          </button>

          <p className="forgot-form-note">
            <ShieldCheck size={16} />
            Your account information stays private.
          </p>
        </form>
      )}
    </div>

    <div className="forgot-help">
      Still having trouble?{" "}
      <Link to="/login">Return to sign in</Link>
    </div>
  </section>

  <footer className="forgot-footer">
    <span>© {new Date().getFullYear()} Kampusly</span>
    <span>Made for campus life.</span>
  </footer>
</main>

);
}
