pragma solidity ^0.8.24;

contract Raffle { 
    uint256 public totalIndex;
    address public owner;
    string[] public participants;
    string[] public participantsList;
    mapping(string => uint256) public entries;
    mapping(string => uint256) public entriesList;

    string public raffleName;
    uint256 public raffleDate;
    uint256 public winnerCnt;
    uint256 public raffleWaitingCnt;
    string[] public winners;
    string[] public waitingList;

    constructor(string memory _raffleName, uint256 _raffleDate, uint256 _winnerCnt, uint256 _raffleWaitingCnt) {
        raffleName = _raffleName;
        raffleDate = _raffleDate;
        winnerCnt = _winnerCnt;
        raffleWaitingCnt = _raffleWaitingCnt;
        owner = msg.sender;
    }

    function enterRaffle(string memory entryId, uint256 raffleIndex) external {
        require(block.timestamp < raffleDate, "This raffle is over.");
        if (entries[entryId] == 0) {
            participants.push(entryId);
            participantsList.push(entryId);
        }
        entries[entryId] = raffleIndex;
        entriesList[entryId] = raffleIndex;
        totalIndex += raffleIndex;
    }

    function selectWinners() external {
        require(msg.sender == owner, "Only the admin can select winners.");
        require(block.timestamp >= raffleDate, "Raffle has not ended yet.");
        require(participants.length > 0, "No entries in the raffle.");

        uint256 participantsCount = participants.length;
        uint256 selectedCount = 0;

        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)));

        while (selectedCount < winnerCnt && participantsCount > 0) {
            uint256 randomIndex = seed % totalIndex;
            uint256 sum = 0;
            string memory selectedParticipant;
            
            for (uint256 i = 0; i < participants.length; i++) {
                sum += entries[participants[i]];
                if (randomIndex < sum) {
                    selectedParticipant = participants[i];
                    break;
                }
            }

            winners.push(selectedParticipant);
            totalIndex -= entries[selectedParticipant];
            removeParticipant(selectedParticipant);
            participantsCount--;
            selectedCount++;
            
            seed = uint256(keccak256(abi.encodePacked(seed)));
        }

        selectedCount = 0;
        while (selectedCount < raffleWaitingCnt && participantsCount > 0) {
            uint256 randomIndex = seed % totalIndex;
            uint256 sum = 0;
            string memory selectedParticipant;
            
            for (uint256 i = 0; i < participants.length; i++) {
                sum += entries[participants[i]];
                if (randomIndex < sum) {
                    selectedParticipant = participants[i];
                    break;
                }
            }

            waitingList.push(selectedParticipant);
            totalIndex -= entries[selectedParticipant];
            removeParticipant(selectedParticipant);
            participantsCount--;
            selectedCount++;
            
            seed = uint256(keccak256(abi.encodePacked(seed)));
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

    function getRaffleDate() external view returns (uint256) {
        return raffleDate;
    }

    function getCurrentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    function getEntries() external view returns (string[] memory, uint256[] memory) {
        uint256 len = participantsList.length;
        uint256[] memory indexes = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            indexes[i] = entriesList[participantsList[i]];
        }
        return (participantsList, indexes);
    }

    function getWinnerCnt() external view returns (uint256) {
        return winnerCnt;
    }

    function getRaffleWaitingCnt() external view returns (uint256) {
        return raffleWaitingCnt;
    }
}