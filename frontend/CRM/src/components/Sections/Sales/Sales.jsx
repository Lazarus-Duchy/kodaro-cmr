import { Box, Grid, Group, NumberInput, Paper, Select, Stack, Text, TextInput, Title } from "@mantine/core"
import { IconFlame, IconPercentage, IconShoppingBag } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, Cell, Label, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from "recharts"
import SummaryCard from "../../Features/SummaryCard/SummaryCard";
import { TableSort } from "../../Features/TableSort/TableSort";
import { useForm } from "@mantine/form";

const categories = [
  'cat1', 'cat2'
];

const tableData = [
  {id: 0, name: 'Product', price: 1, sku: 10, "category": "cat1"},
  {id: 1, name: 'Product 2', price: 2, sku: 10, "category": "cat2"},
]

const tableValidation = {
  price: (value) => (value >= 0 ? null : 'Price must be greater or equal 0'),
}

const tableStructure = [
  {name: 'id', label: 'ID', type: 'number', isEditable: false, required: true, default: 0}, 
  {name: 'name', label: 'Name', type: 'string', isEditable: true, required: true}, 
  {name: 'sku', label: 'Sku', type: 'number', isEditable: true, required: true}, 
  {name: 'category', label: 'Category', type: 'enum', isEditable: true, required: true}, 
  {name: 'price', label: 'Price', type: 'number', isEditable: true, required: true, default: 1}, 
];

const stats = [
  { title: 'Total sales', value: '12500', diff: 34, icon: <IconShoppingBag size={24} /> },
  { title: 'Hot product sales', value: '188', diff: -12, icon: <IconFlame size={24} /> },
];

const totalSalesData = [
  { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 }, { name: 'May', sales: 1890 }, { name: 'Jun', sales: 6390 },
  { name: 'Jul', sales: 3490 }, { name: 'Aug', sales: 5120 }, { name: 'Sep', sales: 6200 },
  { name: 'Oct', sales: 8400 }, { name: 'Nov', sales: 12500 }, { name: 'Dec', sales: 13650 },
];

const productSalesPercentageData = [
  { name: 'p1', value: 10},
  { name: 'p2', value: 50},
  { name: 'p3', value: 40},
]

const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
const RADIAN = Math.PI / 180;

const Sales = () => {
  const newRowForm = useForm({mode: 'uncontrolled', validate: tableValidation});
  const editRowForm = useForm({mode: 'uncontrolled', validate: tableValidation});

  const newRowFields = [
    <NumberInput key={newRowForm.key("id")} label={'id'} readOnly withAsterisk required {...newRowForm.getInputProps('id')} />,
    <TextInput key={newRowForm.key("name")} label={'name'} withAsterisk required {...newRowForm.getInputProps('name')} />,
    <NumberInput key={newRowForm.key("sku")} min={0} label={'sku'} withAsterisk required {...newRowForm.getInputProps('sku')} />,
    <NumberInput key={newRowForm.key("price")} min={0} label={'price'} withAsterisk required {...newRowForm.getInputProps('price')} />,
    <Select key={newRowForm.key("category")} data={categories} label={'category'} withAsterisk required {...newRowForm.getInputProps('category')}/>
  ]

  const editRowFields = [
    <NumberInput key={editRowForm.key("id")} label={'id'} readOnly withAsterisk required {...editRowForm.getInputProps('id')} />,
    <TextInput key={editRowForm.key("name")} label={'name'} withAsterisk required {...editRowForm.getInputProps('name')} />,
    <NumberInput key={editRowForm.key("sku")} min={0} label={'sku'} withAsterisk required {...editRowForm.getInputProps('sku')} />,
    <NumberInput key={editRowForm.key("price")} min={0} label={'price'} withAsterisk required {...editRowForm.getInputProps('price')} />,
    <Select key={editRowForm.key("category")} data={categories} label={'category'} withAsterisk required {...editRowForm.getInputProps('category')}/>
  ]
  
  const MyCustomPie = (props) => <Sector {...props} fill={colors[props.index % colors.length]} />;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
      return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central">
        {`${((percent ?? 1) * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <Stack gap="lg">
      <Box>
        <Title order={1}>Sales</Title>
        <Text c="dimmed" size="sm">Everything about your sales and products</Text>
      </Box>

      <Grid>
        {stats.map((stat, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 4 }}>
            <SummaryCard title={stat.title} icon={stat.icon} diff={stat.diff} value={stat.value} />
          </Grid.Col>
        ))}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Product Sales Percentage</Text>
            <Text c="clientFlow.4"><IconPercentage size={24} /></Text>
            </Group>
            <Group align="flex-end" gap="xs" mt={10}>
              <ResponsiveContainer width="100%" aspect={1.618}>
                <PieChart>
                  <Pie data={productSalesPercentageData} shape={MyCustomPie} dataKey="value" labelLine={false} label={renderCustomizedLabel} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="xl">Total Sales</Text>
        <Box h={300}>
          <ResponsiveContainer>
            
            <AreaChart data={totalSalesData}>
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
                <Area type="monotone" dataKey="sales" stroke="#88c9c5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <TableSort 
      structure={tableStructure} 
      data={tableData} 
      canEditRows 
      canAddRows 
      canDeleteRows 
      newRowForm = {newRowForm}
      editRowForm = {editRowForm} 
      editRowFields={editRowFields}
      newRowFields={newRowFields}
      addRowsTitle="Add new product" 
      editRowTitle="Edit product" 
      deleteRowTitle="product" 
      addRowBtnInfo="Add new product" 
      deleteRowInfo="Are you sure you want to delete this product? This action is destructive, this data will be gone forever!"
      />
    </Stack>
  )
}

export default Sales