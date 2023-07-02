import Layout from "@/components/layout";
import useKwil from "@/hooks/useKwil";
import { Typography } from "@mui/material";
import { useEffect } from "react";

/**
 * Page with supplies.
 */
export default function Supplies() {
  const { selectSupplies } = useKwil();

  useEffect(() => {
    selectSupplies().then((result) => console.log(result));
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
      <Typography textAlign="center" mt={1}>
        ...
      </Typography>
    </Layout>
  );
}
