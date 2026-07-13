const STANDARD_SANS = [
  'Montserrat', 'Inter', 'Roboto', 'Outfit', 'Open Sans', 'Be Vietnam Pro',
  'Poppins', 'Jost', 'Urbanist', 'Lexend', 'Manrope', 'Lato', 'Raleway',
  'Nunito', 'Quicksand', 'Oswald', 'Syne'
];

const STANDARD_SERIF = [
  'Cormorant Garamond', 'Playfair Display', 'Lora', 'Merriweather', 'Cinzel',
  'EB Garamond', 'Prata', 'Fraunces', 'Cardo', 'Noto Serif'
];

function upsertLink(id, href) {
  let link = document.getElementById(id);
  if (!href) {
    link?.remove();
    return null;
  }

  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = href;
  return link;
}

function upsertStyle(id, text) {
  let style = document.getElementById(id);
  if (!text) {
    style?.remove();
    return null;
  }

  if (!style) {
    style = document.createElement('style');
    style.id = id;
    document.head.appendChild(style);
  }
  style.textContent = text;
  return style;
}

function buildUploadedFontRules(typography) {
  let rules = '';
  if (typography.custom_font_file_url) {
    const sansName = typography.font_sans || 'CustomUploadedSans';
    rules += `
      @font-face {
        font-family: "${sansName}";
        src: url("${typography.custom_font_file_url}");
        font-display: swap;
      }
    `;
  }

  if (typography.custom_font_file_url_serif) {
    const serifName = typography.font_serif || 'CustomUploadedSerif';
    rules += `
      @font-face {
        font-family: "${serifName}";
        src: url("${typography.custom_font_file_url_serif}");
        font-display: swap;
      }
    `;
  }

  return rules;
}

function buildGoogleFontUrl(sansFont, serifFont) {
  const sansFamily = sansFont.replace(/ /g, '+');
  const serifFamily = serifFont.replace(/ /g, '+');

  const sansTerm = STANDARD_SANS.includes(sansFont)
    ? `${sansFamily}:wght@300;400;500;600;700;800;900`
    : sansFamily;

  const serifTerm = STANDARD_SERIF.includes(serifFont)
    ? `${serifFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400`
    : serifFamily;

  return `https://fonts.googleapis.com/css2?family=${sansTerm}&family=${serifTerm}&display=swap`;
}

function buildThemeVars(colors, typography) {
  const sansFont = typography.font_sans || 'Montserrat';
  const serifFont = typography.font_serif || 'Cormorant Garamond';
  let styleText = ':root {\n';

  Object.entries(colors).forEach(([key, val]) => {
    if (val) {
      styleText += `  --color-${key}: ${val};\n`;
    }
  });

  styleText += `  --font-sans: "${sansFont}", "Quicksand", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n`;
  styleText += `  --font-serif: "${serifFont}", serif;\n`;
  styleText += `  --font-size-base: ${typography.font_size_base || '15px'};\n`;
  styleText += `  --card-border-style: ${typography.card_border_style || 'none'};\n`;
  styleText += `  --card-border-width: ${typography.card_border_width || '0px'};\n`;
  styleText += `  --card-border-color: ${typography.card_border_color || '#e8e8e8'};\n`;
  styleText += `  --card-border-radius: ${typography.card_border_radius || '0px'};\n`;
  styleText += `  --card-shadow: ${typography.card_shadow || 'none'};\n`;
  styleText += `  --card-padding: ${typography.card_padding || '0px'};\n`;
  styleText += `  --card-bg-color: ${typography.card_bg_color || 'transparent'};\n`;

  const shadowHover = (typography.card_shadow && typography.card_shadow !== 'none')
    ? '0 12px 28px rgba(0,0,0,0.08)'
    : 'none';
  styleText += `  --card-shadow-hover: ${shadowHover};\n`;
  styleText += `  --product-grid-gap-desktop: ${typography.product_grid_gap_desktop || '24px'};\n`;
  styleText += `  --product-grid-gap-mobile: ${typography.product_grid_gap_mobile || '16px'};\n`;
  styleText += `  --product-card-align: ${typography.product_card_align || 'center'};\n`;
  styleText += `  --product-card-justify: ${typography.product_card_align === 'left' ? 'flex-start' : 'center'};\n`;
  styleText += '}';

  return styleText;
}

export function applyDynamicThemeVars(settings = {}) {
  try {
    const colors = settings.theme_colors || {};
    const typography = settings.theme_typography || {
      font_sans: 'Montserrat',
      font_serif: 'Cormorant Garamond',
      font_size_base: '15px'
    };

    upsertLink('dynamic-custom-fonts', typography.custom_font_css || '');
    upsertStyle('dynamic-uploaded-fonts-vars', buildUploadedFontRules(typography));
    upsertLink(
      'dynamic-google-fonts',
      buildGoogleFontUrl(
        typography.font_sans || 'Montserrat',
        typography.font_serif || 'Cormorant Garamond'
      )
    );
    upsertStyle('dynamic-theme-vars', buildThemeVars(colors, typography));
  } catch (err) {
    console.warn('[Theme] Failed to inject dynamic colors & typography:', err);
  }
}
