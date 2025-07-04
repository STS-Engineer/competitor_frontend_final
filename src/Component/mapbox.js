import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw';

function Mapbox() {
    const mapContainerRef = useRef(null);
    const map = useRef(null);
    const [filters] = useState({
        companyName: '',
        Product: '',
        country: '',
        RDLocation: '',
        HeadquartersLocation: '',
    });
    
    const [companies, setCompanies] = useState([]);


    useEffect(() => {
        // Fetch companies when the component mounts
        fetchCompanies();
    }, []);

    const addMarkersForFilteredCompanies = useCallback(() => {
        companies.forEach(company => {
            const { r_and_d_location, product, name, country, headquarters_location } = company;
            const companyName = name.toLowerCase();
            const filterName = filters.companyName.toLowerCase();
            const filterProduct = filters.Product.toLowerCase();
            const filterCountry = filters.country.toLowerCase();
            const filterr_and_d_location = filters.RDLocation.toLowerCase();
            const filterheadquarters_location = filters.HeadquartersLocation.toLowerCase();
    
            if (r_and_d_location && companyName.includes(filterName) && product.toLowerCase().includes(filterProduct) && country.toLowerCase().includes(filterCountry) && r_and_d_location.toLowerCase().includes(filterr_and_d_location) && headquarters_location.toLowerCase().includes(filterheadquarters_location)) {
                axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(r_and_d_location)}.json?access_token=your_access_token_here`)
                    .then(response => {
                        if (response.data.features && response.data.features.length > 0) {
                            const coordinates = response.data.features[0].geometry.coordinates;
                            const longitude = coordinates[0];
                            const latitude = coordinates[1];
                            let markerColor = '#000';
    
                            if (product) {
                                switch (product.toLowerCase()) {
                                    case 'chokes': markerColor = '#00FF00'; break;
                                    case 'seals': markerColor = '#FFA500'; break;
                                    case 'assembly': markerColor = '#0000FF'; break;
                                    case 'injection': markerColor = '#FF00FF'; break;
                                    case 'brush': markerColor = '#FFFF00'; break;
                                    default: break;
                                }
                            }
    
                            new mapboxgl.Marker({ color: markerColor })
                                .setLngLat([longitude, latitude])
                                .setPopup(new mapboxgl.Popup().setHTML(`<h1>${name}</h1><p>Country: ${country}</p>`))
                                .addTo(map.current);
    
                            map.current.flyTo({
                                center: [longitude, latitude],
                                essential: true
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching company location: ', error);
                    });
            }
        });
    }, [companies, filters, map]); // 👈 add all the real dependencies
    
    
    const addMarkersheadquarterForFilteredCompanies = useCallback(() => {
        companies.forEach(company => {
            const { r_and_d_location, product, name, country, headquarters_location } = company;
            const companyName = name.toLowerCase();
            const filterName = filters.companyName.toLowerCase();
            const filterProduct = filters.Product.toLowerCase();
            const filterCountry = filters.country.toLowerCase();
            const filterr_and_d_location = filters.RDLocation.toLowerCase();
            const filterheadquarters_location = filters.HeadquartersLocation.toLowerCase();
    
            if (r_and_d_location && companyName.includes(filterName) && product.toLowerCase().includes(filterProduct) && country.toLowerCase().includes(filterCountry) && r_and_d_location.toLowerCase().includes(filterr_and_d_location) && headquarters_location.toLowerCase().includes(filterheadquarters_location)) {
                axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(headquarters_location)}.json?access_token=your_access_token_here`)
                    .then(response => {
                        if (response.data.features && response.data.features.length > 0) {
                            const coordinates = response.data.features[0].geometry.coordinates;
                            const longitude = coordinates[0];
                            const latitude = coordinates[1];
                            let markerColor = '#000';
    
                            if (product) {
                                switch (product.toLowerCase()) {
                                    case 'chokes': markerColor = '#00FF00'; break;
                                    case 'seals': markerColor = '#FFA500'; break;
                                    case 'assembly': markerColor = '#0000FF'; break;
                                    case 'injection': markerColor = '#FF00FF'; break;
                                    case 'brush': markerColor = '#FFFF00'; break;
                                    default: break;
                                }
                            }
    
                            new mapboxgl.Marker({ color: markerColor })
                                .setLngLat([longitude, latitude])
                                .setPopup(new mapboxgl.Popup().setHTML(`<h1>${name}</h1><p>Country: ${country}</p>`))
                                .addTo(map.current);
    
                            map.current.flyTo({
                                center: [longitude, latitude],
                                essential: true
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching company location: ', error);
                    });
            }
        });
    }, [companies, filters, map]); // 👈 correct dependencies
    

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0], // Default center
                zoom: 1 // Default zoom
            });

            map.current.on('load', () => {
                // Add markers for the filtered companies after the map has loaded
                addMarkersForFilteredCompanies();
                addMarkersheadquarterForFilteredCompanies();
            });
        } else {
            // Clear existing markers before adding new ones
            clearMarkers();
            // Add markers for the filtered companies
            addMarkersForFilteredCompanies();
            addMarkersheadquarterForFilteredCompanies();
        }
    }, [companies, filters, addMarkersForFilteredCompanies, addMarkersheadquarterForFilteredCompanies]);



    const fetchCompanies = async () => {
        try {
            const response = await axios.get('https://avo-competitor-map-backend.azurewebsites.net/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies: ', error);
        }
    };

    const clearMarkers = () => {
        if (map.current) {
            map.current.remove(); // Remove existing map
            map.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [0, 0], // Default center
                zoom: 1 // Default zoom
            });
        }
    };




    return (
        <div style={{ position: 'relative', width: '20vw', height: '30vh' }}>
        <div ref={mapContainerRef} style={{ position: 'absolute', top: '10', margin: 'auto', width: '80%', height: '70%' }} />
    </div>
    

    );
}

export default Mapbox;
