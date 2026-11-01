import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const pageTitle = title || 'Werkaholic AI';

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-800 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-white text-xl font-bold">Werkaholic AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/scanner" className="text-slate-300 hover:text-white transition-colors">
              Scanner
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
};
