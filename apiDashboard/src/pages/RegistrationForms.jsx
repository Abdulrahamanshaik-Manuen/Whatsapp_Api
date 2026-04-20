import { useState } from 'react'
import NavBar from '../components/NavBar'

const routeTitles = {
    '/pricing': 'Pricing',
    '/product': 'Product',
    '/features': 'Features',
    '/industries': 'Industries',
    '/resources': 'Resources',
    '/integrations': 'Integrations',
}

const onboardingSections = [
    {
        title: 'WhatsApp Setup',
        description: 'This is required to configure the WhatsApp Business profile correctly.',
        fields: [
            'Add a profile photo',
            'Phone number (OTP verification)',
            'Enter your business name',
            'Select your business category',
            'Add your business hours (Open for selected hours, Always open, Appointments only)',
            'Address or region',
            'Add your business description',
            'Add email (for account protection)',
        ],
    },
    {
        title: 'Business Details',
        description: 'Basic company information we need before starting Meta onboarding.',
        fields: [
            'Company name',
            'Business website',
            'Business category',
            'Business address',
            'Primary contact person',
            'Contact email',
            'Contact phone number',
        ],
    },
    // {
    //     title: 'Meta Account Details',
    //     description: 'These details help us connect and manage the client Meta assets.',
    //     fields: [
    //         'Meta Business Manager ID',
    //         'WhatsApp Business Account ID',
    //         'Facebook Page ID',
    //         'Instagram account handle',
    //         'Ad account ID',
    //     ],
    // },
    // {
    //     title: 'Messaging Requirements',
    //     description: 'These inputs define how your client wants to use WhatsApp automation.',
    //     fields: [
    //         'Use case: support, marketing, OTP, notifications',
    //         'Expected monthly message volume',
    //         'Template message requirements',
    //         'Preferred languages',
    //         'Customer opt-in method',
    //         'Automation or chatbot flow needs',
    //         'CRM or backend integration details',
    //     ],
    // },
    // {
    //     title: 'Access And Permissions',
    //     description: 'We need the right permissions to activate APIs, webhooks, and templates.',
    //     fields: [
    //         'Admin access to Meta Business Manager',
    //         'System user access',
    //         'Long-lived access token',
    //         'App ID',
    //         'App secret',
    //         'Webhook verify token',
    //         'Webhook callback URL',
    //     ],
    // },
]

const checklistItems = [
    'Privacy policy URL',
    'Terms and conditions URL',
    'Customer consent proof',
    'Billing contact person',
    'Escalation contact',
]

function createInitialFormValues() {
    return onboardingSections.reduce((sectionAccumulator, section) => {
        sectionAccumulator[section.title] = section.fields.reduce((fieldAccumulator, field) => {
            fieldAccumulator[field] = field === 'Add a profile photo' ? null : ''
            return fieldAccumulator
        }, {})

        return sectionAccumulator
    }, {})
}

function validateSection(section, values) {
    return section.fields.reduce((accumulator, field) => {
        const value = values[field]
        const isEmptyFile = field === 'Add a profile photo' && !value
        const isEmptyText = field !== 'Add a profile photo' && !String(value || '').trim()

        if (isEmptyFile || isEmptyText) {
            accumulator[field] = `${field} is required`
        }

        return accumulator
    }, {})
}

function getSectionId(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function PlaceholderContent({ activePath }) {
    return (
        <section className="min-h-[320px] rounded-[2rem] bg-transparent">
            <span className="sr-only">{routeTitles[activePath] || activePath}</span>
        </section>
    )
}

function SectionCard({
    section,
    values,
    errors,
    onInputChange,
    onFileChange,
    onAction,
}) {
    const isWhatsappSetup = section.title === 'WhatsApp Setup'
    const buttonLabel = isWhatsappSetup ? 'Next' : 'Submit'

    return (
        <section
            id={getSectionId(section.title)}
            className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60"
        >
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                    {section.description}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {section.fields.map((field) => (
                    <label key={field} className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            {field}
                        </span>
                        {field === 'Add a profile photo' ? (
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => onFileChange(section.title, field, event.target.files?.[0] ?? null)}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-600"
                            />
                        ) : (
                            <input
                                type="text"
                                value={values[field]}
                                onChange={(event) => onInputChange(section.title, field, event.target.value)}
                                placeholder={`Enter ${field.toLowerCase()}`}
                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white"
                            />
                        )}
                        {field === 'Add a profile photo' && values[field] ? (
                            <span className="mt-2 block text-xs text-emerald-700">
                                Selected: {values[field].name}
                            </span>
                        ) : null}
                        {errors[field] ? (
                            <span className="mt-2 block text-xs text-red-500">
                                {errors[field]}
                            </span>
                        ) : null}
                    </label>
                ))}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    type="button"
                    onClick={onAction}
                    className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                    {buttonLabel}
                </button>
            </div>
        </section>
    )
}

function RegistrationContent() {
    const [formValues, setFormValues] = useState(createInitialFormValues)
    const [formErrors, setFormErrors] = useState({})
    const [isWhatsappSetupCompleted, setIsWhatsappSetupCompleted] = useState(false)
    const [submissionMessage, setSubmissionMessage] = useState('')
    const [selectedSectionTitle, setSelectedSectionTitle] = useState(
        onboardingSections[0]?.title ?? ''
    )
    const selectedSection = onboardingSections.find(
        (section) => section.title === selectedSectionTitle
    )

    function handleInputChange(sectionTitle, field, value) {
        setSubmissionMessage('')
        setFormValues((currentValues) => ({
            ...currentValues,
            [sectionTitle]: {
                ...currentValues[sectionTitle],
                [field]: value,
            },
        }))

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            [sectionTitle]: {
                ...currentErrors[sectionTitle],
                [field]: '',
            },
        }))
    }

    function handleFileChange(sectionTitle, field, file) {
        setSubmissionMessage('')
        setFormValues((currentValues) => ({
            ...currentValues,
            [sectionTitle]: {
                ...currentValues[sectionTitle],
                [field]: file,
            },
        }))

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            [sectionTitle]: {
                ...currentErrors[sectionTitle],
                [field]: '',
            },
        }))
    }

    function handleSectionAction() {
        if (!selectedSection) {
            return
        }

        if (selectedSection.title === 'Business Details' && !isWhatsappSetupCompleted) {
            setSubmissionMessage('Complete WhatsApp Setup first to submit Business Details.')
            return
        }

        const currentSectionValues = formValues[selectedSection.title]
        const sectionErrors = validateSection(selectedSection, currentSectionValues)

        if (Object.keys(sectionErrors).length > 0) {
            setFormErrors((currentErrors) => ({
                ...currentErrors,
                [selectedSection.title]: sectionErrors,
            }))
            return
        }

        setFormErrors((currentErrors) => ({
            ...currentErrors,
            [selectedSection.title]: {},
        }))

        if (selectedSection.title === 'WhatsApp Setup') {
            setIsWhatsappSetupCompleted(true)
            setSubmissionMessage('')
            setSelectedSectionTitle('Business Details')
        }
    }

    return (
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
            <section className="rounded-[2rem] bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-500 px-6 py-10 text-white shadow-lg shadow-emerald-200 sm:px-8">
                <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-sm font-medium">
                    Client Onboarding
                </span>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                    Collect the right Meta and WhatsApp data before client activation.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-emerald-50 sm:text-lg">
                    Use this onboarding form to gather business details, Meta asset IDs,
                    access credentials, and messaging requirements from every client.
                </p>
            </section>

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
                <div className="flex flex-wrap gap-3">
                    {onboardingSections.map((section) => (
                        <button
                            key={section.title}
                            type="button"
                            onClick={() => {
                                setSubmissionMessage('')
                                setSelectedSectionTitle(section.title)
                            }}
                            className={`inline-flex rounded-full border px-4 py-2 text-sm font-medium transition ${selectedSectionTitle === section.title
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white'
                                }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>
                {submissionMessage ? (
                    <p className="mt-3 text-sm text-amber-600">
                        {submissionMessage}
                    </p>
                ) : null}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    {selectedSection ? (
                        <SectionCard
                            section={selectedSection}
                            values={formValues[selectedSection.title]}
                            errors={formErrors[selectedSection.title] || {}}
                            onInputChange={handleInputChange}
                            onFileChange={handleFileChange}
                            onAction={handleSectionAction}
                        />
                    ) : null}
                </div>


                <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Minimum Checklist
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        These items should be confirmed before your team starts onboarding.
                    </p>

                    <ul className="mt-5 space-y-3">
                        {checklistItems.map((item, index) => (
                            <li
                                key={item}
                                className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                            >
                                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                                    {index + 1}
                                </span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <button className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                        Save Client Onboarding
                    </button>
                </aside>
            </section>
        </main>
    )
}

export default function RegistrationForms({ activePath, onNavigate }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar
                activePath={activePath}
                onNavigate={onNavigate}
            />

            {activePath === '/registration' ? (
                <RegistrationContent />
            ) : (
                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
                    <PlaceholderContent activePath={activePath} />
                </main>
            )}
        </div>
    )
}
