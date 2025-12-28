import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Section from "../components/ui/Section.jsx";
import { projects } from "../data/projects.js";

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  // State สำหรับเลือกรูปภาพ
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  // รองรับทั้ง images (array) และ image (string เดิม)
  const projectImages =
    project.images || (project.image ? [project.image] : []);
  const currentImage = projectImages[selectedImageIndex] || projectImages[0];

  return (
    <div className="stack">
      <Section title={project.title}>
        <div className="projectDetail">
          <div className="projectDetail__media">
            {/* รูปภาพหลัก */}
            <img
              className="projectImage"
              src={currentImage}
              alt={`${project.title} - Image ${selectedImageIndex + 1}`}
            />

            {/* Gallery Thumbnails - แสดงถ้ามีมากกว่า 1 รูป */}
            {projectImages.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  overflowX: "auto",
                  padding: "4px 0",
                }}
              >
                {projectImages.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${project.title} thumbnail ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border:
                        selectedImageIndex === index
                          ? "3px solid #3b82f6"
                          : "2px solid #e5e7eb",
                      opacity: selectedImageIndex === index ? 1 : 0.6,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedImageIndex !== index) {
                        e.target.style.opacity = 0.8;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedImageIndex !== index) {
                        e.target.style.opacity = 0.6;
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="projectDetail__info">
            {project.stack && (
              <div className="projectStack">{project.stack}</div>
            )}

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
                  {project.keyFeatures.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* Highlights */}
            {project.highlights?.length ? (
              <>
                <h3 style={{ marginTop: 16 }}>Highlights</h3>
                <ul className="bullets">
                  {project.highlights.map((h, idx) => (
                    <li key={idx}>{h}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* Responsibilities */}
            {project.responsibilities?.length ? (
              <>
                <h3 style={{ marginTop: 16 }}>Responsibilities</h3>
                <ul className="bullets">
                  {project.responsibilities.map((r, idx) => (
                    <li key={idx}>{r}</li>
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
