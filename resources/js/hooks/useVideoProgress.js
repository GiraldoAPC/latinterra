import { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export function useVideoProgress({ baseUrl, locked, getPlayer, onCompleted }) {
    const props = useRef(null);
    props.current = { baseUrl, locked, getPlayer, onCompleted };
    const state = useRef({ token: null, start: null, queue: Promise.resolve(), playing: false, done: false });
    const mounted = useRef(true);
    const [status, setStatus] = useState({ position: 0, duration: 0, message: '' });

    const error = (failure) => {
        if (!mounted.current) return;
        state.current.playing = false;
        props.current.getPlayer()?.pauseVideo?.();
        const response = failure?.response;
        if (response?.data?.redirect) { router.visit(response.data.redirect); return; }
        if ([401, 403, 404, 422].includes(response?.status)) state.current.token = null;
        const message = response?.data?.errors?.video?.[0] ?? response?.data?.message;
        setStatus((previous) => ({ ...previous, message: message || 'No se pudo guardar el avance. Revisa tu conexión y vuelve a reproducir.' }));
    };
    const start = async () => {
        if (!props.current.locked) return true;
        if (state.current.token) return true;
        if (state.current.start) return state.current.start;
        state.current.start = window.axios.post(`${props.current.baseUrl}/iniciar`, {}, { headers: { Accept: 'application/json' } }).then(({ data }) => {
            if (!mounted.current) return false;
            if (typeof data !== 'object') throw new Error('Invalid video response');
            if (data.complete) {
                if (!state.current.done) { state.current.done = true; props.current.onCompleted(); }
                return true;
            }
            if (!data.token) throw new Error('Missing video session');
            state.current.token = data.token;
            setStatus({ position: data.position, duration: data.duration, message: '' });
            if (data.position > 0) {
                props.current.getPlayer()?.seekTo?.(data.position, true);
                props.current.getPlayer()?.pauseVideo?.();
            }
            props.current.getPlayer()?.setPlaybackRate?.(1);
            return true;
        }).catch((failure) => { error(failure); return false; }).finally(() => { state.current.start = null; });
        return state.current.start;
    };
    const pulse = (ended = false) => {
        if (!props.current.locked || state.current.done || !state.current.token) return Promise.resolve();
        state.current.queue = state.current.queue.catch(() => {}).then(async () => {
            if (!mounted.current || !state.current.token || state.current.done) return;
            const player = props.current.getPlayer();
            const position = ended ? Math.max(player?.getCurrentTime?.() ?? 0, player?.getDuration?.() ?? 0) : player?.getCurrentTime?.() ?? 0;
            const { data } = await window.axios.post(`${props.current.baseUrl}/avance`, {
                token: state.current.token, position, playing: !ended && state.current.playing && !document.hidden, ended,
            }, { headers: { Accept: 'application/json' } });
            if (!mounted.current) return;
            if (typeof data !== 'object') throw new Error('Invalid video response');
            const message = data.resync ? 'Retoma desde el último avance validado. No se permite adelantar ni omitir tiempo.' : state.current.playing || data.complete ? '' : null;
            setStatus((previous) => ({ position: data.position, duration: data.duration, message: message ?? previous.message }));
            if (data.resync) {
                state.current.playing = false;
                player?.pauseVideo?.();
                player?.seekTo?.(data.position, true);
            }
            if (data.complete && !state.current.done) {
                state.current.done = true;
                props.current.onCompleted();
            }
        }).catch(error);
        return state.current.queue;
    };
    const playerState = (playing, ended = false) => {
        state.current.playing = playing;
        if (!props.current.locked) {
            if (ended && !state.current.done) { state.current.done = true; props.current.onCompleted(); }
            return;
        }
        if (playing && !state.current.token) {
            props.current.getPlayer()?.pauseVideo?.();
            return;
        }
        pulse(ended);
    };

    useEffect(() => {
        mounted.current = true;
        const interval = setInterval(() => { if (state.current.playing && !document.hidden) pulse(); }, 5000);
        const visibility = () => { if (document.hidden) props.current.getPlayer()?.pauseVideo?.(); };
        document.addEventListener('visibilitychange', visibility);
        return () => { mounted.current = false; clearInterval(interval); document.removeEventListener('visibilitychange', visibility); };
    }, [baseUrl]);

    return { start, playerState, status };
}
