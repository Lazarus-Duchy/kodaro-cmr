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
  { name: 'stanowisko', label: 'Position',   default: '' },
];

const DZIAL_OPTIONS = [
  { value: 'it',        label: 'IT' },
  { value: 'hr',        label: 'HR' },
  { value: 'finanse',   label: 'Finanse' },
  { value: 'sprzedaz',  label: 'Sprzedaż' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operacje',  label: 'Operacje' },
  { value: 'zarzad',    label: 'Zarząd' },
  { value: 'logistyka', label: 'Logistyka' },
  { value: 'inny',      label: 'Inny' },
];

const STATUS_OPTIONS = [
  { value: 'aktywny',     label: 'Aktywny' },
  { value: 'nieaktywny',  label: 'Nieaktywny' },
  { value: 'urlop',       label: 'Na urlopie' },
  { value: 'zwolniony',   label: 'Zwolniony' },
  { value: 'staz',        label: 'Staż' },
];

const tableValidation = {
  first_name: (v) => (!v ? 'Name is required' : null),
  last_name:  (v) => (!v ? 'Surname is required' : null),
  email:      (v) => (!v ? 'Email is required' : null),
};

// ── Component ────────────────────────────────────────────────────────────────

const Contacts = () => {
  const [tableData, setTableData]   = useState([]);
  const [stats, setStats]           = useState([
    { title: 'Total Workers',   value: '—', icon: <IconAddressBook size={24} /> },
    { title: 'Active Workers',  value: '—', desc: 'Status: aktywny', icon: <IconUsers size={24} /> },
    { title: 'On Leave',        value: '—', desc: 'Status: urlop',   icon: <IconDeviceDesktop size={24} /> },
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
    <TextInput
      key={form.key('stanowisko')}
      label="Position"
      {...form.getInputProps('stanowisko')}
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
      key={form.key('dzial')}
      label="Department"
      data={DZIAL_OPTIONS}
      {...form.getInputProps('dzial')}
    />,
  ];

  const newRowFields  = buildFields(newRowForm);
  const editRowFields = buildFields(editRowForm);

  // ── Helper — update summary cards ─────────────────────────────────────────

  const updateStats = (data) => {
    const active  = data.filter((w) => w.status === 'aktywny').length;
    const onLeave = data.filter((w) => w.status === 'urlop').length;
    setStats([
      { title: 'Total Workers',  value: String(data.length), icon: <IconAddressBook size={24} /> },
      { title: 'Active Workers', value: String(active),       desc: 'Status: aktywny', icon: <IconUsers size={24} /> },
      { title: 'On Leave',       value: String(onLeave),      desc: 'Status: urlop',   icon: <IconDeviceDesktop size={24} /> },
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
