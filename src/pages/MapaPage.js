import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';

const puntoInicial = {
    lng: 5,
    lat: 34,
    zoom: 2
}

export const MapaPage = () => {

    const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial);
    const { socket } = useContext( SocketContext );

    // escuchar los marcadores existentes, se puede hacer con peticion normal
    useEffect(() => {
        socket.on('marcadores-activos', (marcadores) => {
            for(const key of Object.keys( marcadores)) {
                agregarMarcador(marcadores[key], key);
            }
        })
    }, [socket, agregarMarcador])

    useEffect(() => {
        nuevoMarcador$.subscribe( marcador => {
            socket.emit('marcador-nuevo', marcador);
        })
    }, [nuevoMarcador$, socket]);

    useEffect(() => {
        movimientoMarcador$.subscribe( marcador => {
            socket.emit('marcador-actualizado', marcador);
        })
    }, [socket, movimientoMarcador$]);

    // Mover marcador mediante socket
    useEffect(() => {
        socket.on('marcador-actualizado', ( marcador ) => {
            actualizarPosicion( marcador );
        })
    }, [socket, actualizarPosicion])

    // escuchar nuevos marcadores
    useEffect(() => {
        socket.on('marcador-nuevo', (marcador) => {
            agregarMarcador(marcador, marcador.id);
        });
    }, [socket, agregarMarcador])

    return (
        <>
            <div className="info">
                LNG: {coords.lng} | LAT: {coords.lat} | zoom: {coords.zoom}
            </div>

            <div
                ref={ setRef }
                className="mapContainer" />
        </>
    )
}
