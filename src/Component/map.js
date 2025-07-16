import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import {useNavigate} from 'react-router-dom';
import XlsxPopulate from 'xlsx-populate/browser/xlsx-populate';
import { Modal } from 'antd';
import './map.css'  
 
 
mapboxgl.accessToken = 'pk.eyJ1IjoibW9vdGV6ZmFyd2EiLCJhIjoiY2x1Z3BoaTFqMW9hdjJpcGdibnN1djB5cyJ9.It7emRJnE-Ee59ysZKBOJw';
const avoPlants = [
    { name: 'Tunisia', coordinates: [9.5375, 33.8869] },
    { name: 'Poitiers', coordinates: [0.3404, 46.5802] },
    { name: 'Amiens', coordinates: [2.3023, 49.8951] },
    { name: 'Frankfurt', coordinates: [8.6821, 50.1109] },
    { name: 'Chennai', coordinates: [80.2707, 13.0827] },
    { name: 'Kunshan', coordinates: [120.9822, 31.3858] },
    { name: 'Tianjin', coordinates: [117.3616, 39.3434] },
    { name: 'Anhui', coordinates: [117.9249, 30.6007] },
    { name: 'Monterrey', coordinates: [-100.3161, 25.6866] },
    { name: 'Mexico', coordinates: [-99.1332, 19.4326] },
];
 
function Map() {
    const mapContainerRef = useRef(null);
    const map = useRef(null);
    const [filters, setFilters] = useState({
        companyName: '',
        Product: '',
        country: '',
        RDLocation: '',
        HeadquartersLocation: '',
        ProductionLocation: '',
        region: '',
        avoPlant: ''
    });
    const [companies, setCompanies] = useState([]);
    const [companyNames, setCompanyNames] = useState([]);
    const [countries, setCountries] = useState([]);
    const [product, setProduct] = useState([]);
    const [country, setCountry] = useState([]);
    const [Rdlocation, setRdlocation] = useState([]);
    const [headquarterlocation, setHeadquarterlocation] = useState([]);
    const [productionlocation, setProductionlocation] = useState([]);
    const [showRdLocation, setShowRdLocation] = useState(true);
    const [showHeadquarterLocation, setShowHeadquarterLocation] = useState(true);
    const [showproductionLocation, setShowproductionLocation] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const rdMarkersRef = useRef([]);      // For R&D locations
    const hqMarkersRef = useRef([]);      // For Headquarters
    const productionMarkersRef = useRef([]); // For Production locations
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    
 
useEffect(() => {
  // Fetch data when component mounts
  fetchCompanies();

  // Initialize map
  if (!map.current) {
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 1,
      preserveDrawingBuffer: true
    });

    map.current.on('load', () => {
      setIsInitialLoad(true); // Set flag for initial load
    });
  }

  return () => {
    // Clean up map on unmount
    if (map.current) {
      map.current.remove();
      map.current = null;
    }
  };
}, []);




     const addAvoPlantMarkers = useCallback(() => {
  avoPlants.forEach(plant => {
    if (filters.avoPlant === '' || plant.name.toLowerCase() === (filters.avoPlant || '').toLowerCase()) {
      new mapboxgl.Marker({ color: 'red', scale: 0.7 })
        .setLngLat(plant.coordinates)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${plant.name}</h3>`))
        .addTo(map.current);
    }
  });
}, [filters.avoPlant, map]); 
const addAllMarkers = useCallback(() => {
  clearAllMarkers();
  
  if (showRdLocation) {
    companies.forEach(company => {
      if (company.r_and_d_location) {
        addMarker(company, company.r_and_d_location, '#0066CC', 'R&D Location');
      }
    });
  }
  
  if (showHeadquarterLocation) {
    companies.forEach(company => {
      if (company.headquarters_location) {
        addMarker(company, company.headquarters_location, '#00CC66', 'Headquarters');
      }
    });
  }
  
  if (showproductionLocation) {
    companies.forEach(company => {
      if (company.productionLocations?.length > 0) {
        company.productionLocations.forEach(location => {
          addMarker(company, location, '#FF5733', 'Production Location');
        });
      }
    });
  }
  
  addAvoPlantMarkers();
}, [companies, showRdLocation, showHeadquarterLocation, showproductionLocation]);

// Helper function to add a single marker
const addMarker = (company, location, color, locationType) => {
  axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`)
    .then(response => {
      if (response.data.features?.length > 0) {
        const coordinates = response.data.features[0].geometry.coordinates;
        
        const marker = new mapboxgl.Marker({ color, scale: 0.7 })
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`
            <div style="font-family: Arial, sans-serif; padding: 8px;">
              <h3 style="margin: 5px 0; font-size: 16px; color: ${color};">${company.name}</h3>
              <p style="margin: 2px 0; font-size: 14px;"><strong>${locationType}:</strong> ${location}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Product:</strong> ${company.product || 'N/A'}</p>
              <p style="margin: 2px 0; font-size: 14px;"><strong>Country:</strong> ${company.country || 'N/A'}</p>
            </div>
          `))
          .addTo(map.current);

        // Store marker reference based on type
        if (locationType === 'R&D Location') {
          rdMarkersRef.current.push(marker);
        } else if (locationType === 'Headquarters') {
          hqMarkersRef.current.push(marker);
        } else {
          productionMarkersRef.current.push(marker);
        }

        // Add click event for modal
        marker.getElement().addEventListener('click', (e) => {
          e.stopPropagation();
          showModal(company);
        });
      }
    })
    .catch(error => {
      console.error(`Error fetching ${locationType} coordinates:`, error);
    });
};


    const showModal = useCallback((company) => {   
      setSelectedCompany(company);
      setIsModalVisible(true);
    }, []);

    
     
    const regionBoundaries = useMemo(() => ({
      Europe: { minLat: 36, maxLat: 71, minLng: -33, maxLng: 41 },
      East_Asia: { minLat: 18, maxLat: 54, minLng: 100, maxLng: 150 },
      South_Asia: { minLat: 5, maxLat: 35, minLng: 65, maxLng: 106 },
      NAFTA: { minLat: 10, maxLat: 72, minLng: -168, maxLng: -34 },
    }), []);
   

const addMarkersForFilteredCompanies = useCallback(() => {
  // Clear existing R&D markers first
  rdMarkersRef.current.forEach(marker => marker.remove());
  rdMarkersRef.current = [];

  // Skip if R&D locations are hidden
  if (!showRdLocation) return;

  // Normalize filter values
  const filterName = (filters.companyName || '').toLowerCase().trim();
  const filterProduct = (filters.Product || '').toLowerCase().trim();
  const filterCountry = (filters.country || '').toLowerCase().trim();
  const filterRdLocation = (filters.RDLocation || '').toLowerCase().trim();
  const filterHQ = (filters.HeadquartersLocation || '').toLowerCase().trim();
  const filterProduction = (filters.ProductionLocation || '').toLowerCase().trim();
  const filterRegion = filters.region;

  // Filter companies based on all active criteria
  const filteredCompanies = companies.filter(company => {
    const {
      r_and_d_location,
      product,
      name,
      country,
      headquarters_location,
      productionlocation,
      region
    } = company;

    // Skip if no R&D location
    if (!r_and_d_location) return false;

    // Normalize company data
    const companyName = (name || '').toLowerCase().trim();
    const prod = (product || '').toLowerCase().trim();
    const cnt = (country || '').toLowerCase().trim();
    const rdLoc = (r_and_d_location || '').toLowerCase().trim();
    const hqLoc = (headquarters_location || '').toLowerCase().trim();
    const prodLoc = (productionlocation || '').toLowerCase().trim();
    const compRegion = (region || '').toLowerCase().trim();

    // Apply all filters
   const nameMatch = !filterName || companyName.includes(filterName);

    const productMatch = !filterProduct || prod.includes(filterProduct);
    const countryMatch = !filterCountry || cnt.includes(filterCountry);
    const rdLocationMatch = !filterRdLocation || rdLoc.includes(filterRdLocation);
    const hqMatch = !filterHQ || hqLoc.includes(filterHQ);
    const prodMatch = !filterProduction || prodLoc.includes(filterProduction);
    const regionMatch = !filterRegion || compRegion.includes(filterRegion.toLowerCase());

    return nameMatch && productMatch && countryMatch && rdLocationMatch && hqMatch && prodMatch && regionMatch;
  });

  // Geocode and add markers for filtered companies
  const geocodePromises = filteredCompanies.map(company => {
    const { r_and_d_location } = company;
    
    return axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(r_and_d_location)}.json`, {
      params: {
        access_token: mapboxgl.accessToken,
        limit: 1
      }
    })
    .then(response => {
      if (response.data.features?.length > 0) {
        const coordinates = response.data.features[0].geometry.coordinates;

        // Apply region boundary filter if selected
        if (filterRegion && regionBoundaries[filterRegion]) {
          const boundaries = regionBoundaries[filterRegion];
          const [lng, lat] = coordinates;
          if (
            lat < boundaries.minLat || lat > boundaries.maxLat ||
            lng < boundaries.minLng || lng > boundaries.maxLng
          ) {
            return null; // Skip if outside region
          }
        }

        // Create and return marker config
        return {
          company,
          coordinates,
          color: '#0066CC',
          locationType: 'R&D Location'
        };
      }
      return null;
    })
    .catch(error => {
      console.error('Error geocoding R&D location:', error);
      return null;
    });
  });

  // Process all geocoding results
  Promise.all(geocodePromises).then(results => {
    results.forEach(result => {
      if (!result) return;

      const { company, coordinates, color, locationType } = result;
      
      // Create marker
      const marker = new mapboxgl.Marker({ 
        color,
        scale: 0.7 
      })
        .setLngLat(coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`
          <div style="font-family: Arial, sans-serif; padding: 8px;">
            <h3 style="margin: 5px 0; font-size: 16px; color: ${color};">${company.name}</h3>
            <p style="margin: 2px 0; font-size: 14px;"><strong>${locationType}:</strong> ${company.r_and_d_location}</p>
            <p style="margin: 2px 0; font-size: 14px;"><strong>Product:</strong> ${company.product || 'N/A'}</p>
            <p style="margin: 2px 0; font-size: 14px;"><strong>Country:</strong> ${company.country || 'N/A'}</p>
          </div>
        `))
        .addTo(map.current);

      // Store marker reference
      rdMarkersRef.current.push(marker);

      // Add click event
      marker.getElement().addEventListener('click', (e) => {
        e.stopPropagation();
        showModal(company);
      });
    });

    // Log filtered count if debugging
    if (process.env.NODE_ENV === 'development' && filterRdLocation) {
      console.log(`Showing ${filteredCompanies.length} R&D locations matching filters`);
    }
  });
}, [companies, filters, map, regionBoundaries, showModal, showRdLocation]);


 
const addMarkersheadquarterForFilteredCompanies = useCallback(() => {
  // Clear existing HQ markers first
  hqMarkersRef.current.forEach(marker => marker.remove());
  hqMarkersRef.current = [];

  // Skip if HQ checkbox is unchecked
  if (!showHeadquarterLocation) return;

  // Get filter values (normalized)
  const filterName = (filters.companyName || '').toLowerCase().trim();
  const filterProduct = (filters.Product || '').toLowerCase().trim();
  const filterCountry = (filters.country || '').toLowerCase().trim();
  const filterHQ = (filters.HeadquartersLocation || '').toLowerCase().trim();
  const filterProduction = (filters.ProductionLocation || '').toLowerCase().trim();

  // Filter companies based on all criteria
  const filteredCompanies = companies.filter(company => {
    const {
      headquarters_location,
      product,
      name,
      country,
      productionlocation
    } = company;

    // Skip if no HQ location
    if (!headquarters_location) return false;

    // Normalize company data
    const companyName = (name || '').toLowerCase().trim();
    const prod = (product || '').toLowerCase().trim();
    const cnt = (country || '').toLowerCase().trim();
    const hqLoc = (headquarters_location || '').toLowerCase().trim();
    const prodLoc = (productionlocation || '').toLowerCase().trim();

    // Apply all filters
    const nameMatch = !filterName || companyName.includes(filterName);
    const productMatch = !filterProduct || prod.includes(filterProduct);
    const countryMatch = !filterCountry || cnt.includes(filterCountry);
    const hqMatch = !filterHQ || hqLoc.includes(filterHQ);
    const prodMatch = !filterProduction || prodLoc.includes(filterProduction);

    return nameMatch && productMatch && countryMatch && hqMatch && prodMatch;
  });

  // Add markers for filtered companies
  filteredCompanies.forEach(company => {
    const { headquarters_location } = company;
    
    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(headquarters_location)}.json?access_token=${mapboxgl.accessToken}`)
      .then(response => {
        if (response.data.features && response.data.features.length > 0) {
          const coordinates = response.data.features[0].geometry.coordinates;

          // Apply region filter if selected
          if (filters.region) {
            const boundaries = regionBoundaries[filters.region];
            if (boundaries) {
              const [lng, lat] = coordinates;
              if (
                lat < boundaries.minLat || lat > boundaries.maxLat ||
                lng < boundaries.minLng || lng > boundaries.maxLng
              ) {
                return; // Skip if outside region
              }
            }
          }

          // Create marker with green color for HQ locations
          const marker = new mapboxgl.Marker({ 
            color: '#00CC66', // Green color for HQ
            scale: 0.7 
          })
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(`
              <div style="font-family: Arial, sans-serif; padding: 8px;">
                <h3 style="margin: 5px 0; font-size: 16px; color: #00CC66;">${company.name}</h3>
                <p style="margin: 2px 0; font-size: 14px;"><strong>Headquarters:</strong> ${headquarters_location}</p>
                <p style="margin: 2px 0; font-size: 14px;"><strong>Product:</strong> ${company.product || 'N/A'}</p>
                <p style="margin: 2px 0; font-size: 14px;"><strong>Country:</strong> ${company.country || 'N/A'}</p>
              </div>
            `))
            .addTo(map.current);

          // Store marker reference for cleanup
          hqMarkersRef.current.push(marker);

          // Add click event for modal
          const el = marker.getElement();
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            showModal(company);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching HQ location:', error);
      });
  });
}, [companies, filters, map, regionBoundaries, showModal, showHeadquarterLocation]);

 
const addMarkersproductionForFilteredCompanies = useCallback(() => {
  // Clear existing markers first
  productionMarkersRef.current.forEach(marker => marker.remove());
  productionMarkersRef.current = [];

  if (!showproductionLocation) return;

  // Get all active filter values (normalized)
  const filterName = (filters.companyName || '').toLowerCase().trim();
  const filterProduct = (filters.Product || '').toLowerCase().trim();
  const filterCountry = (filters.country || '').toLowerCase().trim();
  const filterRegion = (filters.region || '').toLowerCase().trim();
  const filterProduction = (filters.ProductionLocation || '').toLowerCase().trim();

  // Filter companies based on all criteria
  const filteredCompanies = companies.filter(company => {
    const {
      name,
      product,
      country,
      region,
      productionLocations = []
    } = company;

    // Skip if no production locations
    if (!productionLocations || productionLocations.length === 0) return false;

    // Normalize company data
    const companyName = (name || '').toLowerCase().trim();
    const prod = (product || '').toLowerCase().trim();
    const cnt = (country || '').toLowerCase().trim();
    const reg = (region || '').toLowerCase().trim();

    // Apply all filters
    const nameMatch = !filterName || companyName.includes(filterName);
    const productMatch = !filterProduct || prod.includes(filterProduct);
    const countryMatch = !filterCountry || cnt.includes(filterCountry);
    const regionMatch = !filterRegion || reg.includes(filterRegion);
    
    // Special handling for production location filter
    const productionMatch = !filterProduction || 
      productionLocations.some(loc => 
        loc.toLowerCase().includes(filterProduction)
      );

    return nameMatch && productMatch && countryMatch && 
           regionMatch && productionMatch;
  });

  // Add markers for filtered companies
  filteredCompanies.forEach(company => {
    company.productionLocations.forEach(location => {
      // Skip if specific production location is filtered and doesn't match
      if (filterProduction && !location.toLowerCase().includes(filterProduction)) {
        return;
      }

      axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`)
        .then(response => {
          if (!response.data.features?.length) return;

          const coordinates = response.data.features[0].geometry.coordinates;
          const [lng, lat] = coordinates;

          // Apply region boundary filter if selected
          if (filters.region) {
            const boundaries = regionBoundaries[filters.region];
            if (boundaries) {
              if (
                lat < boundaries.minLat || lat > boundaries.maxLat ||
                lng < boundaries.minLng || lng > boundaries.maxLng
              ) {
                return; // Skip if outside region
              }
            }
          }

          // Create marker
          const marker = new mapboxgl.Marker({
            color: '#FF5733',
            scale: 0.7
          })
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`
              <div>
                <h3>${company.name}</h3>
                <p>Production: ${location}</p>
                <p>Country: ${company.country}</p>
                <p>Product: ${company.product}</p>
                ${company.headquarters_location ? `<p>HQ: ${company.headquarters_location}</p>` : ''}
              </div>
            `))
            .addTo(map.current);

          productionMarkersRef.current.push(marker);
        })
        .catch(error => {
          console.error('Error geocoding production location:', error);
        });
    });
  });
}, [
  companies, 
  filters.companyName,
  filters.Product,
  filters.country,
  filters.region,
  filters.ProductionLocation,
  showproductionLocation,
  map,
  regionBoundaries
]);


const clearAllMarkers = () => {
  // Clear R&D markers
  rdMarkersRef.current.forEach(marker => marker.remove());
  rdMarkersRef.current = [];
  
  // Clear HQ markers
  hqMarkersRef.current.forEach(marker => marker.remove());
  hqMarkersRef.current = [];
  
  // Clear Production markers
  productionMarkersRef.current.forEach(marker => marker.remove());
  productionMarkersRef.current = [];
};


  const markersRef = useRef([]);
useEffect(() => {
    if (map.current) {
        const bounds = new mapboxgl.LngLatBounds();
        
        // Remove existing markers before adding new ones
        if (markersRef.current.length > 0) {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];
        }

        // Define icons for R&D and HQ locations
        const rdIcon = 'https://example.com/rd-icon.png';  // Replace with actual R&D icon URL
        const hqIcon = 'https://example.com/hq-icon.png';  // Replace with actual HQ icon URL

        companies.forEach(company => {
            const { r_and_d_location, headquarters_location, product, name, country, region, productionlocation } = company;
         const companyName = (name || '').toLowerCase();
         const filterName = (filters.companyName || '').toLowerCase();
         const filterProduct = (filters.Product || '').toLowerCase();
         const filterCountry = (filters.country || '').toLowerCase();
         const filterRegion = (filters.region || '').toLowerCase();
        const filterRdLocation = (filters.RDLocation || '').toLowerCase();
        const filterHeadquartersLocation = (filters.HeadquartersLocation || '').toLowerCase();
        const filterproductionLocation = (filters.ProductionLocation || '').toLowerCase();


            const regionMatches = filterRegion ? region.toLowerCase().includes(filterRegion) : true;
            const rdLocationMatches = filterRdLocation ? r_and_d_location?.toLowerCase().includes(filterRdLocation) : true;
            const headquartersMatches = filterHeadquartersLocation ? headquarters_location?.toLowerCase().includes(filterHeadquartersLocation) : true;
             const productlocatMatches = filterproductionLocation ? productionlocation?.toLowerCase().includes(filterproductionLocation) : true;
            const companyMatches = companyName.includes(filterName) &&
                                   product.toLowerCase().includes(filterProduct) &&
                                   country.toLowerCase().includes(filterCountry);

            if (companyMatches && regionMatches && rdLocationMatches && headquartersMatches && productlocatMatches) {
                const location = r_and_d_location || headquarters_location;
                if (location) {
                    const markerIcon = r_and_d_location ? rdIcon : hqIcon; // Set appropriate icon
                    const markerPopup = `
                        <div style="font-family: Arial, sans-serif; padding: 8px; text-align: center;">
                            <h3 style="margin: 5px 0; font-size: 16px;">${name}</h3>
                            <p style="margin: 2px 0; font-size: 14px; color: gray;">${product}</p>
                        </div>
                    `;

                    axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxgl.accessToken}`)
                        .then(response => {
                            if (response.data.features.length > 0) {
                                const coordinates = response.data.features[0].geometry.coordinates;

                                // Create a custom marker element
                                const el = document.createElement('div');
                                el.style.backgroundImage = `url(${markerIcon})`;
                                el.style.width = '30px'; // Adjust size
                                el.style.height = '30px';
                                el.style.backgroundSize = 'cover';
                                el.style.borderRadius = '50%';
                                el.style.cursor = 'pointer';

                                // Create and add the marker
                                const marker = new mapboxgl.Marker(el)
                                    .setLngLat(coordinates)
                                    .setPopup(new mapboxgl.Popup({ offset: 10 }).setHTML(markerPopup))
                                    .addTo(map.current);

                                markersRef.current.push(marker); // Store reference to remove markers later
                                bounds.extend(coordinates);
                            }

                          
                        })
                        .catch(error => console.error('Error fetching location:', error));
                }
            }
        });
    }
}, [companies, filters]);

useEffect(() => {
  if (!map.current || !companies.length) return;

  if (isInitialLoad) {
    addAllMarkers(); // Show everything at first
    setIsInitialLoad(false);
  } else {
    clearAllMarkers();

    // ✅ Show R&D, HQ, and Production markers when filtering by companyName, Product, or Country
    if (filters.companyName || filters.Product || filters.country) {
      addMarkersForFilteredCompanies(); // R&D markers
      addMarkersheadquarterForFilteredCompanies(); // HQ markers
      addMarkersproductionForFilteredCompanies(); // 🆕 Production markers
    }

    // ✅ Location-specific filters override general filters
    else if (filters.RDLocation) {
      addMarkersForFilteredCompanies(); // Only R&D markers
    } else if (filters.HeadquartersLocation) {
      addMarkersheadquarterForFilteredCompanies(); // Only HQ markers
    } else if (filters.ProductionLocation) {
      addMarkersproductionForFilteredCompanies(); // Only production markers
    } else {
      addAllMarkers(); // Fallback: show everything
    }

    // ✅ Always show AVO plant markers
    addAvoPlantMarkers();
  }
}, [
  companies,
  filters,
  isInitialLoad,
  addAllMarkers,
  addMarkersForFilteredCompanies,
  addMarkersheadquarterForFilteredCompanies,
  addMarkersproductionForFilteredCompanies,
  addAvoPlantMarkers
]);



const findClosestCompany = useCallback(async (selectedPlantname, selectedPlantCoordinates, companies, mapboxToken) => {
  let closestCompany = null;
  let minDistance = Infinity;

  for (const company of companies) {
      const { r_and_d_location, headquarters_location } = company;
      const location = r_and_d_location || headquarters_location;
      if (location) {
          try {
              const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}`);
              if (response.data.features && response.data.features.length > 0) {
                  const companyCoords = response.data.features[0].geometry.coordinates;
                  const distance = haversineDistance(selectedPlantCoordinates, companyCoords);
                  if (distance < minDistance) {
                      minDistance = distance;
                      closestCompany = { ...company, coordinates: companyCoords };
                  }
              }
          } catch (error) {
              console.error('Error fetching coordinates: ', error);
          }
      }
  }

  if (closestCompany) {
      const {
          name,
          r_and_d_location,
          headquarters_location,
          productionvolumes,
          employeestrength,
          revenues,
          product
      } = closestCompany;

      const customStyles = `
          <style>
              .swal2-popup {
                  font-size: 1.2rem;
                  font-family: 'Arial', sans-serif;
                  color: #333;
                  border-radius: 10px;
                  background: #f7f9fc;
                  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
              }
              .swal2-title {
                  font-size: 1.5rem;
                  font-weight: bold;
                  color: #2c3e50;
              }
              .swal2-html-container {
                  text-align: left;
              }
              .swal2-html-container strong {
                  color: #34495e;
              }
              .swal2-html-container br + strong {
                  margin-top: 10px;
                  display: inline-block;
              }
          </style>
      `;

      const additionalDetails = `
          <strong>Production Volumes:</strong> ${productionvolumes || 'N/A'}<br>
          <strong>Employee Strength:</strong> ${employeestrength || 'N/A'}<br>
          <strong>Revenues:</strong> ${revenues || 'N/A'}<br>
          <strong>Products:</strong> ${product || 'N/A'}<br>
      `;

      Swal.fire({
          title: `Closest Company to ${selectedPlantname}`,
          html: `
              ${customStyles}
              <strong>Name:</strong> ${name}<br>
              <strong>Location:</strong> ${r_and_d_location || headquarters_location}<br>
              <strong>Distance:</strong> ${minDistance.toFixed(2)} km<br>
              ${additionalDetails}
          `,
          icon: "info",
          customClass: {
              popup: 'swal2-popup'
          }
      });
  }
}, []); // <- empty dependency array if no external variables used




    const addAvoPlantPopup = useCallback(() => {
      if (!filters.avoPlant) return;
    
      const selectedPlant = avoPlants.find(
        plant => plant.name.toLowerCase() === filters.avoPlant.toLowerCase()
      );
    
      if (selectedPlant) {
        map.current.flyTo({
          center: selectedPlant.coordinates,
          zoom: 10,
          essential: true
        });
    
        new mapboxgl.Popup()
          .setLngLat(selectedPlant.coordinates)
          .setText(selectedPlant.name)
          .addTo(map.current);
    
        // Find the nearest company to the selected AVO plant
        findClosestCompany(
          selectedPlant.name,
          selectedPlant.coordinates,
          companies,
          mapboxgl.accessToken
        );
      }
    }, [filters.avoPlant,  map, companies, findClosestCompany]); 
    // <- dependencies it needs to work properly
    
    useEffect(() => {
      addAvoPlantPopup();
    }, [addAvoPlantPopup, filters.avoPlant]);
   
 
const fetchCompanies = async () => {
  try {
    const response = await axios.get('https://compt-back.azurewebsites.net/companies/');

    const processedData = response.data.map(company => {
  const productionLocations = company.productionlocation 
    ? company.productionlocation
        .split(';')
        .map(loc => loc.trim().replace(/^"|"$/g, '')) // ✅ Removes leading/trailing quotes
        .filter(Boolean)
    : [];


      return {
        ...company,
        productionLocations
      };
    });

    setCompanies(processedData);

    // Extract unique filter values for dropdowns
    const allProductionLocations = processedData
      .flatMap(company => company.productionLocations)
      .filter((loc, index, self) => loc && self.indexOf(loc) === index)
      .sort();

    const allRDLocations = processedData
      .map(company => company.r_and_d_location?.trim())
      .filter((loc, index, self) => loc && self.indexOf(loc) === index)
      .sort();

    const allHeadquarters = processedData
      .map(company => company.headquarters_location?.trim())
      .filter((loc, index, self) => loc && self.indexOf(loc) === index)
      .sort();

    const allProducts = processedData
      .map(company => company.product?.trim())
      .filter((prod, index, self) => prod && self.indexOf(prod) === index)
      .sort();

      const allCompanyNames = processedData
      .map(company => company.name?.trim())
      .filter((name, index, self) => name && self.indexOf(name) === index)
      .sort();

    const allCountries = processedData
      .map(company => company.country?.trim())
      .filter((country, index, self) => country && self.indexOf(country) === index)
      .sort();


    // Set them to state
    setProductionlocation(allProductionLocations);
    setRdlocation(allRDLocations); // You need to define this in useState
    setHeadquarterlocation(allHeadquarters); // useState for this too
    setProduct(allProducts); // useState for this too
    setCompanyNames(allCompanyNames);      // <-- ADD THIS
    setCountries(allCountries);            // <-- AND THIS


  } catch (error) {
    console.error('Error fetching companies:', error);
    Swal.fire('Error', 'Failed to load company data', 'error');
  }
};



      const productImages = {
        choke: "https://www.split-corecurrenttransformer.com/photo/pl26101407-ferrite_rod_core_high_frequency_choke_coil_inductor_air_coils_with_flat_wire.jpg",
        seals: "https://5.imimg.com/data5/AG/XO/RZ/SELLER-552766/bonded-seals.jpg",
        assembly: "https://images.paintball.camp/wp-content/uploads/2022/12/06152724/Protoyz-Speedster-Motor-Assembly.png",
        injection: "https://secodi.fr/wp-content/uploads/2022/12/piece-injection-perkins-T417873_3.jpg",
        brush: "https://2.imimg.com/data2/VE/EI/MY-978046/products6-250x250.jpg",
      };


       const handleCancel = () => {
        setIsModalVisible(false);
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
 
   

    const flyToRegion = (region) => {
        const boundaries = regionBoundaries[region];
        if (boundaries) {
            const centerLat = (boundaries.minLat + boundaries.maxLat) / 2;
            const centerLng = (boundaries.minLng + boundaries.maxLng) / 2;
           
            map.current.flyTo({
                center: [centerLng, centerLat],
                zoom: 3, // Adjust the zoom level as needed
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
        } else {
            console.error('Region boundaries not found for:', region);
        }
    };
   
   


    const haversineDistance = (coords1, coords2) => {
        const toRad = (x) => x * Math.PI / 180;
       
        const lat1 = coords1[1];
        const lon1 = coords1[0];
        const lat2 = coords2[1];
        const lon2 = coords2[0];
   
        const R = 6371; // Earth radius in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
   
        return R * c; // Distance in kilometers
    };
   
 
 
    const handleproductChange = (event) => {
        const selectedproduct = event.target.value;
        setFilters({ ...filters, Product: selectedproduct });
    };
    const handlecountrychange = (event) => {
        const selectedcountry = event.target.value;
        setFilters({ ...filters, country: selectedcountry });
    };
const handleRegionChange = (event) => {
  const selectedRegion = event.target.value;
  setFilters((prev) => ({ ...prev, region: selectedRegion }));

  if (selectedRegion) {
    flyToRegion(selectedRegion); // Optional, animates the map
  }
};

   
const handlefilterrdlocationchange = (event) => {
  const selectedRdLocation = event.target.value;
  setFilters(prev => ({
    ...prev, 
    RDLocation: selectedRdLocation,
    HeadquartersLocation: '', // Clear HQ filter
    ProductionLocation: '' // Clear production filter
  }));
};
  
    
const handleheadquarterfilterchange = (event) => {
  const selectedheadquarter = event.target.value;
  setFilters(prev => ({
    ...prev, 
    HeadquartersLocation: selectedheadquarter,
    // Keep other filters (company name, product, etc.)
    RDLocation: '', // Clear R&D filter
    ProductionLocation: '' // Clear production filter
  }));
};

const handleproductfilterchange = (event) => {
  const selectedproduction = event.target.value;
  setFilters(prev => ({
    ...prev, 
    ProductionLocation: selectedproduction,
    RDLocation: '', // Clear R&D filter
    HeadquartersLocation: '' // Clear HQ filter
  }));
};

const handleRdLocationCheckbox = (e) => {
  const isChecked = e.target.checked;
  setShowRdLocation(isChecked);
  
  if (!isChecked) {
    // Remove all R&D markers if unchecked
    rdMarkersRef.current.forEach(marker => marker.remove());
    rdMarkersRef.current = [];
  } else {
    // Re-add filtered R&D markers if checked
    addMarkersForFilteredCompanies();
  }
};

const handleHeadquarterLocationCheckbox = (e) => {
  const isChecked = e.target.checked;
  setShowHeadquarterLocation(isChecked);
  
  if (!isChecked) {
    // Remove all R&D markers if unchecked
    hqMarkersRef.current.forEach(marker => marker.remove());
    hqMarkersRef.current = [];
  } else {
    // Re-add filtered R&D markers if checked
    addMarkersheadquarterForFilteredCompanies();
  }
};
const handleproductionLocationCheckbox = (e) => {
  const isChecked = e.target.checked;
  setShowproductionLocation(isChecked);
  
  if (!isChecked) {
    // Remove all R&D markers if unchecked
    productionMarkersRef.current.forEach(marker => marker.remove());
    productionMarkersRef.current = [];
  } else {
    // Re-add filtered R&D markers if checked
    addMarkersproductionForFilteredCompanies();
  }
};


// Modified handleDownloadPDF function
// In your Map component
const handleDownloadPDF = async () => {
  try {
const visibleCompanies = companies.filter(company => {
  const regionFilter = (filters.region || '').toLowerCase();
  const nameFilter = (filters.companyName || '').toLowerCase();
  const productFilter = (filters.Product || '').toLowerCase();

  return (
    ((company.region || '').toLowerCase() === regionFilter || !regionFilter) &&
    ((company.name || '').toLowerCase().includes(nameFilter) || !nameFilter) &&
    ((company.product || '').toLowerCase().includes(productFilter) || !productFilter)
  );
});

    if (visibleCompanies.length === 0) {
      alert('No companies match the current filters.');
      return;
    }

    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }

    const bounds = new mapboxgl.LngLatBounds();
    const coordinatesPromises = visibleCompanies.map(async (company) => {
      const location = company.r_and_d_location || company.headquarters_location;
      if (!location) return null;

      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json`,
          { params: { access_token: mapboxgl.accessToken } }
        );
        if (response.data.features?.length > 0) {
          const coords = response.data.features[0].geometry.coordinates;
          bounds.extend(coords);
          return coords;
        }
      } catch (error) {
        console.warn('Geocoding failed for:', location, error);
        return null;
      }
    });

    await Promise.all(coordinatesPromises);

    if (bounds.isEmpty()) {
      alert('No valid locations found for current filters');
      return;
    }




    // Wait a bit more to make sure markers are added
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Re-add markers
    addMarkersForFilteredCompanies();
    addMarkersheadquarterForFilteredCompanies();
    addAvoPlantMarkers();

    // Wait for one more idle event to ensure DOM markers are there
    await new Promise(resolve => {
      map.current.once('idle', resolve);
    });

    // Capture the entire map container (canvas + markers)
    const mapElement = mapContainerRef.current;

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      logging: false,
      backgroundColor: null
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const aspectRatio = canvas.width / canvas.height;
    let width = pdfWidth;
    let height = width / aspectRatio;

    if (height > pdfHeight) {
      height = pdfHeight;
      width = height * aspectRatio;
    }

    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;

    pdf.addImage(imgData, 'PNG', x, y, width, height);

    // Restore original view

    addMarkersForFilteredCompanies();
    addMarkersheadquarterForFilteredCompanies();
    addAvoPlantMarkers();

    pdf.save('Filtered_Map.pdf');
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Check console for details.');
  }
};

   const handleDownloadExcel = async () => {
  try {
    // Geocode and filter companies with async processing
    const filteredCompanies = await Promise.all(
      companies.map(async (company) => {
        try {
          // 1. Apply text filters first
          const passesTextFilters = Object.entries(filters).every(([filterKey, filterValue]) => {
            if (!filterValue || filterKey === 'region') return true;
            const companyField = {
              companyName: 'name',
              Product: 'product',
              country: 'country',
              RDLocation: 'r_and_d_location',
              HeadquartersLocation: 'headquarters_location',
              region: 'region'
            }[filterKey];
            
            if (!companyField) return true;
            const companyValue = company[companyField]?.toString().toLowerCase() || '';
            return companyValue.includes(filterValue.toLowerCase());
          });

          if (!passesTextFilters) return null;

          // 2. Geocode company location
          const location = company.r_and_d_location || company.headquarters_location;
          if (!location) return null;

         const response = await axios.get(
         `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json`,
           { 
          params: { 
           access_token: mapboxgl.accessToken,
           limit: 1 
           }
           }
           );

          if (!response.data.features?.length) return null;

          // 3. Extract coordinates
          const [lng, lat] = response.data.features[0].geometry.coordinates;

          // 4. Apply region boundary check if region filter is active
          if (filters.region) {
            const boundaries = regionBoundaries[filters.region];
            if (!boundaries) return null;
            
            const inRegion = lat >= boundaries.minLat && 
                            lat <= boundaries.maxLat && 
                            lng >= boundaries.minLng && 
                            lng <= boundaries.maxLng;
            
            if (!inRegion) return null;
          }

          return company;

        } catch (error) {
          console.warn('Error processing company:', company.name, error);
          return null;
        }
      })
    );

    // Remove null/undefined entries and invalid companies
    const validCompanies = filteredCompanies.filter(c => c);

    if (validCompanies.length === 0) {
      Swal.fire('No Data', 'No companies match the current filters.', 'warning');
      return;
    }

    // Excel data preparation
    const header = [
      'Company Name', 'Email', 'Headquarters', 'R&D Location','Production Location', 'Country', 'Products',
      'Employee Strength', 'Revenues', 'Phone', 'Website', 'Production Volume', 'Key Customers',
      'Region', 'Founding Year', 'Rating', 'Offering Products', 'Pricing Strategy', 'Customer Needs',
      'Technology Used', 'Competitive Advantage', 'Challenges', 'Recent News', 'Product Launch',
      'Strategic Partnership', 'Comments', 'Employees Per Region', 'Business Strategies', 
      'Year of financial detail', 'Revenue', 'EBIT', 'Operating Cash Flow', 'Investing Cash Flow', 
      'Free Cash Flow', 'ROCE', 'Equity Ratio', 'CEO', 'CFO', 'CTO', 'RD&head', 'Sales head', 
      'Production head', 'Key decision marker', 'Requester','Approver'
    ];

    const rows = validCompanies.map(company => [
      company.name, company.email, company.headquarters_location, company.r_and_d_location, company.productionlocation,
      company.country, company.product, company.employeestrength, company.revenues, company.telephone,
      company.website, company.productionvolumes, company.keycustomers, company.region,
      company.foundingyear, company.rate, company.offeringproducts, company.pricingstrategy,
      company.customerneeds, company.technologyuse, company.competitiveadvantage, company.challenges,
      company.recentnews, company.productlaunch, company.strategicpartenrship, company.comments,
      company.employeesperregion, company.businessstrategies, company.financialyear, company.revenue, 
      company.ebit, company.operatingcashflow, company.investingcashflow, company.freecashflow, 
      company.roce, company.equityratio, company.ceo, company.cfo, company.cto, company.rdhead, 
      company.saleshead, company.productionhead, company.keydecisionmarker, company.emailrequester, 'parimmal.patkki@avocarbon.com'
    ]);

    // Create workbook with XlsxPopulate
    XlsxPopulate.fromBlankAsync().then(workbook => {
      const sheet = workbook.sheet(0);
      sheet.name("Companies");

      // Add header row with styling
      sheet.row(1).style("bold", true);
      header.forEach((title, index) => {
        sheet.cell(1, index + 1).value(title);
      });

      // Add company data
      rows.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          sheet.cell(rowIndex + 2, colIndex + 1).value(value);
        });
      });

      // Add data validations
      if (sheet.dataValidations) {
        // Product dropdown
        const productOptions = ['Assembly', 'Chokes', 'Injection', 'Seals', 'Brush'];
        const productRange = `F2:F${rows.length + 1}`;
        sheet.dataValidations.add(productRange, {
          type: 'list',
          allowBlank: true,
          formula1: `"${productOptions.join(',')}"`
        });

        // Region dropdown
        const regionOptions = Object.keys(regionBoundaries);
        const regionRange = `M2:M${rows.length + 1}`;
        sheet.dataValidations.add(regionRange, {
          type: 'list',
          allowBlank: true,
          formula1: `"${regionOptions.join(',')}"`
        });
      }

      // Generate and download file
      return workbook.outputAsync().then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Companies_Export_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }).catch(err => {
      console.error("Excel generation error:", err);
      Swal.fire('Error', 'Failed to generate Excel file.', 'error');
    });

  } catch (error) {
    console.error("Download error:", error);
    Swal.fire('Error', 'Failed to process company data.', 'error');
  }
};

 
const handleFilterChange = (e) => {
  const { name, value } = e.target;

  if (name === 'companyName') {
    setFilters(prev => ({
      ...prev,
      companyName: value,
      RDLocation: '',
      HeadquartersLocation: '',
      ProductionLocation: ''
    }));
  } else {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }
};


 

 
 
   
 
 
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
        if (name === 'region') {
            flyToRegion(value);
        }
    };
   
 
   const commonStyle = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.8rem',
  marginRight: '0.25rem',
  borderRadius: '3px',
  border: 'none'
};

const buttonStyle = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.8rem',
  borderRadius: '3px',
  border: 'none',
  cursor: 'pointer'
};

const checkboxLabelStyle = {
  color: '#fff',
  fontSize: '0.8rem',
  marginRight: '0.5rem',
  display: 'flex',
  alignItems: 'center'
};

const checkboxInputStyle = {
  marginRight: '0.25rem'
};

    return (
        <div>
            
<nav style={{ background: '#333', padding: '1rem' }}>
  {/* Filters Container */}
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.5rem',
      rowGap: '1rem',
    }}
  >
    <h2 style={{ color: '#fff', margin: '0', fontSize: '1rem', flexBasis: '100%' }}>
      Filters:
    </h2>

    {/* All your select inputs */}
    <select name="companyName" value={filters.companyName} onChange={handleFilterChange} style={commonStyle}>
      <option value="">Company Name</option>
      {companyNames.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </select>

    <select value={filters.Product} onChange={handleproductChange} style={commonStyle}>
      <option value="">Product</option>
      {product.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </select>

    <select value={filters.country} onChange={handlecountrychange} style={commonStyle}>
      <option value="">Country</option>
      {countries.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </select>

    <select value={filters.RDLocation} onChange={handlefilterrdlocationchange} style={{ ...commonStyle, width: '120px' }}>
      <option value="">R&D Location</option>
      {Rdlocation.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </select>

    <select value={filters.HeadquartersLocation} onChange={handleheadquarterfilterchange} style={commonStyle}>
      <option value="">HQ Location</option>
      {Array.isArray(headquarterlocation) && headquarterlocation.map((name, index) => (
        <option key={index} value={name}>{name}</option>
      ))}
    </select>

    <select value={filters.ProductionLocation} onChange={handleproductfilterchange} style={commonStyle}>
      <option value="">All Production Locations</option>
      {productionlocation.map((location, index) => (
        <option key={index} value={location}>{location}</option>
      ))}
    </select>

    <select value={filters.region} onChange={handleRegionChange} style={commonStyle}>
      <option value="">Region</option>
      {Object.keys(regionBoundaries).map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>

    <select name="avoPlant" value={filters.avoPlant} onChange={handleInputChange} style={commonStyle}>
      <option value="">AVOCarbon Plant</option>
      {avoPlants.map(plant => (
        <option key={plant.name} value={plant.name}>{plant.name}</option>
      ))}
    </select>

    <button onClick={handleDownloadExcel} style={{ ...buttonStyle, backgroundColor: 'green', color: 'white', padding: '10px 20px' }}>
      Download Excel
    </button>
    <button onClick={handleDownloadPDF} style={{ ...buttonStyle, backgroundColor: 'red', color: 'white', padding: '10px 20px' }}>
      Download PDF
    </button>

    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={showproductionLocation} onChange={handleproductionLocationCheckbox} style={checkboxInputStyle} />
        Production Location
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={showRdLocation} onChange={handleRdLocationCheckbox} style={checkboxInputStyle} />
        R&D Location
      </label>
      <label style={checkboxLabelStyle}>
        <input type="checkbox" checked={showHeadquarterLocation} onChange={handleHeadquarterLocationCheckbox} style={checkboxInputStyle} />
        Headquarters Location
      </label>
    </div>
  </div>
</nav>
            <div ref={mapContainerRef} style={{ width: '100vw', height: 'calc(100vh - 50px)' }} />
                 <Modal
        title={selectedCompany?.name}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {selectedCompany && (
          <div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              <img
                src={productImages[selectedCompany.product.toLowerCase()] || ""}
                alt={selectedCompany.product}
                style={{
                  width: "100px",
                  height: "auto",
                  borderRadius: "8px",
                  border: "2px solid #ddd",
                }}
              />
            </div>
            <p>
              <strong>Product:</strong>{" "}
                {selectedCompany.product}
            </p>
            <p>
              <strong>R&D Location:</strong> {selectedCompany.r_and_d_location}
            </p>
            <p>
              <strong>Headquarters:</strong> {selectedCompany.headquarters_location}
            </p>

            <p>
              <strong>Region:</strong> {selectedCompany.region}
            </p>
            <p>
              <strong>Country:</strong> {selectedCompany.country}
            </p>

            <p>
              <strong>Founding Year:</strong> {selectedCompany.foundingyear}
            </p>
                   
           {/* Executive Information Section */}
            {selectedCompany.ceo && <p><strong>CEO:</strong> {selectedCompany.ceo}</p>}
            {selectedCompany.cfo && <p><strong>CFO:</strong> {selectedCompany.cfo}</p>}
            {selectedCompany.cto && <p><strong>CTO:</strong> {selectedCompany.cto}</p>}
            {selectedCompany.rdhead && <p><strong>R&D Head:</strong> {selectedCompany.rdhead}</p>}
            {selectedCompany.saleshead && <p><strong>Sales Head:</strong> {selectedCompany.saleshead}</p>}
            {selectedCompany.productionhead && <p><strong>Production Head:</strong> {selectedCompany.productionhead}</p>}
            {selectedCompany.keydecisionmarker && <p><strong>Key Decision Marker:</strong> {selectedCompany.keydecisionmarker}</p>}
          
          </div>
        )}
      </Modal>
        </div>
    );
}
 
export default Map;
