import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getEnabledLocaleCodes, defaultLocale } from '../../../config/locales';

export const prerender = true;

export async function getStaticPaths() {
  const { hasFeature } = await import('../../../config/config-loader');
  if (!hasFeature('blog')) return [];

  const langs = getEnabledLocaleCodes();
  return langs.map(lang => ({
    params: { lang: lang === defaultLocale ? undefined : lang },
    props: { locale: lang }
  }));
}

export async function GET(context) {
  const locale = context.props.locale || defaultLocale;
  const posts = await getCollection('blog', ({ slug, data }) => slug.startsWith(`${locale}/`) && !data.draft);
  
  return rss({
    title: `Astro Glass Blog (${locale})`,
    description: 'Insights and updates.',
    site: context.site || 'https://astroglass-preview.pages.dev',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: locale === defaultLocale 
        ? `/blog/${post.slug.replace(`${locale}/`, '')}/` 
        : `/${locale}/blog/${post.slug.replace(`${locale}/`, '')}/`,
    })),
  });
}
