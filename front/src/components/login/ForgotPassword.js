import React, { useState } from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Alert, Collapse } from '@mui/material'; // Import MUI components

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false); // State to manage alert visibility
  const navigate = useNavigate();

  const handleRequestReset = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/user/request-password-reset/', {
        identifier: identifier,
      });

      if (response.status === 200) {
        setMessage('A password reset link has been sent to your email.');
        setError('');
        setOpen(true);
      } else {
        setError('Unable to process request. Please try again.');
        setMessage('');
        setOpen(true);
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      setMessage('');
      setOpen(true);
    }
  };

  return (
    <MDBContainer className="my-5 gradient-form" style={{ backgroundColor: '#eee' }}>
      <MDBRow className="d-flex justify-content-center align-items-center h-100">
        <MDBCol col="12">
          <MDBCard className="rounded-3 text-black">
            <MDBRow className="g-0">
              <MDBCol md="6">
                <MDBCardBody className="p-md-5 mx-md-4">
                  <div className="text-center">
                    <img src="/assets/logo.png" style={{ width: '185px' }} alt="logo" />
                    <h4 className="mt-1 mb-5 pb-1">We are JUMPARK Team</h4>
                  </div>
                  <form>
                    <p>Please enter your email or username to request a password reset.</p>
                    
                    {/* MUI Alert for Success or Error */}
                    <Collapse in={open}>
                      {message && (
                        <Alert severity="success" onClose={() => setOpen(false)} sx={{ mb: 2 }}>
                          {message}
                        </Alert>
                      )}
                      {error && (
                        <Alert severity="error" onClose={() => setOpen(false)} sx={{ mb: 2 }}>
                          {error}
                        </Alert>
                      )}
                    </Collapse>
                    
                    <MDBInput 
                      wrapperClass="mb-4" 
                      label="Email or Username" 
                      id="form2Example11" 
                      type="text" 
                      value={identifier} 
                      onChange={(e) => setIdentifier(e.target.value)} 
                    />
                    <div className="text-center pt-1 mb-5 pb-1">
                      <MDBBtn 
                        className="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3" 
                        type="button" 
                        onClick={handleRequestReset}
                      >
                        Request Reset
                      </MDBBtn>
                    </div>
                    <div className="d-flex align-items-center justify-content-center pb-4">
                      <p className="mb-0 me-2">Remembered your password?</p>
                      <MDBBtn outline className="mx-2" color="danger" onClick={() => navigate('/login')}>
                        Back to Login
                      </MDBBtn>
                    </div>
                  </form>
                </MDBCardBody>
              </MDBCol>
              <MDBCol md="6" className="d-flex align-items-center gradient-custom-2">
                <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                  <h4 className="mb-4">We are more than just a company</h4>
                  <p className="small mb-0">Venez repousser vos limites dans le plus grand parc de trampoline indoor en Tunisie. Parcours Ninja, Laser Room, Jump Ball et bien plus.</p>
                </div>
              </MDBCol>
            </MDBRow>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default ForgotPassword;
