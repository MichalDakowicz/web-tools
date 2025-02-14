document.addEventListener("DOMContentLoaded", function () {
    const conversionData = {
        length: {
            units: [
                "meter",
                "kilometer",
                "centimeter",
                "inch",
                "foot",
                "yard",
                "mile",
            ],
            factors: {
                meter: 1,
                kilometer: 1000,
                centimeter: 0.01,
                inch: 0.0254,
                foot: 0.3048,
                yard: 0.9144,
                mile: 1609.34,
            },
        },
        temperature: {
            units: ["celsius", "fahrenheit", "kelvin"],
        },
        weight: {
            units: ["gram", "kilogram", "ounce", "pound"],
            factors: {
                gram: 1,
                kilogram: 1000,
                ounce: 28.3495,
                pound: 453.592,
            },
        },
        volume: {
            units: ["liter", "milliliter", "gallon", "cup"],
            factors: {
                liter: 1,
                milliliter: 0.001,
                gallon: 3.78541,
                cup: 0.2366,
            },
        },
        time: {
            units: ["second", "minute", "hour", "day"],
            factors: { second: 1, minute: 60, hour: 3600, day: 86400 },
        },
        speed: {
            units: ["m/s", "km/h", "mph"],
            factors: { "m/s": 1, "km/h": 3.6, mph: 2.237 },
        },
        area: {
            units: ["square meter", "square kilometer", "square foot", "acre"],
            factors: {
                "square meter": 1,
                "square kilometer": 1e-6,
                "square foot": 10.7639,
                acre: 0.000247105,
            },
        },
        pressure: {
            units: ["pascal", "bar", "psi"],
            factors: { pascal: 1, bar: 1e-5, psi: 0.000145038 },
        },
        digital: {
            units: ["bit", "byte", "kilobyte", "megabyte", "gigabyte"],
            factors: {
                bit: 1,
                byte: 8,
                kilobyte: 8000,
                megabyte: 8e6,
                gigabyte: 8e9,
            },
        },
        frequency: {
            units: ["hertz", "kilohertz", "megahertz"],
            factors: { hertz: 1, kilohertz: 1e-3, megahertz: 1e-6 },
        },
        fuel: {
            units: ["liter/100km", "mpg"],
            factors: { "liter/100km": 1, mpg: 235.214583 },
        },
        power: {
            units: ["watt", "kilowatt", "hp"],
            factors: { watt: 1, kilowatt: 0.001, hp: 0.00134102 },
        },
        force: {
            units: ["newton", "kilonewton", "pound-force"],
            factors: { newton: 1, kilonewton: 0.001, "pound-force": 0.224809 },
        },
        energy: {
            units: ["joule", "kilojoule", "calorie"],
            factors: { joule: 1, kilojoule: 0.001, calorie: 0.239006 },
        },
        density: {
            units: ["kg/m^3", "g/cm^3"],
            factors: { "kg/m^3": 1, "g/cm^3": 0.001 },
        },
        angle: {
            units: ["degree", "radian", "gradian"],
            factors: { degree: 1, radian: 0.0174533, gradian: 1.11111 },
        },
        illuminance: {
            units: ["lux", "foot-candle"],
            factors: { lux: 1, "foot-candle": 0.092903 },
        },
        charge: {
            units: ["coulomb", "ampere-hour"],
            factors: { coulomb: 1, "ampere-hour": 0.000277778 },
        },
        current: {
            units: ["ampere", "milliampere"],
            factors: { ampere: 1, milliampere: 1000 },
        },
        voltage: {
            units: ["volt", "kilovolt"],
            factors: { volt: 1, kilovolt: 0.001 },
        },
        resistance: {
            units: ["ohm", "kilohm"],
            factors: { ohm: 1, kilohm: 0.001 },
        },
        conductance: {
            units: ["siemens", "milliSiemens"],
            factors: { siemens: 1, milliSiemens: 1000 },
        },
        magnetic: {
            units: ["tesla", "gauss"],
            factors: { tesla: 1, gauss: 10000 },
        },
        torque: {
            units: ["newton-meter", "pound-foot"],
            factors: { "newton-meter": 1, "pound-foot": 0.73756 },
        },
        luminance: {
            units: ["cd/m^2", "nits"],
            factors: { "cd/m^2": 1, nits: 1 },
        },
        viscosity: {
            units: ["pascal-second", "poise"],
            factors: { "pascal-second": 1, poise: 10 },
        },
        flow: {
            units: ["cubic meter per second", "liter per second"],
            factors: { "cubic meter per second": 1, "liter per second": 1000 },
        },
    };

    function convertToCelsius(value, fromUnit) {
        if (fromUnit === "celsius") return value;
        if (fromUnit === "fahrenheit") return ((value - 32) * 5) / 9;
        if (fromUnit === "kelvin") return value - 273.15;
    }
    function convertFromCelsius(celsius, toUnit) {
        if (toUnit === "celsius") return celsius;
        if (toUnit === "fahrenheit") return (celsius * 9) / 5 + 32;
        if (toUnit === "kelvin") return celsius + 273.15;
    }

    let currentType = "length";
    let currentData = conversionData[currentType];

    const container = document.querySelector(".container");
    container.innerHTML = `
        <div class="converter-form">
            <select id="conversionType">
                ${Object.keys(conversionData)
                    .map(
                        (type) =>
                            `<option value="${type}">${
                                type.charAt(0).toUpperCase() + type.slice(1)
                            }</option>`
                    )
                    .join("")}
            </select>
            <input type="number" id="inputValue" placeholder="Enter value" />
            <select id="fromUnit">
                ${currentData.units
                    .map(
                        (unit) =>
                            `<option value="${unit}">${
                                unit.charAt(0).toUpperCase() + unit.slice(1)
                            }</option>`
                    )
                    .join("")}
            </select>
            <select id="toUnit">
            </select>
            <button id="convertBtn">Convert</button>
        </div>
        <div class="converter-result" id="result"></div>
    `;

    function updateUnitOptions() {
        currentType = document.getElementById("conversionType").value;
        currentData = conversionData[currentType];
        const fromSelect = document.getElementById("fromUnit");
        fromSelect.innerHTML = currentData.units
            .map(
                (unit) =>
                    `<option value="${unit}">${
                        unit.charAt(0).toUpperCase() + unit.slice(1)
                    }</option>`
            )
            .join("");
        updateToOptions();
    }

    function updateToOptions() {
        const fromUnit = document.getElementById("fromUnit").value;
        const toSelect = document.getElementById("toUnit");
        toSelect.innerHTML = "";
        currentData.units.forEach((unit) => {
            if (unit !== fromUnit) {
                const option = document.createElement("option");
                option.value = unit;
                option.textContent =
                    unit.charAt(0).toUpperCase() + unit.slice(1);
                toSelect.appendChild(option);
            }
        });
    }

    updateUnitOptions();
    document
        .getElementById("conversionType")
        .addEventListener("change", updateUnitOptions);
    document
        .getElementById("fromUnit")
        .addEventListener("change", updateToOptions);

    document
        .getElementById("convertBtn")
        .addEventListener("click", function () {
            const value = parseFloat(
                document.getElementById("inputValue").value
            );
            if (isNaN(value)) {
                document.getElementById("result").textContent =
                    "Please enter a valid number.";
                return;
            }
            const fromUnit = document.getElementById("fromUnit").value;
            const toUnit = document.getElementById("toUnit").value;
            let result;
            if (currentType === "temperature") {
                const celsiusValue = convertToCelsius(value, fromUnit);
                result = convertFromCelsius(celsiusValue, toUnit);
            } else {
                result =
                    (value * currentData.factors[fromUnit]) /
                    currentData.factors[toUnit];
            }
            document.getElementById(
                "result"
            ).textContent = `${value} ${fromUnit} = ${result.toFixed(
                4
            )} ${toUnit}`;
        });
});
