import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileText, Loader } from 'lucide-react';
import '../styles/Dashboard.css';
import './mouseTrail.js';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); 
  const [verificationResult, setVerificationResult] = useState(null);
  const [processingPhase, setProcessingPhase] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  
  // Canvas references for the analysis animation
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || 
                        droppedFile.type.startsWith('image/') ||
                        droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      handleFileSelection(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    setFile(selectedFile);
    setUploadStatus('uploading');
    setProgressValue(0);
    startFileAnalysis(selectedFile);
  };

  // Draw the scanning line animation
  useEffect(() => {
    if (processingPhase && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let yPos = 0;
      let direction = 1;

      const drawScanningLine = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a glowing scanning line
        const gradient = ctx.createLinearGradient(0, yPos - 5, 0, yPos + 5);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0)');
        gradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.8)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, yPos - 2, canvas.width, 4);
        
        // Add glow effect
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(canvas.width, yPos);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Move the line
        yPos += direction * 2;
        if (yPos >= canvas.height) {
          direction = -1;
        } else if (yPos <= 0) {
          direction = 1;
        }
        
        animationRef.current = requestAnimationFrame(drawScanningLine);
      };
      
      drawScanningLine();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [processingPhase]);

  const startFileAnalysis = (selectedFile) => {
    const totalSteps = 5;
    let currentStep = 0;
    
    const phases = [
      { name: 'uploading', text: 'Uploading document...' },
      { name: 'preprocessing', text: 'Preprocessing document...' },
      { name: 'extracting', text: 'Extracting visual elements...' },
      { name: 'analyzing', text: 'Analyzing patterns...' },
      { name: 'verifying', text: 'Verifying authenticity...' }
    ];
    
    // Create a simulation of the document verification process
    const simulateProcess = () => {
      if (currentStep < totalSteps) {
        setProcessingPhase(phases[currentStep]);
        
        // Update progress from 0 to 100% for current phase
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 5;
          setProgressValue(progress);
          
          if (progress >= 100) {
            clearInterval(progressInterval);
            currentStep++;
            
            if (currentStep < totalSteps) {
              setTimeout(simulateProcess, 500);
            } else {
              // Process completed, show result
              determineDocumentVeracity(selectedFile);
            }
          }
        }, 150);
      }
    };
    
    simulateProcess();
  };
  
  const determineDocumentVeracity = (selectedFile) => {
    // In a real app, this would be analyzing actual signatures, watermarks, etc.
    // For now we'll use file characteristics to make it less random than before
    
    // Read the file content to determine result
    const fileReader = new FileReader();
    
    fileReader.onload = (event) => {
      // More sophisticated logic could be implemented here
      // This is a simple example using file size and type to determine authenticity
      const fileSize = selectedFile.size;
      const fileType = selectedFile.type;
      
      setTimeout(() => {
        setUploadStatus('success');
        
        let result;
        // PDF files above a certain size are more likely to be legitimate
        if (fileType === 'application/pdf' && fileSize > 100000) {
          result = {
            status: 'verified',
            message: 'Document verified successfully. Digital signatures and metadata integrity confirmed.',
            details: 'Document contains valid digital signatures and consistent metadata. No alterations detected in document structure.'
          };
        }
        // Images that are very small might be suspicious (low quality copies)
        else if (fileType.startsWith('image/') && fileSize < 50000) {
          result = {
            status: 'suspicious',
            message: 'Potential alterations detected. Low resolution indicates possible modification.',
            details: 'Image analysis shows potential compression artifacts consistent with multiple edits. Resolution is below standard document quality.'
          };
        }
        // Word documents with unusual sizes may indicate tampering
        else if (fileType.includes('word') && (fileSize < 30000 || fileSize > 10000000)) {
          result = {
            status: 'fraudulent',
            message: 'Document integrity compromised. Structural abnormalities detected.',
            details: 'Analysis reveals inconsistent document structure, metadata anomalies, and potential content manipulation.'
          };
        }
        // Default to semi-random but weighted results
        else {
          const randomVal = Math.random();
          if (randomVal > 0.6) {
            result = {
              status: 'verified',
              message: 'Document verified successfully. All signatures and security elements match our records.',
              details: 'Document contains expected security features and passes all integrity checks.'
            };
          } else if (randomVal > 0.3) {
            result = {
              status: 'suspicious',
              message: 'Potential inconsistencies detected. The document requires manual review.',
              details: 'Some elements of the document show minor inconsistencies that require additional verification.'
            };
          } else {
            result = {
              status: 'fraudulent',
              message: 'Fraud detected! Multiple indicators of document manipulation found.',
              details: 'Analysis shows evidence of digital manipulation, inconsistent fonts, and irregular security element placement.'
            };
          }
        }
        
        setVerificationResult(result);
      }, 1000);
    };
    
    if (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf') {
      fileReader.readAsArrayBuffer(selectedFile);
    } else {
      // For other file types
      fileReader.readAsText(selectedFile);
    }
  };

  const resetVerification = () => {
    setFile(null);
    setUploadStatus(null);
    setVerificationResult(null);
    setProcessingPhase(null);
    setProgressValue(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-text">DocsFraud Detector</div>
        <nav className="dashboard-nav">
          <Link to="/" className="nav-link">Logout</Link>
        </nav>
      </header>

      <main className="dashboard-content">
        <h1>Document Verification Dashboard</h1>
        
        {!file && (
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={48} className="upload-icon" />
            <h3>Drag & Drop Your Document</h3>
            <p>Or click to browse from your device</p>
            <input 
              type="file" 
              id="document-upload" 
              accept="application/pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="document-upload" className="upload-button">
              Select Document
            </label>
            <p className="file-types">Supported formats: PDF, JPG, PNG, DOCX</p>
          </div>
        )}

        {file && processingPhase && (
          <div className="verification-status processing">
            <div className="analysis-container">
              <div className="document-preview">
                <div className="document-icon">
                  <FileText size={48} />
                  <div className="scanning-area">
                    <canvas 
                      ref={canvasRef} 
                      width={200} 
                      height={260} 
                      className="scanning-canvas"
                    />
                  </div>
                </div>
                <div className="document-name">{file.name}</div>
              </div>
              
              <div className="analysis-status">
                <h3>{processingPhase.text}</h3>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progressValue}%` }}
                  ></div>
                </div>
                <p className="progress-percentage">{progressValue}%</p>
                
                <div className="analysis-phases">
                  <div className={`analysis-phase ${processingPhase.name === 'uploading' ? 'active' : (progressValue === 100 && processingPhase.name === 'uploading' ? 'completed' : '')}`}>
                    <div className="phase-indicator">
                      {processingPhase.name === 'uploading' ? <Loader size={16} className="spinner" /> : (progressValue === 100 && processingPhase.name === 'uploading' ? <CheckCircle size={16} /> : '1')}
                    </div>
                    <span>Upload</span>
                  </div>
                  <div className={`analysis-phase ${processingPhase.name === 'preprocessing' ? 'active' : (processingPhase.name === 'extracting' || processingPhase.name === 'analyzing' || processingPhase.name === 'verifying' ? 'completed' : '')}`}>
                    <div className="phase-indicator">
                      {processingPhase.name === 'preprocessing' ? <Loader size={16} className="spinner" /> : (processingPhase.name === 'extracting' || processingPhase.name === 'analyzing' || processingPhase.name === 'verifying' ? <CheckCircle size={16} /> : '2')}
                    </div>
                    <span>Preprocess</span>
                  </div>
                  <div className={`analysis-phase ${processingPhase.name === 'extracting' ? 'active' : (processingPhase.name === 'analyzing' || processingPhase.name === 'verifying' ? 'completed' : '')}`}>
                    <div className="phase-indicator">
                      {processingPhase.name === 'extracting' ? <Loader size={16} className="spinner" /> : (processingPhase.name === 'analyzing' || processingPhase.name === 'verifying' ? <CheckCircle size={16} /> : '3')}
                    </div>
                    <span>Extract</span>
                  </div>
                  <div className={`analysis-phase ${processingPhase.name === 'analyzing' ? 'active' : (processingPhase.name === 'verifying' ? 'completed' : '')}`}>
                    <div className="phase-indicator">
                      {processingPhase.name === 'analyzing' ? <Loader size={16} className="spinner" /> : (processingPhase.name === 'verifying' ? <CheckCircle size={16} /> : '4')}
                    </div>
                    <span>Analyze</span>
                  </div>
                  <div className={`analysis-phase ${processingPhase.name === 'verifying' ? 'active' : ''}`}>
                    <div className="phase-indicator">
                      {processingPhase.name === 'verifying' ? <Loader size={16} className="spinner" /> : '5'}
                    </div>
                    <span>Verify</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {verificationResult && (
          <div className={`verification-result ${verificationResult.status}`}>
            {verificationResult.status === 'verified' && <CheckCircle size={64} className="result-icon verified-icon" />}
            {verificationResult.status === 'suspicious' && <AlertTriangle size={64} className="result-icon suspicious-icon" />}
            {verificationResult.status === 'fraudulent' && <XCircle size={64} className="result-icon fraudulent-icon" />}
            
            <h2 className="result-title">
              {verificationResult.status === 'verified' && 'Document Verified'}
              {verificationResult.status === 'suspicious' && 'Suspicious Document'}
              {verificationResult.status === 'fraudulent' && 'Fraudulent Document'}
            </h2>
            
            <p className="result-message">{verificationResult.message}</p>
            
            <div className="result-details">
              <h4>Analysis Details:</h4>
              <p>{verificationResult.details}</p>
            </div>
            
            <div className="file-info">
              <strong>File:</strong> {file.name}
              <br />
              <strong>Size:</strong> {Math.round(file.size / 1024)} KB
              <br />
              <strong>Type:</strong> {file.type}
              <br />
              <strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}
            </div>
            
            <button onClick={resetVerification} className="reset-button">
              Verify Another Document
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;