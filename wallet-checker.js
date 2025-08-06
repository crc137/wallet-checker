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
const { Address, contractAddress, beginCell } = require("@ton/core");

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
            const si = {
                code: resp.code,
                data: resp.data
            };
            
            const calculatedAddress = contractAddress(0, si);
            console.log('Вычисленный адрес:', calculatedAddress.toString());
            console.log('Исходный адрес:', walletAddress);
            console.log("Совпадение:", calculatedAddress.toString() === addr.toString());
            
            // Если адреса не совпадают, выводим предупреждение
            if (calculatedAddress.toString() !== addr.toString()) {
                console.log("\nВНИМАНИЕ: Адреса не совпадают!");
                console.log("Причина: API возвращает данные в формате x{...}, который не является Cell объектом.");
                console.log("Для корректного вычисления адреса требуется преобразование данных из формата x{...} в Cell.");
            }
        } catch (error) {
            console.error("\nОшибка при вычислении адреса:", error.message);
            console.log("\nПричина: API возвращает данные в формате x{...}, который не является Cell объектом.");
            console.log("Для корректного вычисления адреса требуется преобразование данных из формата x{...} в Cell.");
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