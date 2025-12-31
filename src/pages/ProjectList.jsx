import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta.js";
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
        <img className="projectImage" src={coverImage} alt={title} loading="lazy" />
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
              aria-label={`View ${title} repository`}
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
              aria-label={`View ${title} demo`}
            >
              Demo
            </a>
          )}

          <Link className="btn" to={`/projects/${slug}`} aria-label={`View ${title} details`}>
            View Detail →
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ========================================
   ProjectList Page
   - แสดงรายการโปรเจคทั้งหมด
======================================== */
export default function ProjectList() {
  // SEO Meta Tags
  usePageMeta({
    title: "Projects | Napat Pamornsut",
    description: "Explore my projects including web development, fullstack, system analysis, and software testing work.",
  });

  return (
    <div className="stack">
      <Section title="Projects">
        <div className="projectList">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>
    </div>
  );
}
