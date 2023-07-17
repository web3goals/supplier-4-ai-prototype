import { dataSupplierContractAbi } from "@/contracts/abi/dataSupplierContract";
import useDebounce from "@/hooks/useDebounce";
import useError from "@/hooks/useError";
import useKwil from "@/hooks/useKwil";
import useToasts from "@/hooks/useToast";
import { palette } from "@/theme/palette";
import {
  chainToSupportedChainDataSupplierContractAddress,
  chainToSupportedChainId,
  chainToSupportedChainNativeCurrencySymbol,
} from "@/utils/chains";
import { Dialog, MenuItem, Stack, Typography } from "@mui/material";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import * as yup from "yup";
import FormikHelper from "../helper/FormikHelper";
import {
  DialogCenterContent,
  ExtraLargeLoadingButton,
  FullWidthSkeleton,
  WidgetBox,
  WidgetInputSelect,
  WidgetInputTextField,
  WidgetTitle,
} from "../styled";

/**
 * Dialog to purchase supplies.
 */
export default function SupplyPurchaseDialog(props: {
  onSuccess?: Function;
  isClose?: boolean;
  onClose?: Function;
}) {
  const [isPurchased, setIsPurchased] = useState(false);

  /**
   * Dialog states
   */
  const [isOpen, setIsOpen] = useState(!props.isClose);

  /**
   * Close dialog
   */
  async function close() {
    setIsOpen(false);
    props.onClose?.();
  }

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogCenterContent>
        {isPurchased ? (
          <DownloadForm />
        ) : (
          <PurchaseForm onPurchased={() => setIsPurchased(true)} />
        )}
      </DialogCenterContent>
    </Dialog>
  );
}

function PurchaseForm(props: { onPurchased?: Function }) {
  const { chain } = useNetwork();
  const { showToastError } = useToasts();

  /**
   * Form states
   */
  const [formValues, setFormValues] = useState({
    price: 0.05,
    priceCurrency: "native",
  });
  const formValidationSchema = yup.object({
    price: yup.number().required(),
    priceCurrency: yup.string().required(),
  });
  const debouncedFormValues = useDebounce(formValues);

  /**
   * Contract states
   */
  const { config: contractPrepareConfig } = usePrepareContractWrite({
    address: chainToSupportedChainDataSupplierContractAddress(chain),
    abi: dataSupplierContractAbi,
    functionName: "purchaseData",
    value: parseEther(debouncedFormValues.price.toString()),
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
   * Handle transaction success
   */
  useEffect(() => {
    if (isContractWriteSuccess) {
      props.onPurchased?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContractWriteSuccess]);

  /**
   * Form states
   */
  const isFormLoading = isContractWriteLoading;
  const isFormDisabled = isFormLoading || isContractWriteSuccess;
  const isFormSubmittingDisabled = isFormDisabled || !contractWrite;

  return (
    <>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        🚀 Purchase data
      </Typography>
      <Typography textAlign="center" mt={1}>
        that can be used by AI to learning
      </Typography>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={() => contractWrite?.()}
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
            <WidgetBox bgcolor={palette.greyLight} mt={2}>
              <WidgetTitle>I stake</WidgetTitle>
              <Stack direction="row" spacing={1} sx={{ width: 1 }}>
                <WidgetInputTextField
                  id="price"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  error={touched.price && Boolean(errors.price)}
                  helperText={touched.price && errors.price}
                  disabled={isFormDisabled}
                  sx={{ flex: 1 }}
                />
                <WidgetInputSelect
                  id="priceCurrency"
                  name="priceCurrency"
                  value={values.priceCurrency}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="native">
                    {chainToSupportedChainNativeCurrencySymbol(chain)}
                  </MenuItem>
                </WidgetInputSelect>
              </Stack>
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
    </>
  );
}

function DownloadForm() {
  const { handleError } = useError();
  const { selectSupplies } = useKwil();
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();

  useEffect(() => {
    selectSupplies()
      .then(({ data }) => {
        const downloadData = data?.map((element: any) => ({
          description: element.token_description,
          image: element.token_image,
        }));
        const downloadBlob = new Blob([JSON.stringify(downloadData)], {
          type: "application/json",
        });
        const downloadUrl = URL.createObjectURL(downloadBlob);
        setDownloadUrl(downloadUrl);
      })
      .catch((error) => handleError(error, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Typography variant="h4" fontWeight={700} textAlign="center">
        ✅ Data is purchased
      </Typography>
      {downloadUrl ? (
        <ExtraLargeLoadingButton
          href={downloadUrl}
          download="data.json"
          variant="contained"
          sx={{ mt: 4 }}
        >
          Download
        </ExtraLargeLoadingButton>
      ) : (
        <FullWidthSkeleton sx={{ mt: 2 }} />
      )}
    </>
  );
}
