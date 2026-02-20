import { 
  Grid, Paper, Text, Group, Table, Badge, Title, Stack, ActionIcon, Button, Box 
} from '@mantine/core';
import { 
  IconArrowUpRight, IconArrowDownRight, IconDotsVertical, IconDownload, 
  IconFilter, IconChartPie, IconUsers, IconCurrencyDollar 
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
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 6390 },
  { name: 'Jul', revenue: 3490 },
  { name: 'Aug', revenue: 5120 },
  { name: 'Sep', revenue: 6200 },
  { name: 'Oct', revenue: 8400 },
  { name: 'Nov', revenue: 12500 },
  { name: 'Dec', revenue: 13650 },
];

const tableData = [
  { id: 1, name: 'test1', date: '2024-05-01', amount: '$4,200', status: 'Completed' },
  { id: 2, name: 'test2', date: '2024-05-05', amount: '$1,850', status: 'Pending' },
  { id: 3, name: 'test3', date: '2024-05-10', amount: '$8,400', status: 'Completed' },
  { id: 4, name: 'test4', date: '2024-05-12', amount: '$540', status: 'Cancelled' },
];

const Reports = () => {
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Box>
          <Title order={1}>Analytics Reports</Title>
          <Text c="dimmed" size="sm">Detailed overview of your business performance</Text>
        </Box>
        <Group>
          <Button variant="default" leftSection={<IconFilter size={16} />}>Filter</Button>
          <Button color="clientFlow.4" leftSection={<IconDownload size={16} />}>Export PDF</Button>
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
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#228be6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#228be6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#228be6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Recent Reports</Title>
          <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
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
            {tableData.map((item) => (
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
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
};

export default Reports;