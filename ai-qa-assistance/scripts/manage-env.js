#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const ENV_DIR = path.join(__dirname, '..', 'postman_collections', 'Pidilite');
const ENV_FILE = path.join(ENV_DIR, 'uat.env.json');

// Helper functions
function readEnvFile() {
    try {
        if (fs.existsSync(ENV_FILE)) {
            const content = fs.readFileSync(ENV_FILE, 'utf8');
            return JSON.parse(content);
        }
        return {};
    } catch (error) {
        console.error('Error reading environment file:', error.message);
        return {};
    }
}

function writeEnvFile(variables) {
    try {
        // Ensure directory exists
        if (!fs.existsSync(ENV_DIR)) {
            fs.mkdirSync(ENV_DIR, { recursive: true });
        }

        fs.writeFileSync(ENV_FILE, JSON.stringify(variables, null, 2));
        console.log(`✅ Environment variables saved to ${ENV_FILE}`);
    } catch (error) {
        console.error('Error writing environment file:', error.message);
    }
}

function displayVariables(variables) {
    console.log('\n📋 Current Environment Variables:');
    console.log('=====================================');
    Object.entries(variables).forEach(([key, value]) => {
        const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
        console.log(`${key}: ${displayValue}`);
    });
    console.log('=====================================\n');
}

function addVariable(key, value) {
    const variables = readEnvFile();
    variables[key] = value;
    writeEnvFile(variables);
    console.log(`✅ Added variable: ${key}`);
}

function removeVariable(key) {
    const variables = readEnvFile();
    if (variables.hasOwnProperty(key)) {
        delete variables[key];
        writeEnvFile(variables);
        console.log(`✅ Removed variable: ${key}`);
    } else {
        console.log(`❌ Variable not found: ${key}`);
    }
}

function updateVariable(key, value) {
    const variables = readEnvFile();
    if (variables.hasOwnProperty(key)) {
        variables[key] = value;
        writeEnvFile(variables);
        console.log(`✅ Updated variable: ${key}`);
    } else {
        console.log(`❌ Variable not found: ${key}. Use 'add' to create new variable.`);
    }
}

// CLI Commands
const command = process.argv[2];
const key = process.argv[3];
const value = process.argv[4];

switch (command) {
    case 'list':
    case 'show':
        displayVariables(readEnvFile());
        break;

    case 'add':
        if (!key || !value) {
            console.log('Usage: node manage-env.js add <key> <value>');
            process.exit(1);
        }
        addVariable(key, value);
        break;

    case 'update':
    case 'set':
        if (!key || !value) {
            console.log('Usage: node manage-env.js update <key> <value>');
            process.exit(1);
        }
        updateVariable(key, value);
        break;

    case 'remove':
    case 'delete':
        if (!key) {
            console.log('Usage: node manage-env.js remove <key>');
            process.exit(1);
        }
        removeVariable(key);
        break;

    case 'backup':
        const variables = readEnvFile();
        const backupFile = path.join(ENV_DIR, `uat.env.backup.${Date.now()}.json`);
        fs.writeFileSync(backupFile, JSON.stringify(variables, null, 2));
        console.log(`✅ Backup created: ${backupFile}`);
        break;

    default:
        console.log(`
🔧 Environment Variable Manager

Usage:
  node manage-env.js <command> [key] [value]

Commands:
  list, show              - Display all environment variables
  add <key> <value>       - Add a new environment variable
  update, set <key> <value> - Update an existing environment variable
  remove, delete <key>    - Remove an environment variable
  backup                  - Create a backup of current environment variables

Examples:
  node manage-env.js list
  node manage-env.js add API_KEY my-secret-key
  node manage-env.js update baseUrl https://new-api.example.com
  node manage-env.js remove OLD_VARIABLE
  node manage-env.js backup
        `);
        break;
} 