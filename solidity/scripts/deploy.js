import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const paidPaintFeeWei = ethers.parseEther("0.0002");
  const feeRecipient = "0x0000000000000000000000000000000000000001";

  const bitPlace = await ethers.deployContract("BitPlace", [
    paidPaintFeeWei,
    feeRecipient,
  ]);

  await bitPlace.waitForDeployment();

  const address = await bitPlace.getAddress();

  console.log("BitPlace deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
