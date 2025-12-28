import Section from "../components/ui/Section.jsx";
import { projects } from "../data/projects.js";
import { Link } from "react-router-dom";

export default function Portfolio() {
  return (
    <div className="stack">
      <Section title="Portfolio">
        <div className="portfolioList">
          {projects.map((p) => {
            // รองรับทั้ง images (array) และ image (string) - ใช้รูปแรกเป็นปก
            const coverImage = p.images ? p.images[0] : p.image;

            return (
              <article key={p.slug} className="projectCard">
                <div className="projectImageWrap">
                  <img
                    className="projectImage"
                    src={coverImage}
                    alt={p.title}
                  />
                </div>

                <div className="projectBody">
                  <h3 className="projectTitle">{p.title}</h3>
                  {p.stack && <div className="projectStack">{p.stack}</div>}

                  <div className="pillRow">
                    {p.role.map((r) => (
                      <span key={r} className="pill">
                        {r}
                      </span>
                    ))}
                  </div>

                  <ul className="bullets">
                    {p.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>

                  <div className="projectBtns">
                    {p.links.repo ? (
                      <a
                        className="btn btnOutline"
                        href={p.links.repo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Repo
                      </a>
                    ) : null}
                    {p.links.demo ? (
                      <a
                        className="btn btnOutline"
                        href={p.links.demo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Demo
                      </a>
                    ) : null}
                    <Link
                      className="btn btnOutline"
                      to={`/portfolio/${p.slug}`}
                    >
                      Detail →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
