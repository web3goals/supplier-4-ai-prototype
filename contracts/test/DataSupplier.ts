import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DataSupplier__factory } from "../typechain-types";

describe("DataSupplier", function () {
  async function setupFixture() {
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();

    const dataSupplierContract = await new DataSupplier__factory(
      deployer
    ).deploy();

    return {
      dataSupplierContract,
      deployer,
      userOne,
      userTwo,
      userThree,
    };
  }

  it("Users must successfully save supply and claim earnings", async function () {
    const { dataSupplierContract, userOne, userTwo, userThree } =
      await loadFixture(setupFixture);

    // Supply
    await expect(
      dataSupplierContract.connect(userOne).makeSupply(ethers.ZeroAddress, 1)
    ).to.be.not.reverted;
    await expect(
      dataSupplierContract.connect(userOne).makeSupply(ethers.ZeroAddress, 2)
    ).to.be.not.reverted;
    await expect(
      dataSupplierContract.connect(userTwo).makeSupply(ethers.ZeroAddress, 3)
    ).to.be.not.reverted;

    // Check supplies
    expect(await dataSupplierContract.getTotalSupplySize()).to.equal(3);

    // Purchase
    await expect(
      dataSupplierContract
        .connect(userThree)
        .purchaseData({ value: ethers.parseEther("0.03") })
    ).to.be.not.reverted;

    // Check earnings
    expect(await dataSupplierContract.getEarnings(userOne)).to.equal(
      ethers.parseEther("0.02")
    );
    expect(await dataSupplierContract.getEarnings(userTwo)).to.equal(
      ethers.parseEther("0.01")
    );

    // Claim
    await expect(
      dataSupplierContract.connect(userOne).claimEarnings()
    ).to.changeEtherBalances([userOne], [ethers.parseEther("0.02")]);
    await expect(
      dataSupplierContract.connect(userTwo).claimEarnings()
    ).to.changeEtherBalances([userTwo], [ethers.parseEther("0.01")]);

    // Check claims
    expect((await dataSupplierContract.getClaims(userOne)).length).to.equal(1);
    expect((await dataSupplierContract.getClaims(userTwo)).length).to.equal(1);
  });

  it("Users must successfully save supply and revoke it", async function () {
    const { dataSupplierContract, userOne } = await loadFixture(setupFixture);

    // Supply
    await expect(
      dataSupplierContract.connect(userOne).makeSupply(ethers.ZeroAddress, 1)
    ).to.be.not.reverted;
    expect(
      await dataSupplierContract.isSupplied(ethers.ZeroAddress, 1)
    ).to.equal(true);

    // Revoke
    await expect(
      dataSupplierContract.connect(userOne).revokeSupply(ethers.ZeroAddress, 1)
    ).to.be.not.reverted;
    expect(
      await dataSupplierContract.isSupplied(ethers.ZeroAddress, 1)
    ).to.equal(false);
  });
});
