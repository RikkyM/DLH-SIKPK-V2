import { useSidebar } from "@/hooks/useSidebar";
import type { ComponentType, ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  to: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}

const SidebarItem = ({ to, icon: Icon, children }: SidebarItemProps) => {
  const { isOpen, closeSidebar } = useSidebar();

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  };
  return (
    <NavLink
      to={to}
      onClick={handleNavClick}
      className={({ isActive }) =>
        [
          "block flex items-center gap-2 rounded p-2 outline-none whitespace-nowrap transition-all duration-300",
          isActive
            ? "bg-[#171717] text-white shadow"
            : "text-black hover:bg-gray-500/20",
        ].join(" ")
      }
    >
      <Icon className="w-6 min-w-6" />
      <span
        className={`transition-opacity duration-250 ${
          isOpen
            ? "delay-200 lg:opacity-100"
            : "lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:delay-200"
        }`}
      >
        {children}
      </span>
    </NavLink>
  );
};

export default SidebarItem;
