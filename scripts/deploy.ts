const { ethers } = require("hardhat");

async function main() {
    const Raffle = await ethers.getContractFactory("Raffle"); // Raffle 컨트랙트 코드를 가져와서 compile
    const contract = await Raffle.deploy(ethers.parseEther('0.1')); // argument(본 실습에서는 target amount of money)와 함께 deploy
    console.log('Contract address is:', contract.target)
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
})