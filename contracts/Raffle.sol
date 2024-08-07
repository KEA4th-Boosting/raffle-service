pragma solidity ^0.8.24;

contract Raffle {
    uint256 public totalIndex;
    address public owner;
    mapping(address => uint256) public entries;
    address[] public participants;

    unit256 public raffleDate;
    uint256 public winnerCnt;
    uint256 public raffleWaitingCnt;
    address public winner;

    constructor(uint256 _raffleDate, uint256 _winnerCnt, uint256 _raffleWaitingCnt) {
        raffleDate = _raffleDate;
        winnerCnt = _winnerCnt;
        raffleWaitingCnt = _raffleWaitingCnt;
        owner = msg.sender;
    }

    receive() external payable{
        require(block.timestamp < raffleDate, "This raffle is over.");
        if (entries[msg.sender] == 0) {
            participants.push(msg.sender);
        }
        entries[msg.sender] = msg.value;
        totalIndex += msg.value;
    }

    function setRaffleDate(uint256 _raffleDate) external onlyOwner {
        raffleDate = _raffleDate;
    }

    function selectWinner() external onlyOwner returns (address) {
        require(block.timestamp >= raffleDate, "Raffle has not ended yet.");
        require(totalIndex > 0, "No entries in the raffle.");

        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % totalIndex;
        uint256 cumulativeSum = 0;

        for (uint256 i = 0; i < participants.length; i++) {
            cumulativeSum += entries[participants[i]];
            if (randomIndex < cumulativeSum) {
                winner = participants[i];
                return winner;
            }
        }
        return address(0);
    }

    function getWinner() external view returns (address) {
        return winner;
    }
}