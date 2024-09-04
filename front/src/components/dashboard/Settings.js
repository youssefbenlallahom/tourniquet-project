import React, { useState, useEffect } from 'react';
import Layout from '../../Layout';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@mui/icons-material'; // Importez les icônes de Material-UI
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
  MDBCheckbox,
  MDBTooltip
} from 'mdb-react-ui-kit';
import axiosInstance from '../../axiosInstance';

// Importez les icônes de Material-UI que vous allez utiliser
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

  const handlePermissionChange = async (userId, permission, value) => {
    try {
      await axiosInstance.post('/user/permissions/update/', {
        user_id: userId,
        permissions: { [permission]: value },
      });
      setUsers(users.map(user =>
        user.id === userId ? { ...user, [permission]: value } : user
      ));
    } catch (err) {
      console.error('Error updating permissions:', err);
      setError('Failed to update permissions');
    }
  };

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

  const handleUpdateUser = (userId) => {
    console.log('Update user:', userId);
  };

  // Styles
  const checkboxStyle = {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    cursor: 'pointer',
    appearance: 'none',
    border: '2px solid #0d6efd',
    backgroundColor: '#fff',
    transition: 'background-color 0.3s, border-color 0.3s',
  };

  const checkboxCheckedStyle = {
    ...checkboxStyle,
    backgroundColor: '#0d6efd',
    borderColor: '#0d6efd',
    color: '#fff',
  };

  const checkboxIndicatorStyle = {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  };

  const actionBtnStyle = {
    margin: '0 5px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    minHeight: '36px',
    borderRadius: '50%',
    border: 'none',
  };

  const updateBtnStyle = {
    ...actionBtnStyle,
    backgroundColor: '#0096FF',
  };

  const deleteBtnStyle = {
    ...actionBtnStyle,
    backgroundColor: '#dc3545',
  };

  return (
    <Layout>
      <MDBContainer className="my-5">
        <MDBRow className="d-flex justify-content-center">
          <MDBCol md="10">
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
                        <th>Device Management</th>
                        <th>Access Management</th>
                        <th>Role Management</th>
                        <th>Timezone Management</th>
                        <th>Door Management</th>
                        <th>Assignment Management</th>
                        <th>Actions</th>
                      </tr>
                    </MDBTableHead>
                    <MDBTableBody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <MDBCheckbox
                              checked={user.can_manage_device}
                              onChange={() =>
                                handlePermissionChange(
                                  user.id,
                                  'can_manage_device',
                                  !user.can_manage_device
                                )
                              }
                              style={user.can_manage_device ? checkboxCheckedStyle : checkboxStyle}
                              icon={<CheckIcon style={checkboxIndicatorStyle} />}
                            />
                          </td>
                          <td>
                            <MDBCheckbox
                              checked={user.can_manage_access}
                              onChange={() =>
                                handlePermissionChange(
                                  user.id,
                                  'can_manage_access',
                                  !user.can_manage_access
                                )
                              }
                              style={user.can_manage_access ? checkboxCheckedStyle : checkboxStyle}
                              icon={<CheckIcon style={checkboxIndicatorStyle} />}
                            />
                          </td>
                          <td>
                            <MDBCheckbox
                              checked={user.can_manage_role}
                              onChange={() =>
                                handlePermissionChange(
                                  user.id,
                                  'can_manage_role',
                                  !user.can_manage_role
                                )
                              }
                              style={user.can_manage_role ? checkboxCheckedStyle : checkboxStyle}
                              icon={<CheckIcon style={checkboxIndicatorStyle} />}
                            />
                          </td>
                          <td>
                            <MDBCheckbox
                              checked={user.can_manage_timezone}
                              onChange={() =>
                                handlePermissionChange(
                                  user.id,
                                  'can_manage_timezone',
                                  !user.can_manage_timezone
                                )
                              }
                              style={user.can_manage_timezone ? checkboxCheckedStyle : checkboxStyle}
                              icon={<CheckIcon style={checkboxIndicatorStyle} />}
                            />
                          </td>
                          <td>
                            <MDBCheckbox
                              checked={user.can_manage_door}
                              onChange={() =>
                                handlePermissionChange(
                                  user.id,
                                  'can_manage_door',
                                  !user.can_manage_door
                                )
                              }
                              style={user.can_manage_door ? checkboxCheckedStyle : checkboxStyle}
                              icon={<CheckIcon style={checkboxIndicatorStyle} />}
                            />
                          </td>
                          <td>
                            <MDBCheckbox
                              checked={user.can_manage_assignment}
                              onChange={() =>
                                handlePermissionChange(
                                  user.id,
                                  'can_manage_assignment',
                                  !user.can_manage_assignment
                                )
                              }
                              style={user.can_manage_assignment ? checkboxCheckedStyle : checkboxStyle}
                              icon={<CheckIcon style={checkboxIndicatorStyle} />}
                            />
                          </td>
                          <td>
                            <div className="d-flex">
                              <MDBTooltip tag="span" title="Update User">
                                <MDBBtn
                                  color="info"
                                  size="sm"
                                  onClick={() => handleUpdateUser(user.id)}
                                  style={updateBtnStyle}
                                >
                                  <EditIcon style={{ color: '#fff' }} />
                                </MDBBtn>
                              </MDBTooltip>
                              <MDBTooltip tag="span" title="Delete User">
                                <MDBBtn
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  style={deleteBtnStyle}
                                >
                                  <DeleteIcon style={{ color: '#fff' }} />
                                </MDBBtn>
                              </MDBTooltip>
                            </div>
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
