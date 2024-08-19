pragma solidity ^0.8.24;

import "./UpbitRandomGenerator.sol";

contract Raffle { 
    uint256 public totalIndex;
    uint256 public totalIndexCopy;
    uint256 public winnerIndex;
    uint256 public waitingIndex;
    uint256 public minIndex;
    uint256 public maxIndex;
    address public owner;
    string[] public participants;
    string[] public participantsList;

    struct Entry {
        uint256 raffleIndex;
        uint256 entryTime;
    }

    mapping(string => Entry) public entries;
    mapping(string => Entry) public entriesList;

    string public raffleName;
    uint256 public raffleDate;
    uint256 public winnerCnt;
    uint256 public raffleWaitingCnt;
    string[] public winners;
    string[] public waitingList;

    UpbitRandomGenerator public randomGenerator;

    constructor(
        string memory _raffleName, 
        uint256 _raffleDate, 
        uint256 _winnerCnt, 
        uint256 _raffleWaitingCnt,
        address _randomGeneratorAddress
        ) {
        raffleName = _raffleName;
        raffleDate = _raffleDate;
        winnerCnt = _winnerCnt;
        raffleWaitingCnt = _raffleWaitingCnt;
        owner = msg.sender;
        minIndex = type(uint256).max;
        maxIndex = 0;
        randomGenerator = UpbitRandomGenerator(_randomGeneratorAddress);
    }

    function enterRaffle(string memory entryId, uint256 raffleIndex, uint256 entryTime) external {
        require(block.timestamp < raffleDate, "This raffle is over.");
        if (entries[entryId].raffleIndex == 0) {
            participants.push(entryId);
            participantsList.push(entryId);
        }
        entries[entryId] = Entry(raffleIndex, entryTime);
        entriesList[entryId] = Entry(raffleIndex, entryTime);
        totalIndex += raffleIndex;

        if (raffleIndex < minIndex) {
            minIndex = raffleIndex;
        }
        if (raffleIndex > maxIndex) {
            maxIndex = raffleIndex;
        }
    }

    function selectWinners() external {
        require(msg.sender == owner, "Only the admin can select winners.");
        require(block.timestamp >= raffleDate, "Raffle has not ended yet.");
        require(participants.length > 0, "No entries in the raffle.");

        uint256 participantsCount = participants.length;
        uint256 selectedCount = 0;
        totalIndexCopy = totalIndex;

        uint256 blockNumber = block.number - 1;
        string memory salt = string(abi.encodePacked(raffleName, block.timestamp));

        while (selectedCount < winnerCnt && participantsCount > 0) {
            randomGenerator.recordRandomNumbers(totalIndexCopy, 1, blockNumber, salt);
            uint256 randomNumber = randomGenerator.getRandomNumbers(totalIndexCopy, 1, blockNumber, salt)[0];

            uint256 sum = 0;
            string memory selectedParticipant;
            
            for (uint256 i = 0; i < participants.length; i++) {
                sum += entries[participants[i]].raffleIndex;
                if (randomNumber < sum) {
                    selectedParticipant = participants[i];
                    break;
                }
            }

            winners.push(selectedParticipant);
            winnerIndex += entries[selectedParticipant].raffleIndex;
            totalIndexCopy -= entries[selectedParticipant].raffleIndex;
            removeParticipant(selectedParticipant);
            participantsCount--;
            selectedCount++;
        }

        selectedCount = 0;
        while (selectedCount < raffleWaitingCnt && participantsCount > 0) {
            randomGenerator.recordRandomNumbers(totalIndexCopy, 1, blockNumber, salt);
            uint256 randomNumber = randomGenerator.getRandomNumbers(totalIndexCopy, 1, blockNumber, salt)[0];

            uint256 sum = 0;
            string memory selectedParticipant;
            
            for (uint256 i = 0; i < participants.length; i++) {
                sum += entries[participants[i]].raffleIndex;
                if (randomNumber < sum) {
                selectedParticipant = participants[i];
                break;
                }
            }

            waitingList.push(selectedParticipant);
            waitingIndex += entries[selectedParticipant].raffleIndex;
            totalIndexCopy -= entries[selectedParticipant].raffleIndex;
            removeParticipant(selectedParticipant);
            participantsCount--;
            selectedCount++;
        }
    }

    function removeParticipant(string memory participant) internal {
        for (uint256 i = 0; i < participants.length; i++) {
            if (keccak256(abi.encodePacked(participants[i])) == keccak256(abi.encodePacked(participant))) {
                participants[i] = participants[participants.length - 1];
                participants.pop();
                break;
            }
        }
    }

    function getWinners() external view returns (string[] memory) {
        return winners;
    }

    function getWaitingList() external view returns (string[] memory) {
        return waitingList;
    }

    function getTotalIndex() external view returns (uint256) {
        return totalIndex;
    }

    function getWinnerIndex() external view returns (uint256) {
        return winnerIndex;
    }

    function getWaitingIndex() external view returns (uint256) {
        return waitingIndex;
    }

    function getMinIndex() external view returns (uint256) {
        return minIndex;
    }

    function getMaxIndex() external view returns (uint256) {
        return maxIndex;
    }

    function getRaffleDate() external view returns (uint256) {
        return raffleDate;
    }

    function getEntries() external view returns (string[] memory, uint256[] memory, uint256[] memory) {
        uint256 len = participantsList.length;
        uint256[] memory indexes = new uint256[](len);
        uint256[] memory times = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            indexes[i] = entriesList[participantsList[i]].raffleIndex;
            times[i] = entriesList[participantsList[i]].entryTime;
        }
        return (participantsList, indexes, times);
    }

    function getWinnerCnt() external view returns (uint256) {
        return winnerCnt;
    }

    function getRaffleWaitingCnt() external view returns (uint256) {
        return raffleWaitingCnt;
    }

    function getCurrentBlockTimestamp() external view returns (uint256) {
        return block.timestamp;
    }
}