
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, 'templates');

export const compileTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, data, { async: true, cache: true, filename: templatePath });
    return html;
  } catch (err) {
    console.error(`❌ compileTemplate error for ${templateName}:`, err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const renderPage = async (pageTemplate, data) => {
  try {
    const content = await compileTemplate(pageTemplate, data);
    const layoutData = {
      ...data,
      content,
      page: pageTemplate,
    };
    return await compileTemplate('layout', layoutData);
  } catch (err) {
    console.error(`❌ renderPage error for ${pageTemplate}:`, err.message);
    console.error('❌ Stack:', err.stack);
    throw err;
  }
};

export const getTemplateNames = () => {
  return [
    'layout', 'home', 'products', 'product-detail',
    'cart-checkout', 'login', 'register',
    'order-confirmation', 'orders'
  ];
};

export default {
  compileTemplate,
  renderPage,
  getTemplateNames,
};
