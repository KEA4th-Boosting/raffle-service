pragma solidity ^0.8.24;

contract Raffle { 
    uint256 public totalIndex;
    address public owner;
    mapping(address => uint256) public entries;
    address[] public participants;

    uint256 public raffleDate;
    uint256 public winnerCnt;
    uint256 public raffleWaitingCnt;
    address[] public winners;
    address[] public waitingList;
    
    uint256 public constant KST_OFFSET = 9 * 60 * 60;

    constructor(uint256 _raffleDate, uint256 _winnerCnt, uint256 _raffleWaitingCnt) {
        raffleDate = _raffleDate + KST_OFFSET;
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

    function selectWinners() external {
        require(msg.sender == owner, "Only the admin can create the raffle.");
        require(block.timestamp >= raffleDate, "Raffle has not ended yet.");
        require(participants.length > 0, "No entries in the raffle.");

        uint256 participantsCount = participants.length;
        uint256[] memory randomIndexes = new uint256[](participantsCount);
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));

        // Generate unique random indexes
        for (uint256 i = 0; i < participantsCount; i++) {
            randomIndexes[i] = i;
        }

        // Fisher-Yates shuffle
        for (uint256 i = participantsCount - 1; i > 0; i--) {
            uint256 j = seed % (i + 1);
            seed = uint256(keccak256(abi.encodePacked(seed)));
            (randomIndexes[i], randomIndexes[j]) = (randomIndexes[j], randomIndexes[i]);
        }

        // Select winners
        for (uint256 i = 0; i < winnerCnt && i < participantsCount; i++) {
            winners.push(participants[randomIndexes[i]]);
        }

        // Select waiting list
        for (uint256 i = winnerCnt; i < winnerCnt + raffleWaitingCnt && i < participantsCount; i++) {
            waitingList.push(participants[randomIndexes[i]]);
        }
    }

    function getWinners() external view returns (address[] memory) {
        return winners;
    }

    function getWaitingList() external view returns (address[] memory) {
        return waitingList;
    }

    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    function getTotalIndex() external view returns (uint256) {
        return totalIndex;
    }

    function getRaffleDate() external view returns (uint256) {
        return raffleDate;
    }

    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }
}