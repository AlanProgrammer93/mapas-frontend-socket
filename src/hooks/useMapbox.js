import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';

import mapboxgl from 'mapbox-gl';
import { Subject } from 'rxjs';
mapboxgl.accessToken = 'pk.eyJ1IjoiYWxhbjkzIiwiYSI6ImNrbHdwdnd1dzA0OXgybnBrNnFnMmozbmUifQ.43JukpjlmtcehCpa63dLjw';

export const useMapbox = (puntoInicial) => {
    const mapaDiv = useRef();
    const setRef = useCallback((node) => {
        mapaDiv.current = node;
    }, []);

    const marcadores = useRef({});

    // Observables de Rxjs
    const movimientoMarcador = useRef( new Subject() );
    const nuevoMarcador = useRef( new Subject() );

    const mapa = useRef();
    const [coords, setCoords] = useState(puntoInicial);

    // funcion para agregar marcadores
    const agregarMarcador = useCallback( (e, id) => {

        const { lng, lat } = e.lngLat || e;

        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        marker
            .setLngLat([ lng, lat ])
            .addTo( mapa.current )
            .setDraggable( true );

        marcadores.current[ marker.id ] = marker;

        if ( !id ) {
            nuevoMarcador.current.next({
                id: marker.id,
                lng,
                lat
            });
        }
        
        // escuchar movimientos del marcador
        marker.on('drag', ({ target }) => {
            const { id } = target;
            const { lng, lat } = target.getLngLat();
            movimientoMarcador.current.next({ id, lng, lat });
        });

    });

    // funcion para actualizar la posicion
    const actualizarPosicion = useCallback(({ id, lng, lat }) => {
        marcadores.current[id].setLngLat([ lng, lat ]);
    }, []);

    useEffect(() => {

        const map = new mapboxgl.Map({
            container: mapaDiv.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [ puntoInicial.lng, puntoInicial.lat ],
            zoom: puntoInicial.zoom
        });

        mapa.current = map;

    }, [puntoInicial]);

    useEffect(() => {
        mapa.current?.on('move', () => {
            const { lng, lat } = mapa.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: mapa.current.getZoom().toFixed(2)
            })
        });

    }, []);

    // Agregar marcadores al hacer click
    useEffect(() => {
        mapa.current?.on( 'click', agregarMarcador );
    }, [agregarMarcador]);

    return {
        coords,
        marcadores,
        nuevoMarcador$: nuevoMarcador.current,
        movimientoMarcador$: movimientoMarcador.current,
        setRef,
        agregarMarcador,
        actualizarPosicion
    }
}
