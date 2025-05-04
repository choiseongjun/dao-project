import { ethers } from "hardhat";

async function main() {
  const DAO_ADDRESS = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

  // DAO 컨트랙트 가져오기
  const DAOVoting = await ethers.getContractFactory("DAOVoting");
  const daoVoting = DAOVoting.attach(DAO_ADDRESS);

  // 현재 연결된 계정 가져오기
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();

  // 보상 이벤트 필터
  const rewardFilter = daoVoting.filters.RewardsClaimed(userAddress);
  const rewardEvents = await daoVoting.queryFilter(rewardFilter);

  console.log("\nReward Claim History:");
  console.log("-------------------");

  if (rewardEvents.length === 0) {
    console.log("No rewards claimed yet");
  } else {
    rewardEvents.forEach((event, index) => {
      const amount = ethers.utils.formatEther(event.args?.amount);
      console.log(`Claim #${index + 1}: ${amount} tokens`);
    });
  }

  // 현재 보상 잔액 확인
  const currentRewards = await daoVoting.userRewards(userAddress);
  console.log(
    "\nCurrent Available Rewards:",
    ethers.utils.formatEther(currentRewards),
    "tokens"
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
