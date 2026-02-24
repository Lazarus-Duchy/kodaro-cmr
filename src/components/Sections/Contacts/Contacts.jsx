import {
  IconAddressBook,
  IconUsers,
  IconBeach,
} from '@tabler/icons-react';
import {
  Box, Grid, Paper, Stack, Title, Text,
  TextInput, Select, Textarea, NumberInput,
} from "@mantine/core";
import { DateInput } from '@mantine/dates';
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@mantine/form';
import { get, post, patch, del } from '../../../api';

// ── Table structure — maps backend fields to visible columns ─────────────────

const tableStructure = [
  { name: 'first_name',       label: 'Name',            default: '' },
  { name: 'last_name',        label: 'Surname',         default: '' },
  { name: 'email',            label: 'Email',           default: '' },
  { name: 'position',         label: 'Position',        default: '' },
  { name: 'department',       label: 'Department',      default: '' },
  { name: 'employment_type',  label: 'Employment Type', default: '' },
  { name: 'status',           label: 'Status',          default: '' },
];

// ── Option lists — kept in sync with backend TextChoices ────────────────────

const STATUS_OPTIONS = [
  { value: 'active',      label: 'Active' },
  { value: 'inactive',    label: 'Inactive' },
  { value: 'on_leave',    label: 'On Leave' },
  { value: 'terminated',  label: 'Terminated' },
  { value: 'intern',      label: 'Intern' },
];

const DEPARTMENT_OPTIONS = [
  { value: 'it',          label: 'IT' },
  { value: 'hr',          label: 'HR' },
  { value: 'finance',     label: 'Finance' },
  { value: 'sales',       label: 'Sales' },
  { value: 'marketing',   label: 'Marketing' },
  { value: 'operations',  label: 'Operations' },
  { value: 'management',  label: 'Management' },
  { value: 'logistics',   label: 'Logistics' },
  { value: 'other',       label: 'Other' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time',   label: 'Full Time' },
  { value: 'part_time',   label: 'Part Time' },
  { value: 'contract',    label: 'Contract' },
  { value: 'intern',      label: 'Intern' },
  { value: 'b2b',         label: 'B2B' },
];

// ── Form validation ──────────────────────────────────────────────────────────

const tableValidation = {
  first_name: (v) => (!v ? 'Name is required' : null),
  last_name:  (v) => (!v ? 'Surname is required' : null),
  email:      (v) => (!v ? 'Email is required' : !/^\S+@\S+$/.test(v) ? 'Invalid email' : null),
};

// ── Default values matching backend model defaults ───────────────────────────

const initialValues = {
  first_name:       '',
  last_name:        '',
  email:            '',
  phone:            '',
  position:         '',
  status:           'active',
  department:       'other',
  employment_type:  'full_time',
  address_line1:    '',
  address_line2:    '',
  city:             '',
  state:            '',
  postal_code:      '',
  country:          '',
  hire_date:        null,
  termination_date: null,
  salary:           null,
  notes:            '',
};

// ── Component ────────────────────────────────────────────────────────────────

const Contacts = () => {
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Rescuers', value: '—', icon: <IconAddressBook size={24} /> },
    { title: 'Active',         value: '—', desc: 'Status: active',   icon: <IconUsers size={24} /> },
    { title: 'On Leave',       value: '—', desc: 'Status: on leave', icon: <IconBeach size={24} /> },
  ]);

  const newRowForm  = useForm({ mode: 'uncontrolled', initialValues, validate: tableValidation });
  const editRowForm = useForm({ mode: 'uncontrolled', initialValues, validate: tableValidation });

  // ── Shared field definitions ─────────────────────────────────────────────

  const buildFields = (form) => [
    // ── Personal
    <TextInput
      key={form.key('first_name')}
      label="First Name"
      withAsterisk
      {...form.getInputProps('first_name')}
    />,
    <TextInput
      key={form.key('last_name')}
      label="Last Name"
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
      key={form.key('phone')}
      label="Phone"
      {...form.getInputProps('phone')}
    />,

    // ── Employment
    <TextInput
      key={form.key('position')}
      label="Position"
      {...form.getInputProps('position')}
    />,
    <Select
      key={form.key('department')}
      label="Department"
      data={DEPARTMENT_OPTIONS}
      {...form.getInputProps('department')}
    />,
    <Select
      key={form.key('employment_type')}
      label="Employment Type"
      data={EMPLOYMENT_TYPE_OPTIONS}
      {...form.getInputProps('employment_type')}
    />,
    <Select
      key={form.key('status')}
      label="Status"
      data={STATUS_OPTIONS}
      {...form.getInputProps('status')}
    />,
    <NumberInput
      key={form.key('salary')}
      label="Salary"
      decimalScale={2}
      min={0}
      prefix="$"
      {...form.getInputProps('salary')}
    />,

    // ── Dates
    <DateInput
      key={form.key('hire_date')}
      label="Hire Date"
      valueFormat="YYYY-MM-DD"
      {...form.getInputProps('hire_date')}
    />,
    <DateInput
      key={form.key('termination_date')}
      label="Termination Date"
      valueFormat="YYYY-MM-DD"
      {...form.getInputProps('termination_date')}
    />,

    // ── Address
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

    // ── Notes
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

  // ── Stats helper ─────────────────────────────────────────────────────────

  const applyStats = (byStatus) => {
    setStats([
      {
        title: 'Total Rescuers',
        value: String(Object.values(byStatus).reduce((a, b) => a + b, 0)),
        icon: <IconAddressBook size={24} />,
      },
      {
        title: 'Active',
        value: String(byStatus['active'] ?? 0),
        desc: 'Status: active',
        icon: <IconUsers size={24} />,
      },
      {
        title: 'On Leave',
        value: String(byStatus['on_leave'] ?? 0),
        desc: 'Status: on leave',
        icon: <IconBeach size={24} />,
      },
    ]);
  };

  // ── Serialize form values before sending to API ──────────────────────────
  // DateInput returns Date objects; the backend expects "YYYY-MM-DD" strings.

  const serializeValues = (values) => {
    const toDateStr = (v) => {
      if (!v) return null;
      if (typeof v === 'string') return v;
      const d = new Date(v);
      return isNaN(d) ? null : d.toISOString().slice(0, 10);   // "YYYY-MM-DD"
    };

    // NumberInput returns "" when cleared — backend DecimalField rejects that.
    const toDecimal = (v) => (v === '' || v === undefined ? null : v);

    // Send null instead of empty string for optional text fields so DRF
    // doesn't attempt to coerce "" into typed fields (dates, decimals, etc.)
    const toOptStr = (v) => (v === '' ? null : v ?? null);

    return {
      ...values,
      salary:           toDecimal(values.salary),
      hire_date:        toDateStr(values.hire_date),
      termination_date: toDateStr(values.termination_date),
      // Optional text fields — keep empty strings as-is (CharField accepts them)
      // but strip undefined so we never accidentally send it
      phone:        values.phone        ?? '',
      position:     values.position     ?? '',
      address_line1: values.address_line1 ?? '',
      address_line2: values.address_line2 ?? '',
      city:         values.city         ?? '',
      state:        values.state        ?? '',
      postal_code:  values.postal_code  ?? '',
      country:      values.country      ?? '',
      notes:        values.notes        ?? '',
    };
  };

  // ── Fetch data on mount ──────────────────────────────────────────────────

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rescuers, statsData] = await Promise.all([
          get('/rescuers/'),
          get('/rescuers/stats/'),
        ]);
        setTableData(rescuers);
        applyStats(statsData.by_status ?? {});
      } catch (error) {
        console.error('Failed to fetch rescuers:', error);
      }
    };
    fetchAll();
  }, []);

  // Refresh stats from the dedicated endpoint after any mutation
  const refreshStats = async () => {
    try {
      const statsData = await get('/rescuers/stats/');
      applyStats(statsData.by_status ?? {});
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  // ── CRUD handlers ────────────────────────────────────────────────────────

  const handleAdd = async (values) => {
    const newRescuer = await post('/rescuers/', serializeValues(values));
    setTableData((prev) => [newRescuer, ...prev]);
    await refreshStats();
  };

  const handleEdit = async (id, values) => {
    const updated = await patch(`/rescuers/${id}/`, serializeValues(values));
    setTableData((prev) => prev.map((row) => (row.id === id ? updated : row)));
    await refreshStats();
  };

  const handleDelete = async (id) => {
    await del(`/rescuers/${id}/`);
    setTableData((prev) => prev.filter((row) => row.id !== id));
    await refreshStats();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Rescuers</Title>
        <Text c="dimmed" size="sm">Manage your rescue team members</Text>
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
        <Text fw={700} mb="md">Rescuer List</Text>
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
          addRowsTitle="Add new rescuer"
          editRowTitle="Edit rescuer"
          deleteRowTitle="Delete rescuer"
          addRowBtnInfo="Add rescuer"
          deleteRowInfo="Are you sure you want to delete this rescuer? This action is destructive and cannot be undone."
        />
      </Paper>
    </Stack>
  );
};

export default Contacts;