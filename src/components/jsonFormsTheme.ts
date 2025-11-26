import { createTheme } from "@mui/material/styles";

export const jsonFormsTheme = createTheme({
    components: {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#000",
                    fontWeight: 500,
                }
            }
        },
        MuiTypography: {
            styleOverrides: {
                root: { color: "#000" }
            }
        },
        MuiFormControl: {
            styleOverrides: {
                root: {
                    marginBottom: 20,
                }
            }
        }
    }
});
