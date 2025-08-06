// Простой тест для проверки, что скрипт может быть запущен
console.log('Тест запущен успешно!');
console.log('Проверка зависимостей:');

try {
  const tonApi = require('@ton-api/client');
  console.log('- @ton-api/client загружен успешно');
} catch (error) {
  console.error('- Ошибка при загрузке @ton-api/client:', error.message);
  process.exit(1);
}

try {
  const tonCore = require('@ton/core');
  console.log('- @ton/core загружен успешно');
} catch (error) {
  console.error('- Ошибка при загрузке @ton/core:', error.message);
  process.exit(1);
}

console.log('Все зависимости загружены успешно!'); 