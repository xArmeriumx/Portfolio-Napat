export default function Loading() {
  return (
    <div className="min-h-[70vh] px-4 pb-24 pt-28 md:px-6" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-5xl animate-pulse">
        <div className="h-3 w-40 rounded-full bg-gray-200" />
        <div className="mt-4 h-10 w-3/4 rounded-xl bg-gray-200" />
        <div className="mt-4 h-5 w-1/2 rounded-lg bg-gray-200" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="h-44 rounded-2xl bg-gray-200" />
          <div className="h-44 rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
