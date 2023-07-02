import { Dialog, Typography } from "@mui/material";
import { useState } from "react";
import { DialogCenterContent } from "../styled";

/**
 * Dialog to make a supply.
 *
 * TODO: Implement
 */
export default function SupplyMakeDialog(props: {
  onSuccess?: Function;
  isClose?: boolean;
  onClose?: Function;
}) {
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
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🚚 Supply token
        </Typography>
        <Typography textAlign="center" mt={1}>
          to AI for learning
        </Typography>
      </DialogCenterContent>
    </Dialog>
  );
}
