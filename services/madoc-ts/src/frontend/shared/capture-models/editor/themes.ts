export const defaultTheme = {
  colors: {
    primary: '#333',
    textOnPrimary: '#fff',
    mutedPrimary: '#E3DDFD',
    textOnMutedPrimary: '#444',
  },
  sizes: {
    text: '13px',
    headingLg: '22px',
    headingMd: '18px',
    headingSm: '15px',
    buttonLg: '18px',
    buttonMd: '15px',
    buttonSm: '13px',
  },
  card: {
    shadow: '0 2px 41px 0 rgba(0,0,0,0.15)',
    large: {
      padding: '20px',
      radius: '10px',
      margin: '30px',
    },
    medium: {
      padding: '17px',
      radius: '10px',
      margin: '25px',
    },
    small: {
      padding: '12px',
      radius: '6px',
      margin: '16px',
    },
  },
};

export const getTheme = (props: any) => {
  if (!props) {
    return defaultTheme;
  }
  if (!props.theme) {
    return defaultTheme;
  }

  if (Object.keys(props.theme).length === 0) {
    return defaultTheme;
  }

  return props.theme as typeof defaultTheme;
};

export const getCard = (props: any, property: keyof typeof defaultTheme.card.medium) => {
  const theme = getTheme(props);
  const card: typeof theme.card.medium = (theme.card as any)[props.size]
    ? (theme.card as any)[props.size]
    : theme.card.medium;

  return card[property];
};
