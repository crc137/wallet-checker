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

const { Address } = require("@ton/core");
const TonWeb = require('tonweb');

/**
 * Функция для проверки формата адреса
 * @param {string} walletAddress - Адрес кошелька для проверки
 */
function checkAddressFormat(walletAddress) {
    try {
        console.log(`Проверка формата адреса: ${walletAddress}`);
        
        // Проверка с помощью @ton/core
        console.log("\nПроверка с помощью @ton/core:");
        const tonCoreAddress = Address.parse(walletAddress);
        console.log("Адрес валиден в формате @ton/core");
        console.log("Workchain ID:", tonCoreAddress.workChain);
        console.log("Хеш части:", tonCoreAddress.hash.toString('hex'));
        console.log("Адрес в формате @ton/core:", tonCoreAddress.toString());
        
        // Проверка с помощью TonWeb
        console.log("\nПроверка с помощью TonWeb:");
        const tonWebAddress = new TonWeb.utils.Address(walletAddress);
        console.log("Адрес валиден в формате TonWeb");
        console.log("Workchain ID:", tonWebAddress.wc);
        console.log("Хеш части:", tonWebAddress.hashPart.toString('hex'));
        console.log("Адрес в формате TonWeb (user-friendly):", tonWebAddress.toString(true, true, true));
        console.log("Адрес в формате TonWeb (raw):", tonWebAddress.toString(false, false, false));
        
        // Сравнение хешей
        console.log("\nСравнение хешей адресов:");
        const tonCoreHash = tonCoreAddress.hash.toString('hex');
        const tonWebHashBuffer = Buffer.from(tonWebAddress.hashPart);
        const tonWebHash = tonWebHashBuffer.toString('hex');
        console.log("Хеш @ton/core:", tonCoreHash);
        console.log("Хеш TonWeb:", tonWebHash);
        console.log("Совпадение хешей:", tonCoreHash === tonWebHash);
        
        // Проверка на валидность адреса
        console.log("\nИтоговая проверка:");
        if (tonCoreHash === tonWebHash) {
            console.log("✅ Адрес валиден и имеет корректный формат");
        } else {
            console.log("⚠️ Адрес имеет различные хеши в разных библиотеках");
        }
        
        // Проверка на совпадение с вычисленным адресом
        console.log("\nПроверка на совпадение с вычисленным адресом:");
        const calculatedAddressParam = process.argv[3] || "EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q";
        const calculatedTonCoreAddress = Address.parse(calculatedAddressParam);
        const calculatedTonWebAddress = new TonWeb.utils.Address(calculatedAddressParam);
        
        console.log("Исходный адрес:", walletAddress);
        console.log("Вычисленный адрес:", calculatedAddressParam);
        
        console.log("\nСравнение хешей:");
        console.log("Хеш исходного адреса:", tonCoreHash);
        const calculatedTonCoreHash = calculatedTonCoreAddress.hash.toString('hex');
        console.log("Хеш вычисленного адреса:", calculatedTonCoreHash);
        console.log("Совпадение хешей:", tonCoreHash === calculatedTonCoreHash);
        
        console.log("\nСравнение workchain ID:");
        console.log("Workchain ID исходного адреса:", tonCoreAddress.workChain);
        console.log("Workchain ID вычисленного адреса:", calculatedTonCoreAddress.workChain);
        console.log("Совпадение workchain ID:", tonCoreAddress.workChain === calculatedTonCoreAddress.workChain);
        
        // Итоговое заключение
        console.log("\nИтоговое заключение:");
        if (tonCoreHash === calculatedTonCoreHash && 
            tonCoreAddress.workChain === calculatedTonCoreAddress.workChain) {
            console.log("✅ Адреса полностью совпадают");
        } else if (tonCoreHash === calculatedTonCoreHash) {
            console.log("⚠️ Хеши адресов совпадают, но workchain ID различаются");
        } else if (tonCoreAddress.workChain === calculatedTonCoreAddress.workChain) {
            console.log("⚠️ Workchain ID совпадают, но хеши адресов различаются");
        } else {
            console.log("❌ Адреса полностью различаются");
        }
        
    } catch (error) {
        console.error("Ошибка при проверке адреса:", error);
    }
}

// Адреса для проверки
const sourceAddress = process.argv[2] || 'EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe';
const calculatedAddress = process.argv[3] || 'EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q';

// Запускаем проверку
console.log("=== Проверка исходного адреса ===");
checkAddressFormat(sourceAddress);

console.log("\n=== Проверка вычисленного адреса ===");
checkAddressFormat(calculatedAddress); 