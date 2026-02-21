import {
  IconCoin,
  IconDeviceDesktop,
  IconDiscount2,
  IconDotsCircleHorizontal,
  IconMoodHappy,
  IconReceipt2,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';
import { Box, Button, Checkbox, Grid, GridCol, Group, Paper, Skeleton, Stack, Table, TableTbody, TableThead, Title, Text } from "@mantine/core"
import { useState } from "react";
import { TableSort} from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';

const tableData = [
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

]

const tableStructure = [
  {name: 'id', label: 'ID', type: 'number', isEditable: false, required: true, default: 0}, 
  {name: 'name', label: 'Name', type: 'string', isEditable: true, required: true}, 
  {name: 'email', label: 'Email', type: 'string', isEditable: true, required: true}, 
  {name: 'phone', label: 'Phone', type: 'string', isEditable: true, required: true}, 
  {name: 'address', label: 'Address', type: 'string', isEditable: true, required: true}, 
  {name: 'city', label: 'City', type: 'string', isEditable: true, required: true}, 
  {name: 'createdAt', label: 'Created At', type: 'date', isEditable: false, required: true, default: 'Feb 20, 2026'}
];

const tableValidation = {
  email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
};

const stats = [
  { title: 'Total Clients', value: '188', diff: -12, icon: <IconUser size={24} /> },
  { title: 'Happy Clients', value: '21.37%', diff: 18, icon: <IconMoodHappy size={24} /> },
  { title: 'Active Clients', value: '188', desc: "Right now", icon: <IconDeviceDesktop size={24} /> },
];

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

const Clients = () => {

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Clients</Title>
        <Text c="dimmed" size="sm">Informations about your clients</Text>
      </Box>

      <Grid>
        {stats.map((stat, index) => (

          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard title={stat.title} icon={stat.icon} diff={stat.diff} value={stat.value} desc={stat.desc} />
            
          </Grid.Col>
        ))}
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">All clients</Text>
        <TableSort structure={tableStructure} data={tableData} canEditRows canAddRows canDeleteRows validation={tableValidation} addRowsTitle="Add new client" editRowTitle="Edit client" deleteRowTitle="Delete client" addRowBtnInfo="Add new client" deleteRowInfo="Are you sure you want to delete this client? This action is destructive, this data will be gone forever!" />
      </Paper>

    </Stack>
  )
}

export default Clients





