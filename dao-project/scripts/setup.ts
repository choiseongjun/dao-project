import { ethers } from "hardhat";

async function main() {
  const VOTING_TOKEN_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const DAO_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

  // VotingToken 컨트랙트 가져오기
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = VotingToken.attach(VOTING_TOKEN_ADDRESS);

  // DAO 컨트랙트에 토큰 전송 (1000 토큰)
  const amount = ethers.utils.parseEther("1000");
  const tx = await votingToken.transfer(DAO_ADDRESS, amount);
  await tx.wait();

  console.log(`Transferred 1000 tokens to DAO contract at ${DAO_ADDRESS}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
