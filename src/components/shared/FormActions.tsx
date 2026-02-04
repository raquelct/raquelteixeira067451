import { Button } from './Button';

interface FormActionsProps {
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting: boolean;
  onCancel: () => void;
}

export const FormActions = ({
  submitLabel,
  cancelLabel = 'Cancelar',
  isSubmitting,
  onCancel,
}: FormActionsProps) => {
  return (
    <div className="flex space-x-4 pt-4">
      <Button
        type="submit"
        variant="primary"
        className="flex-1"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {submitLabel}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
    </div>
  );
};
