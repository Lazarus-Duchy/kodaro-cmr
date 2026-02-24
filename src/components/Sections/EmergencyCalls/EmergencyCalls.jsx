import {
  IconPhone,
  IconPhoneCall,
  IconPhoneOff,
  IconPlus,
} from '@tabler/icons-react';
import {
  Box, Grid, Paper, Stack, Title, Text,
  TextInput, Select, Textarea, Badge, Group,
  Modal, Button, LoadingOverlay, Flex, NumberInput,
} from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo, useState } from "react";
import { useForm } from '@mantine/form';
import { useQuery, useMutation } from 'convex/react';
import { api } from "../../../../convex/_generated/api"
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';

// ── Table structure ──────────────────────────────────────────────────────────

const tableStructure = [
  { name: 'caller_name',   label: 'Caller Name',   default: '' },
  { name: 'caller_phone',  label: 'Phone Number',  default: '' },
  { name: 'location',      label: 'Location',      default: '' },
  { name: 'priority',      label: 'Priority',      default: '' },
  { name: 'call_type',     label: 'Call Type',     default: '' },
  { name: 'status',        label: 'Status',        default: '' },
  { name: 'assigned_to',   label: 'Assigned To',   default: '' },
  { name: 'received_at',   label: 'Received At',   default: '' },
];

// ── Option lists ─────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high',     label: 'High' },
  { value: 'medium',   label: 'Medium' },
  { value: 'low',      label: 'Low' },
];

const CALL_TYPE_OPTIONS = [
  { value: 'medical',        label: 'Medical' },
  { value: 'fire',           label: 'Fire' },
  { value: 'rescue',         label: 'Rescue' },
  { value: 'police',         label: 'Police' },
  { value: 'natural_disaster', label: 'Natural Disaster' },
  { value: 'hazmat',         label: 'HazMat' },
  { value: 'other',          label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'pending',     label: 'Pending' },
  { value: 'dispatched',  label: 'Dispatched' },
  { value: 'on_scene',    label: 'On Scene' },
  { value: 'resolved',    label: 'Resolved' },
  { value: 'false_alarm', label: 'False Alarm' },
  { value: 'cancelled',   label: 'Cancelled' },
];

const PRIORITY_COLORS = {
  critical: 'red',
  high:     'orange',
  medium:   'yellow',
  low:      'green',
};

const STATUS_COLORS = {
  pending:     'blue',
  dispatched:  'indigo',
  on_scene:    'violet',
  resolved:    'green',
  false_alarm: 'gray',
  cancelled:   'red',
};

// ── Validation ───────────────────────────────────────────────────────────────

const tableValidation = {
  caller_name:  (v) => (!v ? 'Caller name is required' : null),
  caller_phone: (v) => (!v ? 'Phone number is required' : null),
  location:     (v) => (!v ? 'Location is required' : null),
  priority:     (v) => (!v ? 'Priority is required' : null),
  call_type:    (v) => (!v ? 'Call type is required' : null),
  status:       (v) => (!v ? 'Status is required' : null),
};

// ── Default form values ───────────────────────────────────────────────────────

const initialValues = {
  caller_name:   '',
  caller_phone:  '',
  location:      '',
  priority:      'medium',
  call_type:     'other',
  status:        'pending',
  assigned_to:   '',
  notes:         '',
};

// ── Component ────────────────────────────────────────────────────────────────

const EmergencyCalls = () => {
  const [tableData, setTableData] = useState([]);

  // Convex queries & mutations
  const calls      = useQuery(api.emergencyCalls.list);
  const statsData  = useQuery(api.emergencyCalls.stats);
  const addCall    = useMutation(api.emergencyCalls.create);
  const updateCall = useMutation(api.emergencyCalls.update);
  const removeCall = useMutation(api.emergencyCalls.remove);

  // Sync Convex data into local table state
  useEffect(() => {
    if (calls) {
      setTableData(
        calls.map((c) => ({
          ...c,
          id:          c._id,
          received_at: c._creationTime
            ? new Date(c._creationTime).toLocaleString()
            : '—',
        }))
      );
    }
  }, [calls]);

  // ── Stats ────────────────────────────────────────────────────────────────

  const stats = [
    {
      title: 'Total Calls',
      value: statsData ? String(statsData.total) : '—',
      icon:  <IconPhone size={24} />,
    },
    {
      title: 'Active Calls',
      value: statsData ? String(statsData.active) : '—',
      desc:  'Pending + Dispatched + On Scene',
      icon:  <IconPhoneCall size={24} />,
    },
    {
      title: 'Critical Priority',
      value: statsData ? String(statsData.critical) : '—',
      desc:  'Requires immediate response',
      icon:  <IconPhoneOff size={24} />,
    },
  ];

  // ── Forms ────────────────────────────────────────────────────────────────

  const newRowForm  = useForm({ mode: 'uncontrolled', initialValues, validate: tableValidation });
  const editRowForm = useForm({ mode: 'uncontrolled', initialValues, validate: tableValidation });

  const buildFields = (form) => [
    <TextInput
      key={form.key('caller_name')}
      label="Caller Name"
      withAsterisk
      {...form.getInputProps('caller_name')}
    />,
    <TextInput
      key={form.key('caller_phone')}
      label="Phone Number"
      withAsterisk
      {...form.getInputProps('caller_phone')}
    />,
    <TextInput
      key={form.key('location')}
      label="Location / Address"
      withAsterisk
      {...form.getInputProps('location')}
    />,
    <Select
      key={form.key('priority')}
      label="Priority"
      withAsterisk
      data={PRIORITY_OPTIONS}
      {...form.getInputProps('priority')}
    />,
    <Select
      key={form.key('call_type')}
      label="Call Type"
      withAsterisk
      data={CALL_TYPE_OPTIONS}
      {...form.getInputProps('call_type')}
    />,
    <Select
      key={form.key('status')}
      label="Status"
      withAsterisk
      data={STATUS_OPTIONS}
      {...form.getInputProps('status')}
    />,
    <TextInput
      key={form.key('assigned_to')}
      label="Assigned To"
      placeholder="Responder name or unit"
      {...form.getInputProps('assigned_to')}
    />,
    <Textarea
      key={form.key('notes')}
      label="Notes"
      autosize
      minRows={2}
      {...form.getInputProps('notes')}
    />,
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const newRowFields  = useMemo(() => buildFields(newRowForm),  [newRowForm]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editRowFields = useMemo(() => buildFields(editRowForm), [editRowForm]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  // Strip display-only fields before sending to Convex
  const toPayload = ({ received_at, id, _id, _creationTime, ...rest }) => rest;

  const handleAdd = async (values) => {
    await addCall(toPayload(values));
  };

  const handleEdit = async (id, values) => {
    await updateCall({ id, ...toPayload(values) });
  };

  const handleDelete = async (id) => {
    await removeCall({ id });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Emergency Calls</Title>
        <Text c="dimmed" size="sm">Log and manage incoming emergency call records</Text>
      </Box>

      <Grid>
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard
              title={stat.title}
              icon={stat.icon}
              value={stat.value}
              desc={stat.desc}
            />
          </Grid.Col>
        ))}
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">All Emergency Calls</Text>
        <TableSort
          structure={tableStructure}
          data={tableData}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEditRows
          canAddRows
          canDeleteRows
          newRowForm={newRowForm}
          editRowForm={editRowForm}
          newRowFields={newRowFields}
          editRowFields={editRowFields}
          addRowsTitle="Log new emergency call"
          editRowTitle="Edit emergency call"
          deleteRowTitle="Delete emergency call"
          addRowBtnInfo="Log Call"
          deleteRowInfo="Are you sure you want to delete this call record? This action is destructive and cannot be undone."
        />
      </Paper>
    </Stack>
  );
};

export default EmergencyCalls;