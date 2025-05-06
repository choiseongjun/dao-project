// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./VAToken.sol";

contract Board is Ownable {
    VAToken public vaToken;
    uint256 public constant REWARD_AMOUNT = 1 * 10**18; // 1 VA 토큰

    struct Post {
        address author;
        string content;
        uint256 timestamp;
    }

    Post[] public posts;
    mapping(address => uint256) public userPostCount;

    event PostCreated(address indexed author, uint256 postId, string content);
    event RewardPaid(address indexed user, uint256 amount);

    constructor(address _vaTokenAddress) Ownable(msg.sender) {
        vaToken = VAToken(_vaTokenAddress);
    }

    function createPost(string memory _content) public {
        // 게시글 생성
        posts.push(Post({
            author: msg.sender,
            content: _content,
            timestamp: block.timestamp
        }));

        // 보상 지급
        vaToken.transfer(msg.sender, REWARD_AMOUNT);
        
        // 사용자 게시글 수 증가
        userPostCount[msg.sender]++;

        emit PostCreated(msg.sender, posts.length - 1, _content);
        emit RewardPaid(msg.sender, REWARD_AMOUNT);
    }

    function getPost(uint256 _postId) public view returns (
        address author,
        string memory content,
        uint256 timestamp
    ) {
        require(_postId < posts.length, "Post does not exist");
        Post memory post = posts[_postId];
        return (post.author, post.content, post.timestamp);
    }

    function getPostCount() public view returns (uint256) {
        return posts.length;
    }

    function getUserPostCount(address _user) public view returns (uint256) {
        return userPostCount[_user];
    }
} 