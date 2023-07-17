import { dataSupplierContractAbi } from "@/contracts/abi/dataSupplierContract";
import useError from "@/hooks/useError";
import useKwil from "@/hooks/useKwil";
import useToasts from "@/hooks/useToast";
import { palette } from "@/theme/palette";
import { Token } from "@/types";
import {
  chainToSupportedChainDataSupplierContractAddress,
  chainToSupportedChainId,
} from "@/utils/chains";
import { Dialog, MenuItem, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import * as yup from "yup";
import FormikHelper from "../helper/FormikHelper";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  WidgetBox,
  WidgetInputSelect,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

/**
 * Dialog to make a supply.
 */
export default function SupplyMakeDialog(props: {
  token: Token;
  onSuccess?: Function;
  isClose?: boolean;
  onClose?: Function;
}) {
  const { handleError } = useError();
  const { chain } = useNetwork();
  const { showToastSuccess, showToastError } = useToasts();
  const { selectSupply, insertSupply, deleteSupply } = useKwil();

  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    category: "🖼️ Images",
    description: "",
  });
  const formValidationSchema = yup.object({
    category: yup.string().required(),
    description: yup.string().required(),
  });
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  /**
   * Contract states
   */
  const { config: contractPrepareConfig } = usePrepareContractWrite({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "makeSupply",
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
  async function submitForm(values: any) {
    try {
      setIsFormSubmitting(true);
      const id = `${props.token.contract}_${props.token.id}`;
      // Check supply in kwill
      const { data: supply } = await selectSupply(id);
      // Delete supply if already exists in kwill
      if (supply?.length != 0) {
        await deleteSupply(id);
      }
      // Insert supply to kwill
      await insertSupply(
        id,
        props.token.contract,
        props.token.id,
        props.token.image,
        values.description
      );
      // Use contract to process supply
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
      showToastSuccess("Token is supplied");
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
          🚚 Supply token
        </Typography>
        <Typography textAlign="center" mt={1}>
          to AI for learning
        </Typography>
        <Formik
          initialValues={formValues}
          validationSchema={formValidationSchema}
          onSubmit={submitForm}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <FormikHelper onChange={(values: any) => setFormValues(values)} />
              {/* Category input */}
              <WidgetBox bgcolor={palette.greyDark} mt={2}>
                <WidgetTitle>Category</WidgetTitle>
                <WidgetInputSelect
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  sx={{ width: 1 }}
                >
                  <MenuItem value="🖼️ Images">🖼️ Images</MenuItem>
                </WidgetInputSelect>
              </WidgetBox>
              {/* Description input */}
              <WidgetBox bgcolor={palette.greyLight} mt={2}>
                <WidgetTitle>Description</WidgetTitle>
                <WidgetInputTextField
                  id="description"
                  name="description"
                  placeholder="aggressive wolf with red eyes and..."
                  value={values.description}
                  onChange={handleChange}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  disabled={isFormDisabled}
                  multiline
                  maxRows={4}
                  sx={{ width: 1 }}
                />
              </WidgetBox>
              {/* Submit button */}
              <ExtraLargeLoadingButton
                loading={isFormLoading}
                variant="outlined"
                type="submit"
                disabled={isFormSubmittingDisabled}
                sx={{ mt: 2 }}
              >
                Submit
              </ExtraLargeLoadingButton>
            </Form>
          )}
        </Formik>
      </DialogCenterContent>
    </Dialog>
  );
}
