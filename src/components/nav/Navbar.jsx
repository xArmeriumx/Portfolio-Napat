import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navInner">
        <Link to="/" className="brand">
          Napat-Dev();
        </Link>

        <nav className="navLinks">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            About
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Projects
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

