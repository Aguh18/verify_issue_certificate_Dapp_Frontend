import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable';

const UploadCert = () => {
    const [template, setTemplate] = useState(null);
    const [name, setName] = useState('Name');
    const [namePosition, setNamePosition] = useState({ x: 50, y: 50 });
    const [activeField, setActiveField] = useState(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [maxDimension, setMaxDimension] = useState(1200);
    const [certificacteName, setCertificateName] = useState('');

    const previewRef = useRef(null);

    const resizeImage = (img, maxDimension) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
            }, 'image/png', 0.8); // Adjust quality (0.8 = 80%)
        });
    };

    const handleTemplateUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = async () => {
                    const { dataUrl, width, height } = await resizeImage(img, maxDimension);
                    console.log('Resized imageSize:', { width, height }); // Debug
                    setImageSize({ width, height });
                    setTemplate(dataUrl);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        } else {
            alert('Harap unggah file gambar (PNG/JPG)');
        }
    };

    const handleDrag = (field, e, data) => {
        const parent = previewRef.current.getBoundingClientRect();
        const x = ((data.x + parent.width / 2) / parent.width) * 100;
        const y = ((data.y + parent.height / 2) / parent.height) * 100;

        if (field === 'name') {
            setNamePosition({ x, y });
        }
        console.log('Drag position:', { x, y }); // Debug
    };

    const downloadCertificate = () => {
        const certificateDiv = previewRef.current;
        if (!certificateDiv) {
            alert('Pratinjau sertifikat tidak tersedia');
            return;
        }

        html2canvas(certificateDiv, {
            useCORS: true,
            scale: 2,
            width: imageSize.width,
            height: imageSize.height,
            windowWidth: imageSize.width,
            windowHeight: imageSize.height,
        }).then((canvas) => {
            console.log('Canvas dimensions:', canvas.width, canvas.height); // Debug
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `Sertifikat_${name || 'Peserta'}.png`;
            link.click();
        }).catch((error) => {
            console.error('Error generating certificate:', error);
            alert('Gagal menghasilkan sertifikat');
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">Aplikasi Penerbitan Sertifikat</h1>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Unggah Template Sertifikat (PNG/JPG)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleTemplateUpload}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Masukan Nama Sertifikat</label>
                    <input
                        type="text"
                        onChange={(e) => setCertificateName(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="Masukkan Nama Sertifikat"
                        min="100"
                        max="5000"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Ukuran Maksimum (px)</label>
                    <input
                        type="number"
                        value={maxDimension}
                        onChange={(e) => setMaxDimension(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                        placeholder="Masukkan ukuran maksimum (px)"
                        min="100"
                        max="5000"
                    />
                </div>

                {/* <div className="grid grid-cols-1 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Peserta</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                            placeholder="Masukkan nama peserta"
                        />
                    </div>
                </div> */}

                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => setActiveField('name')}
                        className={`flex-1 py-2 px-4 rounded-md text-white ${activeField === 'name' ? 'bg-green-700' : 'bg-green-600'} hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        disabled={!template}
                    >
                        Geser Nama
                    </button>
                </div>

                <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Pratinjau Sertifikat</h2>
                    <div className="relative max-w-[90vw] max-h-[70vh] overflow-auto mx-auto">
                        <div
                            ref={previewRef}
                            className="relative bg-gray-200"
                            style={{
                                width: `${imageSize.width}px`,
                                height: `${imageSize.height}px`,
                                minWidth: `${imageSize.width}px`,
                                minHeight: `${imageSize.height}px`,
                            }}
                        >
                            {template ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={template}
                                        alt="Template Sertifikat"
                                        className="w-full h-full object-cover"
                                        style={{ display: 'block' }}
                                    />
                                    <Draggable
                                        disabled={activeField !== 'name'}
                                        onDrag={(e, data) => handleDrag('name', e, data)}
                                        position={{
                                            x: (namePosition.x / 100) * (previewRef.current?.offsetWidth || 0) - ((previewRef.current?.offsetWidth || 0) / 2),
                                            y: (namePosition.y / 100) * (previewRef.current?.offsetHeight || 0) - ((previewRef.current?.offsetHeight || 0) / 2),
                                        }}
                                    >
                                        <div className="absolute cursor-move flex justify-center items-center" style={{ transform: 'translate(-50%, -50%)' }}>
                                            <p className="text-2xl font-bold text-black bg-white bg-opacity-50 px-2 text-center">
                                                {name || 'Nama Peserta'}
                                            </p>
                                        </div>
                                    </Draggable>
                                </div>
                            ) : (
                                <p className="text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    Unggah template untuk melihat pratinjau
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={downloadCertificate}
                    disabled={!template}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    Unduh Sertifikat
                </button>
            </div>
        </div>
    );
};

export default UploadCert;