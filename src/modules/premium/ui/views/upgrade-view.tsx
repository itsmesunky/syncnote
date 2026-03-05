"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";

import { PricingCard } from "../components/pricing-card";

const intervalMap: Record<string, string> = {
  month: "개월",
  year: "년",
};

export const UpgradeView = () => {
  const trpc = useTRPC();

  const { data: products } = useSuspenseQuery(trpc.premium.getProducts.queryOptions());

  const { data: currentSubscription } = useSuspenseQuery(
    trpc.premium.getCurrentSubscription.queryOptions(),
  );

  return (
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-10">
      <div className="mt-4 flex-1 flex flex-col gap-y-10 items-center">
        <h5 className="font-medium text-2xl md:text-3xl">
          현재{" "}
          <span className="font-semibold text-primary">{currentSubscription?.name ?? "Free"}</span>{" "}
          요금제를 이용 중입니다.
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product) => {
            const isCurrentProduct = currentSubscription?.id === product.id;
            const isPremium = !!currentSubscription;

            let buttonText = "업그레이드";
            let onClick = () => authClient.checkout({ products: [product.id] });

            if (isCurrentProduct) {
              buttonText = "구독 관리";
              onClick = () => authClient.customer.portal();
            } else if (isPremium) {
              buttonText = "요금제 변경";
              onClick = () => authClient.customer.portal();
            }

            return (
              <PricingCard
                key={product.id}
                buttonText={buttonText}
                onClick={onClick}
                variant={product.metadata.variant === "highlighted" ? "highlighted" : "default"}
                title={product.name}
                price={
                  product.prices[0].amountType === "fixed" ? product.prices[0].priceAmount / 100 : 0
                }
                description={product.description}
                priceSuffix={`/${intervalMap[product.recurringInterval!]}`}
                features={product.benefits.map((benefit) => benefit.description)}
                badge={product.metadata.badge as string | null}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
