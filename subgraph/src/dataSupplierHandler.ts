import { Claimed } from "../generated/DataSupplier/DataSupplier";
import { Claim } from "../generated/schema";

export function handleClaimed(event: Claimed): void {
  let claim = new Claim(event.transaction.hash.toHexString());
  claim.supplier = event.transaction.from.toHexString();
  claim.timestamp = event.block.timestamp;
  claim.value = event.params.value;
  claim.save();
}
