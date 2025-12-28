import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";

export default function NotFound() {
  usePageMeta({
    title: "Page Not Found | Napat Pamornsut",
    description: "The page you are looking for does not exist."
  });

  return (
    <div className="stack" style={{ 
      minHeight: "70vh", 
      justifyContent: "center", 
      alignItems: "center",
      textAlign: "center" 
    }}>
      <h1 style={{ 
        fontSize: "clamp(60px, 10vw, 120px)", 
        fontWeight: "800", 
        color: "#1d0606ff",
        lineHeight: 1,
        marginBottom: "1rem",
        letterSpacing: "-0.05em"
      }}>
        404
      </h1>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Page Not Found</h2>
      <p className="muted" style={{ marginBottom: "2rem", fontSize: "1.1rem", maxWidth: "400px" }}>
        Oops! The page you're looking for doesn't seem to exist (or I haven't built it yet).
      </p>
      <Link className="btn" to="/">
        Return Home
      </Link>
    </div>
  );
}
