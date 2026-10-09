import { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';

import { createConversation, endConversation } from '../services/conversationService';
import { translateSegment } from '../services/translationService';
import { getVelocidadVoz } from '../utils/preferences';

const SPEECH_LANGUAGE = 'es-ES';

// Fin de frase (ARQUITECTURA.md §3): silencio ≥ 0,8 s o fragmento de 8 s máx.
const UMBRAL_SILENCIO_DB = -50; // por debajo se considera silencio
const PAUSA_FIN_FRASE_MS = 800;
const DURACION_MAXIMA_MS = 8000;
const SONDEO_METRO_MS = 150;
const ESPERA_TRAS_FALLO_MS = 500; // evita un bucle cerrado si falla el micrófono
const TIEMPO_HABLA_MAXIMO_MS = 20000; // por si la voz del sistema no avisa al terminar

const OPCIONES_GRABACION = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true, // sin esto getStatus().metering viene vacío
};

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

// Ciclo en vivo por fragmentos: escuchar → enviar → hablar → escuchar… (§3).
// Máquina de estados: idle → listening → sending → speaking → idle (Detener).
export default function useTraduccionEnVivo() {
  const [estado, setEstado] = useState('idle');
  const [segmentos, setSegmentos] = useState([]);
  const [error, setError] = useState(null);
  const [iniciando, setIniciando] = useState(false);

  const recorder = useAudioRecorder(OPCIONES_GRABACION);

  // La sesión vive en refs: el bucle asíncrono se corta desde Detener, desde
  // un error o desde el desmontaje sin depender del estado de React.
  const activoRef = useRef(false);
  const iniciandoRef = useRef(false);
  const desmontadoRef = useRef(false);
  const conversationIdRef = useRef(null);
  const velocidadRef = useRef(1);
  const finHablaRef = useRef(null);

  function mensajeDeError(err) {
    if (!err?.response) {
      return 'No se pudo conectar con el servidor. Revisa que esté corriendo.';
    }
    if (err.response.status === 404) {
      return (
        err.response?.data?.msg ||
        'El servidor no conoce esta ruta (/translate). ¿Está desplegado el backend?'
      );
    }
    return err.response?.data?.msg || 'No se pudo completar la operación.';
  }

  // Corta la sesión: para la voz, despierta al bucle y cierra la conversación.
  async function finalizar(nuevoError = null) {
    activoRef.current = false;

    Speech.stop();
    if (finHablaRef.current) {
      const resolver = finHablaRef.current;
      finHablaRef.current = null;
      resolver();
    }

    if (nuevoError) setError(nuevoError);
    setEstado('idle');

    const id = conversationIdRef.current;
    conversationIdRef.current = null;

    if (id) {
      try {
        await endConversation(id);
      } catch (err) {
        console.warn('No se pudo cerrar la conversación:', err?.message);
      }
    }
  }

  // Promesa que resuelve al terminar de hablar (o al cortar la voz).
  function hablar(texto) {
    return new Promise((resolver) => {
      let resuelta = false;

      function terminar() {
        if (resuelta) return;
        resuelta = true;
        clearTimeout(limite);
        finHablaRef.current = null;
        resolver();
      }

      // Si el sistema de voz no llama a onDone, el bucle no se queda pillado.
      const limite = setTimeout(terminar, TIEMPO_HABLA_MAXIMO_MS);

      finHablaRef.current = terminar;

      Speech.stop();
      Speech.speak(texto, {
        language: SPEECH_LANGUAGE,
        rate: velocidadRef.current,
        onDone: terminar,
        onError: (err) => {
          console.warn('No se pudo reproducir la traducción:', err?.message);
          terminar();
        },
      });
    });
  }

  // Graba hasta detectar la pausa de una frase. Resuelve con la ruta del
  // fragmento o null si no hubo voz (el silencio no se manda al servidor).
  function grabarFragmento() {
    return new Promise((resolverFragmento) => {
      let cerrada = false;
      let intervalo = null;

      const cerrar = async (ruta) => {
        if (cerrada) return;
        cerrada = true;
        if (intervalo) clearInterval(intervalo);

        try {
          await recorder.stop();
        } catch (err) {
          // Ya estaba parado: el fragmento sigue siendo válido.
        }

        resolverFragmento(ruta);
      };

      (async () => {
        try {
          // En Android cada stop() deja el grabador sin preparar.
          await recorder.prepareToRecordAsync();

          if (!activoRef.current) {
            return cerrar(null);
          }

          recorder.record();

          const inicio = Date.now();
          let huboVoz = false;
          let ultimoVoz = inicio;

          intervalo = setInterval(async () => {
            try {
              if (!activoRef.current) {
                return cerrar(null);
              }

              const ahora = Date.now();
              const estadoGrabacion = recorder.getStatus();
              const nivel =
                typeof estadoGrabacion.metering === 'number'
                  ? estadoGrabacion.metering
                  : -160; // sin medición se toma como silencio

              if (nivel > UMBRAL_SILENCIO_DB) {
                huboVoz = true;
                ultimoVoz = ahora;
              }

              const duracion = ahora - inicio;
              const pausa = ahora - ultimoVoz;
              const finDeFrase =
                duracion >= DURACION_MAXIMA_MS ||
                (huboVoz && pausa >= PAUSA_FIN_FRASE_MS);

              if (finDeFrase) {
                await cerrar(huboVoz ? recorder.uri : null);
              }
            } catch (err) {
              console.warn('No se pudo medir el fragmento:', err?.message);
              await cerrar(null);
            }
          }, SONDEO_METRO_MS);
        } catch (err) {
          console.warn('No se pudo grabar el fragmento:', err?.message);
          await cerrar(null);
          // Si el micrófono falla siempre, esperamos antes de reintentar
          // para no girar el bucle a máxima velocidad.
          await esperar(ESPERA_TRAS_FALLO_MS);
        }
      })();
    });
  }

  // Ciclo principal: escuchar → enviar → hablar → escuchar… hasta Detener.
  async function bucle() {
    while (activoRef.current) {
      setEstado('listening');

      const ruta = await grabarFragmento();
      if (!activoRef.current) break;
      if (!ruta) continue; // sin voz: la escucha sigue sin cortar

      setEstado('sending');

      let fragmento;
      try {
        fragmento = await translateSegment(conversationIdRef.current, ruta);
      } catch (err) {
        await finalizar(mensajeDeError(err));
        break;
      }

      if (fragmento.originalText) {
        setSegmentos((anteriores) => [...anteriores, fragmento]);
      }

      if (!activoRef.current) break;

      if (fragmento.translatedText) {
        setEstado('speaking');
        await hablar(fragmento.translatedText);
      }
    }
  }

  async function iniciar() {
    if (iniciandoRef.current || activoRef.current) return;

    iniciandoRef.current = true;
    setIniciando(true);
    setError(null);

    try {
      const permiso = await requestRecordingPermissionsAsync();

      if (!permiso.granted) {
        setError('Sin permiso de micrófono. Actívalo en los ajustes del teléfono.');
        return;
      }

      // En iOS allowsRecording solo va junto a playsInSilentMode (expo-audio).
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      const conversacion = await createConversation();

      if (!conversacion?._id) {
        setError('El servidor no devolvió la conversación.');
        return;
      }

      if (desmontadoRef.current) {
        endConversation(conversacion._id).catch(() => {});
        return;
      }

      velocidadRef.current = await getVelocidadVoz();

      activoRef.current = true;
      conversationIdRef.current = conversacion._id;
      setSegmentos([]);
      setEstado('listening');

      // Cualquier fallo no previsto del ciclo corta la sesión con mensaje.
      bucle().catch((err) => {
        console.error('El ciclo de traducción se detuvo:', err);
        finalizar('Algo falló en el ciclo de traducción.');
      });
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      iniciandoRef.current = false;
      setIniciando(false);
    }
  }

  // Al salir de la pantalla se corta la sesión igual que con Detener.
  useEffect(() => {
    desmontadoRef.current = false;
    return () => {
      desmontadoRef.current = true;
      finalizar();
    };
    // finalizar solo toca refs y setState: la copia del primer render sirve.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    estado,
    segmentos,
    error,
    iniciando,
    iniciar,
    detener: () => finalizar(),
  };
}
