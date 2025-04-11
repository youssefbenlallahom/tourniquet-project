import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdb-react-ui-kit';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { token } = useParams(); // Token from the URL

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/user/reset-password/', {
        token,
        new_password: newPassword,
      });

      if (response.status === 200) {
        setSuccess('Password has been reset successfully.');
        setTimeout(() => {
          navigate('/login');
        }, 2000); // Redirect to login after 2 seconds
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
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
                    <h4 className="mt-1 mb-5 pb-1">Reset Your Password</h4>
                  </div>
                  <form>
                    <p>Please enter your new password</p>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <MDBInput
                      wrapperClass="mb-4"
                      label="New Password"
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <MDBInput
                      wrapperClass="mb-4"
                      label="Confirm Password"
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <div className="text-center pt-1 mb-5 pb-1">
                      <MDBBtn className="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3" type="button" onClick={handleResetPassword}>
                        Reset Password
                      </MDBBtn>
                    </div>
                  </form>
                </MDBCardBody>
              </MDBCol>
              <MDBCol md="6" className="d-flex align-items-center gradient-custom-2">
                <div className="text-white px-3 py-4 p-md-5 mx-md-4">
                  <h4 className="mb-4">We're here to help</h4>
                  <p className="small mb-0">
                    If you have any questions or need further assistance, please don't hesitate to contact our support team.
                  </p>
                </div>
              </MDBCol>
            </MDBRow>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default ResetPassword;
