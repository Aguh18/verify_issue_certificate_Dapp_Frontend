import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserProvider, Contract } from "ethers";
import axios from 'axios';



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
    const [account, setAccount] = useState(localStorage.getItem("walletAddress") || "");



    const navigate = useNavigate();

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contractInstance = new Contract(contractAddress, contractABI, signer);

                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }],
                });

                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                const walletAddress = accounts[0];
                const nonce = Math.random().toString(36).substring(2); // Nonce acak
                const message = `Sign to login to MyDapp at ${new Date().toISOString()} with nonce: ${nonce}`;

                const signature = await signer.signMessage(message);

                const response = await axios.post("http://localhost:5000/api/account/login", {
                    walletAddress,
                    message,
                    signature
                });

                if (response.status !== 200) {
                    throw new Error("Login failed");
                }

                // // Simpan alamat dan token
                localStorage.setItem("walletAddress", walletAddress);
                localStorage.setItem("token", response.data.data.token);

                navigate("/dashboard");
            } catch (error) {
                console.error(error);
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
            localStorage.removeItem("walletAddress");
            localStorage.removeItem("token");

            // Minta Metamask untuk mencabut izin akun (agar pop-up muncul saat connect lagi)


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
