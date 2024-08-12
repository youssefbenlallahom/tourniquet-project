// src/components/dashboard/bracelet/Bracelet.js
import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Container, Typography, InputAdornment } from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material'; // MUI Icon for scanning
import axiosInstance from '../../../axiosInstance';

const Bracelet = () => {
    const [bracelets, setBracelets] = useState([]);
    const [braceletData, setBraceletData] = useState({
        bracelet_id: '',
        color: '',
        active: true
    });

    const braceletIdRef = useRef(null);

    useEffect(() => {
        // Fetch existing bracelets
        axiosInstance.get('/bracelet/all/')
            .then(response => setBracelets(response.data))
            .catch(error => console.error('Error fetching bracelets:', error));

        // Auto-focus the bracelet_id field for scanning
        if (braceletIdRef.current) {
            braceletIdRef.current.focus();
        }
    }, []);

    const handleChange = (e) => {
        setBraceletData({
            ...braceletData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axiosInstance.post('/bracelet/create/', braceletData)
            .then(response => {
                setBracelets([...bracelets, response.data]);
                setBraceletData({
                    bracelet_id: '',
                    color: '',
                    active: true
                });
            })
            .catch(error => console.error('Error adding bracelet:', error));
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Bracelet Management
            </Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Bracelet ID"
                    name="bracelet_id"
                    value={braceletData.bracelet_id}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                    placeholder="Scan Bracelet ID"
                    inputRef={braceletIdRef}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <QrCodeScanner />
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Color"
                    name="color"
                    value={braceletData.color}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Active</InputLabel>
                    <Select
                        name="active"
                        value={braceletData.active}
                        onChange={handleChange}
                    >
                        <MenuItem value={true}>Yes</MenuItem>
                        <MenuItem value={false}>No</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" color="primary">Add Bracelet</Button>
            </form>

            <Typography variant="h5" component="h2" gutterBottom>
                Existing Bracelets
            </Typography>
            <ul>
                {bracelets.map((bracelet) => (
                    <li key={bracelet.num}>
                        {bracelet.bracelet_id} - {bracelet.color} - {bracelet.active ? 'Active' : 'Inactive'}
                    </li>
                ))}
            </ul>
        </Container>
    );
};

export default Bracelet;
