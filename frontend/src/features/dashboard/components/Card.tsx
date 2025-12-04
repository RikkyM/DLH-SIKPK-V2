import { LoaderCircle } from "lucide-react";
import { type ComponentType } from "react";

type CardProps = {
  title: string;
  count: number;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  loading?: boolean;
};

const Card = ({
  title,
  count,
  icon: Icon,
  iconClassName,
  loading,
}: CardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white p-4 shadow-md">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold">{title}</h2>
        <p className="text-lg font-semibold">
          {loading ? (
            <LoaderCircle className="size-7 animate-spin" />
          ) : (
            // <LoaderCircle className="animate-spin bg-red-500" />
            count && <>{count}</>
          )}
        </p>
      </div>
      <Icon
        className={`size-full max-h-14 max-w-14 rounded-lg p-3 text-white ${iconClassName ?? ""}`}
      />
    </div>
  );
};

export default Card;
