const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Board contract with the account:", deployer.address);

  // VA 토큰 컨트랙트 주소
  const vaTokenAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

  // Board 컨트랙트 배포
  const Board = await hre.ethers.getContractFactory("Board");
  const board = await Board.deploy(vaTokenAddress);
  await board.deployed();

  const boardAddress = board.address;
  console.log("Board contract deployed to:", boardAddress);

  // VA 토큰 컨트랙트 인스턴스 가져오기
  const vaToken = await hre.ethers.getContractAt("VAToken", vaTokenAddress);

  // Board 컨트랙트에 VA 토큰 전송 (보상용)
  const rewardAmount = hre.ethers.utils.parseUnits("1000", 18); // 1000 VA 토큰
  await vaToken.transfer(boardAddress, rewardAmount);
  console.log("Transferred 1000 VA tokens to Board contract for rewards");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
