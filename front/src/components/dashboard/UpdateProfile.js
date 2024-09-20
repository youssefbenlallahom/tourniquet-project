// src/components/dashboard/UpdateUser.jsx

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
  MDBBtn,
  MDBIcon,
} from 'mdb-react-ui-kit';

const UpdateUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get('/user/all/');
        const foundUser = response.data.users.find((u) => u.id === parseInt(userId));
        if (foundUser) {
          setUser({
            username: foundUser.username,
            email: foundUser.email,
            password: '',
            confirmPassword: '',
          });
        } else {
          setError('User not found.');
        }
      } catch (err) {
        console.error('Error fetching user:', err.response ? err.response.data : err);
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const validateForm = () => {
    if (!user.username.trim() || !user.email.trim()) {
      setError('Username and Email are required.');
      return false;
    }
    if (user.password || user.confirmPassword) {
      if (user.password !== user.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      if (user.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    const updateData = {
      username: user.username,
      email: user.email,
    };

    if (user.password) {
      updateData.password = user.password;
    }

    try {
      await axiosInstance.put(`/user/update/${userId}/`, updateData);
      setSuccess('User details updated successfully.');
      // Optionally, navigate back to settings after a delay
      setTimeout(() => {
        navigate('/settings');
      }, 2000);
    } catch (err) {
      console.error('Error updating user:', err.response ? err.response.data : err);
      setError(
        err.response && err.response.data && err.response.data.error
          ? err.response.data.error
          : 'Failed to update user.'
      );
    }
  };

  return (
    <MDBContainer className="my-5">
      <MDBRow className="d-flex justify-content-center">
        <MDBCol md="6">
          <MDBCard>
            <MDBCardBody>
              <h4 className="mb-4">Update User</h4>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {loading ? (
                <div className="text-center">
                  <MDBIcon fas icon="spinner" spin size="3x" />
                  <p>Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <MDBInput
                    label="Username"
                    name="username"
                    value={user.username}
                    onChange={handleInputChange}
                    className="mb-3"
                    required
                  />
                  <MDBInput
                    label="Email"
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    className="mb-3"
                    required
                  />
                  <MDBInput
                    label="New Password"
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleInputChange}
                    className="mb-3"
                    placeholder="Leave blank to keep current password"
                  />
                  <MDBInput
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={user.confirmPassword}
                    onChange={handleInputChange}
                    className="mb-3"
                    placeholder="Leave blank to keep current password"
                  />
                  <MDBBtn type="submit" color="primary" className="w-100">
                    Update
                  </MDBBtn>
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
