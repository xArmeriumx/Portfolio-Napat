import { Link, useParams } from "react-router-dom";
import Section from "../components/ui/Section.jsx";
import { projects } from "../data/projects.js";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="stack">
        <Section title="Project not found">
          <Link className="btn btnOutline" to="/portfolio">
            ← Back to Portfolio
          </Link>
        </Section>
      </div>
    );
  }

  return (
    <div className="stack">
      <Section title={project.title}>
        <div className="projectDetail">
          <div className="projectDetail__media">
            <img
              className="projectImage"
              src={project.image}
              alt={project.title}
            />
          </div>

          <div className="projectDetail__info">
            <div className="projectStack">{project.stack}</div>

            <div className="pillRow" style={{ marginTop: 10 }}>
              {project.role.map((r) => (
                <span key={r} className="pill">
                  {r}
                </span>
              ))}
            </div>

            <h3 style={{ marginTop: 16 }}>Highlights</h3>
            <ul className="bullets">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            <div className="projectBtns" style={{ marginTop: 16 }}>
              {project.links.repo ? (
                <a
                  className="btn btnOutline"
                  href={project.links.repo}
                  target="_blank"
                  rel="noreferrer"
                >
                  Repo
                </a>
              ) : null}
              {project.links.demo ? (
                <a
                  className="btn btnOutline"
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer"
                >
                  Demo
                </a>
              ) : null}
              <Link className="btn btnOutline" to="/portfolio">
                ← Back
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
