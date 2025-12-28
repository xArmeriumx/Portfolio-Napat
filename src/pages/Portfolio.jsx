import { Link } from "react-router-dom";
import Section from "../components/ui/Section.jsx";
import { projects } from "../data/projects.js";

/* ========================================
   ProjectCard Component
   - แสดงข้อมูลโปรเจคแต่ละรายการ
======================================== */
function ProjectCard({ project }) {
  const { slug, title, stack, role, highlights, links, images, image } = project;

  // ใช้รูปแรกเป็นปก (รองรับทั้ง array และ string)
  const coverImage = images?.[0] || image;

  return (
    <article className="projectCard">
      {/* รูปปก */}
      <div className="projectImageWrap">
        <img className="projectImage" src={coverImage} alt={title} />
      </div>

      {/* เนื้อหา */}
      <div className="projectBody">
        <h3 className="projectTitle">{title}</h3>

        {stack && <p className="projectStack">{stack}</p>}

        {/* Role Tags */}
        <div className="pillRow">
          {role.map((r) => (
            <span key={r} className="pill">{r}</span>
          ))}
        </div>

        {/* Highlights */}
        <ul className="bullets">
          {highlights.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="projectBtns">
          {links.repo && (
            <a
              className="btn"
              href={links.repo}
              target="_blank"
              rel="noreferrer"
            >
              Repo
            </a>
          )}

          {links.demo && (
            <a
              className="btn"
              href={links.demo}
              target="_blank"
              rel="noreferrer"
            >
              Demo
            </a>
          )}

          <Link className="btn" to={`/portfolio/${slug}`}>
            View Detail →
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ========================================
   Portfolio Page
   - แสดงรายการโปรเจคทั้งหมด
======================================== */
export default function Portfolio() {
  return (
    <div className="stack">
      <Section title="Portfolio">
        <div className="portfolioList">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>
    </div>
  );
}

