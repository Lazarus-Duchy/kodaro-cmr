import {
  IconCoin,
  IconDiscount2,
  IconReceipt2,
  IconUserPlus,
} from '@tabler/icons-react';
import { Checkbox, Grid, GridCol, Skeleton, Table, TableTbody, TableThead } from "@mantine/core"
import { useState } from "react";
import { TableSort} from "../../Features/TableSort/TableSort";
import SummaryCard from '../../Features/SummaryCard/SummaryCard';

const tableData = [
  {id: 0, name: 'Temp Name', email: 'temp@gmail.com', phone: '000111222', address: '1 street', city: 'Warsaw', createdAt: 'Feb 18, 2026'},
  {id: 1, name: 'Temp Name1', email: '1@gmail.com', phone: '111222333', address: '2 street', city: 'Warsaw', createdAt: 'Feb 20, 2026'},
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

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  receipt: IconReceipt2,
  coin: IconCoin,
};

const Clients = () => {

  return (
    <div>
      <TableSort structure={tableStructure} data={tableData} canEditRows canAddRows canDeleteRows />
    </div>
  )
}

export default Clients