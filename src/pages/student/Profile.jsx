import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  CalendarDays,
  GraduationCap,
  Mail,
  BookOpen,
  Heart,
  MessageCircle,
  Users,
  Settings,
  Edit3,
  Check,
  X,
  Sparkles,
  Globe,
  UserRound,
} from "lucide-react";
import "./Profile.css";
import { apiRequest } from "../../lib/api";

const defaultProfile = {
  name: localStorage.getItem("kampuslyName") || "Student",
  username: "",
  bio: "Hey there! I'm new to Kampusly. Let's connect and make campus life better together.",
  department: "",
  faculty: "",
  matricNumber: "",
  email: localStorage.getItem("kampuslyEmail") || "",
  interests: ["Technology", "Music", "Making friends"],
  location: "UNILESA, Osun State",
  website: "",
  joined: new Date().getFullYear().toString(),
};

function getSavedProfile() {
  try {
    const saved = localStorage.getItem("kampuslyProfile");

    if (saved) {
      const parsedProfile = JSON.parse(saved);

      return {
        ...defaultProfile,
        ...parsedProfile,
        interests: Array.isArray(parsedProfile.interests)
          ? parsedProfile.interests
          : defaultProfile.interests,
      };
    }
  } catch (error) {
    console.error("Could not load saved profile:", error);
  }

  return defaultProfile;
}

function getSavedAvatar() {
  try {
    return localStorage.getItem("kampuslyAvatar") || "";
  } catch (error) {
    console.error("Could not load profile picture:", error);
    return "";
  }
}

export default function Profile() {
  const [profile, setProfile] = useState(getSavedProfile);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(() => ({ ...getSavedProfile() }));
  const [avatar, setAvatar] = useState(getSavedAvatar);
  const [notice, setNotice] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    apiRequest("/auth/me")
      .then(({ user }) => {
        if (!active || !user) return;
        setProfile((current) => ({ ...current, ...user }));
        setDraft((current) => ({ ...current, ...user }));
      })
      .catch(() => {
        // The existing saved profile remains available when offline.
      });

    return () => { active = false; };
  }, []);

  const showNotice = (message, type = "success") => {
    setNotice({ message, type });

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  };

  const updateDraft = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const startEditing = () => {
    setDraft({ ...profile });
    setEditMode(true);
    setNotice(null);
  };

  const cancelEditing = () => {
    setDraft({ ...profile });
    setEditMode(false);
    setNotice(null);
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (!draft.name.trim()) {
      showNotice("Please enter your full name.", "error");
      return;
    }

    if (
      draft.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
    ) {
      showNotice("Please enter a valid email address.", "error");
      return;
    }

    if (draft.website.trim()) {
      try {
        const parsedWebsite = new URL(draft.website.trim());

        if (!["http:", "https:"].includes(parsedWebsite.protocol)) {
          showNotice("Please enter a valid website link.", "error");
          return;
        }
      } catch {
        showNotice(
          "Enter a complete website link, including https://.",
          "error"
        );
        return;
      }
    }

    const updatedProfile = {
      ...draft,
      name: draft.name.trim(),
      username: draft.username.trim().replace(/^@/, ""),
      bio: draft.bio.trim(),
      department: draft.department.trim(),
      faculty: draft.faculty.trim(),
      matricNumber: draft.matricNumber.trim(),
      email: draft.email.trim(),
      location: draft.location.trim(),
      website: draft.website.trim(),
      interests: Array.isArray(draft.interests) ? draft.interests : [],
    };

    setIsSaving(true);

    try {
      const response = await apiRequest("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: updatedProfile.name,
          bio: updatedProfile.bio,
          location: updatedProfile.location,
          interests: updatedProfile.interests,
          department: updatedProfile.department,
          faculty: updatedProfile.faculty,
          matricNumber: updatedProfile.matricNumber,
          website: updatedProfile.website,
        }),
      });

      const persistedProfile = { ...updatedProfile, ...(response.user || {}) };
      localStorage.setItem(
        "kampuslyProfile",
        JSON.stringify(persistedProfile)
      );

      localStorage.setItem("kampuslyName", persistedProfile.name);
      localStorage.setItem("kampuslyEmail", persistedProfile.email);

      setProfile(persistedProfile);
      setDraft(persistedProfile);
      setEditMode(false);
      showNotice("Your profile has been updated successfully.");
    } catch (error) {
      console.error("Could not save profile:", error);
      showNotice(
        error.message || "Unable to save your profile. Please try again.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("Please select a valid image file.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotice("Your image must be smaller than 2 MB.", "error");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imageData = reader.result;

        if (typeof imageData !== "string") {
          showNotice("Unable to process this image.", "error");
          return;
        }

        localStorage.setItem("kampuslyAvatar", imageData);
        setAvatar(imageData);

        showNotice("Profile picture updated.");
      } catch (error) {
        console.error("Could not save profile picture:", error);
        showNotice(
          "The image could not be saved. Try a smaller image.",
          "error"
        );
      }
    };

    reader.onerror = () => {
      showNotice("Unable to read this image. Please try another.", "error");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const completedItems = [
    profile.name,
    profile.bio,
    profile.email,
    profile.department,
    profile.matricNumber,
    avatar,
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedItems / 6) * 100);

  const goBack = () => {
    window.location.href = "/student/dashboard";
  };

  return (
    <div className="kampusly-profile-page">
      {notice && (
        <div
          className={`profile-toast profile-toast-${notice.type}`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          <span className="profile-toast-icon">
            {notice.type === "success" ? (
              <Check size={18} />
            ) : (
              <X size={18} />
            )}
          </span>

          <span>{notice.message}</span>

          <button
            type="button"
            className="profile-toast-close"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <header className="profile-topbar">
        <button
          type="button"
          className="profile-back-button"
          onClick={goBack}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="profile-topbar-title">
          <h1>My Profile</h1>
          <p>Your campus identity</p>
        </div>

        {!editMode ? (
          <button
            type="button"
            className="profile-edit-button"
            onClick={startEditing}
          >
            <Edit3 size={16} />
            <span>Edit profile</span>
          </button>
        ) : (
          <button
            type="button"
            className="profile-cancel-button"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        )}
      </header>

      <main className="profile-layout">
        <section className="profile-main-column">
          <div className="profile-hero-card">
            <div className="profile-cover">
              <div className="profile-cover-pattern profile-cover-pattern-one" />
              <div className="profile-cover-pattern profile-cover-pattern-two" />

              <span className="profile-cover-label">
                <Sparkles size={14} />
                Your campus. Your people.
              </span>
            </div>

            <div className="profile-hero-content">
              <div className="profile-avatar-wrapper">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`${profile.name}'s profile`}
                    className="profile-avatar"
                  />
                ) : (
                  <div className="profile-avatar profile-avatar-placeholder">
                    {initials || <UserRound size={38} />}
                  </div>
                )}

                <label
                  className="profile-avatar-upload"
                  htmlFor="profile-avatar-input"
                  title="Change profile picture"
                >
                  <Camera size={17} />
                </label>

                <input
                  id="profile-avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </div>

              <div className="profile-identity">
                <div className="profile-name-row">
                  <h2>{profile.name}</h2>

                  <span className="profile-student-badge">
                    <GraduationCap size={14} />
                    Student
                  </span>
                </div>

                <p className="profile-username">
                  {profile.username
                    ? `@${profile.username}`
                    : "@kampusly_student"}
                </p>

                <p className="profile-bio">
                  {profile.bio || "Add a short bio to introduce yourself."}
                </p>

                <div className="profile-meta">
                  <span>
                    <MapPin size={15} />
                    {profile.location || "Your campus"}
                  </span>

                  <span>
                    <CalendarDays size={15} />
                    Joined {profile.joined}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {editMode && (
            <form className="profile-edit-card" onSubmit={saveProfile}>
              <div className="profile-section-heading">
                <div>
                  <span className="profile-eyebrow">PERSONALISE</span>
                  <h2>Edit your profile</h2>
                  <p>Let other students get to know you.</p>
                </div>
              </div>

              <div className="profile-form-grid">
                <label className="profile-field">
                  <span>Full name *</span>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(event) =>
                      updateDraft("name", event.target.value)
                    }
                    placeholder="Enter your full name"
                    maxLength={80}
                    required
                  />
                </label>

                <label className="profile-field">
                  <span>Username</span>
                  <div className="profile-input-with-prefix">
                    <span>@</span>
                    <input
                      type="text"
                      value={draft.username}
                      onChange={(event) =>
                        updateDraft(
                          "username",
                          event.target.value.replace(/\s/g, "")
                        )
                      }
                      placeholder="yourusername"
                      maxLength={30}
                    />
                  </div>
                </label>

                <label className="profile-field profile-field-full">
                  <span>About me</span>
                  <textarea
                    value={draft.bio}
                    onChange={(event) =>
                      updateDraft("bio", event.target.value)
                    }
                    placeholder="Tell people a little about yourself..."
                    rows={4}
                    maxLength={300}
                  />
                  <small>{draft.bio.length}/300 characters</small>
                </label>

                <label className="profile-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      updateDraft("email", event.target.value)
                    }
                    placeholder="you@example.com"
                  />
                </label>

                <label className="profile-field">
                  <span>Matric number</span>
                  <input
                    type="text"
                    value={draft.matricNumber}
                    onChange={(event) =>
                      updateDraft("matricNumber", event.target.value)
                    }
                    placeholder="Your matric number"
                    maxLength={40}
                  />
                </label>

                <label className="profile-field">
                  <span>Department</span>
                  <input
                    type="text"
                    value={draft.department}
                    onChange={(event) =>
                      updateDraft("department", event.target.value)
                    }
                    placeholder="e.g. Computer Science"
                    maxLength={100}
                  />
                </label>

                <label className="profile-field">
                  <span>Faculty</span>
                  <input
                    type="text"
                    value={draft.faculty}
                    onChange={(event) =>
                      updateDraft("faculty", event.target.value)
                    }
                    placeholder="Your faculty"
                    maxLength={100}
                  />
                </label>

                <label className="profile-field profile-field-full">
                  <span>Location</span>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(event) =>
                      updateDraft("location", event.target.value)
                    }
                    placeholder="Your campus location"
                    maxLength={100}
                  />
                </label>

                <label className="profile-field profile-field-full">
                  <span>Website or social link</span>
                  <input
                    type="url"
                    value={draft.website}
                    onChange={(event) =>
                      updateDraft("website", event.target.value)
                    }
                    placeholder="https://example.com"
                  />
                </label>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={isSaving}
                >
                  <Check size={17} />
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}

          <section className="profile-details-card">
            <div className="profile-section-heading">
              <div>
                <span className="profile-eyebrow">GET TO KNOW ME</span>
                <h2>Student information</h2>
              </div>

              {!editMode && (
                <button
                  type="button"
                  className="profile-text-button"
                  onClick={startEditing}
                >
                  Edit details
                </button>
              )}
            </div>

            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <Mail size={19} />
                </span>
                <div>
                  <span className="profile-detail-label">Email address</span>
                  <p>{profile.email || "Not added yet"}</p>
                </div>
              </div>

              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <BookOpen size={19} />
                </span>
                <div>
                  <span className="profile-detail-label">Department</span>
                  <p>{profile.department || "Not added yet"}</p>
                </div>
              </div>

              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <GraduationCap size={20} />
                </span>
                <div>
                  <span className="profile-detail-label">Faculty</span>
                  <p>{profile.faculty || "Not added yet"}</p>
                </div>
              </div>

              <div className="profile-detail-item">
                <span className="profile-detail-icon">
                  <UserRound size={19} />
                </span>
                <div>
                  <span className="profile-detail-label">Matric number</span>
                  <p>{profile.matricNumber || "Not added yet"}</p>
                </div>
              </div>

              {profile.website && (
                <div className="profile-detail-item">
                  <span className="profile-detail-icon">
                    <Globe size={19} />
                  </span>
                  <div>
                    <span className="profile-detail-label">Website</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="profile-website-link"
                    >
                      Visit website
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="profile-interests-card">
            <div className="profile-section-heading">
              <div>
                <span className="profile-eyebrow">WHAT I LOVE</span>
                <h2>Interests</h2>
                <p>Things that make campus life interesting.</p>
              </div>
            </div>

            <div className="profile-interest-tags">
              {profile.interests.map((interest) => (
                <span key={interest} className="profile-interest-tag">
                  <Heart size={14} />
                  {interest}
                </span>
              ))}

              {profile.interests.length === 0 && (
                <p className="profile-empty-text">
                  Your interests will appear here.
                </p>
              )}
            </div>

            <button
              type="button"
              className="profile-add-interest"
              onClick={startEditing}
            >
              <Edit3 size={15} />
              Personalise your profile
            </button>
          </section>
        </section>

        <aside className="profile-side-column">
          <section className="profile-stats-card">
            <div className="profile-section-heading">
              <div>
                <span className="profile-eyebrow">YOUR JOURNEY</span>
                <h2>Campus activity</h2>
              </div>
            </div>

            <div className="profile-stat-row">
              <span className="profile-stat-icon profile-stat-icon-purple">
                <MessageCircle size={19} />
              </span>
              <div className="profile-stat-copy">
                <strong>0</strong>
                <span>Posts shared</span>
              </div>
              <span className="profile-stat-note">Getting started</span>
            </div>

            <div className="profile-stat-row">
              <span className="profile-stat-icon profile-stat-icon-pink">
                <Heart size={19} />
              </span>
              <div className="profile-stat-copy">
                <strong>0</strong>
                <span>Likes received</span>
              </div>
            </div>

            <div className="profile-stat-row">
              <span className="profile-stat-icon profile-stat-icon-green">
                <Users size={19} />
              </span>
              <div className="profile-stat-copy">
                <strong>0</strong>
                <span>Connections</span>
              </div>
            </div>

            <p className="profile-stats-disclaimer">
              Activity counts will update when your profile is connected to
              Kampusly's backend.
            </p>
          </section>

          <section className="profile-completion-card">
            <div className="profile-completion-heading">
              <div>
                <span className="profile-eyebrow">PROFILE CHECKLIST</span>
                <h2>Complete your profile</h2>
              </div>

              <span className="profile-completion-emoji">
                <Sparkles size={21} />
              </span>
            </div>

            <div
              className="profile-progress-track"
              role="progressbar"
              aria-valuenow={completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <div
                className="profile-progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <p className="profile-completion-description">
              Your profile is {completionPercentage}% complete. A complete
              profile helps other students recognise and connect with you.
            </p>

            <ul className="profile-checklist">
              <li className={profile.name ? "completed" : ""}>
                <span>
                  {profile.name ? <Check size={13} /> : "1"}
                </span>
                Add your name
              </li>

              <li className={profile.bio ? "completed" : ""}>
                <span>{profile.bio ? <Check size={13} /> : "2"}</span>
                Write your bio
              </li>

              <li className={avatar ? "completed" : ""}>
                <span>{avatar ? <Check size={13} /> : "3"}</span>
                Add a profile picture
              </li>

              <li className={profile.department ? "completed" : ""}>
                <span>
                  {profile.department ? <Check size={13} /> : "4"}
                </span>
                Add your department
              </li>
            </ul>

            <button
              type="button"
              className="profile-completion-button"
              onClick={startEditing}
            >
              Complete profile
              <Edit3 size={16} />
            </button>
          </section>

          <section className="profile-privacy-card">
            <span className="profile-privacy-icon">
              <Settings size={19} />
            </span>
            <div>
              <h3>Your profile, your choice</h3>
              <p>
                Only share information you're comfortable showing to other
                students.
              </p>
            </div>
          </section>
        </aside>
      </main>

      <footer className="profile-footer">
        <span>Kampusly</span>
        <span>Campus life, connected.</span>
      </footer>
    </div>
  );
}

