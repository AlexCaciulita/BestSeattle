import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
      <h1 className="text-5xl font-semibold">404</h1>
      <p className="mt-4 text-muted">
        This page doesn&apos;t exist — yet. We&apos;re curating fast.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-black"
      >
        Back to home
      </Link>
    </div>
  );
}
