import { Badge, type BadgeProps } from '@chakra-ui/react';
import type { AssignmentStatus } from '../../types';

interface StatusBadgeProps extends Omit<BadgeProps, 'colorPalette'> {
  status: AssignmentStatus;
}

const STATUS_COLOR_PALETTE: Record<AssignmentStatus, string> = {
  draft: 'gray',
  submitted: 'blue',
  reviewed: 'green',
};

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
};

/**
 * Color-coded status indicator for an assignment, per the project rule:
 * draft=gray, submitted=blue, reviewed=green.
 */
export function StatusBadge({ status, ...rest }: StatusBadgeProps) {
  return (
    <Badge colorPalette={STATUS_COLOR_PALETTE[status]} borderRadius="full" px={3} py={1} {...rest}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
