import React from "react";
import {
  useCollateralBalance,
  useTokenName,
  useUserBalance,
} from "../../hooks";
import { LendingReserve } from "../../models/lending";
import { TokenIcon } from "../../components/TokenIcon";
import { formatNumber } from "../../utils/utils";
import { Button, Card } from "antd";
import { Link } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { TokenAccount } from "../../models";
import { ParsedAccount } from "../../contexts/accounts";

export const DepositItem = (props: {
  reserve: ParsedAccount<LendingReserve>;
  account: TokenAccount;
}) => {
  const account = props.account.info;

  const mintAddress = props.reserve.info.liquidityMint;
  const name = useTokenName(mintAddress);
  const { balance: collateralBalance } = useCollateralBalance(props.reserve.info, props.account.pubkey);

  return (
    <Link to={`/withdraw/${props.reserve.pubkey.toBase58()}`}>
      <Card>
        <div className="deposit-item">
          <span style={{ display: "flex" }}>
            <TokenIcon mintAddress={mintAddress} />
            {name}
          </span>
          <div>
            {formatNumber.format(collateralBalance)} {name}
          </div>
          <div>--</div>
          <div>
            <Button>
              <span>Withdraw</span>
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};
