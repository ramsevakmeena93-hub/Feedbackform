export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur transition-colors duration-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 dark:text-slate-500">
        <p className="text-center sm:text-left">
          © 2026 <span className="font-semibold text-slate-600 dark:text-slate-300">MITS Gwalior</span> · Deemed to be University · Estd. 1957
        </p>
        <p className="hidden sm:block font-medium">
          A Government Aided Autonomous Institute · Academic Year 2025–26
        </p>
      </div>
    </footer>
  );
}
