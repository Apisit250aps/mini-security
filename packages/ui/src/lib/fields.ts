import { FieldValues, ControllerRenderProps, Path } from 'react-hook-form';

export const parseOnChange = <T extends FieldValues>(
  e: React.ChangeEvent<HTMLInputElement>,
  field: ControllerRenderProps<T, Path<T> & (string | undefined)>,
) => {
  if (e.target.type === 'number') {
    field.onChange(e.target.valueAsNumber);
  } else {
    field.onChange(e);
  }
};
