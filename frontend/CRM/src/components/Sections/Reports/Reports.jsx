import { useEffect, useState } from 'react';
import {
  Grid, Paper, Text, Title, Stack, Box, Loader, Center,
import { useEffect, useState } from 'react';
import {
  Grid, Paper, Text, Title, Stack, Box, Loader, Center,
} from '@mantine/core';
import {
  IconCurrencyDollar, IconUsers, IconShoppingCart,
import {
  IconCurrencyDollar, IconUsers, IconShoppingCart,
} from '@tabler/icons-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import SummaryCard from '../../Features/SummaryCard/SummaryCard';
import { get } from '../../../api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Group a flat list of purchases into monthly revenue totals for the current year
function groupByMonth(purchases) {
  const currentYear = new Date().getFullYear();
  const map = {};

  // Pre-fill all 12 months with 0 so months with no purchases still appear
  MONTH_NAMES.forEach((name, i) => {
    map[i + 1] = { name, revenue: 0, count: 0 };
  });

  purchases.forEach((purchase) => {
    const date = new Date(purchase.date);
    if (date.getFullYear() !== currentYear) return;

    const month = date.getMonth() + 1;
    const value = parseFloat(purchase.unit_price ?? 0) * (purchase.quantity ?? 1);
    map[month].revenue += value;
    map[month].count += 1;
  });

  return Object.values(map);
}

const Reports = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    uniqueClients: 0,
  });

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const data = await get('/purchases/');
        const purchases = Array.isArray(data) ? data : (data.results ?? []);

        // Build chart data
        setChartData(groupByMonth(purchases));

        // Build summary stats
        const totalRevenue = purchases.reduce(
          (sum, p) => sum + parseFloat(p.unit_price ?? 0) * (p.quantity ?? 1), 0
        );
        const uniqueClients = new Set(purchases.map((p) => p.client)).size;

        setSummaryStats({
          totalRevenue,
          totalPurchases: purchases.length,
          uniqueClients,
        });
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${summaryStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <IconCurrencyDollar size={24} />,
    },
    {
      title: 'Total Purchases',
      value: String(summaryStats.totalPurchases),
      icon: <IconShoppingCart size={24} />,
    },
    {
      title: 'Unique Clients',
      value: String(summaryStats.uniqueClients),
      icon: <IconUsers size={24} />,
    },
  ];

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    totalPurchases: 0,
    uniqueClients: 0,
  });

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const data = await get('/purchases/');
        const purchases = Array.isArray(data) ? data : (data.results ?? []);

        // Build chart data
        setChartData(groupByMonth(purchases));

        // Build summary stats
        const totalRevenue = purchases.reduce(
          (sum, p) => sum + parseFloat(p.unit_price ?? 0) * (p.quantity ?? 1), 0
        );
        const uniqueClients = new Set(purchases.map((p) => p.client)).size;

        setSummaryStats({
          totalRevenue,
          totalPurchases: purchases.length,
          uniqueClients,
        });
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${summaryStats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <IconCurrencyDollar size={24} />,
    },
    {
      title: 'Total Purchases',
      value: String(summaryStats.totalPurchases),
      icon: <IconShoppingCart size={24} />,
    },
    {
      title: 'Unique Clients',
      value: String(summaryStats.uniqueClients),
      icon: <IconUsers size={24} />,
    },
  ];

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Analytics Reports</Title>
        <Text c="dimmed" size="sm">Monthly revenue overview for {new Date().getFullYear()}</Text>
      </Box>

      <Grid>
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard title={stat.title} icon={stat.icon} value={stat.value} />
          </Grid.Col>
        ))}
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="xl">Monthly Revenue — {new Date().getFullYear()}</Text>
        <Box h={350}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#88c9c5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#88c9c5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#888' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#888' }}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#88c9c5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
                dot={{ r: 4, fill: '#88c9c5', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Monthly breakdown table */}
      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="md">Monthly Breakdown</Text>
        <Grid>
          {chartData.map((month) => (
            <Grid.Col key={month.name} span={{ base: 6, sm: 4, md: 2 }}>
              <Paper withBorder p="sm" radius="md" ta="center">
                <Text size="xs" c="dimmed" fw={600}>{month.name}</Text>
                <Text fw={700} size="sm" mt={4}>
                  ${month.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
                <Text size="xs" c="dimmed">{month.count} orders</Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
};

export default Reports;