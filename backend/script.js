const API_URL = "http://localhost:8000";

// Handle soil type selection
document.getElementById("soilType").addEventListener("change", async (e) => {
    const soilType = e.target.value;
    
    if (!soilType) {
        document.getElementById("soilAttributesContainer").style.display = "none";
        return;
    }

    try {
        const response = await fetch("iot_data.json");
        const data = await response.json();
        
        const soilData = data.soil_data.find(soil => soil.type === soilType);
        
        if (soilData) {
            const attributesGrid = document.getElementById("soilAttributesGrid");
            attributesGrid.innerHTML = "";
            
            // Display relevant soil attributes
            const attributes = [
                { label: "Water Retention", value: soilData.water_retention, unit: "%" },
                { label: "Nutrient Content", value: soilData.nutrient_content, unit: "%" },
                { label: "pH Level", value: soilData.pH_level, unit: "" },
                { label: "Nitrogen Content", value: soilData.nitrogen_percent, unit: "%" },
                { label: "Phosphorus Content", value: soilData.phosphorus_percent, unit: "%" },
                { label: "Potassium Content", value: soilData.potassium_percent, unit: "%" },
                { label: "Organic Matter", value: soilData.organic_matter_percent, unit: "%" },
                { label: "Drainage Capacity", value: soilData.drainage_capacity, unit: "mm/hr" },
                { label: "CEC", value: soilData.cation_exchange_capacity, unit: "cmol/kg" },
                { label: "Electrical Conductivity", value: soilData.electrical_conductivity, unit: "dS/m" },
                { label: "Bulk Density", value: soilData.bulk_density, unit: "g/cm³" },
                { label: "Soil Depth", value: soilData.soil_depth, unit: "cm" }
            ];
            
            attributes.forEach(attr => {
                const attributeDiv = document.createElement("div");
                attributeDiv.className = "soil-attribute-item";
                attributeDiv.innerHTML = `
                    <span class="soil-attribute-label">${attr.label}</span>
                    <span class="soil-attribute-value">${attr.value} ${attr.unit}</span>
                `;
                attributesGrid.appendChild(attributeDiv);
            });
            
            document.getElementById("soilAttributesContainer").style.display = "block";
        }
    } catch (error) {
        console.error("Error loading soil data:", error);
        document.getElementById("soilAttributesContainer").style.display = "none";
    }
});

document.getElementById("predictionForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const landArea = parseInt(document.getElementById("landArea").value);
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const soilType = document.getElementById("soilType").value;

    // Show loading spinner
    document.getElementById("loadingSpinner").style.display = "block";
    document.getElementById("resultsSection").style.display = "none";
    document.getElementById("errorSection").style.display = "none";

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                land_area: landArea,
                latitude: latitude,
                longitude: longitude,
                soil_type: soilType,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to get prediction");
        }

        const data = await response.json();

        // Hide loading spinner
        document.getElementById("loadingSpinner").style.display = "none";

        // Populate crops table (water requirements)
        const cropsTableBody = document.getElementById("cropsTableBody");
        cropsTableBody.innerHTML = "";
        
        if (data.crops && data.crops.length > 0) {
            data.crops.forEach(crop => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${crop.name}</td>
                    <td>${parseFloat(crop.water_required_liters).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                `;
                cropsTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='2'>No crops recommended</td>";
            cropsTableBody.appendChild(row);
        }

        // Populate climate data
        const climate = data.climate_data;
        document.getElementById("avgTempValue").textContent = `${climate.avg_temp}`;
        document.getElementById("soilMoistureValue").textContent = `${climate.avg_soil_moisture} (fraction)`;
        document.getElementById("surfaceTempValue").textContent = `${climate.avg_surface_temp}`;
        document.getElementById("totalRainfallValue").textContent = `${climate.total_rainfall}`;

        // Populate timeline table
        const timelineTableBody = document.getElementById("timelineTableBody");
        timelineTableBody.innerHTML = "";

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        if (data.crop_timeline && data.crop_timeline.length > 0) {
            data.crop_timeline.forEach(item => {
                const row = document.createElement("tr");
                const monthCells = fullMonths.map((fullMonth, index) => {
                    const isMonthSuitable = item.suitable_months.includes(fullMonth) || item.suitable_months.includes(months[index]);
                    const cellClass = isMonthSuitable ? "timeline-month-cell suitable" : "timeline-month-cell";
                    return `<td class="${cellClass}">${months[index]}</td>`;
                }).join("");

                row.innerHTML = `
                    <td>${item.crop}</td>
                    <td>${item.season}</td>
                    ${monthCells}
                `;
                timelineTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='14'>No timeline data available</td>";
            timelineTableBody.appendChild(row);
        }

        // Populate yield prediction table
        const yieldTableBody = document.getElementById("yieldTableBody");
        yieldTableBody.innerHTML = "";

        if (data.yield_data && data.yield_data.length > 0) {
            data.yield_data.forEach(yield_item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${yield_item.crop_name}</td>
                    <td>${parseFloat(yield_item.yield_amount).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                    <td>₹${parseFloat(yield_item.market_rate_per_unit).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                    <td>₹${parseFloat(yield_item.cost_of_selling).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                    <td>₹${parseFloat(yield_item.cost_of_growing).toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                    <td>${parseFloat(yield_item.roi).toLocaleString('en-IN', {maximumFractionDigits: 2})}%</td>
                `;
                yieldTableBody.appendChild(row);
            });
        } else {
            const row = document.createElement("tr");
            row.innerHTML = "<td colspan='6'>No yield data available</td>";
            yieldTableBody.appendChild(row);
        }

        // Populate best sowing time
        if (data.best_sowing_time) {
            document.getElementById("sowingResult").textContent = data.best_sowing_time;
        }

        // Show results section
        document.getElementById("resultsSection").style.display = "block";
        document.getElementById("resultsSection").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        // Hide loading spinner
        document.getElementById("loadingSpinner").style.display = "none";

        // Show error
        document.getElementById("errorMessage").textContent = error.message;
        document.getElementById("errorSection").style.display = "block";
        document.getElementById("errorSection").scrollIntoView({ behavior: "smooth" });

        console.error("Error:", error);
    }
});

function resetForm() {
    document.getElementById("predictionForm").reset();
    document.getElementById("resultsSection").style.display = "none";
    document.getElementById("errorSection").style.display = "none";
    document.getElementById("loadingSpinner").style.display = "none";
}

function closeError() {
    document.getElementById("errorSection").style.display = "none";
}
