const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    // 이더리움 프로바이더와 지갑 설정
    const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia.g.allthatnode.com/full/evm/daa086d0305845efb24e1f0285e3955d');
    const privateKey = 'd1288dd853a60f029a9042c08da497846c08c5392f6436dffb6a82d1ba9347ad';
    const wallet = new ethers.Wallet(privateKey, provider);

    // Solidity 소스 코드 읽기
    const sourceCode = fs.readFileSync(path.join(__dirname, "UpbitRandomGenerator.sol"), "utf8");

    // Solidity 컴파일 설정
    const solc = require("solc");
    const input = {
        language: 'Solidity',
        sources: {
            'UpbitRandomGenerator.sol': {
                content: sourceCode,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    const contractOutput = output.contracts['UpbitRandomGenerator.sol']['UpbitRandomGenerator'];

    const abi = contractOutput.abi;
    const bytecode = contractOutput.evm.bytecode.object;

    // ContractFactory 생성 및 배포
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log("Deploying contract...");
    const contract = await contractFactory.deploy();

    console.log("Waiting for transaction to be mined...");
    const receipt = await contract.waitForDeployment();
    const deployedAddress = await receipt.getAddress();
    console.log(`Contract deployed at address: ${deployedAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
