import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Modal } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {  isValid, isBefore } from 'date-fns';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axiosInstance from '../../axiosInstance';
import TimeZoneView from './TimeZoneView';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [accesses, setAccesses] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState('');

  useEffect(() => {
    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        const accessMap = response.data.reduce((map, access) => {
          map[access.id] = access.name;
          return map;
        }, {});
        console.log('Fetched accesses:', response.data); // Debugging
        console.log('Access Map:', accessMap); // Debugging
        setAccesses(response.data);
        setAccessMap(accessMap);
      } catch (error) {
        console.error('Error fetching accesses:', error);
      }
    };

    fetchAccesses();
  }, []);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const response = await axiosInstance.get('/timezone/all/');
        console.log('Fetched timezones:', response.data); // Debugging
        const fetchedEvents = response.data.map((timezone) => ({
          id: timezone.TimezoneId,
          title: `Timezone for ${accessMap[timezone.access] || 'Unknown Access'}`, // Use timezone.access instead of timezone.access.id
          start: new Date(timezone.startTime),
          end: new Date(timezone.endTime),
          accessId: timezone.access // Ensure this matches the accessMap key
        }));
        console.log('Fetched Events:', fetchedEvents); // Debugging
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching timezones:', error);
      }
    };

    if (Object.keys(accessMap).length > 0) {
      fetchTimezones();
    }
  }, [accessMap]);

  const handleConfirm = async () => {
    if (!selectedDate || !startTime || !endTime || !selectedAccess) {
      alert('Please fill out all required fields.');
      return;
    }

    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

    if (!isValid(startDateTime) || !isValid(endDateTime)) {
      alert('Invalid date-time values. Please check your input.');
      return;
    }

    if (isBefore(endDateTime, startDateTime)) {
      alert('End time must be after start time.');
      return;
    }

    try {
      const newEvent = {
        id: events.length + 1,
        title: `Timezone for ${selectedAccess}`,
        start: startDateTime,
        end: endDateTime,
        accessId: selectedAccess
      };

      setEvents([...events, newEvent]);

      const response = await axiosInstance.post('/timezone/create/', {
        access: selectedAccess,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      if (response.status === 201) {
        setOpen(false);
      } else {
        alert('Failed to create timezone');
      }
    } catch (error) {
      console.error('Error creating timezone:', error);
    }

    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/timezone/delete/${id}/`);
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting timezone:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box display="flex" flexDirection="column" gap={2} p={3}>
        <Typography variant="h6">Select The Access and Create Timezone</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Access</InputLabel>
          <Select
            value={selectedAccess}
            onChange={(e) => setSelectedAccess(e.target.value)}
            label="Access"
          >
            {accesses.map(access => (
              <MenuItem key={access.id} value={access.id}>
                {access.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setOpen(true)}
          sx={{ mb: -3, maxWidth: '190px', fontSize: '16px' }} 

        >
          Create Timezone
        </Button>

        <Box mt={4} sx={{ height: 500 }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            selectable
            onSelectSlot={(slotInfo) => {
              setSelectedDate(slotInfo.start);
              setOpen(true);
            }}
            onSelectEvent={(event) => console.log(event)}
          />
        </Box>

        <Box mt={4} sx={{ width: '100%' }}>
          <TimeZoneView rows={events} accessMap={accessMap} onDelete={handleDelete} />
        </Box>

        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Create Timezone
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Access</InputLabel>
              <Select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                label="Access"
              >
                {accesses.map(access => (
                  <MenuItem key={access.id} value={access.id}>
                    {access.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="Start Time"
              value={startTime}
              onChange={(newValue) => setStartTime(newValue)}
              // Remove disableFuture if you want to allow any date
            />
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="End Time"
              value={endTime}
              onChange={(newValue) => setEndTime(newValue)}
              // Remove disableFuture if you want to allow any date
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              sx={{ mt: 2 }}
            >
              Confirm
            </Button>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default Calendar;