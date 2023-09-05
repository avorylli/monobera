"use client";

import React from "react";
import { formatUsd } from "@bera/berajs";
import { Icons } from "@bera/ui/icons";

import { usePollPrices } from "~/hooks/usePollPrices";

export function DataCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex w-full flex-col rounded-2xl border bg-muted p-4 md:p-6">
      <div className="flex items-center gap-2 text-xs md:text-sm">
        <div className="text-muted-foreground">{icon}</div>
        <div className="whitespace-nowrap text-muted-foreground">{title}</div>
      </div>
      <div className="mt-2 text-base font-bold md:text-2xl">{value}</div>
    </div>
  );
}

export default function Data({ tvl, volume }: { tvl: any; volume: any }) {
  console.log("tvl", tvl);
  console.log("volume", volume);
  const { usePrice } = usePollPrices();
  const beraPrice = usePrice(process.env.NEXT_PUBLIC_WBERA_ADDRESS as string);
  return (
    <section className="my-24 flex w-full flex-col items-center">
      <div className="grid w-full grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <DataCard
          title="Total Value Locked"
          value="$842,886,669"
          icon={<Icons.lock className="h-3 w-3 md:h-6 md:w-6" />}
        />
        <DataCard
          title="24H Volume"
          value="$69,420,702"
          icon={<Icons.candleStick className="h-3 w-3 md:h-6 md:w-6" />}
        />
        <DataCard
          title="BGT Rewards"
          value="1,690,420 BGT"
          icon={<Icons.medal className="h-3 w-3 md:h-6 md:w-6" />}
        />
        <DataCard
          title="Bera Price"
          value={formatUsd(beraPrice)}
          icon={<Icons.bera className="mt-[2px] h-3 w-3 md:h-6 md:w-6" />}
        />
      </div>
      {/* <Button variant="outline" className="mt-8">
        View Analytics
      </Button> */}
    </section>
  );
}
