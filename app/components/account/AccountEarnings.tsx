import { dataSupplierContractAbi } from "@/contracts/abi/dataSupplierContract";
import useClaimsFinder from "@/hooks/subgraph/useClaimsFinder";
import useToasts from "@/hooks/useToast";
import { Claim } from "@/types";
import { isAddressesEqual } from "@/utils/addresses";
import {
  chainToSupportedChainConfig,
  chainToSupportedChainDataSupplierContractAddress,
  chainToSupportedChainId,
  chainToSupportedChainNativeCurrencySymbol,
} from "@/utils/chains";
import { addressToShortAddress, stringToAddress } from "@/utils/converters";
import {
  Box,
  Link as MuiLink,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { formatEther, zeroAddress } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
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
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractPrepareConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  /**
   * Handle transaction success to show success message
   */
  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Earnings are claimed");
      refetchEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransactionSuccess]);

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
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
  const { data: claims } = useClaimsFinder({
    chain: chain,
    supplier: props.address,
  });

  return (
    <EntityList
      entities={claims}
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
          {new Date(props.claim.timestamp * 1000).toLocaleString()}
        </Typography>
        <MuiLink
          variant="body2"
          href={`${
            chainToSupportedChainConfig(chain).chain.blockExplorers?.default.url
          }/tx/${props.claim.id}`}
          target="_blank"
        >
          🔗 {addressToShortAddress(props.claim.id)}
        </MuiLink>
      </Stack>
    </CardBox>
  );
}
