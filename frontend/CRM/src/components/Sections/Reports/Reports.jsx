import { useState } from 'react';
import { 
  Grid, Paper, Text, Group, Table, Badge, Title, Stack, ActionIcon, Button, Box, Menu, TextInput 
} from '@mantine/core';
import { 
  IconDotsVertical, IconFilter, IconChartPie, IconUsers, IconCurrencyDollar, IconSearch 
} from '@tabler/icons-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import SummaryCard from '../../Features/SummaryCard/SummaryCard';

const stats = [
  { title: 'Total Revenue', value: '$69,420', diff: 34, icon: <IconCurrencyDollar size={24} /> },
  { title: 'New Clients', value: '188', diff: -12, icon: <IconUsers size={24} /> },
  { title: 'Conversion Rate', value: '21.37%', diff: 18, icon: <IconChartPie size={24} /> },
];

const chartData = [
  { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 }, { name: 'May', revenue: 1890 }, { name: 'Jun', revenue: 6390 },
  { name: 'Jul', revenue: 3490 }, { name: 'Aug', revenue: 5120 }, { name: 'Sep', revenue: 6200 },
  { name: 'Oct', revenue: 8400 }, { name: 'Nov', revenue: 12500 }, { name: 'Dec', revenue: 13650 },
];

const tableData = [
  { id: 1, name: 'Monthly Sales Report', date: '2024-05-01', amount: '$4,200', status: 'Completed' },
  { id: 2, name: 'Quarterly Audit', date: '2024-05-05', amount: '$1,850', status: 'Pending' },
  { id: 3, name: 'Client Acquisition Cost', date: '2024-05-10', amount: '$8,400', status: 'Completed' },
  { id: 4, name: 'Operational Expenses', date: '2024-05-12', amount: '$540', status: 'Cancelled' },
];

const Reports = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredData = tableData.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Box>
          <Title order={1}>Analytics Reports</Title>
          <Text c="dimmed" size="sm">Detailed overview of your business performance</Text>
        </Box>
        <Group>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="default" leftSection={<IconFilter size={16} />}>
                Filter: {statusFilter}
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Status</Menu.Label>
              <Menu.Item onClick={() => setStatusFilter('All')}>All</Menu.Item>
              <Menu.Item onClick={() => setStatusFilter('Completed')}>Completed</Menu.Item>
              <Menu.Item onClick={() => setStatusFilter('Pending')}>Pending</Menu.Item>
              <Menu.Item onClick={() => setStatusFilter('Cancelled')}>Cancelled</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Grid>
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard title={stat.title} icon={stat.icon} diff={stat.diff} value={stat.value} />
          </Grid.Col>
        ))}
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="xl">Revenue Forecast</Text>
        <Box h={300}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#88c9c5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#88c9c5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#88c9c5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Title order={4}>Recent Reports</Title>
            <TextInput 
              placeholder="Search reports..." 
              leftSection={<IconSearch size={14} />} 
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              size="xs"
            />
          </Group>
          
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Report Name</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredData.length > 0 ? filteredData.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td fw={500}>{item.name}</Table.Td>
                  <Table.Td size="sm" c="dimmed">{item.date}</Table.Td>
                  <Table.Td>{item.amount}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={item.status === 'Completed' ? 'green' : item.status === 'Pending' ? 'yellow' : 'red'}>
                      {item.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              )) : (
                <Table.Tr>
                  <Table.Td colSpan={4} ta="center" py="xl" c="dimmed">No reports found</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Reports;