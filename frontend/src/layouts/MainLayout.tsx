import Header from "@/components/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import type { ReactNode } from "react";

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="h-dvh flex">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <section className="p-5 flex-1 overflow-auto flex flex-col">
          {children}
        </section>
      </main>
    </section>
  );
};

export default MainLayout;
