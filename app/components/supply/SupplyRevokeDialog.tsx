import { dataSupplierContractAbi } from "@/contracts/abi/dataSupplierContract";
import useError from "@/hooks/useError";
import useKwil from "@/hooks/useKwil";
import useToasts from "@/hooks/useToast";
import { Token } from "@/types";
import {
  chainToSupportedChainDataSupplierContractAddress,
  chainToSupportedChainId,
} from "@/utils/chains";
import { Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { DialogCenterContent, ExtraLargeLoadingButton } from "../styled";

/**
 * Dialog to revoke a supply.
 */
export default function SupplyRevokeDialog(props: {
  token: Token;
  onSuccess?: Function;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { handleError } = useError();
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();
  const { deleteSupply } = useKwil();

  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Form states
   */
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Contract states
   */
  const { config: contractPrepareConfig } = usePrepareContractWrite({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "revokeSupply",
    args: [props.token.contract as `0x${string}`, BigInt(props.token.id)],
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
   * Close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  /**
   * Start process form
   */
  async function submitForm() {
    try {
      setIsFormSubmitting(true);
      // Update data in kwill
      await deleteSupply(`${props.token.contract}_${props.token.id}`);
      // Update data in contract
      contractWrite?.();
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  /**
   * Handle transaction success to show success message
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      showToastSuccess("Token is revoked");
      props.onSuccess?.();
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading || isFormSubmitting;
  const isFormDisabled = isFormLoading || isContractWriteSuccess;
  const isFormSubmittingDisabled = isFormDisabled || !contractWrite;

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          ❌ Revoke token
        </Typography>
        <Typography textAlign="center" mt={1}>
          that supplied to AI for learning
        </Typography>
        <ExtraLargeLoadingButton
          loading={isFormLoading}
          variant="outlined"
          type="submit"
          disabled={isFormSubmittingDisabled}
          sx={{ mt: 4 }}
          onClick={() => submitForm()}
        >
          Submit
        </ExtraLargeLoadingButton>
      </DialogCenterContent>
    </Dialog>
  );
}
