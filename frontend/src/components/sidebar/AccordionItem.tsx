import { useSidebar } from "@/hooks/useSidebar";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

const AccordionItem = ({
  title,
  children,
  Icon,
  defaultOpen = false,
  routes = [],
}: {
  title: string;
  routes: string[];
  Icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) => {
  const location = useLocation();
  const { isOpen: sideOpen } = useSidebar();

  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isActiveRoute = routes.some((route) =>
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    if (isActiveRoute) {
      setIsOpen(true);
    }
  }, [location.pathname, isActiveRoute, routes]);

  return (
    <div className="border-b border-gray-200 whitespace-nowrap">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 text-left transition-colors duration-500 rounded-md cursor-pointer ${
          isActiveRoute ? "bg-gray-500/20 text-black" : "hover:bg-gray-500/20"
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon}
          <span
            className={`transition-all duration-250 ${
              sideOpen ? "lg:opacity-100 delay-200" : "lg:opacity-0"
            }`}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 pl-5 pt-2 ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div
          className={`pl-0.5 pb-3 space-y-2 transition-all duration-250 ${
            sideOpen ? "lg:opacity-100 delay-200" : "lg:opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
