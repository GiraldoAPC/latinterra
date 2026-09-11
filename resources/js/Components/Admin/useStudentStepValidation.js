import { useEffect, useRef, useState } from "react";

// Prefijo para distinguir este error puntual (edad insuficiente para el
// curso elegido) de un simple "campo obligatorio", y mostrarlo como
// alerta destacada en vez de texto chico bajo el campo.
export const AGE_ALERT_PREFIX = "EDAD_INSUFICIENTE:";

// Campos obligatorios por paso del wizard de estudiante (coincide con lo
// que exige StudentController::validated() en el backend - los demas
// campos son opcionales ahi, asi que no se bloquean aqui).
const REQUIRED_BY_STEP = {
    1: ["document_type", "dni", "name", "birth_date", "phone", "email", "pais_id", "course_id"],
    2: [],
    3: [],
    4: [],
};

// Calcula la edad exacta (en años cumplidos) a partir de una fecha
// "yyyy-MM-dd". Los cursos son solo para mayores de edad.
function ageFromBirthDate(value) {
    const birth = new Date(value);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const hasHadBirthdayThisYear =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    if (!hasHadBirthdayThisYear) age--;
    return age;
}

function firstInvalidField(step, data, courses, requireCourse) {
    const requiredFields = (REQUIRED_BY_STEP[step] ?? []).filter((f) => requireCourse || f !== "course_id");
    for (const field of requiredFields) {
        if (!data[field] || String(data[field]).trim() === "") {
            return { field, message: "Este campo es obligatorio." };
        }
    }
    if (step === 1 && data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return { field: "email", message: "Ingresa un correo valido." };
    }
    // Segun el pais elegido se pide distrito (Peru) o ciudad (resto de
    // paises) - solo uno de los dos esta visible a la vez en el formulario,
    // asi que se intenta enfocar cualquiera de los dos que exista en el DOM.
    if (step === 1 && data.pais_id && !data.distrito_id && !String(data.ciudad_extranjero ?? "").trim()) {
        return { field: "distrito_id", altField: "ciudad_extranjero", message: "Este campo es obligatorio." };
    }
    // La edad minima es por curso (configurable en Admin > Cursos), no una
    // regla fija: solo se valida si el curso elegido tiene min_age puesto.
    if (step === 1 && data.birth_date && data.course_id) {
        const course = courses?.find((c) => String(c.id) === String(data.course_id));
        if (course?.min_age) {
            const age = ageFromBirthDate(data.birth_date);
            if (age !== null && age < course.min_age) {
                return {
                    field: "birth_date",
                    message: `${AGE_ALERT_PREFIX}El curso "${course.title}" requiere que el estudiante tenga al menos ${course.min_age} años.`,
                };
            }
        }
    }
    // SCTR "Vigente" exige fecha de vencimiento si o si.
    if (step === 4 && data.sctr_status === "vigente" && !data.sctr_expires_at) {
        return { field: "sctr_expires_at", message: "La fecha de vencimiento es obligatoria si el SCTR esta vigente." };
    }
    return null;
}

/**
 * No deja avanzar de paso (con "Siguiente" o saltando directo con los
 * circulos del stepper) si el paso actual tiene un campo obligatorio
 * vacio - marca el error y le pone el foco, igual que un formulario nativo.
 */
export function useStudentStepValidation(step, setStep, data, courses = [], { requireCourse = true } = {}) {
    const [clientErrors, setClientErrors] = useState({});
    const [ageAlert, setAgeAlert] = useState(null);

    const applyInvalid = (invalid) => {
        if (invalid.message.startsWith(AGE_ALERT_PREFIX)) {
            setAgeAlert(invalid.message.slice(AGE_ALERT_PREFIX.length));
        } else {
            setClientErrors({ [invalid.field]: invalid.message });
        }
        (document.getElementById(invalid.field) ?? document.getElementById(invalid.altField ?? ""))?.focus();
    };

    const goToStep = (target) => {
        if (target > step) {
            const invalid = firstInvalidField(step, data, courses, requireCourse);
            if (invalid) {
                applyInvalid(invalid);
                return;
            }
        }
        setClientErrors({});
        setStep(target);
    };

    // Para el ultimo paso no hay "Siguiente" (es el boton de submit), asi
    // que esto se llama justo antes de enviar el formulario. Devuelve true
    // si esta todo bien (dejar seguir con el submit real).
    const validateBeforeSubmit = () => {
        const invalid = firstInvalidField(step, data, courses, requireCourse);
        if (invalid) {
            applyInvalid(invalid);
            return false;
        }
        setClientErrors({});
        return true;
    };

    return {
        clientErrors,
        ageAlert,
        closeAgeAlert: () => setAgeAlert(null),
        onNext: () => goToStep(step + 1),
        onStepClick: goToStep,
        validateBeforeSubmit,
        clearClientErrors: () => {
            setClientErrors({});
            setAgeAlert(null);
        },
    };
}

// A que paso pertenece cada campo (para saltar ahi cuando el backend
// devuelve un error que el chequeo del lado del cliente no pudo detectar,
// ej. un DNI o correo duplicado).
const STEP_BY_FIELD = {
    document_type: 1, dni: 1, name: 1, last_name: 1, gender: 1, birth_date: 1,
    phone: 1, email: 1, address: 1, pais_id: 1, distrito_id: 1, ciudad_extranjero: 1,
    course_id: 1, avatar: 1,
    company: 2, position: 2, previous_experience: 2,
    emergency_contact_name: 3, emergency_contact_phone: 3, blood_type: 3, medical_conditions: 3,
    sctr_status: 4, sctr_expires_at: 4,
};

/**
 * Si el submit del wizard vuelve con errores del backend (ej. DNI
 * duplicado) en un paso distinto al que se esta viendo, salta a ese paso y
 * enfoca el campo - el usuario nunca deberia quedarse viendo un error que
 * esta "escondido" en otro paso.
 */
export function useJumpToServerErrorStep(errors, setStep) {
    const lastSignature = useRef(null);

    useEffect(() => {
        const keys = Object.keys(errors ?? {});
        if (keys.length === 0) {
            lastSignature.current = null;
            return;
        }
        const signature = keys.join(",");
        if (signature === lastSignature.current) return;
        lastSignature.current = signature;

        const field = keys[0];
        const targetStep = STEP_BY_FIELD[field] ?? 1;
        setStep(targetStep);

        // Espera a que el paso nuevo se pinte antes de enfocar.
        requestAnimationFrame(() => {
            document.getElementById(field)?.focus?.();
        });
    }, [errors]);
}
