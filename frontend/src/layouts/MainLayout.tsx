import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar/Sidebar";
import { type ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex h-dvh">
      <div className="fixed top-0 left-0 z-0 h-full max-h-72 w-full bg-[#FA6443]"></div>
      <Sidebar />
      <Dialog />
      <main className="z-0 flex flex-1 flex-col overflow-hidden">
        <Header />
        <section className="flex flex-1 flex-col overflow-auto p-2">
          {children}
        </section>
      </main>
    </section>
  );
};

export default MainLayout;
