import { Box, Checkbox, Flex, Grid, Group, NumberInput, Paper, ScrollArea, Select, Stack, Text, TextInput, Title } from "@mantine/core"
import { IconFlame, IconPercentage, IconShoppingBag } from "@tabler/icons-react";
import { Area, AreaChart, CartesianGrid, Cell, Label, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from "recharts"
import SummaryCard from "../../Features/SummaryCard/SummaryCard";
import { TableSort } from "../../Features/TableSort/TableSort";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { randomId, useListState } from "@mantine/hooks";

const tableValidation = {

}

const tableStructure = [
  {name: 'id', label: 'ID', type: 'number', isEditable: false, required: true, default: 0}, 
  {name: 'name', label: 'Name', type: 'string', isEditable: true, required: true}, 
  {name: 'sku', label: 'Sku', type: 'number', isEditable: true, required: true}, 
  {name: 'category', label: 'Category', type: 'enum', isEditable: true, required: true}, 
  {name: 'price', label: 'Price', type: 'number', isEditable: true, required: true, default: 1}, 
];

const tempProductSalesData = [
  { name: 'Jan', p1: 4000, p2: 3000, p3: 6000 }, 
  { name: 'Feb', p1: 3000, p2: 3500, p3: 5500 }, 
  { name: 'Mar', p1: 2000, p2: 2700, p3: 4000 },
  { name: 'Apr', p1: 2780, p2: 2500, p3: 3500 }, 
  { name: 'May', p1: 1890, p2: 3000, p3: 6000 }, 
  { name: 'Jun', p1: 6390, p2: 3500, p3: 7200 },
  { name: 'Jul', p1: 3490, p2: 2300, p3: 6700 }, 
  { name: 'Aug', p1: 5120, p2: 2400, p3: 5000 }, 
  { name: 'Sep', p1: 6200, p2: 4000, p3: 4000 },
  { name: 'Oct', p1: 8400, p2: 5000, p3: 1000 }, 
  { name: 'Nov', p1: 12500, p2: 6000, p3: 300 }, 
  { name: 'Dec', p1: 13650, p2: 7000, p3: 20 },
];

const tempproductSalesPercentageData = [
  { name: 'p1', value: 10},
  { name: 'p2', value: 50},
  { name: 'p3', value: 40},
]

const tempProductsDisplay = [
  {name: 'p1', label: 'P1', checked: true, key: randomId()},
  {name: 'p2', label: 'P2', checked: true, key: randomId()},
  {name: 'p3', label: 'P3', checked: true, key: randomId()},
]

const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
const RADIAN = Math.PI / 180;

const Sales = () => {
  const [tableData, setTableData] = useState([{id: 0, name: 'Product', price: 1, sku: 10, "category": "cat1"},{id: 1, name: 'Product 2', price: 2, sku: 10, "category": "cat2"}]);
  const [stats, setStats] = useState([
    { title: 'Total sales',  value: '—', icon: <IconShoppingBag size={24} /> },
    { title: 'Hot category sales', value: '—', icon: <IconFlame size={24} /> },
  ]);
  const [hotProductCategory, sethHotProductCategory] = useState("temp");
  const [productSalesData, setProductSalesData] = useState(tempProductSalesData);
  const [productSalesPercentageData, setProductSalesPercentageData] = useState(tempproductSalesPercentageData);
  const [productsDisplayData, productsDisplayDataHandlers] = useListState(tempProductsDisplay);

  const displayAllChecked = productsDisplayData.every((value) => value.checked);
  const displayIndeterminate = productsDisplayData.some((value) => value.checked) && !displayAllChecked;

  const [productCategoriesData, setProductCategoriesData] = useState(['cat1', 'cat2']);

  const newRowForm = useForm({mode: 'uncontrolled', initialValues: {category: productCategoriesData[0]}, validate: tableValidation});
  const editRowForm = useForm({mode: 'uncontrolled', initialValues: {category: productCategoriesData[0]}, validate: tableValidation});

  const newRowFields = [
    <NumberInput key={newRowForm.key("id")} label={'Id'} readOnly required {...newRowForm.getInputProps('id')} />,
    <TextInput key={newRowForm.key("name")} label={'Name'} withAsterisk required {...newRowForm.getInputProps('name')} />,
    <NumberInput key={newRowForm.key("sku")} min={0} label={'SKU'} withAsterisk required {...newRowForm.getInputProps('sku')} />,
    <NumberInput key={newRowForm.key("price")} min={0} label={'Price'} withAsterisk required {...newRowForm.getInputProps('price')} />,
    <Select key={newRowForm.key("category")} data={productCategoriesData} label={'Category'} withAsterisk required {...newRowForm.getInputProps('category')}/>
  ]

  const editRowFields = [
    <NumberInput key={editRowForm.key("id")} label={'Id'} readOnly required {...editRowForm.getInputProps('id')} />,
    <TextInput key={editRowForm.key("name")} label={'Name'} withAsterisk required {...editRowForm.getInputProps('name')} />,
    <NumberInput key={editRowForm.key("sku")} min={0} label={'SKU'} withAsterisk required {...editRowForm.getInputProps('sku')} />,
    <NumberInput key={editRowForm.key("price")} min={0} label={'Price'} withAsterisk required {...editRowForm.getInputProps('price')} />,
    <Select key={editRowForm.key("category")} data={productCategoriesData} label={'Category'} withAsterisk required {...editRowForm.getInputProps('category')}/>
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
            <SummaryCard title={stat.title} icon={stat.icon} diff={stat.diff} value={stat.value} desc={stat.desc} />
          </Grid.Col>
        ))}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Product Category Sales Percentage</Text>
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
            <Text size="sm" c="dimmed" mt="xs">Hottest category: {hotProductCategory}</Text>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="md">
        <Text fw={700} mb="xl">Sales per Product</Text>
        <Flex wrap="wrap" gap="md">
          <Box h={300} w={{md: "80%", sm: "100%", xs: "100%"}}>
            <ResponsiveContainer>
              <LineChart data={productSalesData}>
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
                {
                  productsDisplayData.map((product, index) => {
                    if (product.checked) {return (
                    <Line key={index} type="monotone" dataKey={product.name} stroke={colors[index % colors.length]} strokeWidth={3} />)}
                  })
                }
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <ScrollArea h="300" w={{md: "15%", sm: "100%"}}>
            <Stack>
              <Checkbox
                checked={displayAllChecked}
                indeterminate={displayIndeterminate}
                label="Show all products"
                onChange={() =>
                  productsDisplayDataHandlers.setState((current) =>
                    current.map((value) => ({ ...value, checked: !displayAllChecked }))
                  )
                }
              />
              {productsDisplayData.map((product, index) => (
                <Checkbox
                  mt="xs"
                  ml={33}
                  label={product.label}
                  key={product.key}
                  checked={product.checked}
                  onChange={(event) => productsDisplayDataHandlers.setItemProp(index, 'checked', event.currentTarget.checked)}
                />
              ))}
          </Stack>
          </ScrollArea>
        </Flex>
        
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