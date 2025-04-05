import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider, Contract } from "ethers";



const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newValue",
                "type": "uint256"
            }
        ],
        "name": "ValueChanged",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "getValue",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setValue",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];




const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

function Login() {
    const [account, setAccount] = useState(sessionStorage.getItem("walletAddress") || "");



    const navigate = useNavigate();

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contractInstance = new Contract(contractAddress, contractABI, signer);
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                sessionStorage.setItem("walletAddress", accounts[0]);
                navigate("/dashboard");
            } catch (error) {
                console.error("Error connecting to MetaMask", error);
            }
        } else {
            alert("MetaMask not detected. Please install MetaMask.");
        }
    };

    const disconnectWallet = async () => {
        try {
            // Hapus dari state
            setAccount(null);

            // Hapus sessionStorage
            sessionStorage.removeItem("walletAddress");

            // Minta Metamask untuk mencabut izin akun (agar pop-up muncul saat connect lagi)
            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{ eth_accounts: {} }],
            });

            alert("Wallet disconnected! Connect again to use the app.");
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
        }
    };







    return (

        <div className=" flex h-screen w-full  items-center justify-center" >
            <div className=" text-center">
                {account ? (
                    <div>

                        <button onClick={disconnectWallet}>Disconnect Wallet</button>
                    </div>
                ) : (
                    <button onClick={connectWallet}>Connect Wallet</button>
                )}
                <p><strong>Connected Account:</strong> {account}</p>

            </div>
        </div>
    );
}

export default Login;
