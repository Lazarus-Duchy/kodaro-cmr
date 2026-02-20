import {
  IconCoin,
  IconDiscount2,
  IconReceipt2,
  IconUserPlus,
} from '@tabler/icons-react';
import { Checkbox, Skeleton, Table, TableTbody, TableThead } from "@mantine/core"
import { useState } from "react";
import { TableSort} from "../../Features/TableSort/TableSort";
import SummaryCard from "../../Features/SummaryCard/summaryCard";

const tableData = [
  {id: 0, name: 'Temp Name', email: 'temp@gmail.com', phone: '000111222', address: '1 street', city: 'Warsaw', createdAt: 'Feb 18, 2026'},
  {id: 1, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
]

const tableStructure = [
  {name: 'id', label: 'ID'}, 
  {name: 'name', label: 'Name'}, 
  {name: 'email', label: 'Email'}, 
  {name: 'phone', label: 'Phone'}, 
  {name: 'address', label: 'Address'}, 
  {name: 'city', label: 'City'}, 
  {name: 'createdAt', label: 'Created At'}
];

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

const Clients = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  /*
  const headRows = tableData.head.map((element, index) => (
    <Table.Th key={index}>{element}</Table.Th>
  ));

  const rows = tableData.body.map((element) => (
    <Table.Tr
      key={element.id}
      bg={selectedRows.includes(element.id) ? 'var(--mantine-color-blue-light)' : undefined}
    >
      <Table.Td>
        <Checkbox
          aria-label="Select row"
          checked={selectedRows.includes(element.id)}
          onChange={(event) =>
            setSelectedRows(
              event.currentTarget.checked
                ? [...selectedRows, element.id]
                : selectedRows.filter((id) => id !== element.id)
            )
          }
        />
      </Table.Td>
      <Table.Td>{element.id}</Table.Td>
      <Table.Td>{element.name}</Table.Td>
      <Table.Td>{element.email}</Table.Td>
      <Table.Td>{element.phone}</Table.Td>
      <Table.Td>{element.address}</Table.Td>
      <Table.Td>{element.city}</Table.Td>
      <Table.Td>{element.createdAt}</Table.Td>
    </Table.Tr>
  ));
*/
  return (
    <div>
      <TableSort structure={tableStructure} data={tableData}>

      </TableSort>

      <SummaryCard title="Revenue" value={13.456} diffrence={34} desc="Compared to previous month" icon={<IconReceipt2 size={22} stroke={1.5} />} />
    </div>
  )
  /*
  <Table.Th />
            {headRows}
  */
}

export default Clients