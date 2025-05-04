import { ethers } from "hardhat";

async function main() {
  const DAO_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const VOTING_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // DAO 컨트랙트 가져오기
  const DAOVoting = await ethers.getContractFactory("DAOVoting");
  const daoVoting = DAOVoting.attach(DAO_ADDRESS);

  // VotingToken 컨트랙트 가져오기
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = VotingToken.attach(VOTING_TOKEN_ADDRESS);

  // 현재 연결된 계정 가져오기
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();

  // 설정 확인
  const minVotingPower = await daoVoting.minVotingPower();
  const userBalance = await votingToken.balanceOf(userAddress);
  const daoBalance = await votingToken.balanceOf(DAO_ADDRESS);

  console.log("Configuration Check:");
  console.log("-------------------");
  console.log(
    `Minimum Voting Power: ${ethers.utils.formatEther(minVotingPower)} tokens`
  );
  console.log(
    `Your Token Balance: ${ethers.utils.formatEther(userBalance)} tokens`
  );
  console.log(
    `DAO Contract Balance: ${ethers.utils.formatEther(daoBalance)} tokens`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
