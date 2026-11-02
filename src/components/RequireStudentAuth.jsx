import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  apiRequest,
  clearSession,
  getToken,
  hasUsableStoredSession,
  isStudentPortalRole,
  saveSession,
} from "../lib/api";

export default function RequireStudentAuth({ children }) {
  const location = useLocation();
  const requestVersion = useRef(0);
  const [status, setStatus] = useState(() => (
    hasUsableStoredSession() ? "checking" : "signed-out"
  ));
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (status !== "checking") return undefined;

    const controller = new AbortController();
    const version = ++requestVersion.current;

    apiRequest("/auth/me", { signal: controller.signal })
      .then(({ user }) => {
        if (version !== requestVersion.current) return;

        if (!user || !isStudentPortalRole(user.role)) {
          clearSession();
          setStatus("signed-out");
          return;
        }

        saveSession(getToken(), user);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (version !== requestVersion.current || error.name === "AbortError") return;

        if (error.status === 401 || error.status === 403) {
          clearSession();
          setStatus("signed-out");
          return;
        }

        setStatus("unavailable");
      });

    return () => controller.abort();
  }, [status, retryCount]);

  useEffect(() => {
    const invalidate = () => {
      requestVersion.current += 1;
      setStatus("signed-out");
    };
    const handleStorage = (event) => {
      if (event.key === "kampuslyToken" || event.key === "kampuslyProfile") {
        if (!hasUsableStoredSession()) invalidate();
      }
    };

    window.addEventListener("kampusly:session-expired", invalidate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("kampusly:session-expired", invalidate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (status === "checking") return null;

  if (status === "unavailable") {
    return (
      <main className="not-found-page">
        <div className="not-found-card">
          <span className="not-found-code">AUTH</span>
          <h1>We can’t verify your session</h1>
          <p>Please check your connection and try again.</p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              if (hasUsableStoredSession()) {
                setRetryCount((count) => count + 1);
                setStatus("checking");
              } else {
                setStatus("signed-out");
              }
            }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
