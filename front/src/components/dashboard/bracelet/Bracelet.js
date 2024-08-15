import React, { useState, useEffect, useRef } from 'react';
import {
    TextField, Button, Select, MenuItem, FormControl, InputLabel,
    Container, Typography, InputAdornment, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Pagination,
    Box, Grid, IconButton
} from '@mui/material';
import { QrCodeScanner, Delete as DeleteIcon } from '@mui/icons-material';
import axiosInstance from '../../../axiosInstance';

const Bracelet = () => {
    const [bracelets, setBracelets] = useState([]);
    const [braceletData, setBraceletData] = useState({
        bracelet_id: '',
        color: '',
        active: true
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const braceletIdRef = useRef(null);

    const popularColors = [
        'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Orange', 
        'Purple', 'Pink', 'Brown', 'Gray', 'Cyan', 'Magenta', 'Lime', 
        'Indigo', 'Violet', 'Gold', 'Silver', 'Maroon', 'Navy', 
        'Olive', 'Teal', 'Aqua', 'Fuchsia', 'Coral', 'Salmon', 
        'Khaki', 'Turquoise', 'Plum', 'Orchid', 'Sienna'
    ];

    useEffect(() => {
        fetchBracelets();
    }, []);

    const fetchBracelets = () => {
        axiosInstance.get('/bracelet/all/')
            .then(response => setBracelets(response.data))
            .catch(error => console.error('Error fetching bracelets:', error));
    };

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

    const handleDelete = (braceletId) => {
        axiosInstance.delete(`/bracelet/delete/${braceletId}/`)
            .then(() => {
                setBracelets(bracelets.filter(bracelet => bracelet.num !== braceletId));
            })
            .catch(error => console.error('Error deleting bracelet:', error));
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = bracelets.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <Container>
            <Box sx={{ textAlign: 'center', my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bracelet Management
                </Typography>
            </Box>

            <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
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
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Color</InputLabel>
                                <Select
                                    name="color"
                                    value={braceletData.color}
                                    onChange={handleChange}
                                    required
                                >
                                    {popularColors.map((color) => (
                                        <MenuItem key={color.toLowerCase()} value={color.toLowerCase()}>
                                            {color}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{ mt: 2, px: 2, py: 1, fontSize: '0.85rem', mx: "auto", display: 'block' }}
                            >
                                Add Bracelet
                            </Button>
                        </form>
                    </Paper>
                </Grid>
            </Grid>

            <Box sx={{ my: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Existing Bracelets
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Bracelet ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Active</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Add Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentItems.map((bracelet) => (
                                <TableRow key={bracelet.num}>
                                    <TableCell>{bracelet.num}</TableCell>
                                    <TableCell>{bracelet.bracelet_id}</TableCell>
                                    <TableCell>{bracelet.color.charAt(0).toUpperCase() + bracelet.color.slice(1)}</TableCell>
                                    <TableCell>{bracelet.active ? 'Active' : 'Inactive'}</TableCell>
                                    <TableCell>{new Date(bracelet.add_date).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="secondary"
                                            onClick={() => handleDelete(bracelet.num)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Pagination
                    count={Math.ceil(bracelets.length / itemsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}
                />
            </Box>
        </Container>
    );
};

export default Bracelet;
