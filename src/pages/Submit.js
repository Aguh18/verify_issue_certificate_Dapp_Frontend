import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, isAddress } from 'ethers';
import contractABI from '../ABI.json'; 

const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const networkConfig = {
    chainId: '0x7a69',
    chainName: 'Hardhat Local',
    rpcUrls: ['http://127.0.0.1:8545/'],
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    blockExplorerUrls: [],
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
                const web3Provider = new BrowserProvider(window.ethereum, {
                    chainId: 31337,
                    name: 'hardhat',
                    ensAddress: null, // Nonaktifkan ENS
                });
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
    console.log('Data from state:', data);

    const fileCid =
        data.fileCid ||
        'https://bafybeibgunsp4yfmxonp4vji3ntzpyis32wh33hucb6tsdg4xbogdniyyu.ipfs.w3s.link/certificate_Asep_Teguh_hidayat_2025-05-04T03-57-46-396Z.pdf';

    const certificateData = {
        id: data.id || 'CERT123',
        certificateTitle: data.certificateTitle || 'Certificate of Achievement',
        expiryDate: data.expiryDate || '',
        issueDate: data.issueDate || '2025-05-16',
        cid: data.fileCid || 'QmT5NvUtoM5nXy6v7e4f3g3g3g3g3g3g3g3g3g3g3g3g3g', // Ganti dengan CID valid
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

            if (!isAddress(certificateData.targetAddress) || certificateData.targetAddress.includes('.eth')) {
                throw new Error('Invalid target address: ENS not supported on Hardhat Network');
            }



            console.log('Issuing certificate with data:', certificateData);

            const tx = await contract.issueCertificate(
                certificateData.id,
                certificateData.certificateTitle,
                certificateData.expiryDate,
                certificateData.issueDate,
                certificateData.cid, // Pindah ke posisi kelima sesuai ABI
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
            if (err.code === 'UNSUPPORTED_OPERATION' && err.operation === 'getEnsAddress') {
                setError('ENS not supported on Hardhat Network. Please use a valid Ethereum address.');
            } else {
                setError(`Failed to issue certificate: ${err.message}`);
            }
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