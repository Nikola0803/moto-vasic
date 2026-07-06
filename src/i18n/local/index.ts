const modules = import.meta.glob('./*/*.ts', { eager: true });

const messages: Record<string, Record<string, Record<string, string>>> = {};

Object.keys(modules).forEach((path) => {
  const match = path.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
  if (match) {
    const [, lang, namespace] = match;
    const module = modules[path] as { default?: Record<string, string> };

    if (!messages[lang]) {
      messages[lang] = {};
    }

    if (module.default) {
      messages[lang][namespace] = {
        ...(messages[lang][namespace] || {}),
        ...module.default,
      };
    }
  }
});

export default messages;