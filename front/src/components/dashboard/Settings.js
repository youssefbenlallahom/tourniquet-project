import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBIcon,
  MDBBadge
} from 'mdb-react-ui-kit';
import axiosInstance from '../../axiosInstance';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/user/all/');
        setUsers(response.data.users);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/user/${userId}/delete/`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  const handleToggleStaff = async (userId, isStaff) => {
    try {
      await axiosInstance.patch(`/user/${userId}/toggle-staff/`, {
        is_staff: !isStaff,
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_staff: !user.is_staff } : user
      ));
    } catch (err) {
      console.error('Error updating staff status:', err);
      setError('Failed to update staff status');
    }
  };

  return (
    <Layout>
      <MDBContainer className="my-5">
        <MDBRow className="d-flex justify-content-center">
          <MDBCol md="8">
            <MDBCard>
              <MDBCardBody>
                <h4 className="mb-4">User Management</h4>
                {error && <p className="text-danger">{error}</p>}
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <MDBTable align="middle">
                    <MDBTableHead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <MDBBadge color={user.is_staff ? "success" : "secondary"}>
                              {user.is_staff ? "Staff" : "User"}
                            </MDBBadge>
                          </td>
                          <td>
                            <MDBBtn 
                              color="warning" 
                              size="sm"
                              onClick={() => handleToggleStaff(user.id, user.is_staff)}
                            >
                              {user.is_staff ? 'Revoke Staff' : 'Make Staff'}
                            </MDBBtn>{' '}
                            <MDBBtn 
                              color="danger" 
                              size="sm"
                              onClick={() =>                               handleDeleteUser(user.id)}
                              >
                                <MDBIcon fas icon="trash-alt" />
                              </MDBBtn>
                            </td>
                          </tr>
                        ))}
                      </MDBTableBody>
                    </MDBTable>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </Layout>
    );
  };
  
  export default Settings;
  
