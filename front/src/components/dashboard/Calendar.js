import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Modal } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, isBefore } from 'date-fns';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axiosInstance from '../../axiosInstance';
import TimeZoneView from './TimeZoneView';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '../../Layout';
import './calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const [accesses, setAccesses] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState([]);

  useEffect(() => {
    const fetchAccesses = async () => {
      try {
        const response = await axiosInstance.get('/access/all/');
        const accessMap = response.data.reduce((map, access) => {
          map[access.id] = access.GameName;
          return map;
        }, {});
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
        const fetchedEvents = response.data.map((timezone) => ({
          id: timezone.TimezoneId,
          title: `Timezone for ${timezone.access.map(id => accessMap[id] || 'Unknown Access').join(', ')}`,
          start: new Date(timezone.startTime),
          end: new Date(timezone.endTime),
          accessId: timezone.access
        }));
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
    if (!selectedDate || !startTime || !endTime || selectedAccess.length === 0) {
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
    <Layout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" flexDirection="column" gap={1.5} p={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>Select The Access and Create Timezone</Typography>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Access</InputLabel>
            <Select
              multiple
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                  {selected.map((value) => (
                    <Typography key={value} variant="body2">{accessMap[value]}</Typography>
                  ))}
                </Box>
              )}
              label="Access"
            >
              {accesses.map(access => (
                <MenuItem key={access.id} value={access.id}>
                  {access.GameName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpen(true)}
            sx={{ maxWidth: '200px', fontSize: '14px' }}
          >
            Create Timezone
          </Button>

          <Box mt={2} sx={{ height: 400 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400 }}
              selectable
              onSelectSlot={(slotInfo) => {
                setSelectedDate(slotInfo.start);
                setStartTime(slotInfo.start);
                setEndTime(slotInfo.end);
                setOpen(true);
              }}
              onSelectEvent={(event) => console.log(event)}
            />
          </Box>

          <Box mt={3} sx={{ width: '100%' }}>
            <TimeZoneView rows={events} accessMap={accessMap} onDelete={handleDelete} />
          </Box>

          <Modal open={open} onClose={() => setOpen(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 350,
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Create Timezone
              </Typography>

              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>Access</InputLabel>
                <Select
                  multiple
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
                      {selected.map((value) => (
                        <Typography key={value} variant="body2">{accessMap[value]}</Typography>
                      ))}
                    </Box>
                  )}
                  label="Access"
                >
                  {accesses.map(access => (
                    <MenuItem key={access.id} value={access.id}>
                      {access.GameName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DateTimePicker
                renderInput={(props) => <TextField {...props} size="small" />}
                label="Start Time"
                value={startTime}
                onChange={(newValue) => setStartTime(newValue)}
                sx={{ mb: 1 }}
              />
              <DateTimePicker
                renderInput={(props) => <TextField {...props} size="small" />}
                label="End Time"
                value={endTime}
                onChange={(newValue) => setEndTime(newValue)}
              />

              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="contained" color="primary" size="small" onClick={handleConfirm}>
                  Confirm
                </Button>
                <Button variant="outlined" size="small" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </LocalizationProvider>
    </Layout>
  );
};

export default Calendar;
