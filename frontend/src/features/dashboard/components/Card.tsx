import { type ComponentType } from "react";

type CardProps = {
  title: string;
  count: number;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
};

const Card = ({ title, count, icon: Icon, iconClassName }: CardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-6 shadow-md">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-lg font-semibold">{count}</p>
      </div>
      <Icon
        className={`size-full max-h-14 max-w-14 rounded-lg p-3 text-white ${iconClassName ?? ""}`}
      />
    </div>
  );
};

export default Card;
