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
const { Address, contractAddress, beginCell, Cell } = require("@ton/core");

/**
 * Функция для проверки кошелька и вычисления адреса из StateInit
 * @param {string} walletAddress - Адрес кошелька для проверки
 */
async function checkWallet(walletAddress) {
    try {
        console.log(`Проверка кошелька: ${walletAddress}`);
        
        // Создаем клиент TonApi
        const client = new TonApiClient({
            baseUrl: 'https://tonapi.io',
            // apiKey: 'YOUR_API_KEY' // Раскомментируйте и добавьте свой API ключ для продакшена
        });
        
        // Парсим адрес
        const addr = Address.parse(walletAddress);
        
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
            // Проверяем формат данных
            console.log("\nПроверка формата данных:");
            console.log(`Тип данных code: ${typeof resp.code}`);
            console.log(`Тип данных data: ${typeof resp.data}`);
            
            // Преобразуем код и данные в строки, если они не строки
            const codeStr = typeof resp.code === 'string' ? resp.code : JSON.stringify(resp.code);
            const dataStr = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
            
            // Преобразуем код и данные из формата x{...} в Cell объекты
            console.log("Преобразование кода в Cell...");
            let codeHex;
            if (typeof codeStr === 'string' && codeStr.startsWith('x{') && codeStr.endsWith('}')) {
                codeHex = codeStr.slice(2, -1);
            } else {
                codeHex = codeStr;
            }
            console.log(`Код в hex: ${codeHex.substring(0, Math.min(20, codeHex.length))}...`);
            
            console.log("Преобразование данных в Cell...");
            let dataHex;
            if (typeof dataStr === 'string' && dataStr.startsWith('x{') && dataStr.endsWith('}')) {
                dataHex = dataStr.slice(2, -1);
            } else {
                dataHex = dataStr;
            }
            console.log(`Данные в hex: ${dataHex.substring(0, Math.min(20, dataHex.length))}...`);
            
            // Удаляем пробелы и переносы строк, которые могут быть в hex строке
            codeHex = codeHex.replace(/\s+/g, '');
            dataHex = dataHex.replace(/\s+/g, '');
            
            // Проверяем, что строки содержат только шестнадцатеричные символы
            const isValidHex = (hex) => /^[0-9A-Fa-f]+$/.test(hex);
            if (!isValidHex(codeHex) || !isValidHex(dataHex)) {
                console.log("ВНИМАНИЕ: Некорректный формат hex данных. Пробуем другой подход.");
            }
            
            let codeCell, dataCell;
            try {
                console.log("Создание Cell из кода...");
                if (isValidHex(codeHex)) {
                    codeCell = Cell.fromBoc(Buffer.from(codeHex, 'hex'))[0];
                } else {
                    // Пробуем создать из base64
                    codeCell = Cell.fromBoc(Buffer.from(resp.code, 'base64'))[0];
                }
                
                console.log("Создание Cell из данных...");
                if (isValidHex(dataHex)) {
                    dataCell = Cell.fromBoc(Buffer.from(dataHex, 'hex'))[0];
                } else {
                    // Пробуем создать из base64
                    dataCell = Cell.fromBoc(Buffer.from(resp.data, 'base64'))[0];
                }
            } catch (cellError) {
                console.error("Ошибка при создании Cell:", cellError.message);
                
                // Попробуем альтернативный подход - использовать raw данные
                console.log("Пробуем альтернативный подход...");
                try {
                    // Получаем raw данные аккаунта с другими параметрами
                    console.log("Получаем raw данные аккаунта напрямую...");
                    const rawResp = await client.blockchain.getBlockchainRawAccount(addr, {
                        include_raw: true
                    });
                    
                    console.log("Raw данные получены:");
                    if (rawResp.state && rawResp.state.state_init) {
                        console.log("Используем state_init из ответа API...");
                        
                        if (rawResp.state.state_init.code) {
                            codeCell = Cell.fromBoc(Buffer.from(rawResp.state.state_init.code, 'base64'))[0];
                        }
                        
                        if (rawResp.state.state_init.data) {
                            dataCell = Cell.fromBoc(Buffer.from(rawResp.state.state_init.data, 'base64'))[0];
                        }
                        
                        console.log("Альтернативный подход успешен!");
                    } else {
                        throw new Error("В ответе API отсутствует state_init");
                    }
                } catch (altError) {
                    console.error("Альтернативный подход не сработал:", altError.message);
                    
                    // Последняя попытка - использовать пустые ячейки
                    console.log("Используем пустые ячейки как запасной вариант...");
                    codeCell = new Cell();
                    dataCell = new Cell();
                }
            }
            
            console.log("Преобразование завершено.");
            
            // Получаем workchain ID из оригинального адреса
            const workchainId = addr.workChain;
            console.log(`Используемый workchain ID: ${workchainId}`);
            
            const si = {
                code: codeCell,
                data: dataCell
            };
            
            console.log("Вычисление адреса из StateInit...");
            const calculatedAddress = contractAddress(workchainId, si);
            console.log('Вычисленный адрес:', calculatedAddress.toString());
            console.log('Исходный адрес:', walletAddress);
            console.log("Совпадение:", calculatedAddress.toString() === addr.toString());
            
            // Если адреса не совпадают, выводим предупреждение
            if (calculatedAddress.toString() !== addr.toString()) {
                console.log("\nВНИМАНИЕ: Адреса не совпадают!");
                console.log("Возможные причины:");
                console.log("1. Неправильное преобразование данных из формата x{...} в Cell");
                console.log("2. Контракт использует нестандартный формат StateInit");
                console.log("3. Данные контракта могли измениться с момента деплоя");
            }
        } catch (error) {
            console.error("\nОшибка при вычислении адреса:", error.message);
            console.log("\nПричина: Проблема при преобразовании данных из формата x{...} в Cell.");
            console.log("Проверьте формат данных, возвращаемых API.");
        }
        
        // Проверяем методы get_public_key и seqno
        console.log("\nПроверка методов контракта...");
        
        try {
            const publicKeyResult = await client.blockchain.execGetMethodForBlockchainAccount(addr, {
                method: "get_public_key",
                stack: []
            });
            console.log("Результат get_public_key:", publicKeyResult);
        } catch (e) {
            console.log("Метод get_public_key недоступен:", e.message);
        }
        
        try {
            const seqnoResult = await client.blockchain.execGetMethodForBlockchainAccount(addr, {
                method: "seqno",
                stack: []
            });
            console.log("Результат seqno:", seqnoResult);
        } catch (e) {
            console.log("Метод seqno недоступен:", e.message);
        }
        
    } catch (error) {
        console.error("Ошибка при проверке кошелька:", error);
    }
}

// Адрес для проверки
const walletToCheck = process.argv[2] || 'EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe';

// Запускаем проверку
checkWallet(walletToCheck); 