import { Box, Field, NativeSelect, RadioGroup, Textarea } from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { AnimatedInput } from '../ui/AnimatedInput';
import { GradientButton } from '../ui/GradientButton';
import type { AssignmentCreatePayload, AssignmentFormValues, AssignmentSourceType } from '../../types';

interface AssignmentFormProps {
  initialValues?: Partial<AssignmentFormValues>;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (payload: AssignmentCreatePayload) => void | Promise<void>;
}

const LANGUAGE_OPTIONS = ['python', 'javascript', 'typescript', 'java', 'c++', 'go', 'rust', 'other'];

function toDateInputValue(dueDate: string | undefined): string {
  if (!dueDate) {
    return '';
  }
  return dueDate.slice(0, 10);
}

/**
 * Shared create/edit form for assignments. Source can be either an uploaded
 * file or a repo link — never both, per the assignments module rule.
 */
export function AssignmentForm({ initialValues, isSubmitting, submitLabel, onSubmit }: AssignmentFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [language, setLanguage] = useState(initialValues?.language ?? LANGUAGE_OPTIONS[0]);
  const [sourceType, setSourceType] = useState<AssignmentSourceType>(initialValues?.sourceType ?? 'repo_link');
  const [sourceUrlOrPath, setSourceUrlOrPath] = useState(initialValues?.sourceUrlOrPath ?? '');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState(toDateInputValue(initialValues?.dueDate));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [sourceError, setSourceError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let hasError = false;
    if (title.trim().length === 0) {
      setTitleError('Title is required.');
      hasError = true;
    } else {
      setTitleError(null);
    }

    if (sourceUrlOrPath.trim().length === 0) {
      setSourceError(sourceType === 'file' ? 'A file upload is required.' : 'A repository link is required.');
      hasError = true;
    } else {
      setSourceError(null);
    }

    if (hasError) {
      return;
    }

    void onSubmit({
      title: title.trim(),
      description: description.trim().length > 0 ? description.trim() : null,
      language,
      sourceType,
      sourceUrlOrPath: sourceUrlOrPath.trim(),
      dueDate: dueDate.length > 0 ? new Date(dueDate).toISOString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box display="flex" flexDirection="column" gap={5}>
        <AnimatedInput
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={titleError ?? undefined}
          placeholder="Assignment title"
        />

        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
            borderWidth="2px"
            borderColor="border.muted"
            borderRadius="xl"
            px={4}
            py={3}
            _focus={{ borderColor: 'brand.solid' }}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Language</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field value={language} onChange={(event) => setLanguage(event.target.value)}>
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label>Source</Field.Label>
          <RadioGroup.Root
            value={sourceType}
            onValueChange={(details) => {
              setSourceType(details.value as AssignmentSourceType);
              setSourceUrlOrPath('');
              setSelectedFileName(null);
              setSourceError(null);
            }}
          >
            <Box display="flex" gap={6}>
              <RadioGroup.Item value="repo_link">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>Repository link</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item value="file">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>File upload</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Box>
          </RadioGroup.Root>
        </Field.Root>

        {sourceType === 'repo_link' ? (
          <AnimatedInput
            label="Repository URL"
            value={sourceUrlOrPath}
            onChange={(event) => setSourceUrlOrPath(event.target.value)}
            error={sourceError ?? undefined}
            placeholder="https://github.com/user/repo"
          />
        ) : (
          <Field.Root invalid={Boolean(sourceError)}>
            <Field.Label>File</Field.Label>
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setSelectedFileName(file.name);
                  setSourceUrlOrPath(file.name);
                }
              }}
            />
            {selectedFileName && <Field.HelperText>Selected: {selectedFileName}</Field.HelperText>}
            {sourceError && <Field.ErrorText>{sourceError}</Field.ErrorText>}
          </Field.Root>
        )}

        <AnimatedInput
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />

        <GradientButton type="submit" disabled={isSubmitting} alignSelf="flex-start">
          {isSubmitting ? 'Saving...' : submitLabel}
        </GradientButton>
      </Box>
    </form>
  );
}

