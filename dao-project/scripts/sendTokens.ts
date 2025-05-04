import { ethers } from "hardhat";

async function main() {
  const VOTING_TOKEN_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

  // VotingToken 컨트랙트 가져오기
  const VotingToken = await ethers.getContractFactory("VotingToken");
  const votingToken = VotingToken.attach(VOTING_TOKEN_ADDRESS);

  // 현재 연결된 계정 가져오기
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();

  // 사용자에게 토큰 전송 (20 토큰)
  const amount = ethers.utils.parseEther("20");
  const tx = await votingToken.transfer(userAddress, amount);
  await tx.wait();

  console.log(`Transferred 20 tokens to ${userAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
