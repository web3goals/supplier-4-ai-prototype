import { dataSupplierContractAbi } from "@/contracts/abi/dataSupplierContract";
import useToasts from "@/hooks/useToast";
import { Claim } from "@/types";
import { isAddressesEqual } from "@/utils/addresses";
import {
  chainToSupportedChainDataSupplierContractAddress,
  chainToSupportedChainId,
  chainToSupportedChainNativeCurrencySymbol,
} from "@/utils/chains";
import { stringToAddress } from "@/utils/converters";
import { Box, Stack, SxProps, Typography } from "@mui/material";
import { useEffect } from "react";
import { formatEther, zeroAddress } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import EntityList from "../entity/EntityList";
import { CardBox, LargeLoadingButton } from "../styled";

/**
 * A component with account earnings.
 */
export default function AccountEarnings(props: { address: string }) {
  const { address } = useAccount();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        💸 Earnings
      </Typography>
      <Typography textAlign="center" mt={1}>
        received by supplying tokens to the AI
      </Typography>
      {isAddressesEqual(address, props.address) && (
        <ClaimEarningsCard address={props.address} sx={{ mt: 2 }} />
      )}
      <ClaimedEarningsList address={props.address} sx={{ mt: 2 }} />
    </Box>
  );
}

function ClaimEarningsCard(props: { address: string; sx?: SxProps }) {
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();

  /**
   * Define earnings
   */
  const { data: earnings, refetch: refetchEarnings } = useContractRead({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "getEarnings",
    args: [stringToAddress(props.address) || zeroAddress],
  });

  /**
   * Contract states
   */
  const { config: contractPrepareConfig } = usePrepareContractWrite({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "claimEarnings",
    chainId: chainToSupportedChainId(chain),
    onError(error: any) {
      showToastError(error);
    },
  });
  const {
    isLoading: isContractWriteLoading,
    write: contractWrite,
    isSuccess: isContractWriteSuccess,
  } = useContractWrite(contractPrepareConfig);

  /**
   * Handle transaction success to show success message
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      showToastSuccess("Earnings are claimed");
      refetchEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading;
  const isFormDisabled = isFormLoading || isContractWriteSuccess;
  const isFormSubmittingDisabled =
    isFormDisabled || !contractWrite || earnings === BigInt(0);

  if (earnings === undefined) {
    return <></>;
  }

  return (
    <CardBox
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...props.sx,
      }}
    >
      <Typography fontWeight={700}>
        {formatEther(earnings)}{" "}
        {chainToSupportedChainNativeCurrencySymbol(chain)}
      </Typography>
      <LargeLoadingButton
        loading={isFormLoading}
        variant="contained"
        type="submit"
        disabled={isFormSubmittingDisabled}
        sx={{ mt: 2 }}
        onClick={() => contractWrite?.()}
      >
        Claim
      </LargeLoadingButton>
    </CardBox>
  );
}

function ClaimedEarningsList(props: { address: string; sx?: SxProps }) {
  const { chain } = useNetwork();

  /**
   * Define claims
   */
  const { data: claims } = useContractRead({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "getClaims",
    args: [stringToAddress(props.address) || zeroAddress],
  });

  return (
    <EntityList
      entities={claims as any[]}
      renderEntityCard={(claim, index) => (
        <ClaimedEarningsCard claim={claim} key={index} />
      )}
      noEntitiesText="😐 no claimed earnings"
      sx={{ ...props.sx }}
    />
  );
}

function ClaimedEarningsCard(props: { claim: Claim; sx?: SxProps }) {
  const { chain } = useNetwork();

  return (
    <CardBox
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#DDDDDD",
        ...props.sx,
      }}
    >
      {/* Left side */}
      <Typography fontWeight={700}>
        {formatEther(BigInt(props.claim.value))}{" "}
        {chainToSupportedChainNativeCurrencySymbol(chain)}
      </Typography>
      {/* Right side */}
      <Stack direction="column" alignItems="flex-end">
        <Typography variant="body2">
          {new Date(Number(props.claim.timestamp) * 1000).toLocaleString()}
        </Typography>
      </Stack>
    </CardBox>
  );
}
