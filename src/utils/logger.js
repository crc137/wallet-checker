/**
 * Enhanced logging utility with colors and levels
 */

const config = require('../config');

class Logger {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            dim: '\x1b[2m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            white: '\x1b[37m'
        };
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        this.currentLevel = this.levels[config.logging.level] || 1;
    }
    
    _formatMessage(level, message, data = null) {
        let output = '';
        
        if (config.logging.timestamp) {
            const timestamp = new Date().toISOString();
            output += `[${timestamp}] `;
        }
        
        if (config.logging.colors) {
            const levelColors = {
                debug: this.colors.cyan,
                info: this.colors.green,
                warn: this.colors.yellow,
                error: this.colors.red
            };
            
            output += `${levelColors[level]}[${level.toUpperCase()}]${this.colors.reset} `;
        } else {
            output += `[${level.toUpperCase()}] `;
        }
        
        output += message;
        
        if (data) {
            output += '\n' + JSON.stringify(data, null, 2);
        }
        
        return output;
    }
    
    debug(message, data = null) {
        if (this.currentLevel <= this.levels.debug) {
            console.log(this._formatMessage('debug', message, data));
        }
    }
    
    info(message, data = null) {
        if (this.currentLevel <= this.levels.info) {
            console.log(this._formatMessage('info', message, data));
        }
    }
    
    warn(message, data = null) {
        if (this.currentLevel <= this.levels.warn) {
            console.warn(this._formatMessage('warn', message, data));
        }
    }
    
    error(message, data = null) {
        if (this.currentLevel <= this.levels.error) {
            console.error(this._formatMessage('error', message, data));
        }
    }
    
    success(message, data = null) {
        if (config.logging.colors) {
            console.log(`${this.colors.green}✅ ${message}${this.colors.reset}`);
        } else {
            console.log(`✅ ${message}`);
        }
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
    
    warning(message, data = null) {
        if (config.logging.colors) {
            console.log(`${this.colors.yellow}⚠️  ${message}${this.colors.reset}`);
        } else {
            console.log(`⚠️  ${message}`);
        }
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
    
    failure(message, data = null) {
        if (config.logging.colors) {
            console.log(`${this.colors.red}❌ ${message}${this.colors.reset}`);
        } else {
            console.log(`❌ ${message}`);
        }
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

module.exports = new Logger();