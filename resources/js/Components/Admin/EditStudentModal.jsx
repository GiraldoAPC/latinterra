import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import StepperModal from "@/Components/Admin/StepperModal";
import { AccountFields, WorkFields, EmergencyFields, SctrFields } from "@/Components/Admin/StudentFormFields";
import { AvatarPicker } from "@/Components/ui/avatar-picker";
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
        description: "Identidad y datos de contacto del estudiante.",
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

function fieldsFrom(student) {
    return {
        avatar: null, // File nuevo (si el admin sube uno); la foto actual se
        // muestra aparte via `student.avatar_url`, no se prellena aqui.
        document_type: student.document_type ?? "dni",
        dni: student.dni ?? "",
        course_id: student.course_id ? String(student.course_id) : "",
        name: student.name ?? "",
        last_name: student.last_name ?? "",
        gender: student.gender ?? "",
        birth_date: student.birth_date ?? "",
        phone: student.phone ?? "",
        email: student.email ?? "",
        address: student.address ?? "",
        pais_id: student.pais_id ? String(student.pais_id) : "",
        distrito_id: student.distrito_id ? String(student.distrito_id) : "",
        ciudad_extranjero: student.ciudad_extranjero ?? "",
        company: student.company ?? "",
        position: student.position ?? "",
        is_active: !!student.is_active,
        emergency_contact_name: student.emergency_contact_name ?? "",
        emergency_contact_phone: student.emergency_contact_phone ?? "",
        blood_type: student.blood_type ?? "",
        medical_conditions: student.medical_conditions ?? "",
        sctr_status: student.sctr_status ?? "",
        sctr_expires_at: student.sctr_expires_at ?? "",
        previous_experience: student.previous_experience ?? "",
    };
}

/**
 * Editar estudiante existente: mismo asistente por pasos que el registro
 * (NewStudentModal), pero prellenado y enviando por PUT. No incluye el
 * no incluye el aviso de usuario/contrasena (exclusivo del alta), pero si
 * incluye el curso: al cambiarlo se crea una inscripcion nueva (no
 * reemplaza ni quita las que ya tenia).
 */
export default function EditStudentModal({ open, onOpenChange, student, documentTypes, genderOptions, sctrOptions, courses }) {
    const [step, setStep] = useState(1);
    const { data, setData, put, processing, errors, clearErrors } = useForm(fieldsFrom({}));
    const { clientErrors, ageAlert, closeAgeAlert, onNext, onStepClick, validateBeforeSubmit, clearClientErrors } =
        useStudentStepValidation(step, setStep, data, courses);
    useJumpToServerErrorStep(errors, setStep);
    const loadedFor = useRef(null);

    // Importante: NO remontar este componente (ej. con `key={student.id}`)
    // para recargar los datos - abrir el Dialog "ya montado en open=true"
    // en vez de dejarlo alternar open=false/true en la misma instancia
    // rompe la deteccion de "click fuera" y cierra el modal apenas se usa
    // un <Select>. En su lugar, precargamos los datos con setData() (que
    // reemplaza el objeto completo) cada vez que cambia el estudiante.
    useEffect(() => {
        if (student && open && loadedFor.current !== student.id) {
            setData(fieldsFrom(student));
            setStep(1);
            clearErrors();
            clearClientErrors();
            loadedFor.current = student.id;
        }
        if (!open) {
            loadedFor.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [student?.id, open]);

    const close = () => {
        onOpenChange(false);
        setStep(1);
        clearErrors();
        clearClientErrors();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!student) return;
        if (!validateBeforeSubmit()) return;
        put(`/admin/estudiantes/${student.id}`, {
            preserveScroll: true,
            onSuccess: () => close(),
        });
    };

    // El Dialog se mantiene siempre montado (igual que en NewStudentModal)
    // y solo alterna `open`; ver el comentario del useEffect de arriba.
    return (
        <>
        <StepperModal
            open={open && !!student}
            onOpenChange={onOpenChange}
            onClose={close}
            icon={Pencil}
            title="Editar estudiante"
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
                        currentUrl={student?.avatar_url}
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
                    initialDepartamentoId={student?.departamento_id}
                    initialProvinciaId={student?.provincia_id}
                    courses={courses ?? []}
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
