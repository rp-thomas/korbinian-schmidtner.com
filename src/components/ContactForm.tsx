import { useState, type FormEvent } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface FieldErrors {
  name?: string[];
  email?: string[];
  nachricht?: string[];
  interesse?: string[];
}

const inputCls =
  'w-full bg-white border border-[#c8c4bf] text-[#1a1a1a] px-4 py-3.5 text-base font-[inherit] outline-none appearance-none transition-[border-color,box-shadow] duration-200 focus:border-[#2f81f7] focus:shadow-[0_0_0_3px_rgba(47,129,247,0.15)]';

const labelCls =
  'block text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-[#4a4a4a] mb-1.5';

export default function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);

    try {
      const { actions, isInputError } = await import('astro:actions');
      const { data, error } = await actions.contact(formData);

      if (error) {
        if (isInputError(error)) {
          setFieldErrors(error.fields as FieldErrors);
          setState('idle');
        } else {
          setMessage(error.message ?? 'Ein Fehler ist aufgetreten.');
          setState('error');
        }
      } else {
        setMessage(data?.message ?? 'Vielen Dank für deine Nachricht!');
        setState('success');
        (e.target as HTMLFormElement).reset();
      }
    } catch {
      setMessage('Ein unerwarteter Fehler ist aufgetreten.');
      setState('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

      {state === 'success' && (
        <div role="alert" className="bg-green-500/10 border border-green-500/30 text-green-700 px-5 py-4 rounded font-medium">
          <strong>✓</strong> {message}
        </div>
      )}
      {state === 'error' && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-700 px-5 py-4 rounded font-medium">
          {message}
        </div>
      )}

      {/* Row 1: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={labelCls}>Name *</label>
          <input id="name" name="name" type="text" required placeholder="Dein Name" className={inputCls} aria-describedby={fieldErrors.name ? 'name-error' : undefined} />
          {fieldErrors.name && <span id="name-error" className="text-red-500 text-[0.8rem] mt-1 block">{fieldErrors.name.join(', ')}</span>}
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>E-Mail *</label>
          <input id="email" name="email" type="email" required placeholder="deine@email.de" className={inputCls} aria-describedby={fieldErrors.email ? 'email-error' : undefined} />
          {fieldErrors.email && <span id="email-error" className="text-red-500 text-[0.8rem] mt-1 block">{fieldErrors.email.join(', ')}</span>}
        </div>
      </div>

      {/* Row 2: Telefon + Interesse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="telefon" className={labelCls}>Telefon (optional)</label>
          <input id="telefon" name="telefon" type="tel" placeholder="+49 ..." className={inputCls} />
        </div>
        <div>
          <label htmlFor="interesse" className={labelCls}>Interesse *</label>
          <select id="interesse" name="interesse" required className={inputCls}>
            <option value="allgemein">Allgemeine Anfrage</option>
            <option value="hochtouren">Hochtouren</option>
            <option value="felsklettern">Felsklettern</option>
            <option value="eisklettern">Eisklettern</option>
            <option value="skitouren">Skitouren</option>
          </select>
          {fieldErrors.interesse && <span className="text-red-500 text-[0.8rem] mt-1 block">{fieldErrors.interesse.join(', ')}</span>}
        </div>
      </div>

      {/* Nachricht */}
      <div>
        <label htmlFor="nachricht" className={labelCls}>Nachricht *</label>
        <textarea id="nachricht" name="nachricht" rows={6} required placeholder="Erzähl mir von deinen Plänen, deiner Erfahrung und deinem Wunschtermin..." className={inputCls} aria-describedby={fieldErrors.nachricht ? 'nachricht-error' : undefined} />
        {fieldErrors.nachricht && <span id="nachricht-error" className="text-red-500 text-[0.8rem] mt-1 block">{fieldErrors.nachricht.join(', ')}</span>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="self-start bg-[#2f81f7] text-white border-0 px-10 py-3.5 text-sm font-bold uppercase tracking-[0.08em] cursor-pointer font-[inherit] transition-[background,transform] duration-200 hover:bg-[#1f6feb] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
      >
        {state === 'loading' ? 'Wird gesendet...' : 'Nachricht senden'}
      </button>

    </form>
  );
}
