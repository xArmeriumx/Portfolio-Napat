import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Section from "../components/ui/Section.jsx";
import { projects } from "../data/projects.js";

/* ========================================
   NotFoundView - แสดงเมื่อไม่พบโปรเจค
======================================== */
function NotFoundView() {
  return (
    <div className="stack">
      <Section title="Project not found">
        <Link className="btn" to="/portfolio">
          ← Back to Portfolio
        </Link>
      </Section>
    </div>
  );
}

/* ========================================
   ImageGallery - แสดงรูปภาพและ Thumbnails
======================================== */
function ImageGallery({ images, title, selectedIndex, onSelect }) {
  const currentImage = images[selectedIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="projectDetail__media">
      {/* รูปหลัก */}
      <img
        className="projectImage"
        src={currentImage}
        alt={`${title} - Image ${selectedIndex + 1}`}
      />

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="galleryThumbs">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${title} thumbnail ${index + 1}`}
              className={`galleryThumb ${selectedIndex === index ? "active" : ""}`}
              onClick={() => onSelect(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================================
   InfoSection - แสดงหัวข้อ + เนื้อหา
======================================== */
function InfoSection({ title, children }) {
  if (!children) return null;
  return (
    <div className="infoSection">
      <h3 className="infoSection__title">{title}</h3>
      {children}
    </div>
  );
}

/* ========================================
   ActionButtons - ปุ่ม Repo / Demo / Back
======================================== */
function ActionButtons({ links }) {
  return (
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

      <Link className="btn" to="/portfolio">
        ← Back
      </Link>
    </div>
  );
}

/* ========================================
   ProjectDetail Page - หน้ารายละเอียดโปรเจค
======================================== */
export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ไม่พบโปรเจค
  if (!project) return <NotFoundView />;

  // รองรับทั้ง images (array) และ image (string)
  const projectImages = project.images || (project.image ? [project.image] : []);

  const {
    title,
    stack,
    role,
    description,
    technologies,
    keyFeatures,
    highlights,
    responsibilities,
    links,
  } = project;

  return (
    <div className="stack">
      <Section title={title}>
        <div className="projectDetail">
          {/* ========== Media Section ========== */}
          <ImageGallery
            images={projectImages}
            title={title}
            selectedIndex={selectedImageIndex}
            onSelect={setSelectedImageIndex}
          />

          {/* ========== Info Section ========== */}
          <div className="projectDetail__info">
            {/* Stack */}
            {stack && <p className="projectStack">{stack}</p>}

            {/* Role Tags */}
            {role?.length > 0 && (
              <div className="pillRow">
                {role.map((r) => (
                  <span key={r} className="pill">{r}</span>
                ))}
              </div>
            )}

            {/* Overview */}
            <InfoSection title="Overview">
              {description && (
                <p className="muted" style={{ whiteSpace: "pre-line" }}>
                  {description.trim()}
                </p>
              )}
            </InfoSection>

            {/* Technologies */}
            <InfoSection title="Technologies">
              {technologies?.length > 0 && (
                <div className="pillRow">
                  {technologies.map((t) => (
                    <span key={t} className="pill">{t}</span>
                  ))}
                </div>
              )}
            </InfoSection>

            {/* Key Features */}
            <InfoSection title="Key Features">
              {keyFeatures?.length > 0 && (
                <ul className="bullets">
                  {keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </InfoSection>

            {/* Highlights */}
            <InfoSection title="Highlights">
              {highlights?.length > 0 && (
                <ul className="bullets">
                  {highlights.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
            </InfoSection>

            {/* Responsibilities */}
            <InfoSection title="Responsibilities">
              {responsibilities?.length > 0 && (
                <ul className="bullets">
                  {responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </InfoSection>

            {/* Action Buttons */}
            <ActionButtons links={links} />
          </div>
        </div>
      </Section>
    </div>
  );
}

