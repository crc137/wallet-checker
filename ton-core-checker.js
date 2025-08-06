/* 
✨ CoonDev • https://dev.coonlink.com/ 

 ▄█▄    ████▄ ████▄    ▄   ██▄   ▄███▄      ▄  
 █▀ ▀▄  █   █ █   █     █  █  █  █▀   ▀      █ 
 █   ▀  █   █ █   █ ██   █ █   █ ██▄▄   █     █
 █▄  ▄▀ ▀████ ▀████ █ █  █ █  █  █▄   ▄▀ █    █
 ▀███▀              █  █ █ ███▀  ▀███▀    █  █ 
                    █   ██                 █▐  
                                           ▐   
*/

const { TonApiClient } = require("@ton-api/client");
const { Address, Cell, contractAddress, beginCell, storeStateInit } = require("@ton/core");

/**
 * Функция для вычисления адреса из StateInit с использованием @ton/core
 * @param {string} walletAddress - Адрес кошелька для проверки
 */
async function checkAddressWithTonCore(walletAddress) {
    try {
        console.log(`Проверка кошелька с использованием @ton/core: ${walletAddress}`);
        
        // Создаем клиент TonApi
        const client = new TonApiClient({
            baseUrl: 'https://tonapi.io',
            // apiKey: 'YOUR_API_KEY' // Раскомментируйте и добавьте свой API ключ для продакшена
        });
        
        // Парсим адрес
        const addr = Address.parse(walletAddress);
        console.log('Адрес в формате @ton/core:', addr.toString());
        console.log('Workchain ID:', addr.workChain);
        
        // Получаем данные аккаунта
        console.log("Получаем данные аккаунта...");
        const resp = await client.blockchain.getBlockchainRawAccount(addr);
        
        console.log("Данные аккаунта получены:");
        console.log(`Статус: ${resp.status}`);
        console.log(`Баланс: ${resp.balance.toString()}`);
        
        // Выводим информацию о формате кода и данных
        console.log("\nИнформация о коде и данных:");
        console.log(`Код: ${resp.code}`);
        console.log(`Данные: ${resp.data}`);
        
        // Пытаемся создать StateInit и вычислить адрес
        console.log("\nПопытка вычислить адрес из StateInit...");
        
        try {
            // Пробуем использовать данные напрямую из ответа API
            console.log("Используем данные напрямую из ответа API...");
            
            // Функция для преобразования hex строки в Cell
            const hexToCell = (hexStr) => {
                if (!hexStr) return new Cell();
                
                // Удаляем префикс x{ и суффикс } если они есть
                let cleanHex = hexStr;
                if (cleanHex.startsWith('x{') && cleanHex.endsWith('}')) {
                    cleanHex = cleanHex.slice(2, -1);
                }
                
                // Удаляем пробелы и переносы строк
                cleanHex = cleanHex.replace(/\s+/g, '');
                
                // Удаляем символы подчеркивания, которые могут быть в выводе
                cleanHex = cleanHex.replace(/_/g, '');
                
                try {
                    // Преобразуем hex в бинарные данные и создаем Cell
                    const buffer = Buffer.from(cleanHex, 'hex');
                    return Cell.fromBoc(buffer)[0];
                } catch (error) {
                    console.error(`Ошибка при преобразовании hex в Cell: ${error.message}`);
                    return new Cell();
                }
            };
            
            // Получаем код и данные
            let codeHex = resp.code;
            let dataHex = resp.data;
            
            console.log("Преобразование кода в Cell...");
            let codeCell;
            try {
                codeCell = hexToCell(codeHex);
                console.log("Код успешно преобразован в Cell");
            } catch (codeError) {
                console.error(`Ошибка при преобразовании кода: ${codeError.message}`);
                console.log("Используем пустую ячейку для кода");
                codeCell = new Cell();
            }
            
            console.log("Преобразование данных в Cell...");
            let dataCell;
            try {
                dataCell = hexToCell(dataHex);
                console.log("Данные успешно преобразованы в Cell");
            } catch (dataError) {
                console.error(`Ошибка при преобразовании данных: ${dataError.message}`);
                console.log("Используем пустую ячейку для данных");
                dataCell = new Cell();
            }
            
            // Создаем StateInit
            console.log("Создание StateInit...");
            const stateInit = { code: codeCell, data: dataCell };
            
            // Вычисляем адрес для разных workchain ID
            for (const wc of [-1, 0, 1]) {
                const calculatedAddress = contractAddress(wc, stateInit);
                console.log(`Вычисленный адрес (workchain ${wc}):`, calculatedAddress.toString());
                console.log(`Совпадение с исходным: ${calculatedAddress.toString() === addr.toString()}`);
            }
            
            // Проверяем, есть ли совпадение для исходного workchain
            const calculatedAddress = contractAddress(addr.workChain, stateInit);
            console.log(`\nВычисленный адрес (исходный workchain ${addr.workChain}):`, calculatedAddress.toString());
            console.log(`Исходный адрес:`, addr.toString());
            console.log(`Совпадение: ${calculatedAddress.toString() === addr.toString()}`);
            
            if (calculatedAddress.toString() !== addr.toString()) {
                console.log("\nВНИМАНИЕ: Адреса не совпадают!");
                console.log("Возможные причины:");
                console.log("1. Контракт был обновлен после деплоя (изменились code или data)");
                console.log("2. Контракт использует нестандартный формат StateInit");
                console.log("3. Контракт был деплоен с использованием специального метода");
                
                // Проверяем, совпадает ли адрес с вычисленным для другого workchain
                for (const wc of [-1, 0, 1]) {
                    if (wc !== addr.workChain) {
                        const altAddress = contractAddress(wc, stateInit);
                        if (altAddress.toString() === addr.toString()) {
                            console.log(`\nОбнаружено совпадение для workchain ${wc}, хотя исходный адрес имеет workchain ${addr.workChain}`);
                            console.log("Это может указывать на проблему с определением workchain ID");
                        }
                    }
                }
            }
            
            // Пробуем также получить raw данные аккаунта, если доступны
            try {
                console.log("\nПробуем также получить raw данные аккаунта...");
                const rawAccount = await client.blockchain.getBlockchainRawAccount(addr, { include_raw: true });
                
                if (rawAccount.state && rawAccount.state.state_init) {
                    console.log("Raw данные получены, state_init найден");
                    // Обработка raw данных...
                } else {
                    console.log("В ответе API отсутствует state_init");
                }
            } catch (rawError) {
                console.log("Не удалось получить raw данные:", rawError.message);
            }
            
        } catch (error) {
            console.error("Ошибка при вычислении адреса:", error.message);
        }
        
    } catch (error) {
        console.error("Ошибка при проверке кошелька:", error);
    }
}

// Адрес для проверки
const walletToCheck = process.argv[2] || 'EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe';

// Запускаем проверку
checkAddressWithTonCore(walletToCheck); 