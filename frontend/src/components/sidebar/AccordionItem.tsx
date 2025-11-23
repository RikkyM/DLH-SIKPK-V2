import { useSidebar } from "@/hooks/useSidebar";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

const AccordionItem = ({
  title,
  children,
  icon,
  defaultOpen = false,
  routes = [],
}: {
  title: string;
  routes: string[];
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const location = useLocation();
  const { isOpen: sideOpen } = useSidebar();

  const isActiveRoute = routes.some((route) =>
    location.pathname.startsWith(route),
  );

  useEffect(() => {
    if (isActiveRoute) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isActiveRoute]);

  const [isOpen, setIsOpen] = useState(defaultOpen || isActiveRoute);

  return (
    <div className="whitespace-nowrap">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full cursor-pointer items-center justify-between rounded-md p-2 text-left transition-all duration-300 outline-none ${
          isActiveRoute
            ? "bg-gray-500/20 text-black shadow"
            : "hover:bg-gray-500/20"
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span
            className={`transition-opacity duration-250 lg:group-hover:opacity-100 ${
              sideOpen
                ? "delay-200 lg:opacity-100"
                : "lg:opacity-0 lg:group-hover:delay-200"
            }`}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden pt-2 transition-all duration-300 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div
          className={`space-y-2 transition-all duration-250 ${
            sideOpen && "delay-200"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
