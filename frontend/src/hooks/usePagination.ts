import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const usePagination = (defaultPerPage: number = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [perPage, setPerPage] = useState<number>(defaultPerPage);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const perPageFromUrl = searchParams.get("per_page");
    if (perPageFromUrl) {
      setPerPage(Number(perPageFromUrl));
    }
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    const params: { page: string; per_page?: string } = {
      page: page.toString(),
    };

    if (perPage !== defaultPerPage && perPage !== -1) {
      params.per_page = perPage.toString();
    }

    setSearchParams(params);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    const params: { page: string; per_page?: string } = { page: "1" };

    if (value !== defaultPerPage && value !== -1) {
      params.per_page = value.toString();
    }

    setSearchParams(params);
  };

  return {
    currentPage,
    perPage,
    handlePageChange,
    handlePerPageChange
  };
};
