import { useMemo } from "react";

export const toISODate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

export const useDateRangeLimit = (
  fromDate?: string,
  toDate?: string,
  rangeMonth = 1,
) => {
  return useMemo(() => {
    let fMin = "";
    let fMax = "";
    let tMin = "";
    let tMax = "";

    if (toDate) {
        const to = new Date(toDate);
        fMax = toISODate(to);

        const min = new Date(to);
        min.setMonth(min.getMonth() - rangeMonth);
        fMin = toISODate(min);

        tMin = fMin;
        tMax = fMax;
    }

    if (fromDate) {
        const from = new Date(fromDate)
        tMin = toISODate(from);

        const max = new Date(from);
        max.setMonth(max.getMonth() + rangeMonth);
        tMax = toISODate(max);
    }

    return { fromMin: fMin, fromMax: fMax, toMin: tMin, toMax: tMax};
  }, [fromDate, toDate, rangeMonth]);
};
