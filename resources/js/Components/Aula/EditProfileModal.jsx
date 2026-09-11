import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import StepperModal from "@/Components/Admin/StepperModal";
import { AccountFields, WorkFields, EmergencyFields, SctrFields } from "@/Components/Admin/StudentFormFields";
import { useStudentStepValidation, useJumpToServerErrorStep } from "@/Components/Admin/useStudentStepValidation";
import AgeRestrictionModal from "@/Components/Admin/AgeRestrictionModal";
import { Pencil, UserCircle, Building2, HeartPulse, ShieldCheck } from "lucide-react";

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
        description: "Tu identidad y datos de contacto.",
        color: "bg-[#00ADEE]/10 text-[#024A7D]",
    },
    2: {
        icon: Building2,
        title: "Datos laborales",
        description: "Empresa, cargo y experiencia previa.",
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

function fieldsFrom(profileUser) {
    return {
        document_type: profileUser.document_type ?? "dni",
        dni: profileUser.dni ?? "",
        name: profileUser.name ?? "",
        last_name: profileUser.last_name ?? "",
        gender: profileUser.gender ?? "",
        birth_date: profileUser.birth_date ?? "",
        phone: profileUser.phone ?? "",
        email: profileUser.email ?? "",
        address: profileUser.address ?? "",
        pais_id: profileUser.pais_id ? String(profileUser.pais_id) : "",
        distrito_id: profileUser.distrito_id ? String(profileUser.distrito_id) : "",
        ciudad_extranjero: profileUser.ciudad_extranjero ?? "",
        company: profileUser.company ?? "",
        position: profileUser.position ?? "",
        emergency_contact_name: profileUser.emergency_contact_name ?? "",
        emergency_contact_phone: profileUser.emergency_contact_phone ?? "",
        blood_type: profileUser.blood_type ?? "",
        medical_conditions: profileUser.medical_conditions ?? "",
        sctr_status: profileUser.sctr_status ?? "",
        sctr_expires_at: profileUser.sctr_expires_at ?? "",
        previous_experience: profileUser.previous_experience ?? "",
    };
}

/**
 * Edicion de "Mi perfil" (aula virtual) - mismo asistente por pasos que usa
 * el admin para editar un estudiante, pero sin curso/avatar/estado de
 * cuenta (eso no lo puede tocar el propio estudiante).
 */
export default function EditProfileModal({ open, onOpenChange, profileUser, documentTypes, genderOptions, sctrOptions }) {
    const [step, setStep] = useState(1);
    const { data, setData, put, processing, errors, clearErrors } = useForm(fieldsFrom(profileUser));
    const { clientErrors, ageAlert, closeAgeAlert, onNext, onStepClick, validateBeforeSubmit, clearClientErrors } =
        useStudentStepValidation(step, setStep, data, [], { requireCourse: false });
    useJumpToServerErrorStep(errors, setStep);

    useEffect(() => {
        if (open) {
            setData(fieldsFrom(profileUser));
            setStep(1);
            clearErrors();
            clearClientErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const close = () => {
        onOpenChange(false);
        setStep(1);
        clearErrors();
        clearClientErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validateBeforeSubmit()) return;
        put("/aula-virtual/perfil", {
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
                icon={Pencil}
                title="Editar mi perfil"
                stepLabel={`Paso ${step} de ${STEPS.length}`}
                steps={STEPS}
                currentStep={step}
                onStepClick={onStepClick}
                meta={STEP_META[step]}
                onBack={() => setStep((s) => s - 1)}
                onNext={onNext}
                onSubmit={submit}
                canGoBack={step > 1}
                isLastStep={step === STEPS.length}
                submitLabel="Guardar cambios"
                processing={processing}
            >
                {step === 1 && (
                    <AccountFields
                        data={data}
                        setData={setData}
                        errors={{ ...clientErrors, ...errors }}
                        documentTypes={documentTypes}
                        genderOptions={genderOptions}
                        initialDepartamentoId={profileUser.departamento_id}
                        initialProvinciaId={profileUser.provincia_id}
                        showActiveToggle={false}
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
