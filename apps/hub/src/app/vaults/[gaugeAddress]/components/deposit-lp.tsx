import { useState } from "react";
import {
  BERA_VAULT_REWARDS_ABI,
  type Token,
  TransactionActionType,
  usePollWalletBalances,
  usePollAllowance,
  usePollVaultsInfo,
} from "@bera/berajs";
import {
  ActionButton,
  ApproveButton,
  TokenInput,
  useAnalytics,
  useTxn,
} from "@bera/shared-ui";
import { Button } from "@bera/ui/button";
import BigNumber from "bignumber.js";
import { Address, parseUnits } from "viem";
import { ApiVaultFragment } from "@bera/graphql/pol/api";

export const DepositLP = ({
  lpToken,
  rewardVault,
}: {
  lpToken: Token;
  rewardVault: ApiVaultFragment;
}) => {
  const { useSelectedWalletBalance, refresh: refreshWalletBalances } =
    usePollWalletBalances({
      externalTokenList: [lpToken],
    });

  const balance = useSelectedWalletBalance(lpToken.address);
  const [depositAmount, setDepositAmount] = useState("");
  const validAmount =
    BigNumber(depositAmount).gt(0) &&
    BigNumber(depositAmount).lte(balance?.formattedBalance ?? "0");

  const { refresh: refreshVaultInfo } = usePollVaultsInfo({
    vaultAddress: rewardVault.vaultAddress as Address,
  });

  const { captureException, track } = useAnalytics();
  const { write, ModalPortal } = useTxn({
    message: "Stake LP Tokens", // AKA 'stake'
    actionType: TransactionActionType.ADD_LIQUIDITY,
    onSuccess: () => {
      try {
        track("stake", {
          quantity: depositAmount,
          token: lpToken.symbol,
          vault: rewardVault.vaultAddress,
        });
        setDepositAmount("");
      } catch (e) {
        captureException(e);
      }
      refreshWalletBalances();
      refreshVaultInfo();
    },
    onError: (e: Error | undefined) => {
      track("stake_failed");
      captureException(e);
    },
  });

  const { data: allowance } = usePollAllowance({
    spender: rewardVault.vaultAddress as Address,
    token: lpToken,
  });

  const [exceeding, setExceeding] = useState(false);

  return (
    <div className="flex flex-col gap-4 rounded-md border border-border p-4">
      <div>
        <div className="text-lg font-semibold leading-7">Stake Tokens</div>
        <div className="mt-1 text-sm leading-5">
          Stake your tokens to start earning BGT rewards
        </div>
        <div className="mt-4 rounded-md border border-border bg-muted">
          <TokenInput
            selected={lpToken}
            amount={depositAmount}
            balance={balance?.formattedBalance}
            hidePrice
            showExceeding={true}
            selectable={false}
            setAmount={(amount: string) =>
              setDepositAmount(amount as `${number}`)
            }
            onExceeding={(exceeding) => setExceeding(exceeding)}
          />
        </div>
      </div>
      {/* <Info /> */}

      <ActionButton className="mt-4">
        {((allowance !== undefined && allowance?.formattedAllowance === "0") ||
          (allowance?.allowance ?? 0n) <
            parseUnits(depositAmount, lpToken.decimals)) &&
        depositAmount !== "" &&
        depositAmount !== "0" &&
        !exceeding ? (
          <ApproveButton
            token={lpToken}
            spender={rewardVault.vaultAddress as Address}
            amount={parseUnits(depositAmount, lpToken.decimals)}
          />
        ) : (
          <Button
            className="w-full"
            disabled={!validAmount || exceeding}
            onClick={() =>
              write({
                address: rewardVault.vaultAddress as Address,
                abi: BERA_VAULT_REWARDS_ABI,
                functionName: "stake",
                params: [parseUnits(depositAmount, lpToken.decimals)],
              })
            }
          >
            Stake
          </Button>
        )}
      </ActionButton>
      {ModalPortal}
    </div>
  );
};
