import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <p className="text-8xl font-extrabold text-amber-500 leading-none">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">Page Not Found</h1>
        <p className="mt-3 text-slate-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

