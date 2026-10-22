import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatIsComplete,
  getGuidedValueIssue,
  GuidedFormat,
  GuidedFormatConfig,
  GuidedValueIssue,
  numberFits,
  resolveGuidedFormat,
} from '../../../../utility/guided-formats';
import {
  changedRange,
  editMask,
  InputMask,
  maskFits,
  remainingMask,
  textEditRange,
} from '../../../../utility/input-mask';
import {
  getTextFieldFormatHint,
  isValidTextFieldValue,
  TextFieldInputFormat,
} from '../../../../utility/text-field-format';

export const textInputClass =
  'block m-0 w-full appearance-none rounded-[3px] border px-[0.8rem] py-[0.4rem] font-[inherit] text-sm leading-6 text-black/90 outline-none focus:border-[#005cc5] disabled:cursor-not-allowed disabled:bg-[#f0f0f0]';

interface FormattedTextInputProps extends GuidedFormatConfig {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  inputFormat?: TextFieldInputFormat;
}

function maskFor(format: GuidedFormat, value: string): InputMask | undefined {
  return format.historicalMask && maskFits(format.historicalMask, value) && !maskFits(format.mask!, value)
    ? format.historicalMask
    : format.mask;
}
function fits(format: GuidedFormat | undefined, value: string): boolean {
  if (!format || !value) return true;
  return format.mask
    ? maskFits(format.mask, value) || (!!format.historicalMask && maskFits(format.historicalMask, value))
    : numberFits(format, value);
}

export function FormattedTextInput({
  value,
  onChange,
  id,
  placeholder,
  disabled,
  required,
  ...config
}: FormattedTextInputProps) {
  const { t } = useTranslation();
  const format = resolveGuidedFormat(config);
  const configKey = `${config.inputFormat}|${config.formatTemplate}|${config.allowNegative}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const caret = useRef<number | undefined>(undefined);
  const selection = useRef<{ start: number; end: number } | undefined>(undefined);
  const composing = useRef(false);
  const [compositionValue, setCompositionValue] = useState<string | undefined>(undefined);
  const [focused, setFocused] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const [notice, setNotice] = useState('');
  // Only an externally supplied value/config establishes legacy mode. Local edits cannot opt themselves out.
  const baseline = useRef({ value, configKey, emitted: value, legacy: !fits(format, value) });
  if (
    baseline.current.configKey !== configKey ||
    (baseline.current.value !== value && baseline.current.emitted !== value)
  ) {
    baseline.current.legacy = !fits(format, value);
    baseline.current.configKey = configKey;
  }
  baseline.current.value = value;
  const legacy = baseline.current.legacy;
  const mask = format?.mask ? maskFor(format, value) : undefined;
  const issue: GuidedValueIssue | undefined = format
    ? getGuidedValueIssue(value, config)
    : !isValidTextFieldValue(value, config.inputFormat)
      ? { message: getTextFieldFormatHint(config.inputFormat) || '' }
      : undefined;
  const invalid =
    !legacy && !!issue && ((!focused && blurred) || (focused && !!format && formatIsComplete(format, value)));
  const oldHint = getTextFieldFormatHint(config.inputFormat);
  const restoreCaret = () => {
    if (caret.current !== undefined && inputRef.current) {
      inputRef.current.setSelectionRange(caret.current, caret.current);
      caret.current = undefined;
    }
  };
  useLayoutEffect(restoreCaret);

  function commit(next: string, position: number) {
    baseline.current.emitted = next;
    if (!next || fits(format, next)) baseline.current.legacy = false;
    caret.current = position;
    // Restore even when a rejected edit emits the same controlled value (React need not rerender).
    if (inputRef.current) {
      inputRef.current.value = next;
      inputRef.current.setSelectionRange(position, position);
    }
    onChange(next);
    setNotice('');
  }

  function edit(start: number, end: number, text: string, paste = false, deletion?: 'backward' | 'forward') {
    if (!format || legacy) {
      const range = textEditRange(value, start, end, deletion);
      const next = value.slice(0, range.start) + text + value.slice(range.end);
      commit(next, range.start + text.length);
      return;
    }
    // Local mixed-slot correction stays validated, unlike externally supplied legacy text.
    if (format.id === 'custom' && mask && !fits(format, value)) {
      const range = textEditRange(value, start, end, deletion);
      const next = value.slice(0, range.start) + text + value.slice(range.end);
      if (paste || (range.start === 0 && range.end === value.length)) {
        const replacement = editMask(mask, '', 0, 0, next);
        if (replacement.accepted) commit(replacement.value, replacement.caret);
        else reject(start, paste, end);
      } else commit(next, range.start + text.length);
      return;
    }
    if (!mask) {
      const insertion = !paste && text.length === 1 && format.decimal && /[.,]/.test(text) ? format.decimal : text;
      const next = value.slice(0, start) + insertion + value.slice(end);
      if (numberFits(format, next)) commit(next, start + insertion.length);
      else reject(start, paste, end);
      return;
    }
    const replacingAll = start === 0 && end === value.length;
    const candidates = [mask, format.mask, format.historicalMask].filter(
      (candidate, index, all): candidate is InputMask => !!candidate && all.indexOf(candidate) === index
    );
    // A full replacement has no dependency on the previous value's historical/standard shape.
    const results = candidates.map(candidate =>
      editMask(candidate, replacingAll ? '' : value, replacingAll ? 0 : start, replacingAll ? 0 : end, text, deletion)
    );
    const result = results.find(candidate => candidate.accepted);
    if (result) commit(result.value, result.caret);
    else if (format.id === 'custom' && !text && (deletion || start !== end)) {
      // Reflowing across unlike slots can fail. Preserve all other data for correction.
      const range = textEditRange(value, start, end, deletion, mask);
      commit(value.slice(0, range.start) + value.slice(range.end), range.start);
    } else reject(start, paste, end);
  }

  function reject(position: number, paste: boolean, end = position) {
    if (inputRef.current) {
      inputRef.current.value = value;
      inputRef.current.setSelectionRange(position, end);
    }
    if (paste) setNotice(t("That text doesn't match the selected format, so nothing was pasted."));
  }

  const hint = format
    ? `${format.mask ? format.label : t(format.label)} · ${t('e.g.')} ${format.example}`
    : oldHint
      ? t(oldHint, { nsSeparator: false })
      : undefined;
  const ghost =
    mask &&
    !legacy &&
    fits(format, value) &&
    compositionValue === undefined &&
    (focused || value || !placeholder?.trim());
  return (
    <div className="grid gap-1">
      <div className="relative bg-white" dir="ltr">
        {ghost ? (
          <div
            ref={ghostRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre px-[0.8rem] py-[0.4rem] text-sm leading-6 tabular-nums border border-transparent"
          >
            <span className="invisible">{value}</span>
            <span className="text-gray-500">{remainingMask(mask, value)}</span>
          </div>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          name={id}
          type="text"
          className={`${textInputClass} tabular-nums ${ghost ? 'bg-transparent' : 'bg-white'} ${invalid ? 'border-red-600' : 'border-[rgba(5,42,68,0.2)]'}`}
          value={compositionValue ?? value}
          placeholder={ghost ? undefined : placeholder}
          required={required}
          disabled={disabled}
          inputMode={
            format
              ? format.allowNegative
                ? undefined
                : mask
                  ? mask.tokens.every(token => token.kind === 'literal' || token.slot === '#')
                    ? 'numeric'
                    : undefined
                  : format.decimal
                    ? 'decimal'
                    : 'numeric'
              : config.inputFormat === 'number'
                ? 'decimal'
                : undefined
          }
          autoComplete={format ? 'off' : undefined}
          autoCapitalize={format ? 'off' : undefined}
          autoCorrect={format ? 'off' : undefined}
          spellCheck={format ? false : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-format` : undefined}
          aria-errormessage={invalid ? `${id}-status` : undefined}
          onScroll={event => {
            if (ghostRef.current) ghostRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setBlurred(true);
            selection.current = undefined;
          }}
          onBeforeInput={event => {
            selection.current = {
              start: event.currentTarget.selectionStart || 0,
              end: event.currentTarget.selectionEnd || 0,
            };
          }}
          onKeyDown={event => {
            selection.current = {
              start: event.currentTarget.selectionStart || 0,
              end: event.currentTarget.selectionEnd || 0,
            };
            if (
              format?.mask &&
              !legacy &&
              !composing.current &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.altKey &&
              (event.key === 'Backspace' || event.key === 'Delete')
            ) {
              event.preventDefault();
              edit(
                selection.current.start,
                selection.current.end,
                '',
                false,
                event.key === 'Backspace' ? 'backward' : 'forward'
              );
              selection.current = undefined;
            }
          }}
          onChange={event => {
            const next = event.currentTarget.value;
            if (composing.current) {
              setCompositionValue(next);
              return;
            }
            const range = changedRange(value, next);
            const native = event.nativeEvent as InputEvent;
            const transfer = native.inputType === 'insertFromPaste' || native.inputType === 'insertFromDrop';
            const deletion =
              native.inputType === 'deleteContentBackward'
                ? 'backward'
                : native.inputType === 'deleteContentForward'
                  ? 'forward'
                  : undefined;
            if (selection.current && native.data !== null && typeof native.data === 'string') {
              edit(selection.current.start, selection.current.end, native.data, transfer);
            } else {
              edit(range.start, range.end, range.text, transfer, deletion);
            }
            selection.current = undefined;
          }}
          onPaste={event => {
            if (!format || legacy || composing.current) return;
            event.preventDefault();
            edit(
              event.currentTarget.selectionStart || 0,
              event.currentTarget.selectionEnd || 0,
              event.clipboardData.getData('text'),
              true
            );
            selection.current = undefined;
          }}
          onCompositionStart={() => {
            composing.current = true;
            selection.current = undefined;
          }}
          onCompositionEnd={event => {
            composing.current = false;
            setCompositionValue(undefined);
            const range = changedRange(value, event.currentTarget.value);
            edit(range.start, range.end, range.text);
          }}
        />
      </div>
      {hint ? (
        <p id={`${id}-format`} className="text-xs text-gray-600">
          {hint}
        </p>
      ) : null}
      <p id={`${id}-status`} aria-live="polite" className={`text-xs ${invalid ? 'text-red-700' : 'text-gray-600'}`}>
        {notice ||
          (invalid
            ? t(issue!.message, { ...issue!.values, nsSeparator: false })
            : legacy && !focused && format
              ? t('This saved value uses a different format. It stays as it is unless you change it.')
              : '')}
      </p>
    </div>
  );
}
