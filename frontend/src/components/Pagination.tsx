interface PaginationProps {
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  currentPage,
  lastPage,
  from,
  to,
  total,
  onPageChange,
}: PaginationProps) => {
  const renderPageNumbers = () => {

    if (lastPage <= 1) return null;

    const pages = [];

    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`min-w-10 h-10 flex items-center justify-center text-sm rounded-full cursor-pointer ${
          currentPage === 1
            ? "bg-blue-500 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        1
      </button>
    );

    if (lastPage <= 7) {
      for (let i = 2; i <= lastPage; i++) {
        pages.push(
          <button
            key={`page-${i}`}
            onClick={() => onPageChange(i)}
            className={`min-w-10 cursor-pointer h-10 flex items-center justify-center text-sm rounded-full ${
              currentPage === i
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(
            <button
              key={`page-${i}`}
              onClick={() => onPageChange(i)}
              className={`min-w-10 cursor-pointer h-10 flex items-center justify-center text-sm rounded-full ${
                currentPage === i
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis-right" className="px-2 text-gray-500">
            ...
          </span>
        );
        pages.push(
          <button
            key={`page-${lastPage}`}
            onClick={() => onPageChange(lastPage)}
            className="min-w-10 cursor-pointer h-10 flex items-center justify-center text-sm rounded-full text-gray-700 hover:bg-gray-100"
          >
            {lastPage}
          </button>
        );
      } else if (currentPage >= lastPage - 2) {
        pages.push(
          <span key="ellipsis-left" className="px-2 text-gray-500">
            ...
          </span>
        );
        for (let i = lastPage - 3; i <= lastPage; i++) {
          pages.push(
            <button
              key={`page-${i}`}
              onClick={() => onPageChange(i)}
              className={`min-w-10 cursor-pointer h-10 flex items-center justify-center text-sm rounded-full ${
                currentPage === i
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i}
            </button>
          );
        }
      } else {
        pages.push(
          <span key="ellipsis-left" className="px-2 text-gray-500">
            ...
          </span>
        );
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(
            <button
              key={`page-${i}`}
              onClick={() => onPageChange(i)}
              className={`min-w-10 h-10 cursor-pointer flex items-center justify-center text-sm rounded-full ${
                currentPage === i
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {i}
            </button>
          );
        }
        pages.push(
          <span key="ellipsis-right" className="px-2 text-gray-500">
            ...
          </span>
        );
        pages.push(
          <button
            key={`page-${lastPage}`}
            onClick={() => onPageChange(lastPage)}
            className="min-w-10 cursor-pointer h-10 flex items-center justify-center text-sm rounded-full text-gray-700 hover:bg-gray-100"
          >
            {lastPage}
          </button>
        );
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 **:text-xs overflow-auto">
      <div className="text-sm text-gray-600">
        Showing {from} to {to} of {total} results
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 flex items-center gap-1 text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 cursor-pointer"
        >
          <span>&lt;</span>{" "}
          <span className="hidden sm:inline-flex">Previous</span>
        </button>

        <div className="flex items-center gap-1">{renderPageNumbers()}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="px-3 flex items-center gap-1 py-2 cursor-pointer text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900"
        >
          <span className="hidden sm:inline-flex">Next</span> <span>&gt;</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
