import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, isAddress } from 'ethers';

// ABI dari smart contract CertificateRegistry
const contractABI = [
    'function issueCertificate(string _id, string _certificateTitle, string _expiryDate, string _issueDate, string _issuerName, string _recipientName, address _targetAddress) external returns (string)',
    'event CertificateIssued(string indexed id, address indexed issuerAddress, address indexed targetAddress, string recipientName, string issueDate)',
];

// Alamat smart contract dan network configuration
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Ganti dengan alamat kontrak yang sudah di-deploy
const networkConfig = {
    chainId: '0x7a69', // Hardhat local (31337). Ganti dengan chain ID testnet/mainnet (e.g., Sepolia: 0xaa36a7)
    chainName: 'Hardhat Local',
    rpcUrls: ['http://127.0.0.1:8545/'], // RPC untuk Hardhat. Ganti untuk testnet/mainnet
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    blockExplorerUrls: [], // Kosong untuk Hardhat local
};

const Submit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [transactionStatus, setTransactionStatus] = useState('');
    const [error, setError] = useState('');

    const state = location.state;

    // Inisialisasi ethers.js dengan MetaMask
    useEffect(() => {
        const initEthers = async () => {
            if (!window.ethereum) {
                setError('MetaMask not detected. Please install MetaMask.');
                return;
            }

            try {
                const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                const targetChainId = networkConfig.chainId;

                if (currentChainId !== targetChainId) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_switchEthereumChain',
                            params: [{ chainId: targetChainId }],
                        });
                    } catch (switchError) {
                        if (switchError.code === 4902) {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: networkConfig.chainId,
                                        chainName: networkConfig.chainName,
                                        rpcUrls: networkConfig.rpcUrls,
                                        nativeCurrency: networkConfig.nativeCurrency,
                                        blockExplorerUrls: networkConfig.blockExplorerUrls,
                                    },
                                ],
                            });
                        } else {
                            throw switchError;
                        }
                    }
                }

                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3Provider = new BrowserProvider(window.ethereum);
                const signer = await web3Provider.getSigner();
                const contractInstance = new Contract(contractAddress, contractABI, signer);

                setProvider(web3Provider);
                setSigner(signer);
                setContract(contractInstance);
            } catch (err) {
                setError(`Failed to connect to MetaMask: ${err.message}`);
            }
        };

        initEthers();
    }, []);

    // Handle redirect jika state atau state.data tidak ada
    useEffect(() => {
        if (!state || !state.data) {
            navigate('/issue-certificate', { replace: true });
        }
    }, [state, navigate]);

    if (!state || !state.data) {
        return null;
    }

    const data = state.data;

    const fileCid =
        data.fileCid ||
        'https://bafybeibgunsp4yfmxonp4vji3ntzpyis32wh33hucb6tsdg4xbogdniyyu.ipfs.w3s.link/certificate_Asep_Teguh_hidayat_2025-05-04T03-57-46-396Z.pdf';

    const certificateData = {
        id: data.id || 'CERT123',
        certificateTitle: data.certificateTitle || 'Certificate of Achievement',
        expiryDate: data.expiryDate || '',
        issueDate: data.issueDate || '2025-05-16',
        issuerName: data.issuerName || 'Universitas XYZ',
        recipientName: data.recipientName || 'Recipient Name',
        targetAddress: data.targetAddress || '0xFde6f7aC02514dDa4B3bB7C135EB0A39C90243A4',
    };

    const handleIssueCertificate = async () => {
        if (!contract || !signer) {
            setError('Contract or signer not initialized. Ensure MetaMask is connected.');
            return;
        }

        setTransactionStatus('Processing...');
        setError('');

        try {
            // Validasi input
            if (!certificateData.id || !certificateData.certificateTitle || !certificateData.recipientName) {
                throw new Error('Required fields (ID, title, recipient name) cannot be empty');
            }

            if (!isAddress(certificateData.targetAddress)) {
                throw new Error('Invalid target address');
            }

            const tx = await contract.issueCertificate(
                certificateData.id,
                certificateData.certificateTitle,
                certificateData.expiryDate,
                certificateData.issueDate,
                certificateData.issuerName,
                certificateData.recipientName,
                certificateData.targetAddress
            );

            const receipt = await tx.wait();
            const log = receipt.logs.find((log) => {
                try {
                    return contract.interface.parseLog(log).name === 'CertificateIssued';
                } catch {
                    return false;
                }
            });

            if (!log) {
                throw new Error('CertificateIssued event not found in transaction receipt');
            }

            const decoded = contract.interface.parseLog(log);
            const issuedId = decoded.args.id;

            setTransactionStatus(`Certificate issued successfully with ID: ${issuedId}`);
        } catch (err) {
            setError(`Failed to issue certificate: ${err.message}`);
            setTransactionStatus('');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Submit Certificate</h1>
            <h2>Certificate Data</h2>
            <pre>{JSON.stringify(certificateData, null, 2)}</pre>
            <button
                onClick={handleIssueCertificate}
                disabled={!contract || transactionStatus === 'Processing...'}
                style={{
                    margin: '10px 0',
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: !contract || transactionStatus === 'Processing...' ? 'not-allowed' : 'pointer',
                }}
            >
                Issue Certificate to Blockchain
            </button>
            {transactionStatus && <p style={{ color: 'green' }}>{transactionStatus}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <h2>Certificate PDF</h2>
            <iframe
                src={fileCid}
                title="Certificate PDF"
                style={{ width: '100%', height: '80vh', border: 'none' }}
            />
        </div>
    );
};

export default Submit;