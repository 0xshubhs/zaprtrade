import { extendTheme } from "@chakra-ui/react";

const bauhaus = {
  background: "#F5F0E8",
  black: "#121212",
  red: "#E63946",
  blue: "#457B9D",
  yellow: "#F4D35E",
  green: "#208040",
  border: "#121212",
  foreground: "#121212",
};

// UI color scheme: header/chrome #053AC6 + white text; accent on blue = #ADFF01; buttons #FFFFFF + #002583 text
const brand = {
  primaryBg: "#053AC6",
  primaryText: "#FFFFFF",
  accentOnBlue: "#ADFF01", // lime accent for text on blue bg
  buttonBg: "#FFFFFF",
  buttonText: "#002583",
  pageBg: "#FFFFFF",
  textPrimary: "#002583",
  textAccent: "#043BCB",
  textDark: "#000000",
  // legacy aliases for gradual migration
  lime: "#FFFFFF",
  darkTeal: "#053AC6",
  green: "#043BCB",
};

export const theme = extendTheme({
  colors: {
    bauhaus,
    brand,
  },
  fonts: {
    heading: "var(--font-serif), Georgia, serif",
    body: "var(--font-geist-sans), system-ui, sans-serif",
  },
  fontSizes: {
    "2xs": "0.625rem",
  },
  semanticTokens: {
    colors: {
      "text.secondary": { default: "#4A5568", _dark: "#A0AEC0" },
      "text.tertiary": { default: "#718096", _dark: "#718096" },
    },
  },
  components: {
    Button: {
      variants: {
        // Primary: white bg, #002583 text (main buttons)
        primary: {
          bg: "brand.buttonBg",
          color: "brand.buttonText",
          border: "2px solid",
          borderColor: "brand.buttonText",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          _hover: {
            bg: "gray.100",
            borderColor: "brand.textAccent",
            color: "brand.textAccent",
            transform: "translateY(-1px)",
          },
          _active: {
            transform: "translateY(0)",
          },
        },
        lime: {
          bg: "brand.buttonBg",
          color: "brand.buttonText",
          border: "2px solid",
          borderColor: "brand.buttonText",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          _hover: {
            bg: "gray.100",
            borderColor: "brand.textAccent",
            color: "brand.textAccent",
            transform: "translateY(-1px)",
          },
          _active: {
            transform: "translateY(0)",
          },
        },
        outline: {
          border: "2px solid",
          borderColor: "brand.textPrimary",
          bg: "transparent",
          color: "brand.textPrimary",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          _hover: {
            bg: "whiteAlpha.900",
            borderColor: "brand.textAccent",
            color: "brand.textAccent",
          },
        },
        yellow: {
          bg: "bauhaus.yellow",
          color: "bauhaus.black",
          border: "3px solid",
          borderColor: "bauhaus.black",
          boxShadow: "3px 3px 0px 0px #121212",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          _hover: {
            transform: "translateY(-1px)",
            boxShadow: "4px 4px 0px 0px #121212",
          },
          _active: {
            transform: "translate(3px, 3px)",
            boxShadow: "none",
          },
        },
        green: {
          bg: "brand.buttonBg",
          color: "brand.buttonText",
          border: "2px solid",
          borderColor: "brand.buttonText",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          _hover: {
            bg: "gray.100",
            borderColor: "brand.textAccent",
            color: "brand.textAccent",
            transform: "translateY(-1px)",
          },
          _active: {
            transform: "translateY(0)",
          },
        },
      },
    },
  },
});
