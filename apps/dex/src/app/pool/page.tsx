import { type Metadata } from "next";
import { RouterService, defaultConfig } from "@bera/bera-router";
import { type Pool } from "@bera/bera-router/dist/services/PoolService/types";
import { formatUnits, parseUnits } from "viem";

import PoolsTable from "~/components/pools-table";
import PoolPageHeader from "./PoolPageHeader";

export const metadata: Metadata = {
  title: "Pools | DEX | Berachain",
  description: "Decentralized exchange on Berachain",
};

interface MappedTokens {
  [key: string]: number;
}

const BERA = "0x675494e291eb5d416cAd45d56AbD1781e88C5701";
export const revalidate = 300; // five minutes
export default async function Pool() {
  const router = new RouterService(defaultConfig);
  try {
    await router.fetchPools();
  } catch (e) {
    console.log(`Error fetching pools: ${e}`);
  }
  let pools = [];
  let mappedTokens: MappedTokens = {};
  // TODO typesafe this
  pools = router.getPools();
  if (pools.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allPoolPromises: any[] = [];
    pools.forEach((pool) => {
      const tokenPromises = pool.tokens
        .filter((token) => token.address !== BERA)
        .map((token) =>
          router
            .getSwaps(
              token.address,
              BERA,
              0,
              parseUnits(`${1}`, token.decimals),
            )
            .catch(() => {
              return {
                tokenIn: token.address,
              };
            }),
        );

      allPoolPromises.push(tokenPromises);
    });

    const allPoolData = await Promise.all(allPoolPromises.flat());

    mappedTokens =
      allPoolData?.length &&
      allPoolData.reduce(
        (acc, cur) => {
          acc[cur.tokenIn] = cur.formattedReturnAmount;
          return acc;
        },
        { [BERA]: "1" },
      );

    pools.map(async (pool) => {
      const volumeResponse = await fetch(
        `http://k8s-devnet-apinlb-25cc83ec5c-24b3d2c710b46250.elb.us-east-2.amazonaws.com/events/dex/historical_volumes?pool=${pool.pool}&num_of_days=1`,
      );
      const volume = await volumeResponse.json();

      pool.dailyVolume = 0;
      if (
        volume.result &&
        volume.result[0] &&
        volume.result[0].coins &&
        volume.result[0].coins[0]
      ) {
        pool.dailyVolume = volume.result[0].coins[0].amount;
      }
      pool.totalValue = pool.tokens.reduce((acc, cur) => {
        const tokenValue = mappedTokens[cur.address];
        const tokenBalance = formatUnits(cur.balance, cur.decimals);
        if (!tokenValue) {
          return acc;
        }
        const totalTokenValue = tokenValue * Number(tokenBalance);
        return acc + totalTokenValue;
      }, 0);
    });
  }

  return (
    <div className="container m-auto flex w-full flex-col gap-5">
      <PoolPageHeader />
      <PoolsTable pools={pools} mappedTokens={mappedTokens} />
    </div>
  );
}