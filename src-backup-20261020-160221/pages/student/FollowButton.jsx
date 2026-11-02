import { useState } from "react";
import { UserPlus, UserCheck, LoaderCircle } from "lucide-react";

export default function FollowButton({
  userId,
  initialIsFollowing = false,
  onFollowChange,
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFollow = async () => {
    if (!userId || loading) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/users/${userId}/follow`,
        {
          method: isFollowing ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update follow status.");
      }

      const nextFollowing =
        typeof data.isFollowing === "boolean"
          ? data.isFollowing
          : !isFollowing;

      setIsFollowing(nextFollowing);

      if (onFollowChange) {
        onFollowChange(nextFollowing, data);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kampusly-follow-wrapper">
      <button
        type="button"
        className={`kampusly-follow-button ${
          isFollowing ? "is-following" : ""
        }`}
        onClick={handleFollow}
        disabled={loading}
        aria-label={isFollowing ? "Unfollow student" : "Follow student"}
      >
        {loading ? (
          <LoaderCircle size={16} className="follow-spinner" />
        ) : isFollowing ? (
          <UserCheck size={16} />
        ) : (
          <UserPlus size={16} />
        )}

        <span>
          {loading ? "Please wait..." : isFollowing ? "Following" : "Follow"}
        </span>
      </button>

      {error && (
        <p className="kampusly-follow-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}