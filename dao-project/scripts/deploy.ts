import { ethers } from "hardhat";

async function main() {
  // VotingToken 배포
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = await VotingToken.deploy();
  await votingToken.deployed();
  console.log("VotingToken deployed to:", votingToken.address);

  // DAOVoting 배포 (minVotingPower를 10 토큰으로 설정)
  const minVotingPower = "10000000000000000000"; // 10 토큰 (18 decimals)
  const DAOVoting = await ethers.getContractFactory("DAOVoting");
  const daoVoting = await DAOVoting.deploy(votingToken.address, minVotingPower);
  await daoVoting.deployed();
  console.log("DAOVoting deployed to:", daoVoting.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
