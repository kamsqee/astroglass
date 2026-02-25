import { getCollection } from 'astro:content';

// Sidebar Labels (Localization)
export const SIDEBAR_LABELS: Record<string, Record<string, string>> = {
  'components-sections': {
    en: 'Marketing Sections',
    ru: 'Маркетинговые Секции',
    fr: 'Sections Marketing',
    es: 'Secciones de Marketing',
    ja: 'マーケティングセクション',
    zh: '营销区块',
    kk: 'Маркетинг бөлімдері'
  },
  'components-ui': {
    en: 'UI Elements',
    ru: 'UI Элементы',
    fr: 'Éléments UI',
    es: 'Elementos UI',
    ja: 'UI要素',
    zh: 'UI 组件',
    kk: 'UI элементтері'
  },
  'components-pages': {
    en: 'Pages',
    ru: 'Страницы',
    fr: 'Pages',
    es: 'Páginas',
    ja: 'ページ',
    zh: '页面',
    kk: 'Беттер'
  },
  'components-reference': {
    en: 'Reference',
    ru: 'Справочник',
    fr: 'Référence',
    es: 'Referencia',
    ja: 'リファレンス',
    zh: '参考',
    kk: 'Анықтамалық'
  },
  'getting-started': {
    en: 'Getting Started',
    ru: 'Начало работы',
    fr: 'Premiers pas',
    es: 'Primeros pasos',
    ja: 'はじめに',
    zh: '快速开始',
    kk: 'Бастау'
  },
  'core-concepts': {
    en: 'Core Concepts',
    ru: 'Основные Концепции',
    fr: 'Concepts clés',
    es: 'Conceptos clave',
    ja: 'コアコンセプト',
    zh: '核心概念',
    kk: 'Негізгі тұжырымдамалар'
  },
  'deployment': {
    en: 'Deployment',
    ru: 'Развертывание',
    fr: 'Déploiement',
    es: 'Despliegue',
    ja: 'デプロイ',
    zh: '部署',
    kk: 'Орналастыру'
  },
  'components': {
    en: 'Components',
    ru: 'Компоненты',
    fr: 'Composants',
    es: 'Componentes',
    ja: 'コンポーネント',
    zh: '组件',
    kk: 'Компоненттер'
  },
  'themes': {
    en: 'Themes',
    ru: 'Темы',
    fr: 'Thèmes',
    es: 'Temas',
    ja: 'テーマ',
    zh: '主题',
    kk: 'Тақырыптар'
  },
  'guide': {
    en: 'Guide',
    ru: 'Руководство',
    fr: 'Guide',
    es: 'Guía',
    ja: 'ガイド',
    zh: '指南',
    kk: 'Нұсқаулық'
  },
  'guides': {
    en: 'Guides',
    ru: 'Руководства',
    fr: 'Guides',
    es: 'Guías',
    ja: 'ガイド',
    zh: '指南',
    kk: 'Нұсқаулықтар'
  },
  'General': {
    en: 'General',
    ru: 'Общее',
    fr: 'Général',
    es: 'General',
    ja: '一般',
    zh: '通用',
    kk: 'Жалпы'
  }
};

export async function buildDocsNav(locale: string) {
  // Fetch all docs
  const allDocs = await getCollection('docs');
  
  // Filter for locale
  const docs = allDocs.filter(d => d.slug.startsWith(`${locale}/`));
  
  // Group by folder
  const sections: Record<string, any[]> = {};
  
  docs.forEach(doc => {
    const cleanSlug = doc.slug.replace(`${locale}/`, '');
    const parts = cleanSlug.split('/');
    
    // Determine section name
    // If it's in a subfolder, use folder name. If root, use 'General'
    let sectionKey = parts.length > 1 ? parts[0] : 'General';
    
    // granular components
    if (sectionKey === 'components' && parts.length > 2) {
      sectionKey = `components-${parts[1]}`;
    }
    
    if (!sections[sectionKey]) sections[sectionKey] = [];
    
    sections[sectionKey].push({
      title: doc.data.title,
      href: locale === 'en' ? `/docs/${cleanSlug}/` : `/${locale}/docs/${cleanSlug}/`,
      order: doc.data.order || 99
    });
  });

  // Explicit Section Ordering
  const SECTION_ORDER: Record<string, number> = {
    'getting-started': 1,
    'core-concepts': 2,
    'components-sections': 3,
    'components-ui': 4,
    'components-pages': 5,
    'components-reference': 6,
    'guides': 7,
    'deployment': 8,
    'General': 0
  };

  // Convert to array and sort
  const nav = Object.entries(sections).map(([key, items]) => {
    // Default formatting
    let title = key === 'General' 
      ? (SIDEBAR_LABELS['General']?.[locale] || 'General') : 
      key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Use localized override if available
    if (SIDEBAR_LABELS[key] && SIDEBAR_LABELS[key][locale]) {
      title = SIDEBAR_LABELS[key][locale];
    }
      
    // Get explicit order
    const sectionOrder = SECTION_ORDER[key] || 99;

    return {
      title,
      order: sectionOrder,
      items: items.sort((a, b) => a.order - b.order)
    };
  });

  return nav.sort((a, b) => a.order - b.order);
}
