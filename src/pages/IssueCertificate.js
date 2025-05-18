import { data } from 'autoprefixer';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { getEnv } from '../utils/env';
import { useNavigate } from 'react-router-dom';


const IssueCertificate = () => {
    const [formData, setFormData] = useState({
        template: '',
        recipientName: '',
        certificateTitle: '',
        issueDate: '',
        expiryDate: '',
        description: '',
        signature: null,
        category: '',
        issuerAddress: localStorage.getItem("walletAddress"),
        issuerName: localStorage.getItem("walletAddress"),
        targetAddress: '',

    });
    const [templateName, setTemplateName] = useState([]);
    const [loading, setLoading] = useState(true);


    const [errors, setErrors] = useState({});
    const navigate = useNavigate();


    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${getEnv('BASE_URL')}/api/certificate/template`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log('Full response:', response.data);

                // Jika response.data = { data: { templates: [...] } }
                setTemplateName(response.data.data.templates);
            } catch (error) {
                console.error('Error fetching templates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);




    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: '' });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) {
            setErrors({ ...errors, signature: 'Ukuran file maksimum 2MB' });
            return;
        }
        setFormData({ ...formData, signature: file });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.template) newErrors.template = 'Template wajib dipilih';
        if (!formData.recipientName) newErrors.recipientName = 'Nama penerima wajib diisi';
        else if (!/^[a-zA-Z\s'-]+$/.test(formData.recipientName))
            newErrors.recipientName = 'Nama hanya boleh berisi huruf, spasi, tanda hubung, atau apostrof';
        if (!formData.certificateTitle) newErrors.certificateTitle = 'Judul sertifikat wajib diisi';
        if (!formData.issueDate) newErrors.issueDate = 'Tanggal penerbitan wajib diisi';

        if (formData.expiryDate && formData.expiryDate < formData.issueDate)
            newErrors.expiryDate = 'Tanggal kedaluwarsa harus lebih baru dari tanggal penerbitan';
        if (!formData.targetAddress) newErrors.targetAddress = 'Alamat target wajib diisi';
        else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.targetAddress))
            newErrors.targetAddress = 'Alamat target tidak valid';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);

            return;
        }
        try {
            
            const response = await axios.post('http://localhost:5000/api/certificate/generate', formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("token")}`,
                },

                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload Progress: ${percentCompleted}%`);
                },
            });

            if (response.status !== 200) {
                throw new Error('Failed to upload file');
            }
            navigate('/issue-certificate/submit', {
                state: {
                    data: response.data.data,
                },
            })
            console.log('Upload Success:', response.data);
            setErrors({});

        } catch (error) {
            console.error('Error uploading file:', error);
            setErrors({ submit: 'Failed to upload file. Please try again.' });
        }





    };

    return (
        <div className="p-6 bg-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Terbitkan Sertifikat</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                {errors.submit && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{errors.submit}</div>
                )}
                {/* {templateName[0].id} */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Template Sertifikat</label>
                    <select
                        name="template"
                        value={formData.template}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                        required
                    >
                        <option value="">Pilih Template</option>
                        {templateName.map((template) => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {errors.template && <p className="text-red-500 text-sm mt-1">{errors.template}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nama Penerima</label>
                    <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                    {errors.recipientName && (
                        <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Judul Sertifikat</label>
                    <input
                        type="text"
                        name="certificateTitle"
                        value={formData.certificateTitle}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                    {errors.certificateTitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.certificateTitle}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Tanggal Penerbitan</label>
                    <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                        required
                    />
                    {errors.issueDate && <p className="text-red-500 text-sm mt-1">{errors.issueDate}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Tanggal Kedaluwarsa (Opsional)
                    </label>
                    <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                    />
                    {errors.expiryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Deskripsi (Opsional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                        rows="4"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Tanda Tangan (Opsional)
                    </label>
                    <input
                        type="file"
                        name="signature"
                        onChange={handleFileChange}
                        className="mt-1 block w-full p-2 border rounded-md"
                        accept="image/png,image/jpeg"
                    />
                    {errors.signature && (
                        <p className="text-red-500 text-sm mt-1">{errors.signature}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Kategori (Opsional)
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                    >
                        <option value="">Pilih Kategori</option>
                        <option value="akademik">Akademik</option>
                        <option value="profesional">Profesional</option>
                        <option value="penghargaan">Penghargaan</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Address Target</label>
                    <input
                        type="text"
                        name="targetAddress"
                        value={formData.targetAddress}
                        onChange={handleChange}
                        className="mt-1 block w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                        placeholder="0x..."
                        required
                    />
                    {errors.targetAddress && (
                        <p className="text-red-500 text-sm mt-1">{errors.targetAddress}</p>
                    )}
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                    Terbitkan Sertifikat
                </button>
            </form>
        </div>
    );
};

export default IssueCertificate;