// src/components/OcrDashboard.js
import React, { useState } from 'react';
import { performOCR } from '../utils/ocrProcessor';

const OcrDashboard = () => {
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');
  const [isOriginal, setIsOriginal] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setStatus('Analyzing...');
    
    const text = await performOCR(file, m => {
      if (m.status === 'recognizing text') {
        setStatus(`Progress: ${Math.round(m.progress * 100)}%`);
      }
    });

    setResult(text);

    // Fraud detection: assume blank or unreadable is edited
    const isReadable = text.trim().length > 20;
    setIsOriginal(isReadable);
    setStatus(isReadable ? 'Original Document ✅' : 'Edited or Tampered ❌');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📄 OCR Document Analyzer</h2>
      <input type="file" accept=".jpeg,.jpg,.png,.pdf,.docx" onChange={handleFileUpload} />
      <p>{status}</p>
      {result && (
        <div>
          <h4>Extracted Text:</h4>
          <textarea value={result} readOnly style={{ width: '100%', height: '200px' }} />
        </div>
      )}
    </div>
  );
};

export default OcrDashboard;
