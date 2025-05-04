// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DAOVoting is Ownable {
    IERC20 public immutable votingToken;
    uint256 public immutable minVotingPower;
    
    // 가스 최적화: 구조체 단순화 및 패킹
    struct Proposal {
        bytes32 title;
        uint32 startTime;
        uint32 endTime;
        uint32 yesVotes;
        uint32 noVotes;
        bool executed;
    }

    // 가스 최적화: 이벤트 최소화 및 indexed 필드 최적화
    event ProposalCreated(uint256 indexed id, bytes32 title);
    event Voted(uint256 indexed id, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed id);
    event RewardsClaimed(address indexed user, uint256 amount);

    // 가스 최적화: 매핑 통합 및 패킹
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteSupport; // 투표 방향 저장
    mapping(address => uint256) public rewards;

    uint256 public proposalCount;
    uint256 private constant REWARD = 0.1 ether;
    uint256 private constant VOTING_PERIOD = 7 days;

    constructor(address _votingToken, uint256 _minVotingPower) Ownable(msg.sender) {
        votingToken = IERC20(_votingToken);
        minVotingPower = _minVotingPower;
    }

    // 가스 최적화: calldata 사용 및 불필요한 검사 제거
    function createProposal(string calldata _title) external {
        require(bytes(_title).length <= 32, "Title too long");
        
        uint256 id = proposalCount++;
        Proposal storage p = proposals[id];
        
        p.title = bytes32(bytes(_title));
        p.startTime = uint32(block.timestamp);
        p.endTime = uint32(block.timestamp + VOTING_PERIOD);
        
        emit ProposalCreated(id, p.title);
    }

    // 가스 최적화: 조건문 최적화 및 불필요한 검사 제거
    function vote(uint256 _id, bool _support) external {
        Proposal storage p = proposals[_id];
        require(!p.executed, "Proposal executed");
        require(block.timestamp >= p.startTime && block.timestamp <= p.endTime, "Not active");
        require(votingToken.balanceOf(msg.sender) >= minVotingPower, "Insufficient power");

        if (hasVoted[_id][msg.sender]) {
            // 이전 투표 취소
            if (voteSupport[_id][msg.sender]) {
                p.yesVotes--;
            } else {
                p.noVotes--;
            }
            rewards[msg.sender] -= REWARD;
        }

        // 새 투표
        hasVoted[_id][msg.sender] = true;
        voteSupport[_id][msg.sender] = _support;
        if (_support) p.yesVotes++; else p.noVotes++;
        
        rewards[msg.sender] += REWARD;
        emit Voted(_id, msg.sender, _support);
    }

    // 투표 취소 함수 추가
    function cancelVote(uint256 _id) external {
        Proposal storage p = proposals[_id];
        require(hasVoted[_id][msg.sender], "No vote to cancel");
        require(!p.executed, "Proposal executed");
        require(block.timestamp <= p.endTime, "Voting ended");

        hasVoted[_id][msg.sender] = false;
        if (voteSupport[_id][msg.sender]) {
            p.yesVotes--;
        } else {
            p.noVotes--;
        }
        rewards[msg.sender] -= REWARD;
        emit Voted(_id, msg.sender, false); // 취소 이벤트 발생
    }

    // 가스 최적화: 불필요한 검사 제거
    function claimRewards() external {
        uint256 amount = rewards[msg.sender];
        require(amount > 0, "No rewards");
        
        rewards[msg.sender] = 0;
        require(votingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit RewardsClaimed(msg.sender, amount);
    }

    // 가스 최적화: 조건문 최적화
    function executeProposal(uint256 _id) external {
        Proposal storage p = proposals[_id];
        require(!p.executed && block.timestamp > p.endTime, "Cannot execute");
        
        p.executed = true;
        emit ProposalExecuted(_id);
    }

    // 가스 최적화: view 함수 최적화
    function getProposal(uint256 _id) external view returns (
        bytes32 title,
        uint32 startTime,
        uint32 endTime,
        uint32 yesVotes,
        uint32 noVotes,
        bool executed
    ) {
        Proposal storage p = proposals[_id];
        return (p.title, p.startTime, p.endTime, p.yesVotes, p.noVotes, p.executed);
    }
} 