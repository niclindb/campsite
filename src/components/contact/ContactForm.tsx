import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { contact, site } from '../../content/site'
import Icon from '../Icon'
import ArrowIcon from '../ArrowIcon'

// Sends messages through Formspree (https://formspree.io/f/<id>). The form id
// comes from VITE_FORMSPREE_ID; Contact.tsx only renders this when it is set.

type Field = 'name' | 'email' | 'dates' | 'message'
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>
type Status = 'idle' | 'sending' | 'sent' | 'error'

const empty: Values = { name: '', email: '', dates: '', message: '' }
const order: Field[] = ['name', 'email', 'dates', 'message']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const validate = (v: Values): Errors => {
  const e: Errors = {}
  if (!v.name.trim()) e.name = 'Please tell us your name.'
  if (!v.email.trim()) e.email = 'We need your email to write back.'
  else if (!emailPattern.test(v.email.trim())) e.email = 'That email doesn’t look quite right.'
  if (v.dates.length > 100) e.dates = 'Please keep this under 100 characters.'
  if (!v.message.trim()) e.message = 'Please add a short message.'
  else if (v.message.trim().length < 10) e.message = 'Could you tell us a little more? (10 characters or more)'
  else if (v.message.length > 3000) e.message = 'Please keep your message under 3000 characters.'
  return e
}

const ContactForm = ({ formId }: { formId: string }) => {
  const [values, setValues] = useState<Values>(empty)
  // Errors show after the first Send attempt, then update live as people fix them.
  // (Showing them on blur would shift the Send button mid-click and swallow the click.)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the thank-you message so screen reader and keyboard users land on it.
  useEffect(() => {
    if (status === 'sent') successRef.current?.focus()
  }, [status])

  const errors = validate(values)
  const shown = (f: Field) => (submitted ? errors[f] : undefined)

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    setSubmitted(true)
    const firstBad = order.find((f) => errors[f])
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus()
      return
    }

    setStatus('sending')
    setServerError('')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.currentTarget),
        signal: controller.signal,
      })
      if (res.ok) {
        setStatus('sent')
        setValues(empty)
        setSubmitted(false)
        return
      }
      const data = (await res.json().catch(() => null)) as { errors?: { message?: string }[] } | null
      const msg = data?.errors?.map((x) => x.message).filter(Boolean).join(' ')
      setServerError(msg ?? '')
      setStatus('error')
    } catch {
      setStatus('error')
    } finally {
      clearTimeout(timer)
    }
  }

  if (status === 'sent') {
    return (
      <div className="contact-success" role="status">
        <span className="contact-success-icon"><Icon name="check" size={40} /></span>
        <h3 ref={successRef} tabIndex={-1}>{contact.successTitle}</h3>
        <p>{contact.successText}</p>
        <button type="button" className="contact-again" onClick={() => setStatus('idle')}>
          {contact.sendAnotherLabel}
        </button>
      </div>
    )
  }

  const fieldProps = (f: Field) => ({
    id: `contact-${f}`,
    name: f,
    value: values[f],
    onChange,
    'aria-invalid': shown(f) ? true : undefined,
    'aria-describedby': shown(f) ? `contact-${f}-error` : undefined,
  })
  const errorFor = (f: Field) =>
    shown(f) && (
      <span className="contact-field-error" id={`contact-${f}-error`}>
        <Icon name="alert" size={16} /> {shown(f)}
      </span>
    )

  return (
    <form ref={formRef} className="contact-form" onSubmit={onSubmit} noValidate aria-busy={status === 'sending'}>
      <div>
        <h3>{contact.formTitle}</h3>
        <p className="contact-form-intro">{contact.formIntro}</p>
      </div>
      <input type="hidden" name="_subject" value={contact.emailSubject} />
      <div className="contact-form-row">
        <div className="contact-field">
          <label htmlFor="contact-name">Name</label>
          <input {...fieldProps('name')} autoComplete="name" maxLength={100} />
          {errorFor('name')}
        </div>
        <div className="contact-field">
          <label htmlFor="contact-email">Email</label>
          <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" maxLength={200} />
          {errorFor('email')}
        </div>
      </div>
      <div className="contact-field">
        <label htmlFor="contact-dates">
          Dates you're thinking of <span className="contact-optional">(optional)</span>
        </label>
        <input {...fieldProps('dates')} placeholder="e.g. June 12 to 14" />
        {errorFor('dates')}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-message">Message</label>
        <textarea {...fieldProps('message')} rows={5} placeholder="Your rig, how many campers, any add-ons…" />
        {errorFor('message')}
      </div>

      {/* Spam trap: hidden from people and screen readers; bots that fill it are dropped by Formspree. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-gotcha">Leave this empty</label>
        <input id="contact-gotcha" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'error' && (
        <div className="contact-form-error" role="alert">
          <Icon name="alert" size={20} />
          <p>
            {serverError || contact.errorText}{' '}
            <a className="arrow-link" href={site.hipcampUrl} target="_blank" rel="noopener">
              {contact.hipcampLabel} <ArrowIcon />
            </a>
          </p>
        </div>
      )}

      <button type="submit" className="hero-btn primary" disabled={status === 'sending'}>
        {status === 'sending' ? contact.sendingLabel : contact.sendLabel}
      </button>
    </form>
  )
}

export default ContactForm
