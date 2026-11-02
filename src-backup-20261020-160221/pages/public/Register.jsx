import { useState } from "react";
import { Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
Eye,
EyeOff,
GraduationCap,
CheckCircle2,
ShieldCheck,
ShoppingBag,
Utensils,
Shirt,
ShoppingBasket,
Check,
} from "lucide-react";

const initialForm = {
fullName: "",
email: "",
role: "student",
password: "",
confirmPassword: "",
};

const availableRoles = [
{
id: "student",
title: "Student / Buyer",
description: "Discover services and buy what you need.",
icon: GraduationCap,
},
{
id: "seller",
title: "Seller",
description: "Sell products to your campus community.",
icon: ShoppingBag,
},
{
id: "food_vendor",
title: "Food Vendor",
description: "List meals and receive food orders.",
icon: Utensils,
},
{
id: "laundry_provider",
title: "Laundry Service Provider",
description: "Offer laundry services and manage bookings.",
icon: Shirt,
},
{
id: "grocery_shopper",
title: "Grocery Shopper",
description: "Help students purchase groceries.",
icon: ShoppingBasket,
},
];

function Register() {
const [form, setForm] = useState(initialForm);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [errors, setErrors] = useState({});
const [successMessage, setSuccessMessage] = useState("");

const handleChange = (event) => {
const { name, value } = event.target;


setForm((previous) => ({
  ...previous,
  [name]: value,
}));

setErrors((previous) => ({
  ...previous,
  [name]: "",
  form: "",
}));

setSuccessMessage("");


};

// A user can select only one role at a time.
const selectRole = (roleId) => {
setForm((previous) => ({
...previous,
role: roleId,
}));


setErrors((previous) => ({
  ...previous,
  role: "",
  form: "",
}));

setSuccessMessage("");


};

const validateForm = () => {
const newErrors = {};


if (!form.fullName.trim()) {
  newErrors.fullName = "Please enter your full name.";
} else if (form.fullName.trim().length < 3) {
  newErrors.fullName =
    "Your name must contain at least 3 characters.";
}

if (!form.email.trim()) {
  newErrors.email = "Please enter your email address.";
} else if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
) {
  newErrors.email = "Please enter a valid email address.";
}

if (!form.role) {
  newErrors.role = "Please select an account role.";
}

if (!form.password) {
  newErrors.password = "Please create a password.";
} else if (form.password.length < 8) {
  newErrors.password =
    "Your password must contain at least 8 characters.";
}

if (!form.confirmPassword) {
  newErrors.confirmPassword = "Please confirm your password.";
} else if (form.password !== form.confirmPassword) {
  newErrors.confirmPassword = "Your passwords do not match.";
}

return newErrors;


};

const handleSubmit = (event) => {
event.preventDefault();


setSuccessMessage("");

const validationErrors = validateForm();
setErrors(validationErrors);

if (Object.keys(validationErrors).length > 0) {
  return;
}

const selectedRole = availableRoles.find(
  (role) => role.id === form.role
);

setSuccessMessage(
  `Your details are valid! Selected role: ${selectedRole.title}. Account creation will be available when registration is connected to the Kampusly server.`
);

};

return ( <main className="register-page"> <header className="register-header"> <Link
       to="/"
       className="register-brand"
       aria-label="Kampusly home"
     > <span className="register-brand-icon"> <GraduationCap size={25} strokeWidth={2.2} /> </span>


      <span className="register-brand-name">
        kampusly<span>.</span>
      </span>
    </Link>

    <Link to="/" className="register-back-link">
      <ArrowLeft size={17} />
      <span>Back to home</span>
    </Link>
  </header>

  <section className="register-layout">
    <aside className="register-intro">
      <div className="register-intro-badge">
        <span className="register-badge-dot" />
        YOUR CAMPUS. YOUR COMMUNITY.
      </div>

      <h1>
        Campus life,
        <br />
        <span>made easier.</span>
      </h1>

      <p className="register-intro-description">
        Meet people, discover opportunities, buy and sell, and
        get the everyday things you need — all in one place.
      </p>

      <div className="register-benefits">
        <div className="register-benefit">
          <span className="register-benefit-icon">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <strong>One account, more possibilities</strong>
            <p>Buy, sell, connect, and discover.</p>
          </div>
        </div>

        <div className="register-benefit">
          <span className="register-benefit-icon">
            <CheckCircle2 size={19} />
          </span>

          <div>
            <strong>Made for campus communities</strong>
            <p>Find what you need from your community.</p>
          </div>
        </div>

        <div className="register-benefit">
          <span className="register-benefit-icon">
            <ShieldCheck size={19} />
          </span>

          <div>
            <strong>Your account, your control</strong>
            <p>Manage your profile and interactions.</p>
          </div>
        </div>
      </div>

      <div className="register-quote">
        <span className="register-quote-mark">“</span>
        <p>Good things happen when campus connects.</p>
        <span className="register-quote-line" />
      </div>

      <div className="register-decoration register-decoration-one" />
      <div className="register-decoration register-decoration-two" />
    </aside>

    <section className="register-form-section">
      <div className="register-form-card">
        <div className="register-mobile-brand">
          <span className="register-brand-icon">
            <GraduationCap size={24} />
          </span>

          <span className="register-brand-name">
            kampusly<span>.</span>
          </span>
        </div>

        <div className="register-form-heading">
          <span className="register-step-label">
            LET'S GET YOU STARTED
          </span>

          <h2>Create your account</h2>

          <p>
            Join your campus community. It only takes a minute.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="register-field">
            <label htmlFor="fullName">Full name</label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={
                errors.fullName ? "fullName-error" : undefined
              }
            />

            {errors.fullName && (
              <span className="register-error" id="fullName-error">
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="register-field">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "email-error" : undefined
              }
            />

            {errors.email && (
              <span className="register-error" id="email-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="register-field register-roles-field">
            <div className="register-roles-heading">
              <label id="register-roles-label">
                How will you use Kampusly?
              </label>

              <span className="register-roles-optional">
                Select one role
              </span>
            </div>

            <div
              className="register-roles-grid"
              role="group"
              aria-labelledby="register-roles-label"
              aria-describedby={
                errors.role ? "role-error" : "role-help"
              }
            >
              {availableRoles.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = form.role === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    className={`register-role-card ${
                      isSelected ? "register-role-selected" : ""
                    }`}
                    onClick={() => selectRole(role.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="register-role-icon">
                      <RoleIcon size={20} strokeWidth={1.9} />
                    </span>

                    <span className="register-role-copy">
                      <strong>{role.title}</strong>
                      <span>{role.description}</span>
                    </span>

                    <span className="register-role-check">
                      {isSelected && (
                        <Check size={15} strokeWidth={3} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {errors.role && (
              <span className="register-error" id="role-error">
                {errors.role}
              </span>
            )}

            <span className="register-field-hint" id="role-help">
              Choose the role that best describes how you want to
              start using Kampusly. You can manage your activities
              from your account.
            </span>

            <div className="register-admin-note">
              <ShieldCheck size={16} />
              <span>
                Administrator access is assigned separately by
                Kampusly.
              </span>
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>

            <div className="register-password-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {errors.password && (
              <span className="register-error" id="password-error">
                {errors.password}
              </span>
            )}

            <span className="register-field-hint">
              Use at least 8 characters.
            </span>
          </div>

          <div className="register-field">
            <label htmlFor="confirmPassword">
              Confirm password
            </label>

            <div className="register-password-wrap">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword ? "text" : "password"
                }
                placeholder="Enter your password again"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword
                    ? "confirmPassword-error"
                    : undefined
                }
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {errors.confirmPassword && (
              <span
                className="register-error"
                id="confirmPassword-error"
              >
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <p className="register-terms">
            By creating an account, you agree to our{" "}
            <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>.
          </p>

          {successMessage && (
            <div className="register-success" role="status">
              <CheckCircle2 size={19} />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.form && (
            <p className="register-error" role="alert">
              {errors.form}
            </p>
          )}

          <button
            type="submit"
            className="register-submit-button"
          >
            <span>Create account</span>
            <ArrowRight size={19} />
          </button>
        </form>

        <div className="register-login-prompt">
          Already have an account? <Link to="/login">Log in</Link>
        </div>

        <div className="register-security-note">
          <ShieldCheck size={16} />
          <span>Your campus journey starts here.</span>
        </div>
      </div>
    </section>
  </section>

  <footer className="register-footer">
    <span>© {new Date().getFullYear()} Kampusly</span>
    <span>Campus Life, Simplified.</span>
  </footer>
</main>


);
}

export default Register;
