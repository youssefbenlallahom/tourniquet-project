import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn
} from 'mdb-react-ui-kit';

const UpdateUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(`/user/all/`);
        setUser(response.data); // Adjust based on actual response structure
      } catch (err) {
        console.error('Error fetching user:', err.response ? err.response.data : err);
        setError('Failed to load user details');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({ ...prevUser, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/user/update/${userId}/`, user);
      navigate('/settings');
    } catch (err) {
      console.error('Error updating user:', err.response ? err.response.data : err);
      setError('Failed to update user');
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBRow className="d-flex justify-content-center">
        <MDBCol md="6">
          <MDBCard>
            <MDBCardBody>
              <h4 className="mb-4">Update User</h4>
              {error && <p className="text-danger">{error}</p>}
              {loading ? (
                <p>Loading...</p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <MDBInput
                    label="Username"
                    name="username"
                    value={user.username || ''}
                    onChange={handleInputChange}
                    className="mb-3"
                  />
                  <MDBInput
                    label="Email"
                    type="email"
                    name="email"
                    value={user.email || ''}
                    onChange={handleInputChange}
                    className="mb-3"
                  />
                  <MDBBtn type="submit">Update</MDBBtn>
                </form>
              )}
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default UpdateUser;
