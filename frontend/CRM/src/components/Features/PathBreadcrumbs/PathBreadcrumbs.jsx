import { Anchor, Breadcrumbs } from '@mantine/core';

const PathBreadcrumbs = ({ pathSteps }) => {

  return (
    <Breadcrumbs separator=">">
    {pathSteps.map((item, index) => (
        <Anchor href={item.href} key={index}>
          {item.label}
        </Anchor>
    ))}
    </Breadcrumbs>
  )
}

export default PathBreadcrumbs