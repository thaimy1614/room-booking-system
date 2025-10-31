🧠 Node-RED Project Setup Guide

This guide explains how to set up, enable Project Mode, and run this Node-RED project locally.

🚀 Prerequisites

| Tool         | Recommended Version | Installation                            |
| ------------ | ------------------- | --------------------------------------- |
| **Node.js**  | ≥ 18.x              | [nodejs.org](https://nodejs.org)        |
| **npm**      | ≥ 9.x               | Included with Node.js                   |
| **Git**      | Latest              | [git-scm.com](https://git-scm.com)      |
| **Node-RED** | ≥ 4.x               | `npm install -g --unsafe-perm node-red` |

⚙️ 1. Enable Project Mode

Node-RED Project Mode allows version control for your flows using Git.

Edit your Node-RED settings file (usually in ~/.node-red/settings.js) and make sure this block exists:

    editorTheme: {
        projects: {
            enabled: true
        }
    }

Then restart Node-RED. It creates /projects folder in user dir .node-red automatically.

📦 2. Get the Project

You can clone this Node-RED project either via Git CLI or directly in the Node-RED UI.

🖥️ Option A — Clone via Terminal

    cd userDir nodered (.node-red) /projects
    git clone https://github.com/thaimy1614/room-booking-system.git
    cd project name
    npm install

🧠 Option B — Clone via Node-RED UI (RECOMMEND)

Once Project Mode is enabled:

Start Node-RED: 
    
    node-red


Open the editor at http://localhost:1880

Go to Menu -> Projects -> New

When prompted to “Select a project,” choose: Clone repository

Paste repo URL:

    https://github.com/thaimy1614/room_booking_system.git

Node-RED will automatically clone the project and install dependencies.

💬 Tip: If the project has a package.json, Node-RED will automatically run npm install for you.

⚙️ 3. Setup ENV

Add .env file into project directory

Open .env file and create variable:

    JWT_SECRET_KEY=your-jwt-secret-key

▶️ 4. Open and Run project

Start Node-RED manually:

    cd to the project
    node-red -s custom-setting.js -u .

To run with custom-setting.js file and set current user directory

🌐 Open your browser at: 

    http://localhost:1880

▶️ 5. Open and Run UIBUILDER

Start UIBUILDER manually:

    cd to the project /uibuilder/project (uibuilder name prefix)
    npm install
    npm run build (to create /build folder)

Run ReactJS dev mode:

    npm start

🌐 Open your browser at: 
    
    http://localhost:1880/project (uibuilder)
    http://localhost:3000/project (ReactJS dev mode)

📦 6. Folder Structure

    ├── uibuilder/              # Store uibuild (ReactJS)
    ├── flows.json              # Main Node-RED flow definitions
    ├── flows_cred.json         # Encrypted credentials (auto-generated)
    ├── package.json            # Node dependencies
    ├── .gitignore              # Git ignore rules
    ├── custom-settings.js      # Custom Node-RED settings
    └── README.md               # This file
