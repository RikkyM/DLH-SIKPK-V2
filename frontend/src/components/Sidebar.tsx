import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="h-dvh w-full min-w-72 lg:max-w-72 bg-black/20 shadow border-r border-gray-300 fixed top-0 left-0 lg:relative z-10">
      {/* <aside className="flex-1 h-dvh w-full max-w-72 bg-red-500"> */}
      <div className="max-w-72 h-full bg-[#FAFAFA]">
        <header className="p-3">
          <div className="text-center text-xl font-semibold">DLH SIKPK V2</div>
        </header>
        <nav className="p-3 space-y-3 text-lg">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              [
                "block p-2",
                isActive
                  ? "text-white bg-[#171717] rounded shadow"
                  : "text-black",
              ].join(" ")
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/pegawai"
            className={({ isActive }) =>
              [
                "block p-2",
                isActive
                  ? "text-white bg-[#171717] rounded shadow"
                  : "text-black",
              ].join(" ")
            }
          >
            Pegawai
          </NavLink>
          <NavLink
            to="/kehadiran"
            className={({ isActive }) =>
              [
                "block p-2",
                isActive
                  ? "text-white bg-[#171717] rounded shadow"
                  : "text-black",
              ].join(" ")
            }
          >
            Kehadiran
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
