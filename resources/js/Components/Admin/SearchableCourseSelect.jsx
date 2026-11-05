import { SmartSelect } from '@/Components/ui/smart-select';

export default function SearchableCourseSelect({ courses, value, onChange, placeholder = 'Sin requisito', allowEmpty = true }) {
    return <SmartSelect aria-label="Seleccionar curso" searchable value={String(value ?? '')} onValueChange={onChange} placeholder={placeholder} options={[
        ...(allowEmpty ? [{ value: '', label: placeholder, text: placeholder }] : []),
        ...courses.map((course) => ({ value: String(course.id), label: course.title, text: course.title })),
    ]} />;
}
