import {
  IconDeviceDesktop,
  IconUser,
} from '@tabler/icons-react';
import { Box, Grid, Paper, Stack, Title, Text, NumberInput, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useForm } from '@mantine/form';
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { get, post, patch, del } from '../../../api';
import { DateTimePicker } from '@mantine/dates';

const tableStructure = [
  { name: 'id',         label: 'ID',          },
  { name: 'name',       label: 'Name',        },
  { name: 'email',      label: 'Email',       },
  { name: 'phone',      label: 'Phone',       },
  { name: 'city',       label: 'City',        },
  { name: 'created_at', label: 'Created At',  },
];

const tableValidation = {
  // email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
};

const Clients = () => {
  const [tableData, setTableData] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Survivors',  value: '—', icon: <IconUser size={24} /> },
  ]);

  const newRowForm = useForm({mode: 'uncontrolled', initialValues: {}, validate: tableValidation});
  const editRowForm = useForm({mode: 'uncontrolled', initialValues: {}, validate: tableValidation});

  const newRowFields = [
    <NumberInput key={newRowForm.key("id")} label={'Id'} readOnly required {...newRowForm.getInputProps('id')} />,
    <TextInput key={newRowForm.key("name")} label={'Name'} withAsterisk required {...newRowForm.getInputProps('name')} />,
    <TextInput key={newRowForm.key("email")} label={'Email'} withAsterisk required {...newRowForm.getInputProps('email')} />,
    <TextInput key={newRowForm.key("phone")} label={'Phone'} withAsterisk required {...newRowForm.getInputProps('phone')} />,
    <TextInput key={newRowForm.key("city")} label={'City'} withAsterisk required {...newRowForm.getInputProps('city')} />,
    <DateTimePicker key={newRowForm.key("created_at")} label={'Created At'} readOnly required {...newRowForm.getInputProps('created_at')}  />,
  ]

  const editRowFields = [
    <NumberInput key={editRowForm.key("id")} label={'Id'} readOnly required {...editRowForm.getInputProps('id')} />,
    <TextInput key={editRowForm.key("name")} label={'Name'} withAsterisk required {...editRowForm.getInputProps('name')} />,
    <TextInput key={editRowForm.key("email")} label={'Email'} withAsterisk required {...editRowForm.getInputProps('email')} />,
    <TextInput key={editRowForm.key("phone")} label={'Phone'} withAsterisk required {...editRowForm.getInputProps('phone')} />,
    <TextInput key={editRowForm.key("city")} label={'City'} withAsterisk required {...editRowForm.getInputProps('city')} />,
    <DateTimePicker key={editRowForm.key("created_at")} label={'Created At'} readOnly required {...editRowForm.getInputProps('created_at')}  />,
  ]

  
  // ── Fetch clients on mount ───────────────────────────────────────────────────
  
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await get("/clients/");
        setTableData(data);

        // Update summary cards from real data
        const activeCount = data.filter((c) => c.status === "active").length;
        setStats([
          { title: 'Total Survivors',  value: String(data.length),  icon: <IconUser size={24} /> },
        ]);
      } catch (error) {
        console.error("Failed to fetch Survivors", error);
      }
    };
    fetchClients();
  }, []);
  

  // ── CRUD handlers passed to TableSort ───────────────────────────────────────

  const handleAdd = async (values) => {
    
    const newClient = await post("/clients/", values);
    setTableData((prev) => [newClient, ...prev]);
    setStats((prev) => [
      { ...prev[0], value: String(Number(prev[0].value) + 1) },
      prev[1],
    ]);
    
  };

  const handleEdit = async (id, values) => {
    
    const updated = await patch(`/clients/${id}/`, values);
    setTableData((prev) => prev.map((row) => (row.id === id ? updated : row)));
    
  };

  const handleDelete = async (id) => {
    
    await del(`/clients/${id}/`);
    setTableData((prev) => {
      const next = prev.filter((row) => row.id !== id);
      const activeCount = next.filter((c) => c.status === "active").length;
      setStats([
        { title: 'Total Survivors',  value: String(next.length),  icon: <IconUser size={24} /> },
        
      ]);
      return next;
    });
    
  };
  

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Survivors</Title>
        <Text c="dimmed" size="sm">Informations about rescue survivors</Text>
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
          addRowBtnInfo="Add new survivor"
          deleteRowInfo="Are you sure you want to delete this survivor? This action is destructive, this data will be gone forever!"
        />
      </Paper>
    </Stack>
  );
};

export default Clients





