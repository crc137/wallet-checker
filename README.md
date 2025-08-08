# TON Wallet Address Checker

## 🚀 Version 2.0 - Enhanced Features

This is a comprehensive tool for analyzing TON blockchain wallet addresses with advanced features including:

- **Multi-API Support**: Uses both TonAPI and TonCenter for reliable data fetching
- **Intelligent Retry Logic**: Automatic retry with exponential backoff for API calls
- **Enhanced Logging**: Colored, timestamped logs with configurable levels
- **Wallet Type Detection**: Automatically identifies wallet versions (v3R1, v3R2, v4R1, v4R2, etc.)
- **Comprehensive Analysis**: StateInit calculation, address comparison, and mismatch analysis
- **CLI Interface**: User-friendly command-line interface with multiple output formats
- **Modular Architecture**: Clean, maintainable code structure

## Проблема несовпадения адресов

При вычислении адреса из StateInit наблюдается несовпадение между исходным и вычисленным адресами:

- Исходный адрес: `EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe`
- Вычисленный адрес: `EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q`

## Причины несовпадения

После анализа адресов выявлены следующие факты:

1. Оба адреса имеют валидный формат и находятся в workchain 0
2. Хеши адресов полностью различаются:
   - Хеш исходного адреса: `ebd720a4b5ba7af7ff2e60e704e38ff76cad2a6b3b61012d36f2bcc9a85bdee8`
   - Хеш вычисленного адреса: `d4da39fa3bfea7213a34d1b8d108ca0a533ef3f156260e18738f93f5696f8dea`

## Возможные причины несовпадения

1. **Изменение данных контракта после деплоя**
   - Контракт мог быть обновлен после деплоя, что привело к изменению StateInit
   - Адрес контракта остался прежним, но его текущее состояние отличается от исходного

2. **Нестандартный формат StateInit при деплое**
   - При деплое контракта мог использоваться нестандартный формат StateInit
   - Некоторые контракты используют специальные параметры при инициализации

3. **Проблемы с парсингом данных из API**
   - Формат данных, возвращаемых API, может не соответствовать ожидаемому формату для создания Cell
   - Данные в формате x{...} требуют специальной обработки перед использованием

4. **Контракт был деплоен с использованием специального метода**
   - Некоторые контракты деплоятся с использованием специальных методов, которые могут влиять на итоговый адрес

## Решение

Для корректного вычисления адреса из StateInit необходимо:

1. Получить оригинальный StateInit, использованный при деплое контракта
2. Правильно преобразовать данные из формата API в Cell объекты
3. Учесть возможные специальные параметры, использованные при деплое

Если контракт был обновлен после деплоя, то вычислить исходный адрес из текущего состояния может быть невозможно.

## Инструменты для проверки

В репозитории представлены следующие инструменты:

- `wallet-checker.js` - основной скрипт для проверки кошелька и вычисления адреса из StateInit
- `tonweb-checker.js` - скрипт для проверки адреса с использованием TonWeb
- `ton-core-checker.js` - скрипт для вычисления адреса с использованием @ton/core
- `address-checker.js` - скрипт для сравнения форматов адресов

## Использование

### Новый улучшенный интерфейс (v2.0)

```bash
# Базовый анализ кошелька
node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Подробный анализ с детальными логами
node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe --verbose

# Сравнение двух адресов
node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe --compare EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q

# Вывод результатов в JSON формате
node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe --format json

# Тихий режим (только ошибки)
node src/cli.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe --quiet
```

### Оригинальные скрипты (v1.0)

```bash
# Проверка кошелька
node wallet-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Проверка адреса с использованием TonWeb
node tonweb-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Вычисление адреса с использованием @ton/core
node ton-core-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe

# Сравнение адресов
node address-checker.js EQDr1yCktbp69_8uYOcE44_3bK0qazthAS028rzJqFve6BZe EQDU2jn6O_6nITo00bjRCMoKUz7z8VYmDhhzj5P1aW-N6h9Q
```

## 🔧 Конфигурация

### Переменные окружения

```bash
# Опциональный API ключ для TonCenter (для увеличения лимитов)
export TONCENTER_API_KEY=your_api_key_here

# Уровень логирования (debug, info, warn, error)
export LOG_LEVEL=info
```

### Файл конфигурации

Настройки можно изменить в файле `src/config.js`:

- Таймауты API запросов
- Количество повторных попыток
- Задержки между попытками
- Известные хеши кодов кошельков
- Настройки логирования

## 📊 Новые возможности v2.0

### Комплексный анализ
- Определение типа кошелька по хешу кода
- Проверка доступных методов контракта
- Анализ последних транзакций
- Детальное сравнение адресов

### Улучшенная обработка ошибок
- Автоматические повторные попытки при сбоях API
- Подробные сообщения об ошибках
- Graceful fallback между различными API

### Модульная архитектура
- Разделение логики на отдельные модули
- Легкое расширение функциональности
- Улучшенная тестируемость кода

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск с подробными логами
LOG_LEVEL=debug npm test
```

## 📈 Производительность

- Параллельные API запросы где возможно
- Кэширование результатов
- Оптимизированная обработка больших данных
- Минимальное потребление памяти

## 🤝 Вклад в проект

Приветствуются любые улучшения! Пожалуйста:

1. Создайте fork репозитория
2. Создайте ветку для ваших изменений
3. Добавьте тесты для новой функциональности
4. Убедитесь, что все тесты проходят
5. Создайте Pull Request
