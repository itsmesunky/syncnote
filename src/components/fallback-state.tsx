import { AlertCircleIcon, Loader2Icon } from "lucide-react";

interface Props {
  type: "loading" | "error";
  title: string;
  description: string;
}

export const FallbackState = ({ type, title, description }: Props) => {
  return (
    <div className="py-4 px-8 flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
        {type === "loading" ? (
          <Loader2Icon aria-label="로딩 중 아이콘" className="size-6 animate-spin text-primary" />
        ) : (
          <AlertCircleIcon aria-label="에러 아이콘" className="size-6 text-red-500" />
        )}
        <div className="flex flex-col gap-y-2 text-center">
          <h6 className="text-lg font-medium">{title}</h6>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </div>
    </div>
  );
};
