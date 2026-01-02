export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      © {year} Napat Pamornsut | Napat-Dev.com · All rights reserved
    </footer>
  );
}
