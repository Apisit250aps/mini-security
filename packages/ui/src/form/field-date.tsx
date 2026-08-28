import { Field, FieldLabel } from '@repo/ui/components/field';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Popover } from '@repo/ui/components/popover';
import { DialogTrigger, Dialog } from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { format } from 'date-fns';
import { Calendar } from '@repo/ui/components/calendar';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';

// react-hook-form stores a plain JS Date; Calendar needs a react-aria DateValue
function toDateValue(value: unknown): CalendarDate | null {
  const date = value instanceof Date ? value : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

function DateField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
}: {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        return (
          <Field className="mx-auto">
            {label && (
              <FieldLabel htmlFor="date-picker-simple">{label}</FieldLabel>
            )}
            <DialogTrigger>
              <Button
                variant="outline"
                id="date-picker-simple"
                className="justify-start font-normal"
              >
                {field.value != null && field.value !== '' ? (
                  format(field.value, 'PPP')
                ) : (
                  <span>{placeholder ?? 'Pick a date'}</span>
                )}
              </Button>
              <Popover className="w-auto p-0" placement="bottom start">
                <Dialog>
                  <Calendar
                    value={toDateValue(field.value)}
                    onChange={(date) =>
                      field.onChange(
                        date ? date.toDate(getLocalTimeZone()) : null,
                      )
                    }
                  />
                </Dialog>
              </Popover>
            </DialogTrigger>
          </Field>
        );
      }}
    />
  );
}

export { DateField };
