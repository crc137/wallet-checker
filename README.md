# Проверка кошелька TON

[![Node.js CI](https://github.com/crc137/wallet-checker/actions/workflows/node.yml/badge.svg)](https://github.com/crc137/wallet-checker/actions/workflows/node.yml)

Этот проект предоставляет простой инструмент для проверки кошелька TON и попытки вычисления адреса из StateInit.

Репозиторий: [https://github.com/crc137/wallet-checker](https://github.com/crc137/wallet-checker)

## Установка

1. Клонируйте репозиторий:
```
git clone https://github.com/crc137/wallet-checker.git
cd wallet-checker
```

2. Установите зависимости:
```
npm install @ton-api/client @ton/core
```

## Использование

Запустите скрипт с адресом кошелька в качестве аргумента:

```
node wallet-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe
```

Если адрес не указан, будет использован адрес по умолчанию.

## Что делает скрипт

1. Получает информацию о кошельке через API TON
2. Отображает статус и баланс кошелька
3. Пытается вычислить адрес из StateInit
4. Проверяет методы контракта (get_public_key и seqno)

## Проблема с вычислением адреса

Библиотека `@ton-api/client` возвращает данные в формате `x{...}`, который не является Cell объектом, как ожидается в функции `contractAddress`. Поэтому прямое использование `resp.code` и `resp.data` в StateInit не работает корректно.

### Возможные решения

1. Использовать другую библиотеку для работы с TON (например, `@ton/ton`)
2. Реализовать парсер формата `x{...}` для преобразования в Cell объект
3. Использовать другой API метод, который возвращает данные в формате BOC или base64

## Разработка

### Тестирование

Для запуска тестов выполните:

```
npm test
```

### CI/CD

Проект настроен для работы с GitHub Actions. При каждом пуше в ветку `main` и при создании pull request выполняются тесты на различных версиях Node.js. 