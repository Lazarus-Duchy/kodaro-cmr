import {
  IconAddressBook,
  IconCoin,
  IconDeviceDesktop,
  IconDiscount2,
  IconMoodHappy,
  IconReceipt2,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Box, Grid, Paper, Stack, Title, Text, NumberInput, TextInput, Select } from "@mantine/core"
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { useState } from 'react';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';


const tableStructure = [
  { name: 'id',         label: 'ID',          },
  { name: 'name',       label: 'Name',        },
  { name: 'lastname',   label: 'LastName',    },
  { name: 'job_title',  label: 'Job Title',   },
];

const tableValidation = {};

const Contacts = () => {
  const [tableData, setTableData] = useState([]);
  const [jobTitlesData, setJobTitlesData] = useState(['title1', 'title2']);
  const [stats, setStats] = useState([
    { title: 'Total Contacts',  value: '—', icon: <IconAddressBook size={24} /> },
    { title: 'Active Leads', value: '—', desc: "Right now", icon: <IconUsers size={24} /> },
    { title: 'Online Now', value: '—', desc: "Active contacts", icon: <IconDeviceDesktop size={24} /> }
  ]);

  const newRowForm = useForm({mode: 'uncontrolled', initialValues: {}, validate: tableValidation});
  const editRowForm = useForm({mode: 'uncontrolled', initialValues: {}, validate: tableValidation});

  const newRowFields = [
    <NumberInput key={newRowForm.key("id")} label={'Id'} readOnly required {...newRowForm.getInputProps('id')} />,
    <TextInput key={newRowForm.key("name")} label={'Name'} withAsterisk required {...newRowForm.getInputProps('name')} />,
    <TextInput key={newRowForm.key("lastname")} label={'Last Name'} withAsterisk required {...newRowForm.getInputProps('lastname')} />,
    <Select key={newRowForm.key("job_title")} data={jobTitlesData} label={'Job Title'} withAsterisk required {...newRowForm.getInputProps('job_title')}/>
  ]

  const editRowFields = [
    <NumberInput key={editRowForm.key("id")} label={'Id'} readOnly required {...editRowForm.getInputProps('id')} />,
    <TextInput key={editRowForm.key("name")} label={'Name'} withAsterisk required {...editRowForm.getInputProps('name')} />,
    <TextInput key={editRowForm.key("lastname")} label={'Last Name'} withAsterisk required {...editRowForm.getInputProps('lastname')} />,
    <Select key={editRowForm.key("job_title")} data={jobTitlesData} label={'Job Title'} withAsterisk required {...editRowForm.getInputProps('job_title')}/>
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

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Contacts</Title>
        <Text c="dimmed" size="sm">Manage your contact database and communication info</Text>
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
        <Text fw={700} mb="md">Contact List</Text>
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
          addRowsTitle="Add new contact"
          editRowTitle="Edit contact"
          deleteRowTitle="Delete contact"
          addRowBtnInfo="Add new contact"
          deleteRowInfo="Are you sure you want to delete this contact? This action is destructive, this data will be gone forever!"
        />
      </Paper>
    </Stack>
  )
}

export default Contacts;


