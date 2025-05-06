import { useNavigate, useLocation } from 'react-router-dom';

// Submit component
const Submit = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state;

    // If no state or state.data is missing, redirect to /issue-certificate
    if (!state || !state.data) {
        // Redirect to /issue-certificate, not /issue-certificate/submit
        navigate('/issue-certificate', { replace: true });
        console.log("Redirecting to /issue-certificate");
        return null; // Prevent rendering until redirect
    }

    // Access the passed data
    const data = state.data;

    // Use fileCid from state.data if available, otherwise use the provided IPFS URL
    const fileCid = data.fileCid || 'https://bafybeibgunsp4yfmxonp4vji3ntzpyis32wh33hucb6tsdg4xbogdniyyu.ipfs.w3s.link/certificate_Asep_Teguh_hidayat_2025-05-04T03-57-46-396Z.pdf';

    return (
        <div style={{ padding: '20px' }}>
            <h1>Submit Page</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            {/* Display the PDF using iframe */}
            <h2>Certificate PDF</h2>
            <iframe
                src={fileCid}
                title="PDF Viewer"
                style={{ width: '100%', height: '80vh', border: 'none' }}
            />
        </div>
    );
};

export default Submit;