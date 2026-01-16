export default function Section({ title, children }) {
  return (
    <section className="mt-8 mb-6">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
      </div>
      {children}
    </section>
  );
}
