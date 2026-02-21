import { Table } from "@mantine/core"

const tableData = {
  head: ['ID', 'Name', 'Email', 'Phone', 'Address', 'City', 'Created At', ],
  body: [
    [0, 'Temp Name', 'temp@gmail.com', '000111222', '1 street', 'Warsaw', 'Feb 18, 2025'],
    [1, 'Temp Name2', 'temp2@gmail.com', '1110001222', '2 street', 'Warsaw', 'Feb 18, 2025'],

  ],
};

const Clients = () => {
  return (
    <div>
      <Table data={tableData} stickyHeader stickyHeaderOffset={60} highlightOnHover />
    </div>
  )
}

export default Clients