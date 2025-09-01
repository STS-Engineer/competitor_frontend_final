import React, { useState, useEffect} from 'react';
import axios from 'axios';
import './form.css';
import Notification from './Notification/Notification';
import phonehand from "../assets/logo-avocarbon.png";
import MapComponent from '../Component/mapbox';
import Navbar from '../Components/Navbar';
import { MultiSelect } from 'react-multi-select-component';
import { motion } from 'framer-motion';
import { Button, Input, Modal, Progress, Slider } from 'antd';

const Form = () => {
    const [companies, setCompanies] = useState([]);    
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [progressvalue, setProgressValue] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        headquarters_location: '',
        r_and_d_location: '',
        country: '',
        product: '',
        email: '',  
        employeestrength: '',
        revenues: '',
        telephone: '',
        website: '',
        productionvolumes: '',
        keycustomers: '',
        region: '',
        foundingyear: '', // Add founding year field
        rate: progressvalue,
        offeringproducts:'',
        pricingstrategy: '',
        customerneeds:'',
        technologyuse: '',
        competitiveadvantage:'',
        challenges: '',
        recentnews:'',
        productlaunch: '',
        strategicpartenrship:'',
        comments: '',
        employeesperregion: '',
        businessstrategies:'',
        revenue: '',
        ebit: '',
        operatingcashflow: '',
        investingcashflow: '',
        freecashflow: '',
        roce: '',
        equityratio: '',
        financialyear:'',
        keymanagement: [],
        ceo: '',
        cfo: '',
        cto: '',
        rdhead: '',
        saleshead: '',
        productionhead: '',
        keydecisionmarker: '',
        generated_id: '',
        productionlocation: ''

    });
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedRdLocation, setSelectedRdLocation] = useState(null); // Selected R&D location
    const [mode, setMode] = useState('');
    const [showAddForm, setShowAddForm] = useState(false); // State to show/hide add form
    const [showEditForm, setShowEditForm] = useState(false); // State to show/hide edit form
    const [showMap, setShowMap] = useState(false);
    const [newCompanyCoordinates, setNewCompanyCoordinates] = useState(null);
    const [newCompanyCoordinatesheadquarter, setNewCompanyCoordinatesheadquarter] = useState(null);
    const [newCompanyCoordinatesproductionlocation, setNewCompanyCoordinatesproductionlocation] = useState(null);
    const [rdLocationSuggestions, setRdLocationSuggestions] = useState([]);
    const [headquarterSuggestions, setheadquarterSuggestions] = useState([]);
    const [productionLocationSuggestions, setProductionLocationSuggestions] = useState([]);
    const [loadingRdSuggestions, setLoadingRdSuggestions] = useState(false);
    const [loadingheadquarterSuggestions, setLoadingheadquarterSuggestions] = useState(false);
    const [loadingproductionLocationSuggestions, setLoadingproductionLocationSuggestions] = useState(false);
    const[currentStep,setCurrentStep]= useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentstepupdate,setCurrentStepUpdate]= useState(1)
    const [selectedProductionLocations, setSelectedProductionLocations] = useState([]);
    const [productionLocationInput, setProductionLocationInput] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [detailsValue, setDetailsValue] = useState("");

  

    const options = [
        { label: 'Choke', value: 'Choke' },
        { label: 'Seals', value: 'Seals' },
        { label: 'Assembly', value: 'Assembly' },
        { label: 'Injection', value: 'Injection' },
        { label: 'Brush', value: 'Brush' }
    ];
    const optionskey = [
  { value: 'ceo', label: 'CEO' },
  { value: 'cfo', label: 'CFO' },
  { value: 'cto', label: 'CTO' },
  { value: 'rdhead', label: 'R&D Head' },
  { value: 'saleshead', label: 'Sales Head' },
  { value: 'productionhead', label: 'Production Head' },
  { value: 'keydecisionmarker', label: 'Key Decision Makers' },
];

useEffect(() => {
  const existingRoles = optionskey
    .filter(opt => formData[opt.value] && formData[opt.value].trim() !== "")
    .map(opt => opt.value);

  // Only prefill on first load if keymanagement is empty
  if (formData.keymanagement.length === 0 && existingRoles.length > 0) {
    setFormData(prev => ({
      ...prev,
      keymanagement: existingRoles
    }));
  }
}, [optionskey]); // runs when optionskey is loaded




const handleDetailsChange = (e) => {
  const value = e.target.value;
  setDetailsValue(value);
  if (selectedRole) {
    setFormData(prev => ({ ...prev, [selectedRole]: value }));
  }
};
    useEffect(() => {
        fetchCompanies();
    }, []);


    
useEffect(() => {
  if (mode === 'edit' && selectedCompanyId) {
    axios.get(`https://compt-back.azurewebsites.net/companies/${selectedCompanyId}`).then((res) => {
      const data = res.data;
      
      // Parse existing locations (split by semicolon and clean)
      const existingLocations = data.productionlocation
        ? data.productionlocation
            .split(';')
            .map(loc => loc.trim().replace(/"/g, '')) // Remove quotes
            .filter(loc => loc !== '')
        : [];

      setSelectedProductionLocations(existingLocations);
      setFormData({
        ...data,
        productionlocation: data.productionlocation // Keep original string format
      });
    });
  }
}, [selectedCompanyId, mode]);

    const fetchCompanies = async () => {
        try {
            const response = await axios.get('https://compt-back.azurewebsites.net/companies/');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies: ', error);
        }
    };
    const handleProductChange = (selectedProducts) => {
        const formattedProduct = selectedProducts.map(product => product.value).join(', ');
        setFormData({ ...formData, product: formattedProduct });
    };





    const handleModalClose = () => {
        setIsModalVisible(false); // Hide the modal
    };

    const handleSave = () => {
        // Update the main form data with the modal inputs
        setFormData((prevData) => ({
            ...prevData,
            revenue: formData.revenue,
            ebit: formData.ebit,
            operatingcashflow: formData.operatingcashflow,
            investingcashflow: formData.investingcashflow,
            freecashflow: formData.freecashflow,
            roce: formData.roce,
            equityratio: formData.equityratio,
        }));
        setIsModalVisible(false) // Close the modal after saving
    };

    // Function to handle changes to the slider
    const handleSliderChange = (value) => {
        setProgressValue(value); // Update progress value based on the slider
        setFormData((prevFormData) => ({ ...prevFormData, rate: value }));
    };

 



    const handleNext = () => {
        setCurrentStep(2); // Move to the next step
    };
    const handlenextupdate =()=>{
        setCurrentStepUpdate(2);
    }
   

    // Animation variants for steps
   const stepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
    };
    



    const fetchRdLocationSuggestions = async (inputValue) => {
        try {
            setLoadingRdSuggestions(true);
            const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=pk.eyJ1Ijoic3RzLWVuZ2luZWVyIiwiYSI6ImNsdjN2bGR2cTAydWIydHF0ZWMyYTlsbHUifQ.EBjvuJ70JuEXJgjTdDeK1g`);
            setRdLocationSuggestions(response.data.features.map(feature => feature.place_name));
        } catch (error) {
            console.error('Error fetching R&D location suggestions: ', error);
        } finally {
            setLoadingRdSuggestions(false);
        }
    };

    const handlesuggestionclick = (suggestion) => {
        setFormData({ ...formData, r_and_d_location: suggestion });
        setRdLocationSuggestions([]);
    }


    const fetchheadquarterSuggestions = async (inputValue) => {
        try {
            setLoadingheadquarterSuggestions(true);
            const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=pk.eyJ1Ijoic3RzLWVuZ2luZWVyIiwiYSI6ImNsdjN2bGR2cTAydWIydHF0ZWMyYTlsbHUifQ.EBjvuJ70JuEXJgjTdDeK1g`);
            setheadquarterSuggestions(response.data.features.map(feature => feature.place_name));
        } catch (error) {
            console.error('Error fetching R&D location suggestions: ', error);
        } finally {
            setLoadingheadquarterSuggestions(false);
        }
    };

    const handleheadquartersuggestionclick = (suggestion) => {
        setFormData({ ...formData, headquarters_location: suggestion });
        setheadquarterSuggestions([]);
    }

   
    {/*fetchproductionlocation*/}
        const fetchproductionLocationSuggestions = async (inputValue) => {
        try {
            setLoadingproductionLocationSuggestions(true);
            const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(inputValue)}.json?access_token=pk.eyJ1Ijoic3RzLWVuZ2luZWVyIiwiYSI6ImNsdjN2bGR2cTAydWIydHF0ZWMyYTlsbHUifQ.EBjvuJ70JuEXJgjTdDeK1g`);
            setProductionLocationSuggestions(response.data.features.map(feature => feature.place_name));
        } catch (error) {
            console.error('Error fetching R&D location suggestions: ', error);
        } finally {
            setLoadingproductionLocationSuggestions(false);
        }
    };

const handleporudtionsuggestionclick = (location) => {
  if (!selectedProductionLocations.includes(location)) {
    setSelectedProductionLocations([...selectedProductionLocations, location]);
  }
  setProductionLocationInput('');
  setProductionLocationSuggestions([]);
};



const removeProductionLocation = (index) => {
  setSelectedProductionLocations((prev) =>
    prev.filter((_, i) => i !== index)
  );
};




const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    // Debug: Log the raw selected locations
    console.log('Raw selected locations:', selectedProductionLocations);

    // Format production locations with quotes and semicolons
     const formattedLocations = selectedProductionLocations
      .map(loc => `"${loc.trim()}"`)
      .join('; ');

    // Debug: Log the formatted locations
    console.log('Formatted locations:', formattedLocations);

    const submitData = {
      ...formData,
      emailrequester:localStorage.getItem('email'),
      productionlocation: formattedLocations 
    };

    // Debug: Log the complete submit data
    console.log('Full submit data:', JSON.stringify(submitData, null, 2));

    let response;

    if (mode === 'add') {
      response = await axios.post('https://compt-back.azurewebsites.net/companies', submitData);
      setSuccessMessage('⏳ Your request has been sent, waiting for approval');
      // Reset form fields
      setFormData({
        ...formData, // Keep other fields if needed
       name: '',
        headquarters_location: '',
        r_and_d_location: '',
        country: '',
        product: '',
        email: '',  
        employeestrength: '',
        revenues: '',
        telephone: '',
        website: '',
        productionvolumes: '',
        keycustomers: '',
        region: '',
        foundingyear: '', // Add founding year field
        rate: 0,
        offeringproducts:'',
        pricingstrategy: '',
        customerneeds:'',
        technologyuse: '',
        competitiveadvantage:'',
        challenges: '',
        recentnews:'',
        productlaunch: '',
        strategicpartenrship:'',
        comments: '',
        employeesperregion: '',
        businessstrategies:'',
        revenue: '',
        ebit: '',
        operatingcashflow: '',
        investingcashflow: '',
        freecashflow: '',
        roce: '',
        equityratio: '',
        financialyear:'',
        keymanagement: [],
        ceo: '',
        cfo: '',
        cto: '',
        rdhead: '',
        saleshead: '',
        productionhead: '',
        keydecisionmarker: '',
        generated_id: '',
        productionlocation: ''
      });
      setProgressValue(0);
      setSelectedProductionLocations([]); 
    } else if (mode === 'edit') {
      response = await axios.put(
        `https://compt-back.azurewebsites.net/companies/${selectedCompanyId}`, 
        submitData
      );

            // Reset form fields
      setFormData({
        ...formData, // Keep other fields if needed
       name: '',
        headquarters_location: '',
        r_and_d_location: '',
        country: '',
        product: '',
        email: '',  
        employeestrength: '',
        revenues: '',
        telephone: '',
        website: '',
        productionvolumes: '',
        keycustomers: '',
        region: '',
        foundingyear: '', // Add founding year field
        rate: 0,
        offeringproducts:'',
        pricingstrategy: '',
        customerneeds:'',
        technologyuse: '',
        competitiveadvantage:'',
        challenges: '',
        recentnews:'',
        productlaunch: '',
        strategicpartenrship:'',
        comments: '',
        employeesperregion: '',
        businessstrategies:'',
        revenue: '',
        ebit: '',
        operatingcashflow: '',
        investingcashflow: '',
        freecashflow: '',
        roce: '',
        equityratio: '',
        financialyear:'',
        keymanagement: [],
        ceo: '',
        cfo: '',
        cto: '',
        rdhead: '',
        saleshead: '',
        productionhead: '',
        keydecisionmarker: '',
        generated_id: '',
        productionlocation: ''
      });
      setProgressValue(0);
      setSuccessMessage('⏳ Your request has been sent, waiting for approval');
    }

    // Debug: Log the successful response
    console.log('Server response:', response.data);

  } catch (error) {
    console.error(`Error ${mode === 'add' ? 'adding' : 'updating'} company:`, error);
    if (error.response) {
      console.error('Server responded with:', error.response.data);
    }
  }
};
    
 const handleback =()=>{
    setCurrentStep(1);
 }
 const handlebackupdate =()=>{
    setCurrentStepUpdate(1);
 }

    const handleCancelEdit = () => { 
        setFormData({
             name: '',
    headquarters_location: '',
    r_and_d_location: '',
    country: '',
    product: '',
    email: '',
    employeestrength: '',
    revenues: '',
    telephone: '',
    website: '',
    productionvolumes: '',
    keycustomers: '',
    region: '',
    foundingyear: '',
    rate: progressvalue, // You might need to update this separately if progressvalue is dynamic
    offeringproducts: '',
    pricingstrategy: '',
    customerneeds: '',
    technologyuse: '',
    competitiveadvantage: '',
    challenges: '',
    recentnews: '',
    productlaunch: '',
    strategicpartenrship: '',
    comments: '',
    employeesperregion: '',
    businessstrategies: '',
    revenue: '',
    ebit: '',
    operatingcashflow: '',
    investingcashflow: '',
    freecashflow: '',
    roce: '',
    equityratio: '',
    financialyear: '',
    keymanagement: [], // assuming this is an array of names/objects
    ceo: '',
    cfo: '',
    cto: '',
    rdhead: '',
    saleshead: '',
    productionhead: '',
    keydecisionmarker: '',
    generated_id: '',
    productionlocation: ''
        });
        setSelectedCompanyId('');
        setMode('add');
    };
const handleSelectChange = async (e) => {
  const selectedName = e.target.value;
  const selectedCompany = companies.find(company => company.name === selectedName);
  setSelectedCompanyId(selectedCompany.id);

  try {
    const response = await axios.get(`https://compt-back.azurewebsites.net/companies/${selectedCompany.id}`);
    const selectedCompanyData = response.data;

    // Ensure keymanagement is always an array
    const keyManagementData = Array.isArray(selectedCompanyData.keymanagement)
      ? selectedCompanyData.keymanagement
      : selectedCompanyData.keymanagement
        ? [selectedCompanyData.keymanagement]
        : [];

    // Set form data with proper keymanagement array
    setFormData({
      ...selectedCompanyData,
      keymanagement: keyManagementData,
      productionlocation: selectedCompanyData.productionlocation,
    });

    // 2. AUTO-POPULATE the details input for the first role
    if (keyManagementData.length > 0) {
      const firstRole = keyManagementData[0];
      setSelectedRole(firstRole);
      // Set detailsValue from the corresponding field in formData
      setDetailsValue(selectedCompanyData[firstRole] || "");
    }

    setProgressValue(Number(selectedCompanyData.rate) || 0);
    // ... other state updates

  } catch (error) {
    console.error('Error fetching company details: ', error);
  }
};


    
const handleKeyManagementChange = (selectedOptions) => {
  const selectedRoles = selectedOptions.map(option => option.value);

  setFormData(prev => ({
    ...prev,
    keymanagement: selectedRoles
  }));
};



    const handleAddForm = () => {
        setShowAddForm(true);
        setShowEditForm(false);
        setMode('add');
    };

    const handleEditForm = () => {
        setShowAddForm(false);
        setShowEditForm(true);
        setMode('edit');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        // Implement your update logic here, using formData and selectedCompanyId
        try {
            const response = await axios.put(`https://compt-back.azurewebsites.net/companies/${selectedCompanyId}`, formData);
            setFormData(response.data);
         
            setFormData({
            name: '',
            headquarters_location: '',
            r_and_d_location: '',
            country: '',
            product: '',
            email: '',
            employeestrength: '',
            revenues: '',
            telephone: '',
            website: '',
            productionvolumes: '',
            keycustomers: '',
            region: '',
            foundingyear: '',
            rate: '',
            offeringproducts: '',
            pricingstrategy: '',
            customerneeds: '',
            technologyuse: '',
            competitiveadvantage: '',
            challenges: '',
            recentnews: '',
            productlaunch: '',
            strategicpartenrship: '',
            comments: '',
            employeesperregion: '',
            businessstrategies: '',
            revenue: '',
            ebit: '',
            operatingcashflow: '',
            investingcashflow: '',
            freecashflow: '',
            roce: '',
            equityratio: '',
            financialyear: '',
            keymanagement: [],
            ceo: '',
            cfo: '',
            cto: '',
            rdhead: '',
            saleshead: '',
            productionhead: '',
            keydecisionmarker: '',
            generated_id: '',
            productionlocation: ''
        });
        setSuccessMessage('competitor updated successfuly');
            // Inside handleUpdate function, after successful update
            setSelectedRdLocation(formData.r_and_d_location);

        } catch (error) {
            console.error('Error updating company: ', error);
        }
    };

const handleRemoveProductionLocation = (indexToRemove) => {
  setSelectedProductionLocations(prev => 
    prev.filter((_, idx) => idx !== indexToRemove)
  );
};

    // Function to open and close modal
    const handleShowFinancialDetails = () => setIsModalVisible(true);

return (

<div className="container">




            {!showAddForm && !showEditForm && (
                <form className="form">
                    {/* Initial form content */}
                    <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} alt="" />
                    <div className="button-container">
                        <button onClick={handleAddForm} className="button">Add a competitor</button>
                        <button onClick={handleEditForm} className="button">Update competitor details</button>
                    </div>
                </form>
            )}
                   
       {showAddForm && currentStep === 1 && (
          <motion.div
          key="step1"
          className="form"
          variants={stepVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.7 }}
          style={{ marginTop: '70px' }} 
        >
        <form onSubmit={handleSubmit} >
        <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} alt=""  />
        <div className="input-group">
       <label htmlFor="name" className="label">Company Name</label>
       <input
         type="text"
         name="name"
        placeholder="Enter company name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="input"
  />
</div>


        <div className="input-row">
            <div className="input-group">
                <label htmlFor="email" className="label">E-mail</label>
                <input type="text" name="email" placeholder="Enter company email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="telephone" className="label">Phone number</label>
                <input type="text" name="telephone" placeholder="Enter company Telephone" value={formData.telephone}  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="website" className="label">Website</label>
                <input type="text" name="website" placeholder="Enter company website" value={formData.website}  onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" />
            </div>

            <div className="input-group">
                        <label htmlFor="country" className="label">Country:</label>
                        <select name="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input" >
                            <option value="">Select Country</option>
                            <option value="Afghanistan">Afghanistan</option>
                            <option value="Albania">Albania</option>
                            <option value="Algeria">Algeria</option>
                            <option value="Andorra">Andorra</option>
                            <option value="Angola">Angola</option>
                            <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                            <option value="Argentina">Argentina</option>
                            <option value="Armenia">Armenia</option>
                            <option value="Australia">Australia</option>
                            <option value="Austria">Austria</option>
                            <option value="Azerbaijan">Azerbaijan</option>
                            <option value="Bahamas">Bahamas</option>
                            <option value="Bahrain">Bahrain</option>
                            <option value="Bangladesh">Bangladesh</option>
                            <option value="Barbados">Barbados</option>
                            <option value="Belarus">Belarus</option>
                            <option value="Belgium">Belgium</option>
                            <option value="Belize">Belize</option>
                            <option value="Benin">Benin</option>
                            <option value="Bhutan">Bhutan</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                            <option value="Botswana">Botswana</option>
                            <option value="Brazil">Brazil</option>
                            <option value="Brunei">Brunei</option>
                            <option value="Bulgaria">Bulgaria</option>
                            <option value="Burkina Faso">Burkina Faso</option>
                            <option value="Burundi">Burundi</option>
                            <option value="Cabo Verde">Cabo Verde</option>
                            <option value="Cambodia">Cambodia</option>
                            <option value="Cameroon">Cameroon</option>
                            <option value="Canada">Canada</option>
                            <option value="Central African Republic">Central African Republic</option>
                            <option value="Chad">Chad</option>
                            <option value="Chile">Chile</option>
                            <option value="China">China</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Comoros">Comoros</option>
                            <option value="Congo">Congo</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="Croatia">Croatia</option>
                            <option value="Cuba">Cuba</option>
                            <option value="Cyprus">Cyprus</option>
                            <option value="Czechia">Czechia</option>
                            <option value="Denmark">Denmark</option>
                            <option value="Djibouti">Djibouti</option>
                            <option value="Dominica">Dominica</option>
                            <option value="Dominican Republic">Dominican Republic</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="Egypt">Egypt</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Equatorial Guinea">Equatorial Guinea</option>
                            <option value="Eritrea">Eritrea</option>
                            <option value="Estonia">Estonia</option>
                            <option value="Eswatini">Eswatini</option>
                            <option value="Ethiopia">Ethiopia</option>
                            <option value="Fiji">Fiji</option>
                            <option value="Finland">Finland</option>
                            <option value="France">France</option>
                            <option value="Gabon">Gabon</option>
                            <option value="Gambia">Gambia</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Germany">Germany</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Greece">Greece</option>
                            <option value="Grenada">Grenada</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="Guinea">Guinea</option>
                            <option value="Guinea-Bissau">Guinea-Bissau</option>
                            <option value="Guyana">Guyana</option>
                            <option value="Haiti">Haiti</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Hungary">Hungary</option>
                            <option value="Iceland">Iceland</option>
                            <option value="India">India</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Iran">Iran</option>
                            <option value="Iraq">Iraq</option>
                            <option value="Ireland">Ireland</option>
                            <option value="Israel">Israel</option>
                            <option value="Italy">Italy</option>
                            <option value="Jamaica">Jamaica</option>
                            <option value="Japan">Japan</option>
                            <option value="Jordan">Jordan</option>
                            <option value="Kazakhstan">Kazakhstan</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Kiribati">Kiribati</option>
                            <option value="Korea, North">Korea, North</option>
                            <option value="Korea, South">Korea, South</option>
                            <option value="Kosovo">Kosovo</option>
                            <option value="Kuwait">Kuwait</option>
                            <option value="Kyrgyzstan">Kyrgyzstan</option>
                            <option value="Laos">Laos</option>
                            <option value="Latvia">Latvia</option>
                            <option value="Lebanon">Lebanon</option>
                            <option value="Lesotho">Lesotho</option>
                            <option value="Liberia">Liberia</option>
                            <option value="Libya">Libya</option>
                            <option value="Liechtenstein">Liechtenstein</option>
                            <option value="Lithuania">Lithuania</option>
                            <option value="Luxembourg">Luxembourg</option>
                            <option value="Madagascar">Madagascar</option>
                            <option value="Malawi">Malawi</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Maldives">Maldives</option>
                            <option value="Mali">Mali</option>
                            <option value="Malta">Malta</option>
                            <option value="Marshall Islands">Marshall Islands</option>
                            <option value="Mauritania">Mauritania</option>
                            <option value="Mauritius">Mauritius</option>
                            <option value="Mexico">Mexico</option>
                            <option value="Micronesia">Micronesia</option>
                            <option value="Moldova">Moldova</option>
                            <option value="Monaco">Monaco</option>
                            <option value="Mongolia">Mongolia</option>
                            <option value="Montenegro">Montenegro</option>
                            <option value="Morocco">Morocco</option>
                            <option value="Mozambique">Mozambique</option>
                            <option value="Myanmar">Myanmar</option>
                            <option value="Namibia">Namibia</option>
                            <option value="Nauru">Nauru</option>
                            <option value="Nepal">Nepal</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="Niger">Niger</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="North Macedonia">North Macedonia</option>
                            <option value="Norway">Norway</option>
                            <option value="Oman">Oman</option>
                            <option value="Pakistan">Pakistan</option>
                            <option value="Palau">Palau</option>
                            <option value="Palestine">Palestine</option>
                            <option value="Panama">Panama</option>
                            <option value="Papua New Guinea">Papua New Guinea</option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Peru">Peru</option>
                            <option value="Philippines">Philippines</option>
                            <option value="Poland">Poland</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Qatar">Qatar</option>
                            <option value="Romania">Romania</option>
                            <option value="Russia">Russia</option>
                            <option value="Rwanda">Rwanda</option>
                            <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                            <option value="Saint Lucia">Saint Lucia</option>
                            <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                            <option value="Samoa">Samoa</option>
                            <option value="San Marino">San Marino</option>
                            <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="Senegal">Senegal</option>
                            <option value="Serbia">Serbia</option>
                            <option value="Seychelles">Seychelles</option>
                            <option value="Sierra Leone">Sierra Leone</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Slovakia">Slovakia</option>
                            <option value="Slovenia">Slovenia</option>
                            <option value="Solomon Islands">Solomon Islands</option>
                            <option value="Somalia">Somalia</option>
                            <option value="South Africa">South Africa</option>
                            <option value="South Sudan">South Sudan</option>
                            <option value="Spain">Spain</option>
                            <option value="Sri Lanka">Sri Lanka</option>
                            <option value="Sudan">Sudan</option>
                            <option value="Suriname">Suriname</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Syria">Syria</option>
                            <option value="Taiwan">Taiwan</option>
                            <option value="Tajikistan">Tajikistan</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Timor-Leste">Timor-Leste</option>
                            <option value="Togo">Togo</option>
                            <option value="Tonga">Tonga</option>
                            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                            <option value="Tunisia">Tunisia</option>
                            <option value="Turkey">Turkey</option>
                            <option value="Turkmenistan">Turkmenistan</option>
                            <option value="Tuvalu">Tuvalu</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Ukraine">Ukraine</option>
                            <option value="United Arab Emirates">United Arab Emirates</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United States">United States</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Uzbekistan">Uzbekistan</option>
                            <option value="Vanuatu">Vanuatu</option>
                            <option value="Vatican City">Vatican City</option>
                            <option value="Venezuela">Venezuela</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Yemen">Yemen</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                        </select>
                    </div>  
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="region" className="label">Region</label>
                <select name="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="input" >
                    <option value="">Select Region</option>
                    <option value="nafta ">NAFTA </option>
                   <option value="eastAsia">East_Asia</option>
                    <option value="europe">Europe</option>
                    <option value="southAsia">South_Asia</option>
                </select>
            </div>
            <div className="input-group">
                <label htmlFor="headquarters_location" className="label">HeadquartersLocation</label>
                <input type="text" name="headquarters_location" placeholder="Enter headquarters location" value={formData.headquarters_location}  onChange={(e) => {
                    setFormData({ ...formData, headquarters_location: e.target.value });
                    fetchheadquarterSuggestions(e.target.value);
                }} className="input" />
                {loadingheadquarterSuggestions && <div>Loading...</div>}
                {headquarterSuggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {headquarterSuggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleheadquartersuggestionclick(suggestion)}>
                                <span>{suggestion}</span>
                                <span className="geolocation-icon">🌍</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
         
            
        </div>      
        <div className="input-row">
            <div className="input-group">
                <label htmlFor="r_and_d_location" className="label">R&D location:</label>
                <input
                    type="text"
                    name="r_and_d_location"
                    placeholder="Enter R&D location"
                    value={formData.r_and_d_location}
                    onChange={(e) => {
                        setFormData({ ...formData, r_and_d_location: e.target.value });
                        fetchRdLocationSuggestions(e.target.value);
                    }}
                    className="input"
                />
                {loadingRdSuggestions && <div>Loading...</div>}
                {rdLocationSuggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {rdLocationSuggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handlesuggestionclick(suggestion)}>
                                <span>{suggestion}</span>
                                <span className="geolocation-icon">🌍</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="input-group">
           <label htmlFor="product" className="label">Product</label>
           <MultiSelect
                options={options}
                value={formData.product ? formData.product.split(', ').map(product => ({ label: product, value: product })) : []}
                onChange={handleProductChange}
                labelledBy="Select Products"
            />
      </div>
        </div>
<div className="input-row">
  <div className="input-group">
    <label htmlFor="productionlocation" className="label">Production location:</label>

    <div className="selected-tags">
      {selectedProductionLocations.map((location, index) => (
        <span key={index} className="tag">
          {location}
          <button
            type="button"
            onClick={() => removeProductionLocation(index)}
          >
            ×
          </button>
        </span>
      ))}
    </div>

    <input
      type="text"
      name="productionlocation"
      placeholder="Enter production location"
      value={productionLocationInput}
      onChange={(e) => {
        const value = e.target.value;
        setProductionLocationInput(value);
        fetchproductionLocationSuggestions(value);
      }}
      className="input"
    />

    {/* Loading Indicator */}
    {loadingproductionLocationSuggestions && <div>Loading...</div>}

    {/* Dropdown Suggestions */}
    {productionLocationSuggestions.length > 0 && (
      <ul className="suggestions-dropdown">
        {productionLocationSuggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleporudtionsuggestionclick(suggestion)}>
            <span>{suggestion}</span>
            <span className="geolocation-icon">🌍</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="revenues" className="label">Currency(USD)</label>
                <input type="text" name="revenues" placeholder="Enter company Revenues" value={formData.revenues}  onChange={(e) => setFormData({ ...formData, revenues: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="employeestrength" className="label">Employees number</label>
                <input type="text" name="employeestrength" placeholder="Enter company employeestrength" value={formData.employeestrength}  onChange={(e) => setFormData({ ...formData, employeestrength: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="productionvolumes" className="label">Production volumes</label>
                <input type="text" name="productionvolumes" placeholder="Enter company Productionvolumes" value={formData.productionvolumes}  onChange={(e) => setFormData({ ...formData, productionvolumes: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="keycustomers" className="label">Key customers</label>
                <input type="text" name="keycustomers" placeholder="Enter company Keycustomers" value={formData.keycustomers}  onChange={(e) => setFormData({ ...formData, keycustomers: e.target.value })} className="input" />
            </div>
            </div>
       

        <div className="button-container">
         <button type="button" onClick={handleNext} className="button">Next</button>
        </div>
        </form>
        </motion.div>
)}

{showAddForm && currentStep === 2 && (
    <motion.div
        key="step2"
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="form-container"
        style={{ marginTop: '60px' }} 
    >
        <form className="form" onSubmit={handleSubmit}>
        <img src={phonehand} width={180} height={50} style={{ display:'block', margin:'20px auto' }} alt="" />
        <div className="input-row" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
  {/* Year of Establishment */}
  <div className="input-group" style={{ flex: 1, paddingTop:'10px' }}>
    <label
      htmlFor="foundingYear"
      style={{
        fontSize: "14px",
        marginBottom: "8px",
        fontWeight: "500",
        color: "#333",
       }}
    >
      Year of Establishment
    </label>
    <input
      type="text"
      name="foundingyear"
      value={formData.foundingyear}
      onChange={(e) => {
      const value = e.target.value;
      // Only allow digits and make sure the length is 4 characters
      if (/^\d{0,4}$/.test(value)) {
        setFormData({ ...formData, foundingyear: value });
      }
    }}
      style={{
        padding: "10px 12px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#f9f9f9",
        color: "#333",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        width: "100%", // Make it responsive within the row
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#007bff";
        e.target.style.boxShadow = "0 0 0 3px rgba(0, 123, 255, 0.2)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#ccc";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>

  {/* Strategic Business */}
  <div className="input-group" style={{ flex: 1 }}>
    <label htmlFor="Businessstrategies" className="label">
      Strategic Business
    </label>
    <select
      name="businessstrategies"
      value={formData.businessstrategies}
      onChange={(e) => setFormData({ ...formData, businessstrategies: e.target.value })}
      className="input modern-input"
      placeholder="Enter the strategic business"
      style={{ width: "100%" }} // Ensure it fits within the row
    >
      <option value="">Select a Business</option>
      <option value="Productivity">Productivity</option>
      <option value="Payment">Payment Investment</option>
      <option value="Business">Business Link</option>
      <option value="Advance">Advance bribe to key management</option>
      <option value="Growth">Growth partners</option>
      <option value="Mutual">Mutual agreement</option>
    </select>
  </div>

  {/* Key Management Positions */}
  <div className="input-group" style={{ flex: 1 }}>
    <label
      style={{
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "10px",
        display: "block",
        color: "#111827",
      }}
    >
      Key Management Positions
    </label>
   <MultiSelect
  options={optionskey}
  value={optionskey.filter(option =>
    formData.keymanagement.includes(option.value)
  )}
  onChange={handleKeyManagementChange}
  labelledBy="Select Key Management Positions"
  className="input"
  hasSelectAll={false}
  style={{ width: "100%" }}
    />

  </div>
        </div>

   {/* Details input appears conditionally */}
  {formData.businessstrategies && (
  <div className="input-group">
    <label htmlFor="email" className="label">Details</label>
    <input type="text" name="email" placeholder="Enter the details" className="input" />
  </div>
   )}

{/* Key Management Dynamic Inputs */}
{Array.isArray(formData.keymanagement) && formData.keymanagement.length > 0 && (
  <div className="input-row" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
    {formData.keymanagement.map((role) => (
      <div className="input-group" style={{ flex: 1 }} key={role}>
        <label htmlFor={role} className="label">
          Name of {optionskey.find((opt) => opt.value === role)?.label || role}
        </label>
        <input
          type="text"
          name={role}
          value={formData[role] || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              [role]: e.target.value
            })
          }
          className="input modern-input"
          placeholder={`Enter name of ${optionskey.find((opt) => opt.value === role)?.label || role}`}
          style={{ width: "100%" }}
        />
      </div>
    ))}
  </div>
)}



            <div className='input-row'>
                <div className="input-group">
                    <h3 className='text-bold'>Growth rate</h3>
                    <Slider
                        min={0}
                        max={100}
                        value={progressvalue}
                        onChange={handleSliderChange}
                        style={{ marginBottom: '0px' }}
                    />
                    <Progress
                        percent={progressvalue}
                        status="active"
                        showInfo
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        style={{ marginTop: '5px' }}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="Pricingstrategy" className="label">Pricing Strategy </label>
                    <input
                        type="text"
                        value={formData.pricingstrategy}
                        onChange={(e) => setFormData({ ...formData, pricingstrategy: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="customerneeds" className="label">Customer Needs</label>
                    <input
                        type="text"
                        value={formData.customerneeds}
                        onChange={(e) => setFormData({ ...formData, customerneeds: e.target.value })}
                        className="input modern-input"
                    />
                </div>
               
            </div>
         

            <div className="input-row">
                <div className="input-group">
                    <label htmlFor="technologyuse" className="label">Technology Use</label>
                    <input
                        type="text"
                        value={formData.technologyuse}
                        onChange={(e) => setFormData({ ...formData, technologyuse: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="challenges" className="label">Challenges</label>
                    <input
                        type="text"
                        value={formData.challenges}
                        onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="competitiveadvantage" className="label">Competitive Advantages</label>
                    <input
                        type="text"
                        value={formData.competitiveadvantage}
                        onChange={(e) => setFormData({ ...formData, competitiveadvantage: e.target.value })}
                        className="input modern-input"
                    />
                </div>
            </div>

            <div className="input-row">
             
                <div className="input-group">
                    <label htmlFor="Recentnews" className="label">Recent News</label>
                    <input
                        type="text"
                        value={formData.recentnews}
                        onChange={(e) => setFormData({ ...formData, recentnews: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="Productlaunch" className="label">Product Launch or Updates:</label>
                    <input
                        type="text"
                        value={formData.productlaunch}
                        onChange={(e) => setFormData({ ...formData, productlaunch: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="strategicpartenrship" className="label">Strategic Partnership:</label>
                    <input
                        type="text"
                        value={formData.strategicpartenrship}
                        onChange={(e) => setFormData({ ...formData, strategicpartenrship: e.target.value })}
                        className="input modern-input"
                    />
                </div>
            </div>

          

            <div className="input-row">
                <div className="input-group">
                    <label htmlFor="comments" className="label">Comments Box</label>
                    <input
                        type="text"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="financialdetails" className="label">Financial Details</label>
                    <input
                        onClick={handleShowFinancialDetails}
                        placeholder="Click to add financial details"
                        className="input modern-input"
                        readOnly
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="employeesperregion" className="label">Employees per Region</label>
                    <input
                        type="text"
                        value={formData.employeesperregion}
                        onChange={(e) => setFormData({ ...formData, employeesperregion: e.target.value })}
                        className="input modern-input"
                    />
                </div>
            </div>

            <Modal
                title="Additional Financial Details"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="save" onClick={handleSave}>Save</Button>,
                    <Button key="close" onClick={handleModalClose}>Close</Button>,
                ]}
            >
         <div className="modal-input-group">
      <select
       name="financialyear"
      value={formData.financialyear}
      onChange={(e) =>
      setFormData({ ...formData, financialyear: e.target.value })
    }
     >
    <option value="">Select Year</option>
    {Array.from({ length: 6 }, (_, i) => 2020 + i).map((year) => (
      <option key={year} value={year}>
        {year}
        </option>
         ))}
        </select>
         </div>

                <div className="modal-input-group">
                    <label>Revenue</label>
                    <Input
                        type="text"
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        className="modern-input"
                    />
                </div>
                <div className="modal-input-group">
                    <label>EBIT</label>
                    <Input
                        type="text"
                        value={formData.ebit}
                        onChange={(e) => setFormData({ ...formData, ebit: e.target.value })}
                        className="modern-input"
                    />
                </div>
               <div className="modal-input-group">
                    <label>Operating Cash Flow (€)</label>
                    <Input
                        type="text"
                        value={formData.operatingcashflow}
                        onChange={(e) => setFormData({ ...formData, operatingcashflow: e.target.value })}
                        className="modern-input"
                    />
                </div>

                <div className="modal-input-group">
                    <label>Investing Cash Flow (€)</label>
                    <Input
                        type="text"
                        value={formData.investingcashflow}
                        onChange={(e) => setFormData({ ...formData, investingcashflow: e.target.value })}
                        className="modern-input"
                    />
                </div>
                <div className="modal-input-group">
                    <label>Free Cash FLow (€)</label>
                    <Input
                        type="text"
                        value={formData.freecashflow}
                        onChange={(e) => setFormData({ ...formData, freecashflow: e.target.value })}
                        className="modern-input"
                    />
                </div>
                <div className="modal-input-group">
                    <label>Roce </label>
                    <Input
                        type="text"
                        value={formData.roce}
                        onChange={(e)=>setFormData({...formData, roce: e.target.value})}
                        className="modern-input"
                    />
                </div>

                  <div className="modal-input-group">
                    <label>Equity Ratio</label>
                    <Input
                        type="text"
                        value={formData.equityratio}
                        onChange={(e)=>setFormData({...formData, equityratio: e.target.value})}
                        className="modern-input"
                    />
                </div>             
            </Modal>

            <div className="input-row">
                <div className="input-group">
                    <h3>Offering Products</h3>
                    <Input.TextArea
                        value={formData.offeringproducts}
                        onChange={(e)=>setFormData({...formData, offeringproducts: e.target.value})}
                        rows={2}
                        style={{ marginBottom: '20px' }}
                        placeholder="Enter offering products..."
                        className="modern-input"
                    />
                </div>
           
            </div>

            <div className="button-beside">
                {mode === 'add' ? (
                    <>
                        <button type="submit" className="button">Add</button>
                        <button type="button" className="button" onClick={handleback}>Back</button>
                    </>
                ) : (
                    <>
                        <button type="submit" className="button">Update</button>
                        <button type="button" onClick={handleCancelEdit} className="button">Cancel</button>
                    </>
                )}
            </div>
                    
        </form>
    </motion.div>
)}


            {/* Edit Form */}
            {showEditForm && currentstepupdate === 1 && (
                <form  className="form">
                    <img src={phonehand} width={180} height={50} style={{ marginBottom: '20px' }} alt="" />
                    <div className="input-group">
                        <label htmlFor="selectCompany" className="label">Select Company</label>
                        <select name="selectCompany" value={formData.name} onChange={handleSelectChange} className="input">
                            <option value="">Select Company</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.name}>{company.name}</option>
                            ))}
                        </select>
                    </div>
              <div className="input-row">           
             <div className="input-group">
             <label htmlFor="name" className="label">Company Name</label>
             <input type="text" name="name" placeholder="Enter company name" value={formData.name}  onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" />
            </div>
               
             </div>
        <div className="input-row">
            <div className="input-group">
                <label htmlFor="email" className="label">E-mail</label>
                <input type="text" name="email" placeholder="Enter company email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="telephone" className="label">Phone number</label>
                <input type="text" name="telephone" placeholder="Enter company Telephone" value={formData.telephone}  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="website" className="label">Website</label>
                <input type="text" name="website" placeholder="Enter company website" value={formData.website}  onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" />
            </div>

            <div className="input-group">
                        <label htmlFor="country" className="label">Country</label>
                        <select name="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="input">
                            <option value="">Select Country</option>
                            <option value="Afghanistan">Afghanistan</option>
                            <option value="Albania">Albania</option>
                            <option value="Algeria">Algeria</option>
                            <option value="Andorra">Andorra</option>
                            <option value="Angola">Angola</option>
                            <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                            <option value="Argentina">Argentina</option>
                            <option value="Armenia">Armenia</option>
                            <option value="Australia">Australia</option>
                            <option value="Austria">Austria</option>
                            <option value="Azerbaijan">Azerbaijan</option>
                            <option value="Bahamas">Bahamas</option>
                            <option value="Bahrain">Bahrain</option>
                            <option value="Bangladesh">Bangladesh</option>
                            <option value="Barbados">Barbados</option>
                            <option value="Belarus">Belarus</option>
                            <option value="Belgium">Belgium</option>
                            <option value="Belize">Belize</option>
                            <option value="Benin">Benin</option>
                            <option value="Bhutan">Bhutan</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                            <option value="Botswana">Botswana</option>
                            <option value="Brazil">Brazil</option>
                            <option value="Brunei">Brunei</option>
                            <option value="Bulgaria">Bulgaria</option>
                            <option value="Burkina Faso">Burkina Faso</option>
                            <option value="Burundi">Burundi</option>
                            <option value="Cabo Verde">Cabo Verde</option>
                            <option value="Cambodia">Cambodia</option>
                            <option value="Cameroon">Cameroon</option>
                            <option value="Canada">Canada</option>
                            <option value="Central African Republic">Central African Republic</option>
                            <option value="Chad">Chad</option>
                            <option value="Chile">Chile</option>
                            <option value="China">China</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Comoros">Comoros</option>
                            <option value="Congo">Congo</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="Croatia">Croatia</option>
                            <option value="Cuba">Cuba</option>
                            <option value="Cyprus">Cyprus</option>
                            <option value="Czechia">Czechia</option>
                            <option value="Denmark">Denmark</option>
                            <option value="Djibouti">Djibouti</option>
                            <option value="Dominica">Dominica</option>
                            <option value="Dominican Republic">Dominican Republic</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="Egypt">Egypt</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Equatorial Guinea">Equatorial Guinea</option>
                            <option value="Eritrea">Eritrea</option>
                            <option value="Estonia">Estonia</option>
                            <option value="Eswatini">Eswatini</option>
                            <option value="Ethiopia">Ethiopia</option>
                            <option value="Fiji">Fiji</option>
                            <option value="Finland">Finland</option>
                            <option value="France">France</option>
                            <option value="Gabon">Gabon</option>
                            <option value="Gambia">Gambia</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Germany">Germany</option>
                            <option value="Ghana">Ghana</option>
                            <option value="Greece">Greece</option>
                            <option value="Grenada">Grenada</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="Guinea">Guinea</option>
                            <option value="Guinea-Bissau">Guinea-Bissau</option>
                            <option value="Guyana">Guyana</option>
                            <option value="Haiti">Haiti</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Hungary">Hungary</option>
                            <option value="Iceland">Iceland</option>
                            <option value="India">India</option>
                            <option value="Indonesia">Indonesia</option>
                            <option value="Iran">Iran</option>
                            <option value="Iraq">Iraq</option>
                            <option value="Ireland">Ireland</option>
                            <option value="Israel">Israel</option>
                            <option value="Italy">Italy</option>
                            <option value="Jamaica">Jamaica</option>
                            <option value="Japan">Japan</option>
                            <option value="Jordan">Jordan</option>
                            <option value="Kazakhstan">Kazakhstan</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Kiribati">Kiribati</option>
                            <option value="Korea, North">Korea, North</option>
                            <option value="Korea, South">Korea, South</option>
                            <option value="Kosovo">Kosovo</option>
                            <option value="Kuwait">Kuwait</option>
                            <option value="Kyrgyzstan">Kyrgyzstan</option>
                            <option value="Laos">Laos</option>
                            <option value="Latvia">Latvia</option>
                            <option value="Lebanon">Lebanon</option>
                            <option value="Lesotho">Lesotho</option>
                            <option value="Liberia">Liberia</option>
                            <option value="Libya">Libya</option>
                            <option value="Liechtenstein">Liechtenstein</option>
                            <option value="Lithuania">Lithuania</option>
                            <option value="Luxembourg">Luxembourg</option>
                            <option value="Madagascar">Madagascar</option>
                            <option value="Malawi">Malawi</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="Maldives">Maldives</option>
                            <option value="Mali">Mali</option>
                            <option value="Malta">Malta</option>
                            <option value="Marshall Islands">Marshall Islands</option>
                            <option value="Mauritania">Mauritania</option>
                            <option value="Mauritius">Mauritius</option>
                            <option value="Mexico">Mexico</option>
                            <option value="Micronesia">Micronesia</option>
                            <option value="Moldova">Moldova</option>
                            <option value="Monaco">Monaco</option>
                            <option value="Mongolia">Mongolia</option>
                            <option value="Montenegro">Montenegro</option>
                            <option value="Morocco">Morocco</option>
                            <option value="Mozambique">Mozambique</option>
                            <option value="Myanmar">Myanmar</option>
                            <option value="Namibia">Namibia</option>
                            <option value="Nauru">Nauru</option>
                            <option value="Nepal">Nepal</option>
                            <option value="Netherlands">Netherlands</option>
                            <option value="New Zealand">New Zealand</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="Niger">Niger</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="North Macedonia">North Macedonia</option>
                            <option value="Norway">Norway</option>
                            <option value="Oman">Oman</option>
                            <option value="Pakistan">Pakistan</option>
                            <option value="Palau">Palau</option>
                            <option value="Palestine">Palestine</option>
                            <option value="Panama">Panama</option>
                            <option value="Papua New Guinea">Papua New Guinea</option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Peru">Peru</option>
                            <option value="Philippines">Philippines</option>
                            <option value="Poland">Poland</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Qatar">Qatar</option>
                            <option value="Romania">Romania</option>
                            <option value="Russia">Russia</option>
                            <option value="Rwanda">Rwanda</option>
                            <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                            <option value="Saint Lucia">Saint Lucia</option>
                            <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                            <option value="Samoa">Samoa</option>
                            <option value="San Marino">San Marino</option>
                            <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="Senegal">Senegal</option>
                            <option value="Serbia">Serbia</option>
                            <option value="Seychelles">Seychelles</option>
                            <option value="Sierra Leone">Sierra Leone</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Slovakia">Slovakia</option>
                            <option value="Slovenia">Slovenia</option>
                            <option value="Solomon Islands">Solomon Islands</option>
                            <option value="Somalia">Somalia</option>
                            <option value="South Africa">South Africa</option>
                            <option value="South Sudan">South Sudan</option>
                            <option value="Spain">Spain</option>
                            <option value="Sri Lanka">Sri Lanka</option>
                            <option value="Sudan">Sudan</option>
                            <option value="Suriname">Suriname</option>
                            <option value="Sweden">Sweden</option>
                            <option value="Switzerland">Switzerland</option>
                            <option value="Syria">Syria</option>
                            <option value="Taiwan">Taiwan</option>
                            <option value="Tajikistan">Tajikistan</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Thailand">Thailand</option>
                            <option value="Timor-Leste">Timor-Leste</option>
                            <option value="Togo">Togo</option>
                            <option value="Tonga">Tonga</option>
                            <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                            <option value="Tunisia">Tunisia</option>
                            <option value="Turkey">Turkey</option>
                            <option value="Turkmenistan">Turkmenistan</option>
                            <option value="Tuvalu">Tuvalu</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Ukraine">Ukraine</option>
                            <option value="United Arab Emirates">United Arab Emirates</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United States">United States</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Uzbekistan">Uzbekistan</option>
                            <option value="Vanuatu">Vanuatu</option>
                            <option value="Vatican City">Vatican City</option>
                            <option value="Venezuela">Venezuela</option>
                            <option value="Vietnam">Vietnam</option>
                            <option value="Yemen">Yemen</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                        </select>
                    </div>  
        </div>

        <div className="input-row">

        <div className="input-group">
                <label htmlFor="region" className="label">Region</label>
                <select name="region" value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="input" >
                  <option value="">Select Region</option>
                    <option value="nafta ">NAFTA </option>
                   <option value="eastAsia">East_Asia</option>
                    <option value="europe">Europe</option>
                    <option value="southAsia">South_Asia</option>           
                </select>
            </div>
            <div className="input-group">
                <label htmlFor="headquarters_location" className="label">HeadquartersLocation</label>
                <input type="text" name="headquarters_location" placeholder="Enter headquarters location" value={formData.headquarters_location} onChange={(e) => {
                    setFormData({ ...formData, headquarters_location: e.target.value });
                    fetchheadquarterSuggestions(e.target.value);
                }} className="input" />
                {loadingheadquarterSuggestions && <div>Loading...</div>}
                {headquarterSuggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {headquarterSuggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleheadquartersuggestionclick(suggestion)}>
                                <span>{suggestion}</span>
                                <span className="geolocation-icon">🌍</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
         
            
        </div>      
        <div className="input-row">
            <div className="input-group">
                <label htmlFor="r_and_d_location" className="label">R&D location</label>
                <input
                    type="text"
                    name="r_and_d_location"
                    placeholder="Enter R&D location"
                    value={formData.r_and_d_location}
                    onChange={(e) => {
                        setFormData({ ...formData, r_and_d_location: e.target.value });
                        fetchRdLocationSuggestions(e.target.value);
                    }}
                    className="input"
                />
                {loadingRdSuggestions && <div>Loading...</div>}
                {rdLocationSuggestions.length > 0 && (
                    <ul className="suggestions-dropdown">
                        {rdLocationSuggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handlesuggestionclick(suggestion)}>
                                <span>{suggestion}</span>
                                <span className="geolocation-icon">🌍</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="input-group">
        <label htmlFor="product" className="label">Product</label>
         <MultiSelect
             options={options}
             value={options.filter(option => formData.product.includes(option.value))} // Map product values to options
             onChange={handleProductChange}
             labelledBy={"Select Products"}
             className="input"
             hasSelectAll={false} />
            </div>
            </div>
  <div className="input-row">
  <div className="input-group">
    <label htmlFor="productionlocation" className="label">Production location:</label>
    
    {/* Display selected locations as chips */}
    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {selectedProductionLocations.map((loc, idx) => (
        <span key={idx} className="chip">
          "{loc}"
          {idx < selectedProductionLocations.length - 1 ? ";" : ""}
          <button 
            type="button"
            onClick={() => handleRemoveProductionLocation(idx)}
            className="remove-chip-button"
          >
            ×
          </button>
        </span>
      ))}
    </div>

    {/* Location input */}
    <input
      type="text"
      value={productionLocationInput}
      onChange={(e) => {
        setProductionLocationInput(e.target.value);
        fetchproductionLocationSuggestions(e.target.value);
      }}
      placeholder="Add locations (type and select from suggestions)"
      className="input"
    />

    {/* Suggestions dropdown */}
    {loadingproductionLocationSuggestions && <div>Loading...</div>}
    {productionLocationSuggestions.length > 0 && (
      <ul className="suggestions-dropdown">
        {productionLocationSuggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleporudtionsuggestionclick(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="revenues" className="label">Revenue</label>
                <input type="text" name="revenues" placeholder="Enter company Revenues" value={formData.revenues}  onChange={(e) => setFormData({ ...formData, revenues: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="employeestrength" className="label">Employees number</label>
                <input type="text" name="employeestrength" placeholder="Enter company employeestrength" value={formData.employeestrength}  onChange={(e) => setFormData({ ...formData, employeestrength: e.target.value })} className="input" />
            </div>
        </div>

        <div className="input-row">
        <div className="input-group">
                <label htmlFor="productionvolumes" className="label">Production volumes:</label>
                <input type="text" name="productionvolumes" placeholder="Enter company Productionvolumes" value={formData.productionvolumes}  onChange={(e) => setFormData({ ...formData, productionvolumes: e.target.value })} className="input" />
            </div>
            <div className="input-group">
                <label htmlFor="keycustomers" className="label">Key customers</label>
                <input type="text" name="keycustomers" placeholder="Enter company Keycustomers" value={formData.keycustomers}  onChange={(e) => setFormData({ ...formData, keycustomers: e.target.value })} className="input" />
            </div>
            </div>
       

        {/* <div className="button-container">
            {mode === 'add' ? (
                <button type="submit" className="button">Add</button>
            ) : (
                <>
                     {selectedCompanyId && <button onClick={handleUpdate} className="button">Update</button>}
                    <button type="button" onClick={handleCancelEdit} className="button">Cancel</button>
                </>
            )}
        </div> */}

        
       <div className="button-container">
         <button type="button" onClick={handlenextupdate} className="button">Next</button>
        </div>
        </form>
        
            )}

{showEditForm && currentstepupdate === 2 && (
    <motion.div
        key="step2"
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="form-container"
        style={{ marginTop: '60px' }} 
    >
        <form className="form" onSubmit={handleSubmit}>
        <img src={phonehand} width={180} height={50} style={{ display:'block', margin:'20px auto' }} alt=""  />
        <div className="input-row" style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
  {/* Year of Establishment */}
  <div className="input-group" style={{ flex: 1, paddingTop:'10px' }}>
    <label
      htmlFor="foundingYear"
      style={{
        fontSize: "14px",
        marginBottom: "8px",
        fontWeight: "500",
        color: "#333",
       }}
    >
      Year of Establishment
    </label>
    <input
      type="text"
      name="foundingyear"
      value={formData.foundingyear}
      onChange={(e) => {
      const value = e.target.value;
      // Only allow digits and make sure the length is 4 characters
      if (/^\d{0,4}$/.test(value)) {
        setFormData({ ...formData, foundingyear: value });
      }
    }}
      style={{
        padding: "10px 12px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#f9f9f9",
        color: "#333",
        transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        cursor: "pointer",
        width: "100%", // Make it responsive within the row
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "#007bff";
        e.target.style.boxShadow = "0 0 0 3px rgba(0, 123, 255, 0.2)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#ccc";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>

  {/* Strategic Business */}
  <div className="input-group" style={{ flex: 1 }}>
    <label htmlFor="Businessstrategies" className="label">
      Strategic Business
    </label>
    <select
      name="businessstrategies"
      value={formData.businessstrategies}
      onChange={(e) => setFormData({ ...formData, businessstrategies: e.target.value })}
      className="input modern-input"
      placeholder="Enter the strategic business"
      style={{ width: "100%" }} // Ensure it fits within the row
    >
      <option value="">Select a Business</option>
      <option value="Productivity">Productivity</option>
      <option value="Payment">Payment Investment</option>
      <option value="Business">Business Link</option>
      <option value="Advance">Advance bribe to key management</option>
      <option value="Growth">Growth partners</option>
      <option value="Mutual">Mutual agreement</option>
    </select>
  </div>

  {/* Key Management Positions */}
  <div className="input-group" style={{ flex: 1 }}>
    <label
      style={{
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "10px",
        display: "block",
        color: "#111827",
      }}
    >
      Key Management Positions
    </label>
  <MultiSelect
    options={optionskey}
    value={optionskey.filter(option =>
      formData.keymanagement.includes(option.value)
    )}
    onChange={handleKeyManagementChange}
    labelledBy="Select Key Management Positions"
    className="input"
    hasSelectAll={false}
    style={{ width: "100%" }}
  />


  </div>
        </div>


  {/* Role-specific inputs appear here */}
{formData.keymanagement.includes("ceo") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of CEO"
      value={formData.ceo}
      onChange={e => setFormData(prev => ({ ...prev, ceo: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}

{formData.keymanagement.includes("cfo") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of CFO"
      value={formData.cfo}
      onChange={e => setFormData(prev => ({ ...prev, cfo: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}

{formData.keymanagement.includes("cto") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of CTO"
      value={formData.cto}
      onChange={e => setFormData(prev => ({ ...prev, cto: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}

{formData.keymanagement.includes("rdhead") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of R&D Head"
      value={formData.rdhead}
      onChange={e => setFormData(prev => ({ ...prev, rdhead: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}

{formData.keymanagement.includes("saleshead") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of Sales Head"
      value={formData.saleshead}
      onChange={e => setFormData(prev => ({ ...prev, saleshead: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}

{formData.keymanagement.includes("productionhead") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of Production Head"
      value={formData.productionhead}
      onChange={e => setFormData(prev => ({ ...prev, productionhead: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}

{formData.keymanagement.includes("keydecisionmarker") && (
  <div style={{ marginBottom: 16 }}>
    <input
      type="text"
      placeholder="Name of Key Decision Maker"
      value={formData.keydecisionmarker}
      onChange={e => setFormData(prev => ({ ...prev, keydecisionmarker: e.target.value }))}
      style={{
        width: "100%",
        padding: "10px 12px",
        fontSize: 16,
        border: "1.5px solid #ccc",
        borderRadius: 6,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.3s ease",
      }}
      onFocus={e => (e.target.style.borderColor = "#4A90E2")}
      onBlur={e => (e.target.style.borderColor = "#ccc")}
    />
  </div>
)}


  
            <div className='input-row'>
                <div className="input-group">
                    <h3 className='text-bold'>Growth rate</h3>
                    <Slider
                        min={0}
                        max={100}
                        value={progressvalue}
                        onChange={handleSliderChange}
                        style={{ marginBottom: '0px' }}
                    />
                    <Progress
                        percent={progressvalue}
                        status="active"
                        showInfo
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        style={{ marginTop: '5px' }}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="Pricingstrategy" className="label">Pricing Strategy </label>
                    <input
                        type="text"
                        value={formData.pricingstrategy}
                        onChange={(e) => setFormData({ ...formData, pricingstrategy: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="customerneeds" className="label">Customer Needs</label>
                    <input
                        type="text"
                        value={formData.customerneeds}
                        onChange={(e) => setFormData({ ...formData, customerneeds: e.target.value })}
                        className="input modern-input"
                    />
                </div>
               
            </div>
         

            <div className="input-row">
                <div className="input-group">
                    <label htmlFor="technologyuse" className="label">Technology Use</label>
                    <input
                        type="text"
                        value={formData.technologyuse}
                        onChange={(e) => setFormData({ ...formData, technologyuse: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="challenges" className="label">Challenges</label>
                    <input
                        type="text"
                        value={formData.challenges}
                        onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="competitiveadvantage" className="label">Competitive Advantages</label>
                    <input
                        type="text"
                        value={formData.competitiveadvantage}
                        onChange={(e) => setFormData({ ...formData, competitiveadvantage: e.target.value })}
                        className="input modern-input"
                    />
                </div>
            </div>

            <div className="input-row">
             
                <div className="input-group">
                    <label htmlFor="Recentnews" className="label">Recent News</label>
                    <input
                        type="text"
                        value={formData.recentnews}
                        onChange={(e) => setFormData({ ...formData, recentnews: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="Productlaunch" className="label">Product Launch or Updates:</label>
                    <input
                        type="text"
                        value={formData.productlaunch}
                        onChange={(e) => setFormData({ ...formData, productlaunch: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="strategicpartenrship" className="label">Strategic Partnership:</label>
                    <input
                        type="text"
                        value={formData.strategicpartenrship}
                        onChange={(e) => setFormData({ ...formData, strategicpartenrship: e.target.value })}
                        className="input modern-input"
                    />
                </div>
            </div>

          

            <div className="input-row">
                <div className="input-group">
                    <label htmlFor="comments" className="label">Comments Box</label>
                    <input
                        type="text"
                        value={formData.comments}
                        onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                        className="input modern-input"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="financialdetails" className="label">Financial Details</label>
                    <input
                        onClick={handleShowFinancialDetails}
                        placeholder="Click to add financial details"
                        className="input modern-input"
                        readOnly
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="employeesperregion" className="label">Employees per Region</label>
                    <input
                        type="text"
                        value={formData.employeesperregion}
                        onChange={(e) => setFormData({ ...formData, employeesperregion: e.target.value })}
                        className="input modern-input"
                    />
                </div>
            </div>

            <Modal
                title="Additional Financial Details"
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={[
                    <Button key="save" onClick={handleSave}>Save</Button>,
                    <Button key="close" onClick={handleModalClose}>Close</Button>,
                ]}
            >
         <div className="modal-input-group">
      <select
       name="financialyear"
      value={formData.financialyear}
      onChange={(e) =>
      setFormData({ ...formData, financialyear: e.target.value })
    }
     >
    <option value="">Select Year</option>
    {Array.from({ length: 6 }, (_, i) => 2020 + i).map((year) => (
      <option key={year} value={year}>
        {year}
        </option>
         ))}
        </select>
         </div>

                <div className="modal-input-group">
                    <label>Revenue</label>
                    <Input
                        type="text"
                        value={formData.revenue}
                        onChange={(e) => setFormData({ ...formData, revenue: e.target.value })}
                        className="modern-input"
                    />
                </div>
                <div className="modal-input-group">
                    <label>EBIT</label>
                    <Input
                        type="text"      
                        value={formData.ebit}
                        onChange={(e) => setFormData({ ...formData, ebit: e.target.value })}
                        className="modern-input"
                    />
                </div>
               <div className="modal-input-group">
                    <label>Operating Cash Flow (€)</label>  
                    <Input
                        type="text"
                        value={formData.operatingcashflow}
                        onChange={(e) => setFormData({ ...formData, operatingcashflow: e.target.value })}
                        className="modern-input"
                    />
                </div>

                <div className="modal-input-group">
                    <label>Investing Cash Flow (€)</label>
                    <Input
                        type="text"
                        value={formData.investingcashflow}
                        onChange={(e) => setFormData({ ...formData, investingcashflow: e.target.value })}
                        className="modern-input"
                    />
                </div>
                <div className="modal-input-group">
                    <label>Free Cash FLow (€)</label>
                    <Input
                        type="text"
                        value={formData.freecashflow}
                        onChange={(e) => setFormData({ ...formData, freecashflow: e.target.value })}
                        className="modern-input"
                    />
                </div>
                <div className="modal-input-group">
                    <label>Roce </label>
                    <Input
                        type="text"
                        value={formData.roce}
                        onChange={(e)=>setFormData({...formData, roce: e.target.value})}
                        className="modern-input"
                    />
                </div>

                  <div className="modal-input-group">
                    <label>Equity Ratio</label>
                    <Input
                        type="text"
                        value={formData.equityratio}
                        onChange={(e)=>setFormData({...formData, equityratio: e.target.value})}
                        className="modern-input"
                    />
                </div>             
            </Modal>

            <div className="input-row">
                <div className="input-group">
                    <h3>Offering Products</h3>
                    <Input.TextArea
                        value={formData.offeringproducts}
                        onChange={(e)=>setFormData({...formData, offeringproducts: e.target.value})}
                        rows={2}
                        style={{ marginBottom: '20px' }}
                        placeholder="Enter offering products..."
                        className="modern-input"
                    />
                </div>
           
            </div>

            <div className="button-beside">
                         {selectedCompanyId && <button className="button">Update</button>}
                        <button type="button" className="button" onClick={handlebackupdate}>Back</button>
                 
            </div>    
                            
        </form>
    </motion.div>
)}
            {/* Map Component */}
 {showMap && (
        <div style={{ position: 'absolute', top: '60px', right: '0', width: '20%', height: '80%' }}>
            <MapComponent coordinates={newCompanyCoordinates} coordinateslocations={newCompanyCoordinatesheadquarter} />
        </div>
    )}
    <Notification message={successMessage} />
</div>  
);       
}

export default Form;
