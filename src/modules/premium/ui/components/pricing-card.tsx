import { type VariantProps, cva } from "class-variance-authority";
import { CircleCheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const pricingCardVariants = cva("rounded-lg p-4 py-6 w-full transition-all", {
  variants: {
    variant: {
      default: "bg-white text-black border",
      highlighted: "bg-black text-white border-black shadow-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pricingCardIconVariants = cva("size-5", {
  variants: {
    variant: {
      default: "fill-black text-white",
      highlighted: "fill-white text-black",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pricingCardSecondaryTextVariants = cva("", {
  variants: {
    variant: {
      default: "text-neutral-700",
      highlighted: "text-neutral-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pricingCardBadgeVariants = cva("text-xs font-medium p-1 px-2 rounded-md", {
  variants: {
    variant: {
      default: "bg-black/10 text-black",
      highlighted: "bg-white text-black",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const pricingCardButtonVariants = cva("w-full font-medium", {
  variants: {
    variant: {
      default: "bg-white text-black border border-neutral-200 hover:bg-neutral-100",
      highlighted: "bg-white text-black hover:bg-neutral-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface Props extends VariantProps<typeof pricingCardVariants> {
  price: number;
  features: string[];
  title: string;
  priceSuffix: string;
  buttonText: string;
  badge?: string | null;
  description?: string | null;
  className?: string;
  onClick: () => void;
}

export const PricingCard = ({
  price,
  features,
  title,
  priceSuffix,
  buttonText,
  badge,
  variant,
  description,
  className,
  onClick,
}: Props) => {
  return (
    <div className={cn(pricingCardVariants({ variant }), className)}>
      <div className="flex items-end gap-x-4 justify-between">
        <div className="flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <h6 className="font-medium text-xl">{title}</h6>
            {badge ? (
              <Badge className={cn(pricingCardBadgeVariants({ variant }), "border-none")}>
                {badge}
              </Badge>
            ) : null}
          </div>
          <p className={cn("text-xs", pricingCardSecondaryTextVariants({ variant }))}>
            {description}
          </p>
        </div>
        <div className="flex items-end shrink-0 gap-x-0.5">
          <h4 className="text-3xl font-medium">
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(price)}
          </h4>
          <span className={cn(pricingCardSecondaryTextVariants({ variant }))}>{priceSuffix}</span>
        </div>
      </div>
      <div className="py-6">
        <Separator
          className={cn(
            "opacity-20",
            variant === "highlighted" ? "bg-neutral-700" : "bg-neutral-200",
          )}
        />
      </div>

      {/* 반전 테마에 맞춘 버튼 적용 */}
      <Button className={cn(pricingCardButtonVariants({ variant }))} size="lg" onClick={onClick}>
        {buttonText}
      </Button>

      <div className="flex flex-col gap-y-2 mt-6">
        <p
          className={cn(
            "font-medium uppercase",
            variant === "highlighted" ? "text-neutral-200" : "text-neutral-800",
          )}
        >
          제공 혜택:
        </p>
        <ul
          className={cn("flex flex-col gap-y-2.5", pricingCardSecondaryTextVariants({ variant }))}
        >
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-x-2.5">
              <CircleCheckIcon className={cn(pricingCardIconVariants({ variant }))} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
