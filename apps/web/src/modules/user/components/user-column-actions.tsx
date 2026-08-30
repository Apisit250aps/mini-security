import { CellContext } from '@tanstack/react-table';
import { User } from '@repo/domains/entities';
import ColumnActions from '@repo/ui/components/shared/dropdown/column-actions';

function UserColumnActions<T extends User>(cell: CellContext<T, unknown>) {
  return (
    <ColumnActions<User>
      actions={{
        edit: (id, data) => {
          // Implement edit action
        },
        delete: (id) => {
          // Implement delete action
        },
      }}
    />
  );
}

export default UserColumnActions;
