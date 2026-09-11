import { useState } from "react";
import { useForm } from "@inertiajs/react";
import StepperModal from "@/Components/Admin/StepperModal";
import { AccountFields, WorkFields, EmergencyFields, SctrFields } from "@/Components/Admin/StudentFormFields";
import { AvatarPicker } from "@/Components/ui/avatar-picker";
import { useStudentStepValidation, useJumpToServerErrorStep } from "@/Components/Admin/useStudentStepValidation";
import AgeRestrictionModal from "@/Components/Admin/AgeRestrictionModal";
import { UserPlus, UserCircle, Building2, HeartPulse, ShieldCheck } from "lucide-react";

const STEPS = [
    { id: 1, label: "Principal" },
    { id: 2, label: "Laboral" },
    { id: 3, label: "Emergencia" },
    { id: 4, label: "SCTR" },
];

const STEP_META = {
    1: {
        icon: UserCircle,
        title: "Datos principales",
        description: "Identidad, contacto y curso al que se inscribe. Usuario y contrasena se generan con el documento.",
        color: "bg-[#00ADEE]/10 text-[#024A7D]",
    },
    2: {
        icon: Building2,
        title: "Datos laborales",
        description: "Empresa, cargo y experiencia previa del estudiante.",
        color: "bg-sky-500/10 text-sky-600",
    },
    3: {
        icon: HeartPulse,
        title: "Emergencia y salud",
        description: "Requerido para actividades de alto riesgo (acceso vertical, trabajos en altura).",
        color: "bg-red-500/10 text-red-600",
    },
    4: {
        icon: ShieldCheck,
        title: "SCTR",
        description: "Seguro Complementario de Trabajo de Riesgo vigente.",
        color: "bg-amber-500/10 text-amber-600",
    },
};

const EMPTY = {
    avatar: null,
    document_type: "dni",
    dni: "",
    name: "",
    last_name: "",
    gender: "",
    birth_date: "",
    phone: "",
    email: "",
    address: "",
    pais_id: "",
    distrito_id: "",
    ciudad_extranjero: "",
    course_id: "",
    company: "",
    position: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_type: "",
    medical_conditions: "",
    sctr_status: "",
    sctr_expires_at: "",
    previous_experience: "",
};

export default function NewStudentModal({ open, onOpenChange, courses = [], documentTypes, genderOptions, sctrOptions }) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm(EMPTY);
    const { clientErrors, ageAlert, closeAgeAlert, onNext, onStepClick, validateBeforeSubmit, clearClientErrors } =
        useStudentStepValidation(step, setStep, data, courses);
    useJumpToServerErrorStep(errors, setStep);

    const close = () => {
        onOpenChange(false);
        setStep(1);
        reset();
        clearErrors();
        clearClientErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validateBeforeSubmit()) return;
        post("/admin/estudiantes", {
            preserveScroll: true,
            onSuccess: () => close(),
        });
    };

    return (
        <>
        <StepperModal
            open={open}
            onOpenChange={onOpenChange}
            onClose={close}
            icon={UserPlus}
            title="Nuevo estudiante"
            stepLabel={`Paso ${step} de ${STEPS.length}`}
            steps={STEPS}
            currentStep={step}
            onStepClick={onStepClick}
            meta={STEP_META[step]}
            headerExtra={
                step === 1 && (
                    <AvatarPicker
                        value={data.avatar}
                        onChange={(file) => setData("avatar", file)}
                        name={`${data.name ?? ""} ${data.last_name ?? ""}`}
                        size="h-11 w-11"
                    />
                )
            }
            onBack={() => setStep((s) => s - 1)}
            onNext={onNext}
            onSubmit={submit}
            canGoBack={step > 1}
            isLastStep={step === STEPS.length}
            submitLabel="Registrar estudiante"
            processing={processing}
        >
            {step === 1 && (
                <AccountFields
                    data={data}
                    setData={setData}
                    errors={{ ...clientErrors, ...errors }}
                    showAccountFields
                    courses={courses}
                    documentTypes={documentTypes}
                    genderOptions={genderOptions}
                    bare
                />
            )}
            {step === 2 && <WorkFields data={data} setData={setData} errors={errors} bare />}
            {step === 3 && <EmergencyFields data={data} setData={setData} errors={errors} bare />}
            {step === 4 && <SctrFields data={data} setData={setData} errors={errors} sctrOptions={sctrOptions} bare />}
        </StepperModal>
        <AgeRestrictionModal message={ageAlert} onClose={closeAgeAlert} />
        </>
    );
}
