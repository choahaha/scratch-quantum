import {useEffect, useRef} from 'react';
import {attachBridge, embedUrl} from '../lib/embedBridge';
import {supabase} from '../lib/supabaseClient';

/**
 * The embedded Scratch editor plus its bridge lifecycle.
 * Sends MISSION_INIT when the iframe reports ready and again whenever the
 * Supabase token refreshes. Exposes the bridge via bridgeRef.
 */
const ScratchEmbed = ({mission, bridgeRef, onQuantumRun, onBridgeError}) => {
    const iframeRef = useRef(null);
    const handlersRef = useRef({onQuantumRun, onBridgeError});
    handlersRef.current = {onQuantumRun, onBridgeError};

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const sendInit = async () => {
            const {data} = await supabase.auth.getSession();
            if (!data.session) return;
            bridge.sendMissionInit({
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                missionId: mission.id,
                starterProject: mission.starter_project
            });
        };

        const bridge = attachBridge(iframe, {
            onReady: sendInit,
            onInitResult: payload => {
                if (!payload?.ok && handlersRef.current.onBridgeError) {
                    handlersRef.current.onBridgeError(payload?.error || 'init failed');
                }
            },
            onQuantumRun: payload => handlersRef.current.onQuantumRun?.(payload),
            onBridgeError: payload => handlersRef.current.onBridgeError?.(payload?.message)
        });
        bridgeRef.current = bridge;

        const handleTokenRefresh = () => sendInit();
        window.addEventListener('sq-token-refreshed', handleTokenRefresh);

        return () => {
            window.removeEventListener('sq-token-refreshed', handleTokenRefresh);
            bridge.detach();
            bridgeRef.current = null;
        };
    }, [mission.id]);

    return (
        <iframe
            ref={iframeRef}
            className="scratch-embed"
            src={embedUrl()}
            title="Scratch Quantum Editor"
            allow="clipboard-read; clipboard-write"
        />
    );
};

export default ScratchEmbed;
