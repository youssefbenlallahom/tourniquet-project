import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Modal } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isValid, isBefore } from 'date-fns';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axiosInstance from '../../../axiosInstance';
import TimeZoneView from './TimeZoneView';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Layout from '../../../Layout';
import './calendar.css';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const Calendar = () => {
  const navigate = useNavigate();
  const [accesses, setAccesses] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);

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
      if (Object.keys(accessMap).length > 0) {
        try {
          const response = await axiosInstance.get('/timezone/all/');
          const fetchedEvents = response.data.map((timezone) => {
            const accessIds = Array.isArray(timezone.access)
              ? timezone.access.map(item => item.id)
              : [];
            
            const eventAccessNames = accessIds.map(id => accessMap[id] || 'Unknown Access');
            return {
              id: timezone.TimezoneId,
              title: `Timezone for ${eventAccessNames.join(', ')}`,
              start: new Date(timezone.startTime),
              end: new Date(timezone.endTime),
              accessId: accessIds
            };
          });
          setEvents(fetchedEvents);
        } catch (error) {
          console.error('Error fetching timezones:', error);
        }
      }
    };
  
    fetchTimezones();
  }, [accessMap]);

  const handleConfirm = async () => {
    // Debug logging
    console.log('Selected Date:', selectedDate);
    console.log('Start Time:', startTime);
    console.log('End Time:', endTime);
    console.log('Selected Access:', selectedAccess);

    // Check if any field is null or empty
    if (!startTime) {
      alert('Please select a start time.');
      return;
    }
    if (!endTime) {
      alert('Please select an end time.');
      return;
    }
    if (!selectedAccess || selectedAccess.length === 0) {
      alert('Please select at least one access.');
      return;
    }

    // Use the date from startTime if selectedDate is not set
    const baseDate = selectedDate || startTime;
    const startDateTime = new Date(baseDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes());

    const endDateTime = new Date(baseDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes());

    // Debug logging for date objects
    console.log('Base Date:', baseDate);
    console.log('Start DateTime:', startDateTime);
    console.log('End DateTime:', endDateTime);

    if (!isValid(startDateTime) || !isValid(endDateTime)) {
      alert('Invalid date-time values. Please check your input.');
      return;
    }

    if (isBefore(endDateTime, startDateTime)) {
      alert('End time must be after start time.');
      return;
    }

    const eventData = {
      access: selectedAccess,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    try {
      if (currentEvent) {
        await axiosInstance.put(`/timezone/update/${currentEvent.id}/`, eventData);
        setEvents(events.map(event => event.id === currentEvent.id
          ? { ...event, ...eventData, start: startDateTime, end: endDateTime, title: `Timezone for ${selectedAccess.map(id => accessMap[id] || 'Unknown Access').join(', ')}` }
          : event
        ));
      } else {
        const response = await axiosInstance.post('/timezone/create/', eventData);
        if (response.status === 201) {
          const newEvent = {
            ...eventData,
            id: response.data.id,
            title: `Timezone for ${selectedAccess.map(id => accessMap[id] || 'Unknown Access').join(', ')}`,
            start: startDateTime,
            end: endDateTime
          };
          setEvents([...events, newEvent]);
        } else {
          alert('Failed to create timezone');
        }
      }

      setOpen(false);
    } catch (error) {
      console.error('Error creating or updating timezone:', error);
      alert('An error occurred while saving the timezone. Please try again.');
    }

    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
    setSelectedAccess([]);
    setCurrentEvent(null);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/timezone/delete/${id}/`);
      setEvents(events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting timezone:', error);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedDate(event.start);
    setStartTime(event.start);
    setEndTime(event.end);
    setSelectedAccess(event.accessId || []);
    setCurrentEvent(event);
    setOpen(true);
  };

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box display="flex" flexDirection="column" gap={1.5} p={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>Manage Timezones</Typography>
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
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => { setOpen(true); setCurrentEvent(null); }}
              sx={{ maxWidth: '200px', fontSize: '14px' }}
            >
              Create Timezone
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/execute-command-timezone')}
              sx={{ maxWidth: '200px', fontSize: '14px' }}
            >
              Execute Command
            </Button>
          </Box>

          <Box mt={2} sx={{ height: 400 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 350 }}
              selectable
              onSelectSlot={(slotInfo) => {
                setSelectedDate(slotInfo.start);
                setStartTime(slotInfo.start);
                setEndTime(slotInfo.end);
                setOpen(true);
              }}
              onSelectEvent={handleEventSelect}
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
                {currentEvent ? 'Update Timezone' : 'Create Timezone'}
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
                onChange={(newValue) => {
                  console.log('Start Time selected:', newValue);
                  setStartTime(newValue);
                  if (!selectedDate && newValue) {
                    setSelectedDate(newValue);
                  }
                }}
                sx={{ mb: 1 }}
              />
              <DateTimePicker
                renderInput={(props) => <TextField {...props} size="small" />}
                label="End Time"
                value={endTime}
                onChange={(newValue) => {
                  console.log('End Time selected:', newValue);
                  setEndTime(newValue);
                  if (!selectedDate && newValue) {
                    setSelectedDate(newValue);
                  }
                }}
              />

              <Box mt={2} display="flex" justifyContent="space-between">
                <Button variant="outlined" onClick={() => setOpen(false)}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleConfirm}>
                  {currentEvent ? 'Update' : 'Create'}
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
