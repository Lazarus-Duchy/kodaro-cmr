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
import { Box, Grid, Paper, Stack, Title, Text } from "@mantine/core"
import { TableSort } from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';

const contactData = [
 {id: 0, name: 'Temp Name', email: 'temp@gmail.com', phone: '000111222', address: '1 street', city: 'Warsaw', createdAt: 'Feb 18, 2026'},
  {id: 1, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 2, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 3, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 4, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 5, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 6, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 7, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 8, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 9, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 10, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 11, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 12, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 13, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
  {id: 14, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},

];

const contactTableStructure = [
  {name: 'id', label: 'ID', type: 'number', isEditable: false, required: true, default: 0}, 
  {name: 'name', label: 'Full Name', type: 'string', isEditable: true, required: true}, 
  {name: 'email', label: 'Email', type: 'string', isEditable: true, required: true}, 
  {name: 'phone', label: 'Phone Number', type: 'string', isEditable: true, required: true}, 
  {name: 'address', label: 'Address', type: 'string', isEditable: true, required: true}, 
  {name: 'city', label: 'City', type: 'string', isEditable: true, required: true}, 
  {name: 'createdAt', label: 'Added Date', type: 'date', isEditable: false, required: true, default: 'Feb 21, 2026'}
];

const contactValidation = {
  email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email address'),
};

const contactStats = [
  { title: 'Total Contacts', value: '420', diff: 14, icon: <IconAddressBook size={24} /> },
  { title: 'Active Leads', value: '412', diff: -5, icon: <IconUsers size={24} /> },
  { title: 'Online Now', value: '300', desc: "Active contacts", icon: <IconDeviceDesktop size={24} /> },
];

const Contacts = () => {
  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Contacts</Title>
        <Text c="dimmed" size="sm">Manage your contact database and communication info</Text>
      </Box>

      <Grid>
        {contactStats.map((stat, index) => (
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
          structure={contactTableStructure} 
          data={contactData} 
          canEditRows 
          canAddRows 
          canDeleteRows 
          validation={contactValidation} 
          addRowsTitle="Add new contact" 
          editRowTitle="Edit contact" 
          deleteRowTitle="Delete contact" 
          addRowBtnInfo="Add new contact" 
          deleteRowInfo="Are you sure you want to delete this contact? This action is permanent and all contact data will be removed." 
        />
      </Paper>
    </Stack>
  )
}

export default Contacts;


