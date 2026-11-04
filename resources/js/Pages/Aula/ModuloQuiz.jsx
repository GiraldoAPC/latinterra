import { useCallback, useEffect, useRef, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Button } from '@/Components/ui/button';
import { Clock, CheckCircle2, ListChecks, ArrowLeft, ArrowRight } from 'lucide-react';

export default function ModuloQuiz({ course, module, lastAttempt, attemptCount = 0, maxAttempts = 6, durationMinutes = 20, questionLimit = 20, attempt }) {
    const form = useForm({ answers: attempt?.answers ?? {}, attempt_token: attempt?.token ?? '' });
    const start = useForm({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [saveStatus, setSaveStatus] = useState('');
    const submitted = useRef(false);
    const autoSubmitted = useRef(false);
    const timerRan = useRef(false);
    const saveTimer = useRef(null);
    const saveChain = useRef(Promise.resolve());
    const latestAnswers = useRef(form.data.answers);
    latestAnswers.current = form.data.answers;
    const base = `/aula/${course.slug}/modulo/${module.id}/quiz`;
    const questions = module.exam?.questions ?? [];
    const passed = !!lastAttempt?.passed;
    const question = questions[currentIndex];

    useEffect(() => {
        form.setData({ answers: attempt?.answers ?? {}, attempt_token: attempt?.token ?? '' });
        setCurrentIndex(0); submitted.current = false; autoSubmitted.current = false;
        timerRan.current = false;
    }, [attempt?.token]);

    useEffect(() => {
        if (!attempt) return;
        const offset = Date.parse(attempt.server_now) - Date.now();
        const tick = () => setTimeLeft(Math.max(0, Math.ceil((Date.parse(attempt.expires_at) - Date.now() - offset) / 1000)));
        tick(); const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [attempt?.token, attempt?.expires_at, attempt?.server_now]);

    useEffect(() => {
        if (!attempt || submitted.current) return;
        const answers = { ...form.data.answers };
        const snapshot = JSON.stringify(answers);
        setSaveStatus('saving');
        saveTimer.current = setTimeout(() => {
            saveChain.current = saveChain.current.catch(() => {}).then(async () => {
                try {
                    const response = await window.axios.put(`${base}/respuestas`, { attempt_token: attempt.token, answers });
                    if (snapshot === JSON.stringify(latestAnswers.current)) setSaveStatus(response.data.saved ? 'saved' : 'expired');
                } catch { setSaveStatus('error'); }
            });
        }, 300);
        return () => clearTimeout(saveTimer.current);
    }, [form.data.answers, attempt?.token, base]);

    const finish = useCallback(async () => {
        if (!attempt || submitted.current) return;
        submitted.current = true; clearTimeout(saveTimer.current); setSaveStatus('submitting');
        await saveChain.current.catch(() => {});
        form.post(base, { onError: () => { submitted.current = false; setSaveStatus('error'); } });
    }, [attempt?.token, form.post, base]);

    useEffect(() => {
        if (attempt && timeLeft === 0 && !autoSubmitted.current && Date.parse(attempt.expires_at) <= Date.parse(attempt.server_now)) {
            autoSubmitted.current = true; finish();
        }
    }, [attempt?.token, timeLeft, finish]);
    // A separate flag distinguishes the first render from reaching zero after a running timer.
    useEffect(() => {
        if (timeLeft > 0) timerRan.current = true;
        if (attempt && timeLeft === 0 && timerRan.current && !autoSubmitted.current) {
            autoSubmitted.current = true; finish();
        }
    }, [timeLeft, attempt?.token, finish]);

    const setAnswer = (value) => form.setData('answers', { ...form.data.answers, [question.id]: value });
    return <><Head title={`Examen · ${module.title}`} /><StudentLayout>
        <div className="mx-auto max-w-3xl">
            <Link className="text-sm text-slate-500 hover:underline" href={`/aula/${course.slug}`}>{course.title}</Link>
            <h1 className="mb-3 mt-2 flex items-center gap-2 text-xl font-bold text-[#024A7D]"><ListChecks className="h-5 w-5" />Examen: {module.title}</h1>
            {passed ? <div className="rounded-xl border bg-white p-6 text-center"><CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" /><h2 className="font-semibold">Examen aprobado · {Number(lastAttempt.score).toFixed(2)}/20</h2><Button className="mt-5" asChild><Link href={`/aula/${course.slug}/continuar`}>Continuar curso</Link></Button></div> : !attempt ? <div className="space-y-4 rounded-xl border bg-white p-6">
                <p className="text-sm text-slate-600">Se seleccionarán {questionLimit} preguntas del banco. Necesitas 13/20 para aprobar. Al iniciar dispondrás de {durationMinutes} minutos.</p>
                <p className="text-sm">Intentos utilizados: <strong>{attemptCount}/{maxAttempts}</strong>. Recargar no reinicia el tiempo ni cambia las preguntas.</p>
                {lastAttempt && <p className="text-sm text-slate-600">Mejor nota registrada: {Number(lastAttempt.score).toFixed(2)}/20</p>}
                {attemptCount >= maxAttempts ? <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Agotaste los intentos de este examen. Contacta con administración.</p> : <Button disabled={start.processing} onClick={() => start.post(`${base}/iniciar`)}>{start.processing ? 'Iniciando…' : 'Iniciar examen'}</Button>}
                {Object.entries(start.errors).map(([key, error]) => <p key={key} role="alert" className="text-sm text-red-700">{error}</p>)}
            </div> : <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4 text-sm"><span>Intento {attemptCount}/{maxAttempts} · Pregunta {currentIndex + 1}/{questions.length}</span><strong className={`flex items-center gap-2 ${timeLeft <= 60 ? 'text-red-600' : 'text-[#024A7D]'}`}><Clock className="h-4 w-4" />{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</strong></div>
                {question && <div className="space-y-4 rounded-xl border bg-white p-6">
                    <h2 className="font-semibold">{question.question}</h2>
                    {question.type === 'short_answer' ? <input aria-label="Tu respuesta" maxLength={2000} className="w-full rounded-md border p-3 text-sm" value={form.data.answers[question.id] ?? ''} disabled={form.processing || saveStatus === 'submitting' || timeLeft === 0} onChange={(event) => setAnswer(event.target.value)} /> : question.options.map((option) => <label key={option.id} className="flex items-center gap-3 rounded-lg border p-3 text-sm"><input type="radio" name={`question_${question.id}`} checked={form.data.answers[question.id] === option.id} disabled={form.processing || saveStatus === 'submitting' || timeLeft === 0} onChange={() => setAnswer(option.id)} />{option.option_text}</label>)}
                </div>}
                <div className="flex flex-wrap justify-between gap-3"><Button variant="outline" disabled={currentIndex === 0 || form.processing} onClick={() => setCurrentIndex((i) => i - 1)}><ArrowLeft className="h-4 w-4" />Anterior</Button>
                    {currentIndex < questions.length - 1 ? <Button disabled={form.processing} onClick={() => setCurrentIndex((i) => i + 1)}>Siguiente<ArrowRight className="h-4 w-4" /></Button> : <Button disabled={form.processing || saveStatus === 'submitting'} onClick={finish}>Finalizar examen</Button>}
                </div>
                <p className={`text-xs ${saveStatus === 'error' ? 'text-red-700' : 'text-slate-500'}`} role="status">{({ saving: 'Guardando respuestas…', saved: 'Respuestas guardadas.', expired: 'El tiempo terminó. Se corregirán las respuestas guardadas antes del vencimiento.', error: 'No se pudo guardar o enviar. Revisa tu conexión y vuelve a intentar.', submitting: 'Enviando examen…' })[saveStatus]}</p>
                {Object.entries(form.errors).map(([key, error]) => <p key={key} role="alert" className="text-sm text-red-700">{error}</p>)}
            </div>}
        </div>
    </StudentLayout></>;
}
