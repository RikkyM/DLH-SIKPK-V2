import Combobox, { type Option } from "@/components/Combobox";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const TambahKehadiran = () => {
  const loc = useLocation();

  const [selected, setSelected] = useState<Option | null>(null);

  return (
    <>
      <div className="flex-1 space-y-2 overflow-auto rounded border border-gray-300 bg-white p-5 shadow">
        <div className="flex">
          {loc.pathname === "/tambah-kehadiran" && (
            <NavLink
              to="/update-kehadiran"
              className="rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white"
            >
              Update
            </NavLink>
          )}
        </div>
        <div>
          <Combobox
            api="api/v1/petugas-kehadiran"
            // label="Pilih Petugas"
            placeholder="Cari NIK/Nama Petugas"
            onSelect={(option) => setSelected(option)}
            value={selected}
            displayKey="nama"
            valueKey="id"
            searchParam="search"
          />
        </div>
      </div>
    </>
  );
};

export default TambahKehadiran;
