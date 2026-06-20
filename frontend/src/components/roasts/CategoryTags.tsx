import { Badge, Wrap } from '@chakra-ui/react';
import type { RoastSeverity } from '../../types';

interface CategoryTagsProps {
  categories: string[];
  severity: RoastSeverity;
}

const COLOR_PALETTE_BY_SEVERITY: Record<RoastSeverity, string> = {
  low: 'green',
  medium: 'orange',
  high: 'red',
};

function formatCategoryLabel(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Renders the roast's categories as color-coded badges, colored by overall severity. */
export function CategoryTags({ categories, severity }: CategoryTagsProps) {
  const colorPalette = COLOR_PALETTE_BY_SEVERITY[severity];

  if (categories.length === 0) {
    return null;
  }

  return (
    <Wrap gap={2}>
      {categories.map((category) => (
        <Badge key={category} colorPalette={colorPalette} borderRadius="full" px={3} py={1}>
          {formatCategoryLabel(category)}
        </Badge>
      ))}
    </Wrap>
  );
}
