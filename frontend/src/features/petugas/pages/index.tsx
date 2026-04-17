import DateInput from "@/components/DateInput";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import PetugasTable from "../component/table";
import { usePetugas } from "../hooks/usePetugas";

const DetailPetugasPages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState({
    from: searchParams.get("from_date") || null,
    to: searchParams.get("to_date") || null,
  });

  const badgenumber = searchParams.get("badgenumber");
  const department = searchParams.get("department");
  const penugasan = searchParams.get("penugasan");

  const petugas = usePetugas({
    badgenumber,
    department,
    penugasan,
    from: date.from,
    to: date.to,
  });

  const handleSearchDate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (date.from && date.to) {
      params.set("from_date", date.from);
      params.set("to_date", date.to);
    }

    setSearchParams(params);
    petugas.refetch();
  };

  return (
    <>
      <div className="mb-2 flex w-full flex-wrap justify-between gap-4 overflow-hidden">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <form
              onSubmit={handleSearchDate}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-sm font-medium text-white">Tanggal:</span>
              <label htmlFor="from_date" className="flex items-center gap-2">
                <DateInput
                  id="from_date"
                  value={date.from || ""}
                  onChange={(e) =>
                    setDate((prev) => ({
                      ...prev,
                      from: e.target.value,
                    }))
                  }
                  max={date.to || ""}
                  placeholder="Tanggal Awal..."
                />
              </label>

              <label htmlFor="to_date" className="flex items-center gap-2">
                <DateInput
                  id="to_date"
                  value={date.to || ""}
                  onChange={(e) =>
                    setDate((prev) => ({
                      ...prev,
                      to: e.target.value,
                    }))
                  }
                  min={date.from || ""}
                  placeholder="Tanggal Akhir..."
                />
              </label>
              <button
                type="submit"
                className="cursor-pointer rounded-sm bg-blue-600 px-3 py-1 text-white shadow outline-none"
              >
                Cari
              </button>
            </form>
          </div>
        </div>
      </div>

      <PetugasTable {...petugas} />
    </>
  );
};

export default DetailPetugasPages;
