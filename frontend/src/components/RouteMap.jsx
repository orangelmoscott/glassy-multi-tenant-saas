import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Info, X, ExternalLink } from 'lucide-react';
import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const RouteMap = ({ assignments }) => {
    const [viewState, setViewState] = useState({
        latitude: 40.4168,
        longitude: -3.7038,
        zoom: 12
    });
    const [markers, setMarkers] = useState([]);
    const [routeData, setRouteData] = useState(null);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);

    const user = JSON.parse(localStorage.getItem('glassy_user') || '{}');
    const companyLogo = user.logo || ''; 

    useEffect(() => {
        if (assignments.length > 0) {
            geocodeAddresses();
        } else {
            setLoading(false);
        }
        
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition((pos) => {
                const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(coords);
            }, (err) => console.error(err), { enableHighAccuracy: true });
            
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, [assignments]);

    const geocodeAddresses = async () => {
        setLoading(true);
        try {
            const geocodedPoints = await Promise.all(
                assignments.map(async (job) => {
                    const address = job.clientId?.address;
                    if (!address) return null;
                    
                    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
                    const res = await axios.get(url);
                    
                    if (res.data.features && res.data.features.length > 0) {
                        const [lng, lat] = res.data.features[0].center;
                        return {
                            ...job,
                            coordinates: { lng, lat },
                            formattedAddress: res.data.features[0].place_name
                        };
                    }
                    return null;
                })
            );

            const validPoints = geocodedPoints.filter(p => p !== null);
            setMarkers(validPoints);
            
            if (validPoints.length > 0) {
                setViewState(prev => ({
                    ...prev,
                    latitude: validPoints[0].coordinates.lat,
                    longitude: validPoints[0].coordinates.lng,
                    zoom: 13
                }));
                
                if (validPoints.length > 1) {
                    calculateOptimizedRoute(validPoints);
                }
            }
        } catch (err) {
            console.error("Error geocodificando:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateOptimizedRoute = async (points) => {
        try {
            let coords = [];
            if (userLocation) {
                coords.push(`${userLocation.lng},${userLocation.lat}`);
            }
            points.forEach(p => {
                coords.push(`${p.coordinates.lng},${p.coordinates.lat}`);
            });

            const coordinatesString = coords.join(';');
            const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinatesString}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`;
            
            const res = await axios.get(url);
            if (res.data.trips && res.data.trips[0]) {
                setRouteData(res.data.trips[0].geometry);
            }
        } catch (err) {
            console.error("Error ruta:", err);
        }
    };

    const routeLayerStyle = {
        id: 'route',
        type: 'line',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.8
        }
    };

    if (!MAPBOX_TOKEN) {
        return (
            <div className="bg-slate-900 p-8 rounded-[35px] text-center border border-slate-800 shadow-2xl">
                 <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                     <Info size={32} />
                 </div>
                 <h3 className="text-lg font-black text-white uppercase italic">Configuración Requerida</h3>
                 <p className="text-slate-400 text-xs mt-2 font-bold leading-relaxed px-6">
                     Para ver tus rutas, necesitas una clave API de Mapbox alojada bajo el nombre: 
                     <br/><span className="text-blue-400 mt-2 block font-mono bg-blue-500/10 py-2 rounded-lg">VITE_MAPBOX_ACCESS_TOKEN</span>
                 </p>
            </div>
        );
    }

    return (
        <div className="h-[550px] md:h-[650px] w-full rounded-[35px] md:rounded-[45px] overflow-hidden shadow-2xl border border-slate-100 relative bg-slate-50 group">
            {loading && (
                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-slate-900 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="font-black text-slate-800 uppercase tracking-[0.3em] text-[9px]">Calculando Navegación...</p>
                </div>
            )}

            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapStyle="mapbox://styles/mapbox/light-v11"
                style={{ width: '100%', height: '100%' }}
                mapboxAccessToken={MAPBOX_TOKEN}
            >
                <GeolocateControl position="top-right" trackUserLocation={true} />
                <NavigationControl position="top-right" scrollZoom={false} />

                {routeData && (
                    <Source type="geojson" data={routeData}>
                        <Layer {...routeLayerStyle} />
                    </Source>
                )}

                {markers.map((point, index) => (
                    <Marker 
                        key={index} 
                        longitude={point.coordinates.lng} 
                        latitude={point.coordinates.lat}
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            setSelectedPoint(point);
                        }}
                    >
                        <div className="group cursor-pointer flex flex-col items-center drop-shadow-2xl">
                            <div className="relative w-11 h-11 flex items-center justify-center">
                                <div className="absolute inset-0 bg-white rounded-2xl rotate-45 border-2 border-slate-900 shadow-xl group-hover:scale-110 transition-transform duration-300"></div>
                                <div className="z-10 w-7 h-7 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                    {companyLogo ? (
                                        <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase">G</div>
                                    )}
                                </div>
                                <div className="absolute -top-3 -right-3 z-20 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-md">
                                    {index + 1}
                                </div>
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>

            <AnimatePresence>
                {selectedPoint && (
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="absolute bottom-4 left-4 right-4 z-50 md:bottom-8 md:left-8 md:right-8"
                    >
                        <div className="bg-slate-900/95 backdrop-blur-xl p-5 md:p-8 rounded-[35px] shadow-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                            <div className="flex items-center gap-5 w-full">
                                <div className="w-14 h-14 bg-blue-500 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                                    <Navigation size={28} />
                                </div>
                                <div className="min-w-0 pr-4">
                                    <h4 className="text-white text-base md:text-xl font-black uppercase tracking-tight truncate">{selectedPoint.clientId?.companyName}</h4>
                                    <p className="text-slate-400 text-xs font-bold truncate opacity-80">{selectedPoint.clientId?.address}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => setSelectedPoint(null)} className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 transition-all flex items-center justify-center"><X size={20}/></button>
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPoint.clientId?.address)}`}
                                    target="_blank" rel="noreferrer"
                                    className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:scale-[1.03] transition-all"
                                >
                                    Navegar <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur px-5 py-2 rounded-2xl border border-slate-100 shadow-xl flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase text-slate-800 tracking-[0.15em]">{markers.length} Clientes hoy</span>
            </div>
        </div>
    );
};

export default RouteMap;
