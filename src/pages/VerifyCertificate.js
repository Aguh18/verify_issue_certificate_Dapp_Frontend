
import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';

const contractABI = [
  'function verifyCertificate(string _id) external view returns (bool)',
  'function getCertificate(string _id) external view returns (tuple(string id, string certificateTitle, string expiryDate, string issueDate, address issuerAddress, string issuerName, string recipientName, address targetAddress, bool isValid))',
];

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const networkConfig = {
  chainId: '0x7a69',
  chainName: 'Hardhat Local',
  rpcUrls: ['http://127.0.0.1:8545/'],
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: [],
};

const VerifyCertificate = () => {
  const [contract, setContract] = useState(null);
  const [certificateId, setCertificateId] = useState('');
  const [certificateData, setCertificateData] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initEthers = async () => {
      if (!window.ethereum) {
        setError('MetaMask not detected.');
        return;
      }

      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== networkConfig.chainId) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: networkConfig.chainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkConfig],
              });
            } else {
              throw switchError;
            }
          }
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setContract(new Contract(contractAddress, contractABI, signer));
      } catch (err) {
        setError('Failed to connect to MetaMask.');
      }
    };

    initEthers();
  }, []);

  const handleVerify = async () => {
    if (!contract || !certificateId.trim()) {
      setError('Please enter a valid Certificate ID.');
      return;
    }

    setLoading(true);
    setError('');
    setCertificateData(null);
    setIsValid(null);

    try {
      const isValidResult = await contract.verifyCertificate(certificateId);
      setIsValid(isValidResult);

      if (isValidResult) {
        const certData = await contract.getCertificate(certificateId);
        setCertificateData({
          id: certData[0],
          certificateTitle: certData[1],
          expiryDate: certData[2],
          issueDate: certData[3],
          issuerAddress: certData[4],
          issuerName: certData[5],
          recipientName: certData[6],
          targetAddress: certData[7],
          isValid: certData[8],
        });
      } else {
        setError('Certificate is invalid or does not exist.');
      }
    } catch (err) {
      setError('Failed to verify certificate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Verify Certificate</h1>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Enter Certificate ID"
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
        />
      </div>
      <button
        onClick={handleVerify}
        disabled={!contract || loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: !contract || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {isValid !== null && (
        <div style={{ marginTop: '20px' }}>
          <h2>Result</h2>
          <p style={{ color: isValid ? 'green' : 'red' }}>
            {isValid ? 'Certificate is valid!' : 'Certificate is invalid.'}
          </p>
        </div>
      )}
      {certificateData && (
        <div style={{ marginTop: '20px' }}>
          <h2>Details</h2>
          <pre style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
            {JSON.stringify(certificateData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
