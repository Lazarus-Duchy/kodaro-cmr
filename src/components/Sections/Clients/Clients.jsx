import {
  IconUser,
  IconUserCheck,
  IconUserSearch,
} from '@tabler/icons-react';
import {
  Box, Grid, Paper, Stack, Title, Text,
  TextInput, Select, Textarea,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useForm } from '@mantine/form';
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { get, post, patch, del } from '../../../api';

// ── Table structure ──────────────────────────────────────────────────────────

const tableStructure = [
  { name: 'name',       label: 'Name',       default: '' },
  { name: 'email',      label: 'Email',      default: '' },
  { name: 'phone',      label: 'Phone',      default: '' },
  { name: 'city',       label: 'City',       default: '' },
  { name: 'country',    label: 'Country',    default: '' },
  { name: 'status',     label: 'Status',     default: '' },
  { name: 'industry',   label: 'Industry',   default: '' },
  { name: 'created_at', label: 'Created At', default: '' },
];

// ── Option lists — mirror backend TextChoices ────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'lead',      label: 'Lead' },
  { value: 'prospect',  label: 'Prospect' },
  { value: 'active',    label: 'Active' },
  { value: 'inactive',  label: 'Inactive' },
  { value: 'churned',   label: 'Churned' },
];

const INDUSTRY_OPTIONS = [
  { value: 'technology',    label: 'Technology' },
  { value: 'finance',       label: 'Finance' },
  { value: 'healthcare',    label: 'Healthcare' },
  { value: 'retail',        label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education',     label: 'Education' },
  { value: 'real_estate',   label: 'Real Estate' },
  { value: 'logistics',     label: 'Logistics' },
  { value: 'other',         label: 'Other' },
];

// ── Validation ───────────────────────────────────────────────────────────────

const tableValidation = {
  name:  (v) => (!v ? 'Name is required' : null),
  status:  (v) => (!v ? 'Status is required' : null),
  email: (v) => (v && !/^\S+@\S+$/.test(v) ? 'Invalid email' : null),
};

// ── Default form values — match model defaults ───────────────────────────────

const initialValues = {
  name:          '',
  status:        'lead',
  industry:      'other',
  email:         '',
  phone:         '',
  website:       '',
  address_line1: '',
  address_line2: '',
  city:          '',
  state:         '',
  postal_code:   '',
  country:       '',
  notes:         '',
};

// ── Component ────────────────────────────────────────────────────────────────

const Clients = () => {
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Survivors', value: '—', icon: <IconUser size={24} /> },
    { title: 'Active',          value: '—', desc: 'Status: active',   icon: <IconUserCheck size={24} /> },
    { title: 'Leads',           value: '—', desc: 'Status: lead',     icon: <IconUserSearch size={24} /> },
  ]);

  const newRowForm  = useForm({ mode: 'uncontrolled', initialValues, validate: tableValidation });
  const editRowForm = useForm({ mode: 'uncontrolled', initialValues, validate: tableValidation });

  // ── Field builder ────────────────────────────────────────────────────────

  const buildFields = (form) => [
    <TextInput
      key={form.key('name')}
      label="Name"
      withAsterisk
      {...form.getInputProps('name')}
    />,
    <Select
      key={form.key('status')}
      label="Status"
      withAsterisk
      data={STATUS_OPTIONS}
      {...form.getInputProps('status')}
    />,
    <Select
      key={form.key('industry')}
      label="Industry"
      data={INDUSTRY_OPTIONS}
      {...form.getInputProps('industry')}
    />,
    <TextInput
      key={form.key('email')}
      label="Email"
      {...form.getInputProps('email')}
    />,
    <TextInput
      key={form.key('phone')}
      label="Phone"
      {...form.getInputProps('phone')}
    />,
    <TextInput
      key={form.key('website')}
      label="Website"
      {...form.getInputProps('website')}
    />,
    <TextInput
      key={form.key('address_line1')}
      label="Address Line 1"
      {...form.getInputProps('address_line1')}
    />,
    <TextInput
      key={form.key('address_line2')}
      label="Address Line 2"
      {...form.getInputProps('address_line2')}
    />,
    <TextInput
      key={form.key('city')}
      label="City"
      {...form.getInputProps('city')}
    />,
    <TextInput
      key={form.key('state')}
      label="State / Province"
      {...form.getInputProps('state')}
    />,
    <TextInput
      key={form.key('postal_code')}
      label="Postal Code"
      {...form.getInputProps('postal_code')}
    />,
    <TextInput
      key={form.key('country')}
      label="Country"
      {...form.getInputProps('country')}
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

  // ── Stats helper — driven by /survivors/stats/ ───────────────────────────

  const applyStats = (byStatus) => {
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    setStats([
      { title: 'Total Survivors', value: String(total),                    icon: <IconUser size={24} /> },
      { title: 'Active',          value: String(byStatus['active']  ?? 0), desc: 'Status: active', icon: <IconUserCheck size={24} /> },
      { title: 'Leads',           value: String(byStatus['lead']    ?? 0), desc: 'Status: lead',   icon: <IconUserSearch size={24} /> },
    ]);
  };

  // ── Fetch on mount ───────────────────────────────────────────────────────

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [survivors, statsData] = await Promise.all([
          get('/survivors/'),
          get('/survivors/stats/'),
        ]);
        setTableData(survivors.map((s) => ({
          ...s,
          created_at: s.created_at
            ? new Date(s.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        })));
        applyStats(statsData);
      } catch (error) {
        console.error('Failed to fetch survivors:', error);
      }
    };
    fetchAll();
  }, []);

  const refreshStats = async () => {
    try {
      const statsData = await get('/survivors/stats/');
      applyStats(statsData);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const formatDate = (raw) =>
    raw ? new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const handleAdd = async (values) => {
    const newSurvivor = await post('/survivors/', values);
    setTableData((prev) => [{ ...newSurvivor, created_at: formatDate(newSurvivor.created_at) }, ...prev]);
    await refreshStats();
  };

  const handleEdit = async (id, values) => {
    const updated = await patch(`/survivors/${id}/`, values);
    setTableData((prev) => prev.map((row) => (row.id === id ? updated : row)));
    await refreshStats();
  };

  const handleDelete = async (id) => {
    await del(`/survivors/${id}/`);
    setTableData((prev) => prev.filter((row) => row.id !== id));
    await refreshStats();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Survivors</Title>
        <Text c="dimmed" size="sm">Information about rescue survivors</Text>
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
        <Text fw={700} mb="md">All survivors</Text>
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
          addRowsTitle="Add new survivor"
          editRowTitle="Edit survivor"
          deleteRowTitle="Delete survivor"
          addRowBtnInfo="Add survivor"
          deleteRowInfo="Are you sure you want to delete this survivor? This action is destructive and cannot be undone."
        />
      </Paper>
    </Stack>
  );
};

export default Clients;