# Репозитории и рабочий процесс

## Репозитории

| | Приватный | Публичный |
|---|---|---|
| **URL** | https://github.com/gurinovichroman/light-html-editor-private | https://github.com/Apposters/light-html-editor |
| **Remote** | `origin` | `public` |
| **Ветка** | `master` | `main` (локально: `public`) |
| **Включает `_workspace/`** | Да | Нет |

## Что куда попадает

- `master` → `origin` (приватный): весь код + папка `_workspace/` с черновиками
- `public` → `public/main` (публичный): только чистый код, `_workspace/` исключена через `.gitignore`

## Рабочий процесс

### Обычная работа

```bash
# Работаешь в master — коммитишь всё как обычно
git add .
git commit -m "описание изменений"

# Пушишь в приватный репо
git push origin master
```

### Публикация в публичный репо

```bash
# Переходишь на публичную ветку
git checkout public

# Подтягиваешь изменения из master
git merge master

# Пушишь в публичный репо
git push public public:main

# Возвращаешься работать
git checkout master
```

### Эксперименты в _workspace/

Файлы в `_workspace/` коммитятся только в `master` и уходят только в приватный репо.
В публичный репо они никогда не попадут — папка исключена в `.gitignore` ветки `public`.
