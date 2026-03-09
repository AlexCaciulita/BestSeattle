"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-4 text-muted">
        We hit an issue loading this page. This is usually temporary.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black"
      >
        Try again
      </button>
    </div>
  );
}
