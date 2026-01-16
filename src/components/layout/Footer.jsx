export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-8 text-center text-sm font-semibold text-gray-400 uppercase tracking-widest border-t border-gray-100 mt-auto bg-gray-50">
      © {year} Napat Pamornsut · All rights reserved
    </footer>
  );
}
