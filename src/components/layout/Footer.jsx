export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-gray-100 bg-gray-50 py-8 text-center text-sm font-semibold text-gray-400 mt-auto">
      <p className="px-4 text-[11px] uppercase tracking-[0.16em] sm:text-sm sm:tracking-widest">
        © {year} Napat Pamornsut · All rights reserved
      </p>
    </footer>
  );
}
