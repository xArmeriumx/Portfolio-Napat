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

            {project.description ? (
              <>
                <h3 style={{ marginTop: 16 }}>Overview</h3>
                <p
                  className="muted"
                  style={{ marginTop: 6, whiteSpace: "pre-line" }}
                >
                  {project.description.trim()}
                </p>
              </>
            ) : null}

            {/* Technologies */}
            {project.technologies?.length ? (
              <>
                <h3 style={{ marginTop: 16 }}>Technologies</h3>
                <div className="pillRow" style={{ marginTop: 10 }}>
                  {project.technologies.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              </>
            ) : null}

            {/* Key Features */}
            {project.keyFeatures?.length ? (
              <>
                <h3 style={{ marginTop: 16 }}>Key Features</h3>
                <ul className="bullets">
                  {project.keyFeatures.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* เดิม: Highlights */}
            <h3 style={{ marginTop: 16 }}>Highlights</h3>
            <ul className="bullets">
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>

            {/* Responsibilities (ถ้ามี) */}
            {project.responsibilities?.length ? (
              <>
                <h3 style={{ marginTop: 16 }}>Responsibilities</h3>
                <ul className="bullets">
                  {project.responsibilities.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </>
            ) : null}

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
