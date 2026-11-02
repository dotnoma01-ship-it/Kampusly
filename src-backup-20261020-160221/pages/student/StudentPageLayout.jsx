import StudentSidebar from "./StudentSidebar";
import "./StudentPageLayout.css";

export default function StudentPageLayout({ children }) {
  return (
    <div className="kampusly-student-layout">
      <StudentSidebar />
      <div className="kampusly-student-content">
        {children}
      </div>
    </div>
  );
}
