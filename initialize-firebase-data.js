// Firebase Data Initialization Script
// Run this script to set up your portfolio data in Firestore

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkiH7_yAyoCu-r8xSLFMb7S1i1f6itVqk",
    authDomain: "portfolio-315f0.firebaseapp.com",
    projectId: "portfolio-315f0",
    storageBucket: "portfolio-315f0.firebasestorage.app",
    messagingSenderId: "334064031361",
    appId: "1:334064031361:web:77d157f77a1c1962695f80"
};

// Complete Portfolio Data Structure
const portfolioData = {
    profile: {
        name: "Sethupathy",
        title: "IoT Developer & Embedded Systems Engineer",
        bio: "IoT Developer and Embedded Systems Engineer passionate about building smart, connected, and reliable systems. Experienced in C/C++, Python, and ARM-based microcontrollers.",
        email: "SethupathyIoT@proton.me",
        linkedin: "https://linkedin.com/in/sethupathy-iot",
        github: "https://github.com/SethupathyIoT"
    },
    projects: [
        {
            id: 1640995200000, // Timestamp ID
            name: "Real-Time GPS Tracking System",
            description: "GPS tracking utilizing ESP32 and NEO-6M for real-time updates via Telegram Bot. Includes Google Maps integration and portable battery operation.",
            technologies: "ESP32, NEO-6M, Telegram Bot, Google Maps API",
            github: "https://github.com/SethupathyIoT",
            demo: "",
            image: "assets/img/project-01.jpg",
            featured: true
        },
        {
            id: 1640995260000,
            name: "Smart Home Automation",
            description: "Voice-controlled automation using ESP32, DHT11, and Relay Modules. Integrated with Alexa and Home Assistant via Nabu Casa.",
            technologies: "ESP32, DHT11, Relay Modules, Alexa, Home Assistant",
            github: "https://github.com/SethupathyIoT",
            demo: "",
            image: "assets/img/project-02.jpg",
            featured: true
        },
        {
            id: 1640995320000,
            name: "Industrial IoT Monitoring System",
            description: "MQTT-based industrial monitoring system with real-time data visualization and alert mechanisms for production environments.",
            technologies: "ESP32, MQTT, InfluxDB, Grafana, Node-RED",
            github: "https://github.com/SethupathyIoT",
            demo: "",
            image: "assets/img/project-03.jpg",
            featured: false
        }
    ],
    skills: [
        {
            id: 1,
            category: "Embedded Development",
            icon: "lnir-code-alt",
            description: "Low-level programming and firmware development for microcontrollers",
            tags: ["Embedded C", "C++", "Assembly", "Real-time OS", "Bare Metal", "Interrupt Handling"],
            color: "#cf000f"
        },
        {
            id: 2,
            category: "Microcontrollers & SoCs",
            icon: "lnir-cog",
            description: "ARM-based and 8-bit microcontroller platforms",
            tags: ["STM32", "ESP32/ESP8266", "Raspberry Pi", "Arduino", "PIC", "8051", "Nordic nRF"],
            color: "#ff6b35"
        },
        {
            id: 3,
            category: "Communication Protocols",
            icon: "lnir-shuffle",
            description: "Wired and wireless communication interfaces",
            tags: ["UART/USART", "SPI", "I2C", "CAN Bus", "RS485", "1-Wire"],
            color: "#4a90e2"
        },
        {
            id: 4,
            category: "IoT Protocols & Standards",
            icon: "lnir-cloud-network",
            description: "Industrial and consumer IoT communication standards",
            tags: ["MQTT", "Modbus RTU/TCP", "HTTP/HTTPS", "CoAP", "WebSocket", "OPC UA"],
            color: "#00d4aa"
        },
        {
            id: 5,
            category: "Wireless Technologies",
            icon: "lnir-signal",
            description: "Short and long-range wireless communication",
            tags: ["Wi-Fi", "Bluetooth/BLE", "LoRa/LoRaWAN", "Zigbee", "NFC", "GSM/LTE"],
            color: "#9b59b6"
        },
        {
            id: 6,
            category: "Sensors & Actuators",
            icon: "lnir-pulse",
            description: "Environmental monitoring and control systems",
            tags: ["Temperature/Humidity", "Pressure", "Accelerometer/Gyro", "GPS/GNSS", "Relays", "Motor Control"],
            color: "#f39c12"
        },
        {
            id: 7,
            category: "Programming Languages",
            icon: "lnir-laptop-phone",
            description: "Multi-language development expertise",
            tags: ["Python", "JavaScript", "C/C++", "MicroPython", "Bash/Shell", "YAML"],
            color: "#2ecc71"
        },
        {
            id: 8,
            category: "Development Tools",
            icon: "lnir-cogs",
            description: "IDEs, debuggers, and development environments",
            tags: ["Arduino IDE", "PlatformIO", "STM32CubeIDE", "VS Code", "Git/GitHub", "Oscilloscope"],
            color: "#e74c3c"
        },
        {
            id: 9,
            category: "IoT Platforms & Services",
            icon: "lnir-cloud-sync",
            description: "Cloud platforms and home automation systems",
            tags: ["Home Assistant", "ESPHome", "ThingSpeak", "AWS IoT", "Node-RED", "InfluxDB"],
            color: "#3498db"
        }
    ],
    experience: [
        {
            id: 1,
            company: "TRUCON",
            subtitle: "Brickslate Industries",
            position: "IoT Developer",
            period: "Aug 2024 - Present",
            description: "TRUCON by Brickslate Industries Private Limited. Designed, developed, and deployed IoT solutions focusing on automation and robustness. Implemented stacks using C/C++, Python, and MQTT/Modbus.",
            icon: "lnir-cogs",
            color: "#cf000f"
        },
        {
            id: 2,
            company: "TRUCON",
            subtitle: "Internship",
            position: "IoT Intern",
            period: "Mar 2024 - Aug 2024",
            description: "Validated and supported industrial IoT systems. Performed Wi-Fi/BLE connectivity testing and assisted in debugging live production environments.",
            icon: "lnir-graduation",
            color: "#3498db"
        },
        {
            id: 3,
            company: "RVS College",
            subtitle: "Arts & Science",
            position: "B.Sc. IoT",
            period: "2022 - 2025",
            description: "RVS Arts and Science College. Specialized in Embedded Systems & Microcontrollers (8051, PIC).",
            icon: "lnir-graduate",
            color: "#2ecc71"
        }
    ]
};

// Initialization Function
async function initializeFirebaseData() {
    try {
        console.log('🔥 Starting Firebase Data Initialization...');
        
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded. Please include Firebase scripts.');
        }

        // Initialize Firebase
        let app;
        if (firebase.apps.length === 0) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.apps[0];
        }

        const firestore = firebase.firestore();
        console.log('✅ Firebase initialized successfully');

        // Add metadata
        const dataToSave = {
            ...portfolioData,
            metadata: {
                lastUpdated: new Date().toISOString(),
                updatedBy: 'Firebase Data Initialization Script',
                version: '1.0.0',
                totalProjects: portfolioData.projects.length,
                totalSkills: portfolioData.skills.length,
                totalExperience: portfolioData.experience.length
            }
        };

        // Save to Firestore
        console.log('💾 Saving data to Firestore...');
        await firestore.collection('portfolio').doc('data').set(dataToSave);
        console.log('✅ Data saved successfully');

        // Verify the save
        console.log('🔍 Verifying data...');
        const doc = await firestore.collection('portfolio').doc('data').get();
        
        if (doc.exists) {
            const savedData = doc.data();
            console.log('✅ Data verification successful!');
            console.log('📊 Data Summary:');
            console.log(`   - Profile: ${savedData.profile ? '✅' : '❌'}`);
            console.log(`   - Projects: ${savedData.projects?.length || 0}`);
            console.log(`   - Skills: ${savedData.skills?.length || 0}`);
            console.log(`   - Experience: ${savedData.experience?.length || 0}`);
            console.log(`   - Last Updated: ${savedData.metadata?.lastUpdated}`);
            
            return {
                success: true,
                message: 'Firebase data initialized successfully!',
                data: savedData
            };
        } else {
            throw new Error('Data verification failed - document not found after save');
        }

    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        return {
            success: false,
            message: error.message,
            error: error
        };
    }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    // Wait for Firebase to load
    window.addEventListener('load', () => {
        // Add a button to manually trigger initialization
        const button = document.createElement('button');
        button.textContent = '🔥 Initialize Firebase Data';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #cf000f;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            z-index: 10000;
        `;
        button.onclick = async () => {
            button.textContent = '⏳ Initializing...';
            button.disabled = true;
            
            const result = await initializeFirebaseData();
            
            if (result.success) {
                button.textContent = '✅ Success!';
                button.style.background = '#2ecc71';
                alert('Firebase data initialized successfully! Your admin panel should now work.');
            } else {
                button.textContent = '❌ Failed';
                button.style.background = '#e74c3c';
                alert(`Initialization failed: ${result.message}`);
                button.disabled = false;
            }
        };
        document.body.appendChild(button);
    });
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeFirebaseData,
        portfolioData,
        firebaseConfig
    };
}

console.log('🚀 Firebase Data Initialization Script Loaded');
console.log('📋 Portfolio Data Structure Ready');
console.log('🔧 Run initializeFirebaseData() to set up your data');