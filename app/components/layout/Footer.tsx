import { Box, SxProps, Typography } from "@mui/material";
import { Container } from "@mui/system";

/**
 * Component with a footer.
 */
export default function Footer(props: { sx?: SxProps }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#000000",
        ...props.sx,
      }}
    >
      <Copyright />
    </Box>
  );
}

function Copyright(props: { sx?: SxProps }) {
  return (
    <Container maxWidth="md" sx={{ my: 6, ...props.sx }}>
      <Typography
        color="primary.contrastText"
        fontWeight={700}
        textAlign="center"
      >
        Supplier 4 AI © 2023
      </Typography>
      <Typography
        color="primary.contrastText"
        variant="body2"
        textAlign="center"
        mt={0.5}
      >
        ⚡ Earn from your own data by supplying it to AI for learning
      </Typography>
    </Container>
  );
}
