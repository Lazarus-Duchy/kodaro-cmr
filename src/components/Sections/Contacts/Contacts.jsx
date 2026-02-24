import {
  IconAddressBook,
  IconDeviceDesktop,
  IconUsers,
} from '@tabler/icons-react';
import { Box, Grid, Paper, Stack, Title, Text, TextInput, Select } from "@mantine/core";
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { get, post, patch, del } from '../../../api';

// ── Table structure — maps backend fields to column labels ───────────────────

const tableStructure = [
  { name: 'id',         label: 'ID',         default: '' },
  { name: 'first_name', label: 'Name',       default: '' },
  { name: 'last_name',  label: 'Surname',    default: '' },
  { name: 'team',       label: 'Team',       default: '' },
];

const TEAM_OPTIONS = [
  { value: 'team1',     label: 'Team n1' },
  { value: 'team2',     label: 'Team n2' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'rescurer',   label: 'Rescurer' },
  { value: 'other',      label: 'Other' },
]

const STATUS_OPTIONS = [
  { value: 'online',     label: 'Online' },
  { value: 'offline',    label: 'Offline' },
  { value: 'onleave',    label: 'On leave' },
  { value: 'fired',      label: 'Fired' },
  { value: 'practice',   label: 'Practice' },
];

const tableValidation = {
  first_name: (v) => (!v ? 'Name is required' : null),
  last_name:  (v) => (!v ? 'Surname is required' : null),
  email:      (v) => (!v ? 'Email is required' : null),
  team:       (v) => (!v ? 'Team is required' : null),
};

// ── Component ────────────────────────────────────────────────────────────────

const Contacts = () => {
  const [tableData, setTableData]   = useState([]);
  const [stats, setStats]           = useState([
    { title: 'Total Workers',   value: '—', icon: <IconAddressBook size={24} /> },
    { title: 'Active Workers',  value: '—', desc: 'Status: online', icon: <IconUsers size={24} /> },
    { title: 'On Leave',        value: '—', desc: 'Status: on leave',   icon: <IconDeviceDesktop size={24} /> },
  ]);

  const newRowForm  = useForm({ mode: 'uncontrolled', initialValues: {}, validate: tableValidation });
  const editRowForm = useForm({ mode: 'uncontrolled', initialValues: {}, validate: tableValidation });

  // ── Shared field definitions ───────────────────────────────────────────────

  const buildFields = (form) => [
    <TextInput
      key={form.key('first_name')}
      label="Name"
      withAsterisk
      {...form.getInputProps('first_name')}
    />,
    <TextInput
      key={form.key('last_name')}
      label="Surname"
      withAsterisk
      {...form.getInputProps('last_name')}
    />,
    <TextInput
      key={form.key('email')}
      label="Email"
      withAsterisk
      {...form.getInputProps('email')}
    />,
    <Select
      key={form.key('team')}
      label="Team"
      data={TEAM_OPTIONS}
      {...form.getInputProps('team')}
      withAsterisk
    />,
    <TextInput
      key={form.key('phone')}
      label="Phone"
      {...form.getInputProps('phone')}
    />,
    <Select
      key={form.key('status')}
      label="Status"
      data={STATUS_OPTIONS}
      {...form.getInputProps('status')}
    />,
    <Select
      key={form.key('department')}
      label="Department"
      data={DEPARTMENT_OPTIONS}
      {...form.getInputProps('department')}
    />,
  ];

  const newRowFields  = buildFields(newRowForm);
  const editRowFields = buildFields(editRowForm);

  // ── Helper — update summary cards ─────────────────────────────────────────

  const updateStats = (data) => {
    const active  = data.filter((w) => w.status === 'online').length;
    const onLeave = data.filter((w) => w.status === 'onleave').length;
    setStats([
      { title: 'Total Workers',  value: String(data.length), icon: <IconAddressBook size={24} /> },
      { title: 'Active Workers', value: String(active),       desc: 'Status: online', icon: <IconUsers size={24} /> },
      { title: 'On Leave',       value: String(onLeave),      desc: 'Status: on leave',   icon: <IconDeviceDesktop size={24} /> },
    ]);
  };

  // ── Fetch workers on mount ─────────────────────────────────────────────────

  useEffect(() => {
    const fetchPracownicy = async () => {
      try {
        const data = await get('/pracownicy/');
        setTableData(data);
        updateStats(data);
      } catch (error) {
        console.error('Failed to fetch pracownicy:', error);
      }
    };
    fetchPracownicy();
  }, []);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    const newWorker = await post('/pracownicy/', values);
    setTableData((prev) => {
      const next = [newWorker, ...prev];
      updateStats(next);
      return next;
    });
  };

  const handleEdit = async (id, values) => {
    const updated = await patch(`/pracownicy/${id}/`, values);
    setTableData((prev) => {
      const next = prev.map((row) => (row.id === id ? updated : row));
      updateStats(next);
      return next;
    });
  };

  const handleDelete = async (id) => {
    await del(`/pracownicy/${id}/`);
    setTableData((prev) => {
      const next = prev.filter((row) => row.id !== id);
      updateStats(next);
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Workers</Title>
        <Text c="dimmed" size="sm">Manage your employee database</Text>
      </Box>

      <Grid>
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard
              title={stat.title}
              icon={stat.icon}
              diff={stat.diff}
              value={stat.value}
              desc={stat.desc}
            />
          </Grid.Col>
        ))}
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">Worker List</Text>
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
          addRowsTitle="Add new worker"
          editRowTitle="Edit worker"
          deleteRowTitle="Delete worker"
          addRowBtnInfo="Add worker"
          deleteRowInfo="Are you sure you want to delete this worker? This action is destructive and cannot be undone."
        />
      </Paper>
    </Stack>
  );
};

export default Contacts;
