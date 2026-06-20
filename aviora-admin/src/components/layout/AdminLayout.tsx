import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ToastContainer from '../ui/Toast';

interface Props {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title }: Props) {
  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      <Sidebar />
      <TopBar title={title} />
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
