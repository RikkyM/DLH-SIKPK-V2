import { useImagePreview } from "@/hooks/usePreviewImage";
import { Image } from "lucide-react";

type Props = {
  title: string;
  subTitle?: string;
  image?: string;
  type?: string;
};

const PreviewImage = ({ title, subTitle, image }: Props) => {
  const { openPreview } = useImagePreview();

  return (
    <div className="mx-auto w-full rounded-lg border border-gray-300 p-1 shadow">
      <div className="mb-2">
        <h4 className="font-semibold lg:text-lg">{title}</h4>
        <p className="text-xs text-gray-400 lg:text-sm">{subTitle}</p>
      </div>

      {image ? (
        <img
          src={image}
          className="mx-auto max-h-56 max-w-full cursor-pointer rounded object-cover"
          onClick={() => openPreview(image!)}
        />
      ) : (
        <div className="grid h-56 w-full place-content-center rounded-lg border-2 border-dashed border-gray-400 bg-gray-200">
          <div className="space-y-2">
            <Image className="mx-auto size-7 text-gray-500" />
            <p className="text-center text-sm text-gray-500">
              Belum ada gambar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewImage;
