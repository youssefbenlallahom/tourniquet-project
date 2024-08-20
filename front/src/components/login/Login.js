import React, { useState } from 'react';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import axios from 'axios';
import './Login.css'

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/user/login/', {
        username: email,
        password: password,
      });

      console.log('Response:', response);

      if (response.status === 200) {
        const { token, user } = response.data;
        console.log('Token:', token); // Log the token data
        console.log('User:', user); // Log the user data
        localStorage.setItem('isAuthenticated', JSON.stringify(true));
        localStorage.setItem('token', token.access); // Store the token
        onLogin(true);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('There was an error logging in!', error);
      if (error.response && error.response.status === 401) {
        setError('Invalid credentials');
      } else {
        setError('An error occurred. Please try again later.');
      }
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
                  </div>
                  <form>
                    <p>Please login to your account</p>
                    {error && <div className="error">{error}</div>}
                    <MDBInput wrapperClass="mb-4" label="Username" id="form2Example11" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <MDBInput wrapperClass="mb-4" label="Password" id="form2Example22" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <div className="text-center pt-1 mb-5 pb-1">
                      <MDBBtn className="btn btn-primary btn-block fa-lg gradient-custom-2 mb-3" type="button" onClick={handleLogin}>Log in</MDBBtn>
                      <a className="text-muted" href="#!">Forgot password?</a>
                    </div>
                    <div className="d-flex align-items-center justify-content-center pb-4">
                      <p className="mb-0 me-2">Don't have an account?</p>
                      <MDBBtn outline className="mx-2" color="danger">Create new</MDBBtn>
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

export default Login;
