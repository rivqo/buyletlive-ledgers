'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Alert, Button, Field, Input, Select, Textarea, useToast } from '@bluebulb/ui';
import { registerIntent, saveDetails, type FormResult } from '@/app/(customer)/account/actions';
import { CURRENCIES, INTENT_KINDS, type Details } from '@/lib/customer-records';

function Problem({ state }: { state: FormResult }) {
  if (!state.error) return null;
  return (
    <Alert tone="danger" title="That wasn’t saved">
      {state.error}
    </Alert>
  );
}

/** A customer's own details (ADR 0030). Keeps what they typed after an error. */
export function DetailsForm({
  details,
  fallbackName,
}: {
  details: Details | null;
  fallbackName: string;
}) {
  const [state, action, pending] = useActionState(saveDetails, {});
  const toast = useToast();
  useEffect(() => {
    if (state.ok) toast({ title: 'Details saved', tone: 'success' });
  }, [state, toast]);
  const v = state.values ?? { ...details, name: details?.name ?? fallbackName };
  const e = state.fields ?? {};
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4" data-tour="details-form">
      <Field label="Full name" error={e.name}>
        <Input name="name" autoComplete="name" defaultValue={v.name} required />
      </Field>
      <Field label="Phone" optional error={e.phone}>
        <Input name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} />
      </Field>
      <Field label="Address" optional error={e.address}>
        <Textarea name="address" rows={3} autoComplete="street-address" defaultValue={v.address} />
      </Field>
      <Problem state={state} />
      <Button type="submit" loading={pending} className="w-fit">
        Save details
      </Button>
    </form>
  );
}

/** Registers an intent; clears itself once it's saved. */
export function IntentForm() {
  const [state, action, pending] = useActionState(registerIntent, {});
  const form = useRef<HTMLFormElement>(null);
  const toast = useToast();
  useEffect(() => {
    if (!state.ok) return;
    form.current?.reset();
    toast({ title: 'Intent registered', tone: 'success' });
  }, [state, toast]);
  const v = state.values ?? {};
  const e = state.fields ?? {};
  return (
    <form
      ref={form}
      action={action}
      className="flex max-w-xl flex-col gap-4"
      data-tour="intent-form"
    >
      <Field label="What it’s for" error={e.kind}>
        <Select name="kind" defaultValue={v.kind ?? 'purchase'}>
          {Object.entries(INTENT_KINDS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="Amount" error={e.amount}>
          <Input name="amount" inputMode="decimal" defaultValue={v.amount} required />
        </Field>
        <Field label="Currency" error={e.currency}>
          <Select name="currency" defaultValue={v.currency ?? 'GBP'}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="When" optional hint="Roughly when you plan to do it." error={e.when}>
        <Input name="when" type="date" defaultValue={v.when} />
      </Field>
      <Field label="Anything we should know" optional error={e.note}>
        <Textarea name="note" rows={3} maxLength={500} defaultValue={v.note} />
      </Field>
      <Problem state={state} />
      <Button type="submit" loading={pending} className="w-fit">
        Register intent
      </Button>
    </form>
  );
}
