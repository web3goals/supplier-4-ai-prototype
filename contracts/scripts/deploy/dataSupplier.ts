import { ethers } from "hardhat";
import { DataSupplier__factory } from "../../typechain-types";

async function main() {
  console.log("👟 Start to deploy data supplier contract");

  // Define contract deployer
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  // Deploy contract
  const contract = await new DataSupplier__factory(deployer).deploy({
    gasLimit: 5000000,
    gasPrice: 1,
  });
  await contract.waitForDeployment();
  console.log(`✅ Contract deployed to ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
