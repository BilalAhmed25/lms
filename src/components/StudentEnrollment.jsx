import React, { useState, useEffect } from 'react';
import { CreditCard, Upload, CheckCircle, Search, DollarSign } from 'lucide-react';
import FloatingLabelInput from '../components/FloatingLabelInput';
import api from '../utils/api';

const StudentEnrollment = ({ onEnrolled }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await api.get('/enrollment/classes');
      setClasses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceipt(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/enrollment/request', {
        classId: selectedClass.ID,
        amountPaid: selectedClass.Fee,
        receiptBase64: receipt
      });
      setStep(3);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="enrollment-page container animate-fade-in">
      <div className="enrollment-container glass">
        <div className="enrollment-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Select Class</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Verification</div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <h2>Select Your Class</h2>
            <p className="text-muted mb-6">Choose the class you wish to enroll in to start your journey.</p>
            <div className="classes-grid">
              {classes.map(cls => (
                <div 
                  key={cls.ID} 
                  className={`class-selection-card ${selectedClass?.ID === cls.ID ? 'selected' : ''}`}
                  onClick={() => setSelectedClass(cls)}
                >
                  <div className="class-icon"><Search size={24} /></div>
                  <div className="class-details">
                    <h3>{cls.Name}</h3>
                    <p className="fee"><DollarSign size={14} /> {cls.Fee} Course Fee</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="btn btn-primary w-full mt-8" 
              disabled={!selectedClass}
              onClick={() => setStep(2)}
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <button className="back-link mb-6" onClick={() => setStep(1)}>← Back to selection</button>
            <h2>Upload Payment Receipt</h2>
            <p className="text-muted mb-6">Please pay <strong>${selectedClass.Fee}</strong> to our account and upload the receipt image below.</p>
            
            <div className="payment-instructions glass mb-6">
              <p><strong>Account Name:</strong> LMS Education Pro</p>
              <p><strong>Account Number:</strong> 1234-5678-9012</p>
              <p><strong>Bank:</strong> Global Education Bank</p>
            </div>

            <div className="upload-area">
              <input type="file" id="receipt-upload" hidden onChange={handleFileUpload} accept="image/*" />
              <label htmlFor="receipt-upload" className="upload-label">
                {receipt ? (
                  <div className="preview">
                    <img src={receipt} alt="Receipt Preview" />
                    <p>Click to change file</p>
                  </div>
                ) : (
                  <>
                    <Upload size={40} />
                    <p>Click to upload bank receipt</p>
                  </>
                )}
              </label>
            </div>

            <button 
              className="btn btn-primary w-full mt-8" 
              disabled={!receipt || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="step-content text-center py-12">
            <div className="success-icon animate-bounce"><CheckCircle size={80} color="var(--success)" /></div>
            <h2 className="mt-6">Request Submitted!</h2>
            <p className="text-muted mt-4">
              Your enrollment request for <strong>{selectedClass.Name}</strong> has been sent to the admin. 
              Verification typically takes 24-48 hours.
            </p>
            <button className="btn btn-secondary mt-8" onClick={() => window.location.reload()}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollment;
