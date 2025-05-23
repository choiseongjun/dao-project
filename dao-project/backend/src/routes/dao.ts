import { Router } from "express";
import { ethers } from "ethers";
import DAOVotingABI from "../../../frontend/src/contracts/DAOVoting.json";

const router = Router();

// 컨트랙트 설정
const provider = new ethers.providers.JsonRpcProvider(
  process.env.RPC_URL || "http://localhost:8545"
);
const privateKey =
  process.env.PRIVATE_KEY ||
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(privateKey, provider);

const daoContract = new ethers.Contract(
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  DAOVotingABI.abi,
  wallet
);

// 제안 생성
router.post("/proposals", async (req, res) => {
  try {
    const { title } = req.body;

    // 제목이 비어있는지만 확인
    if (!title) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    try {
      // 가스 가격 확인
      const gasPrice = await provider.getGasPrice();
      if (gasPrice.gt(ethers.utils.parseUnits("100", "gwei"))) {
        return res.status(400).json({ error: "Gas price too high" });
      }

      // 트랜잭션 전송 (string 타입으로 전달)
      const tx = await daoContract.createProposal(title);
      const receipt = await tx.wait();

      res.json({
        success: true,
        transactionHash: receipt.transactionHash,
        proposalId: receipt.events[0].args.id,
      });
    } catch (error: any) {
      console.error("Detailed error:", error);
      if (error.message.includes("Title too long")) {
        return res.status(400).json({ error: "Title is too long" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating proposal:", error);
    res.status(500).json({ error: "Failed to create proposal" });
  }
});

// 투표
router.post("/vote", async (req, res) => {
  try {
    const { proposalId, support } = req.body;

    const tx = await daoContract.vote(proposalId, support);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error voting:", error);
    res.status(500).json({ error: "Failed to vote" });
  }
});

// 투표 취소
router.post("/cancel-vote", async (req, res) => {
  try {
    const { proposalId } = req.body;

    const tx = await daoContract.cancelVote(proposalId);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error) {
    console.error("Error canceling vote:", error);
    res.status(500).json({ error: "Failed to cancel vote" });
  }
});

// 보상 청구
router.post("/claim-rewards", async (req, res) => {
  try {
    const tx = await daoContract.claimRewards();
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
    });
  } catch (error: any) {
    console.error("Error claiming rewards:", error);
    if (error.message.includes("No rewards")) {
      return res.status(400).json({
        error:
          "You have no rewards to claim. Please vote first to earn rewards.",
      });
    }
    res
      .status(500)
      .json({ error: "Failed to claim rewards. Please try again later." });
  }
});

// 제안 목록 조회
router.get("/proposals", async (req, res) => {
  try {
    const proposalCount = await daoContract.proposalCount();
    const proposals = [];

    for (let i = 0; i < proposalCount; i++) {
      const proposal = await daoContract.getProposal(i);
      // bytes32를 문자열로 변환
      const title = ethers.utils.parseBytes32String(proposal.title);
      proposals.push({
        id: i,
        title: title,
        startTime: proposal.startTime,
        endTime: proposal.endTime,
        yesVotes: proposal.yesVotes,
        noVotes: proposal.noVotes,
        executed: proposal.executed,
      });
    }

    res.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

// 보상 청구 기록 조회
router.get("/reward-history", async (req, res) => {
  try {
    const rewardFilter = daoContract.filters.RewardsClaimed();
    const events = await daoContract.queryFilter(rewardFilter);

    const history = await Promise.all(
      events.map(async (event) => {
        const block = await event.getBlock();
        return {
          user: event.args?.user,
          amount: ethers.utils.formatEther(event.args?.amount),
          timestamp: block.timestamp,
        };
      })
    );

    res.json(history);
  } catch (error) {
    console.error("Error fetching reward history:", error);
    res.status(500).json({ error: "Failed to fetch reward history" });
  }
});

// 사용자의 투표 내역 조회
router.get("/vote-history", async (req, res) => {
  try {
    const voteFilter = daoContract.filters.Voted();
    const events = await daoContract.queryFilter(voteFilter);

    // 모든 투표 이벤트를 가져와서 처리
    const allVotes = await Promise.all(
      events.map(async (event) => {
        const proposal = await daoContract.getProposal(event.args?.id);
        return {
          proposalId: event.args?.id,
          title: ethers.utils.parseBytes32String(proposal.title),
          support: event.args?.support,
          timestamp: (await event.getBlock()).timestamp,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        };
      })
    );

    // 제안별로 그룹화
    const groupedVotes = allVotes.reduce<Record<number, typeof allVotes>>(
      (acc, vote) => {
        if (!acc[vote.proposalId]) {
          acc[vote.proposalId] = [];
        }
        acc[vote.proposalId].push(vote);
        return acc;
      },
      {}
    );

    // 각 그룹 내에서 블록 번호로 정렬하고 순서 추가
    const result = Object.entries(groupedVotes).map(([proposalId, votes]) => {
      const sortedVotes = votes.sort((a, b) => b.blockNumber - a.blockNumber);
      return {
        proposalId: Number(proposalId),
        title: votes[0].title,
        votes: sortedVotes.map((vote, index) => ({
          ...vote,
          voteSequence: index + 1, // 투표 순서 (1: 최신, 2: 이전, 3: 그 이전...)
        })),
      };
    });

    // 전체 결과를 최신 투표 기준으로 정렬
    const sortedResult = result.sort((a, b) => {
      const aLatestVote = a.votes[0];
      const bLatestVote = b.votes[0];
      return bLatestVote.blockNumber - aLatestVote.blockNumber;
    });

    res.json(sortedResult);
  } catch (error) {
    console.error("Error fetching vote history:", error);
    res.status(500).json({ error: "Failed to fetch vote history" });
  }
});

export const daoRoutes = router;
