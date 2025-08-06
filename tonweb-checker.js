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

const TonWeb = require('tonweb');
const { Address } = require('@ton/core');

/**
 * Функция для проверки кошелька с использованием TonWeb
 * @param {string} walletAddress - Адрес кошелька для проверки
 */
async function checkWalletWithTonWeb(walletAddress) {
    try {
        console.log(`Проверка кошелька с использованием TonWeb: ${walletAddress}`);
        
        // Создаем экземпляр TonWeb
        const tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
            apiKey: '' // Оставьте пустым для использования публичного API
        }));
        
        // Парсим адрес в формате TonWeb
        const address = new TonWeb.utils.Address(walletAddress);
        console.log('Адрес в формате TonWeb:', address.toString(true, true, true));
        console.log('Workchain ID:', address.wc);
        
        // Проверка на high-workchain адрес (не 0 и не -1)
        if (address.wc !== 0 && address.wc !== -1) {
            console.log('ВНИМАНИЕ: Обнаружен нестандартный workchain ID:', address.wc);
            console.log('Это может быть причиной несовпадения адресов при вычислении из StateInit.');
        }
        
        // Получаем информацию о кошельке
        console.log('Получение информации о кошельке...');
        const walletInfo = await tonweb.provider.getAddressInfo(address.toString());
        console.log('Информация о кошельке:', walletInfo);
        
        // Получаем баланс кошелька
        const balance = await tonweb.provider.getBalance(address.toString());
        console.log('Баланс кошелька:', balance);
        
        // Получаем транзакции кошелька
        console.log('Получение последних транзакций...');
        const transactions = await tonweb.provider.getTransactions(address.toString(), 5);
        console.log(`Получено ${transactions.length} транзакций`);
        
        // Определяем тип кошелька
        console.log('Определение типа кошелька...');
        
        // Проверяем разные типы кошельков
        const walletTypes = [
            { name: 'v3R1', wallet: new TonWeb.Wallets.all.v3R1(tonweb.provider, { address: address }) },
            { name: 'v3R2', wallet: new TonWeb.Wallets.all.v3R2(tonweb.provider, { address: address }) },
            { name: 'v4R1', wallet: new TonWeb.Wallets.all.v4R1(tonweb.provider, { address: address }) },
            { name: 'v4R2', wallet: new TonWeb.Wallets.all.v4R2(tonweb.provider, { address: address }) }
        ];
        
        // Получаем код контракта для анализа
        console.log('Получение кода контракта...');
        try {
            // Используем runMethod для получения хеша кода
            const codeResult = await tonweb.provider.call2(address.toString(), 'get_code_hash');
            console.log('Хеш кода контракта:', codeResult);
            
            // Известные хеши кодов для разных типов кошельков
            const knownCodeHashes = {
                'v3R1': '84dafa449f98a6987789ba232358072bc0f76dc4524002a5d0918b9a75d2d599',
                'v3R2': '73d0e0dd6f4c3f1f8f16587f2ff2bfc1e5c03d8cca32e000c927d6e7559db7e7',
                'v4R1': '207dc560c5956de1a2c1479356f8f3ee70a59767db2bf4788b1d61ad42cdad82',
                'v4R2': '5bcc3d95591849208a4cba5d61bc44e390ffad1a1dea86475fdc1ab6d7974207',
                'highload-v2': '9494d1cc8edf12f05671a1a9ba09921096eb50811e1924ec65c3c91913fc5d7f',
                'jetton-wallet': '0f5d299764f73ab68ae096db0f32b7a6a606d0ef6d27933b37ae32b9de5f0a2e'
            };
            
            // Проверяем, совпадает ли хеш кода с известными типами
            if (codeResult && codeResult.hash) {
                const codeHash = codeResult.hash;
                let matchedType = null;
                
                for (const [type, hash] of Object.entries(knownCodeHashes)) {
                    if (codeHash.toLowerCase() === hash.toLowerCase()) {
                        matchedType = type;
                        break;
                    }
                }
                
                if (matchedType) {
                    console.log(`Обнаружен тип кошелька: ${matchedType}`);
                } else {
                    console.log('Неизвестный тип кошелька. Хеш кода не совпадает с известными типами.');
                }
            }
        } catch (error) {
            console.log('Не удалось получить хеш кода контракта:', error.message);
            console.log('Попробуем альтернативный подход - анализ кода из state...');
            
            // Анализируем код из информации о кошельке
            if (walletInfo && walletInfo.code) {
                console.log('Код контракта доступен из информации о кошельке.');
                const codeBase64 = walletInfo.code;
                console.log('Длина кода (base64):', codeBase64.length);
                
                // Вычисляем хеш кода
                try {
                    const codeBuffer = Buffer.from(codeBase64, 'base64');
                    const crypto = require('crypto');
                    const codeHash = crypto.createHash('sha256').update(codeBuffer).digest('hex');
                    console.log('Вычисленный хеш кода:', codeHash);
                    
                    // Проверяем известные типы кошельков
                    for (const [type, hash] of Object.entries(knownCodeHashes)) {
                        if (codeHash.toLowerCase() === hash.toLowerCase()) {
                            console.log(`Обнаружен тип кошелька: ${type}`);
                            break;
                        }
                    }
                } catch (hashError) {
                    console.log('Ошибка при вычислении хеша кода:', hashError.message);
                }
            }
        }
        
        // Сравниваем адреса
        console.log('\nСравнение адресов:');
        
        // Парсим исходный адрес с помощью @ton/core для сравнения
        const tonCoreAddress = Address.parse(walletAddress);
        console.log('Исходный адрес (@ton/core):', tonCoreAddress.toString());
        
        // Пытаемся вычислить адрес из StateInit
        console.log('\nПопытка вычислить адрес из StateInit с помощью TonWeb:');
        try {
            if (walletInfo && walletInfo.code && walletInfo.data) {
                // Создаем StateInit
                const stateInit = {
                    code: Buffer.from(walletInfo.code, 'base64'),
                    data: Buffer.from(walletInfo.data, 'base64')
                };
                
                // Вычисляем хеш StateInit
                const stateInitCell = TonWeb.boc.Cell.oneFromBoc(TonWeb.utils.base64ToBytes(TonWeb.utils.bytesToBase64(
                    TonWeb.boc.createStateInit(stateInit.code, stateInit.data).toBoc()
                )));
                
                // Вычисляем адрес
                const calculatedHash = TonWeb.utils.bytesToHex(await stateInitCell.hash());
                const calculatedAddress = new TonWeb.utils.Address(`0:${calculatedHash}`);
                
                console.log('Вычисленный адрес:', calculatedAddress.toString(true, true, true));
                console.log('Исходный адрес:', address.toString(true, true, true));
                console.log('Совпадение:', calculatedAddress.toString() === address.toString());
                
                if (calculatedAddress.toString() !== address.toString()) {
                    console.log('\nВНИМАНИЕ: Адреса не совпадают!');
                    console.log('Возможные причины:');
                    console.log('1. Контракт был обновлен после деплоя');
                    console.log('2. Контракт использует нестандартный формат StateInit');
                    console.log('3. Контракт был деплоен с использованием специального метода');
                }
            } else {
                console.log('Недостаточно данных для вычисления адреса из StateInit');
            }
        } catch (stateInitError) {
            console.error('Ошибка при вычислении адреса из StateInit:', stateInitError.message);
        }
        
        for (const type of walletTypes) {
            try {
                const walletAddress = await type.wallet.getAddress();
                const addressStr = walletAddress.toString(true, true, true);
                console.log(`${type.name} адрес:`, addressStr);
                console.log(`Совпадение с исходным: ${addressStr === address.toString(true, true, true)}`);
            } catch (e) {
                console.log(`Ошибка при проверке ${type.name}:`, e.message);
            }
        }
        
    } catch (error) {
        console.error('Ошибка при проверке кошелька:', error);
    }
}

// Адрес для проверки
const walletToCheck = process.argv[2] || 'EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe';

// Запускаем проверку
checkWalletWithTonWeb(walletToCheck); 