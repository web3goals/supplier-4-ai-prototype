import Layout from "@/components/layout";
import { ExtraLargeLoadingButton } from "@/components/styled";
import { Box, Typography } from "@mui/material";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";

/**
 * Landing page.
 */
export default function Landing() {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();

  return (
    <Layout maxWidth="lg" hideToolbar sx={{ p: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 6,
        }}
      >
        <Box width={{ xs: "100%", md: "60%", lg: "50%" }}>
          <Image
            src="/images/partnership.png"
            alt="Partnership"
            width="100"
            height="100"
            sizes="100vw"
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </Box>
        <Typography variant="h1" textAlign="center" mt={2}>
          ⚡ <strong>Earn</strong> from your own data{" "}
        </Typography>
        <Typography variant="h4" textAlign="center" mt={1}>
          <strong>by&nbsp;supplying</strong> it to AI for learning
        </Typography>
        {address ? (
          <Link href={`/accounts/${address}`}>
            <ExtraLargeLoadingButton variant="contained" sx={{ mt: 4 }}>
              Let’s go!
            </ExtraLargeLoadingButton>
          </Link>
        ) : (
          <ExtraLargeLoadingButton
            variant="contained"
            sx={{ mt: 4 }}
            onClick={() => openConnectModal?.()}
          >
            Let’s go!
          </ExtraLargeLoadingButton>
        )}
      </Box>
    </Layout>
  );
}
