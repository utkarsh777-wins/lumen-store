export default function Loading() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8">
      <div className="h-8 w-40 animate-pulse bg-sand" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse bg-sand" />
        ))}
      </div>
    </div>
  );
}
