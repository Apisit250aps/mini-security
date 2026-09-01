export type FormProps<T> = {
  onSubmit: (data: T) => void;
  defaultValues?: T;
  isLoading?: boolean;
};
