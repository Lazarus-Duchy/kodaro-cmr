import {
  IconDeviceDesktop,
  IconUser,
} from '@tabler/icons-react';
import { Box, Grid, Paper, Stack, Title, Text, NumberInput, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useForm } from '@mantine/form';
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
//import { get, post, patch, del } from '../../../api';
import { DateTimePicker } from '@mantine/dates';

const tableStructure = [
  { name: 'id',         label: 'ID',         type: 'number', isEditable: false, required: false},
  { name: 'name',       label: 'Name',        type: 'string', isEditable: true,  required: true },
  { name: 'email',      label: 'Email',       type: 'string', isEditable: true,  required: false },
  { name: 'phone',      label: 'Phone',       type: 'string', isEditable: true,  required: false },
  { name: 'city',       label: 'City',        type: 'string', isEditable: true,  required: false },
  { name: 'created_at', label: 'Created At',  type: 'date',   isEditable: false, required: false },
];

const tableValidation = {
  // email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
};

const Clients = () => {
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Clients',  value: '—', icon: <IconUser size={24} /> },
    { title: 'Active Clients', value: '—', desc: "Right now", icon: <IconDeviceDesktop size={24} /> },
  ]);

  const newRowForm = useForm({mode: 'uncontrolled', validate: tableValidation});
  const editRowForm = useForm({mode: 'uncontrolled', validate: tableValidation});

  const newRowFields = [
    <NumberInput key={newRowForm.key("id")} label={'id'} readOnly required {...newRowForm.getInputProps('id')} />,
    <TextInput key={newRowForm.key("name")} label={'name'} withAsterisk required {...newRowForm.getInputProps('name')} />,
    <TextInput key={newRowForm.key("email")} label={'email'} withAsterisk required {...newRowForm.getInputProps('email')} />,
    <TextInput key={newRowForm.key("phone")} label={'phone'} withAsterisk required {...newRowForm.getInputProps('phone')} />,
    <TextInput key={newRowForm.key("city")} label={'city'} withAsterisk required {...newRowForm.getInputProps('city')} />,
    <DateTimePicker key={newRowForm.key("created_at")} label={'created_at'} readOnly required {...newRowForm.getInputProps('created_at')}  />,
  ]

  const editRowFields = [
    <NumberInput key={editRowForm.key("id")} label={'id'} readOnly required {...editRowForm.getInputProps('id')} />,
    <TextInput key={editRowForm.key("name")} label={'name'} withAsterisk required {...editRowForm.getInputProps('name')} />,
    <TextInput key={editRowForm.key("email")} label={'email'} withAsterisk required {...editRowForm.getInputProps('email')} />,
    <TextInput key={editRowForm.key("phone")} label={'phone'} withAsterisk required {...editRowForm.getInputProps('phone')} />,
    <TextInput key={editRowForm.key("city")} label={'city'} withAsterisk required {...editRowForm.getInputProps('city')} />,
    <DateTimePicker key={editRowForm.key("created_at")} label={'created_at'} readOnly required {...editRowForm.getInputProps('created_at')}  />,
  ]

  /*
  // ── Fetch clients on mount ───────────────────────────────────────────────────
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await get("/clients/");
        setTableData(data);

        // Update summary cards from real data
        const activeCount = data.filter((c) => c.status === "active").length;
        setStats([
          { title: 'Total Clients',  value: String(data.length),  icon: <IconUser size={24} /> },
          { title: 'Active Clients', value: String(activeCount), desc: "Right now", icon: <IconDeviceDesktop size={24} /> },
        ]);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };
    fetchClients();
  }, []);
  */

  // ── CRUD handlers passed to TableSort ───────────────────────────────────────

  const handleAdd = async (values) => {
    /*
    const newClient = await post("/clients/", values);
    setTableData((prev) => [newClient, ...prev]);
    setStats((prev) => [
      { ...prev[0], value: String(Number(prev[0].value) + 1) },
      prev[1],
    ]);
    */
  };

  const handleEdit = async (id, values) => {
    /*
    const updated = await patch(`/clients/${id}/`, values);
    setTableData((prev) => prev.map((row) => (row.id === id ? updated : row)));
    */
  };

  const handleDelete = async (id) => {
    /*
    await del(`/clients/${id}/`);
    setTableData((prev) => {
      const next = prev.filter((row) => row.id !== id);
      const activeCount = next.filter((c) => c.status === "active").length;
      setStats([
        { title: 'Total Clients',  value: String(next.length),  icon: <IconUser size={24} /> },
        { title: 'Active Clients', value: String(activeCount), desc: "Right now", icon: <IconDeviceDesktop size={24} /> },
      ]);
      return next;
    });
    */
  };
  

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Clients</Title>
        <Text c="dimmed" size="sm">Informations about your clients</Text>
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
        <Text fw={700} mb="md">All clients</Text>
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
          addRowsTitle="Add new client"
          editRowTitle="Edit client"
          deleteRowTitle="Delete client"
          addRowBtnInfo="Add new client"
          deleteRowInfo="Are you sure you want to delete this client? This action is destructive, this data will be gone forever!"
        />
      </Paper>
    </Stack>
  );
};

export default Clients





