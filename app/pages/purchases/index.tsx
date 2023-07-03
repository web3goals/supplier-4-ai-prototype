import Layout from "@/components/layout";
import { CardBox, LargeLoadingButton } from "@/components/styled";
import SupplyPurchaseDialog from "@/components/supply/SupplyPurchaseDialog";
import { DialogContext } from "@/context/dialog";
import useError from "@/hooks/useError";
import useKwil from "@/hooks/useKwil";
import { Chip, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";

/**
 * Page with supplies.
 */
export default function Supplies() {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { handleError } = useError();
  const { selectCountSupplies } = useKwil();
  const [items, setItems] = useState<number | undefined>();

  /**
   * Load count
   */
  useEffect(() => {
    selectCountSupplies()
      .then(({ data }: any) => setItems(data?.[0]?.["COUNT(*)"]))
      .catch((error) => handleError(error, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout maxWidth="sm">
      <Typography variant="h4" textAlign="center" fontWeight={700}>
        🚀 Data
      </Typography>
      <Typography textAlign="center" mt={1}>
        that can be used by AI to learning
      </Typography>
      <CardBox
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
        mt={2}
      >
        <Typography variant="h4" fontWeight={700}>
          🖼️ Images
        </Typography>
        <Typography mt={1}>
          The data contains JSON with links to images and their descriptions
        </Typography>
        {items && <Chip label={`${items} items`} sx={{ mt: 2 }} />}
        <LargeLoadingButton
          variant="outlined"
          onClick={() =>
            showDialog?.(
              <SupplyPurchaseDialog
                onSuccess={() => {}}
                onClose={closeDialog}
              />
            )
          }
          sx={{ mt: 2 }}
        >
          Purchase
        </LargeLoadingButton>
      </CardBox>
    </Layout>
  );
}
