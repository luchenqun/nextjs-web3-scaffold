import React, { useReducer } from "react";
import PropTypes from "prop-types";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { WalletProvider } from "../contexts/wallet";
import { reducer, initState, context } from "../reducer/index";
import Navbar from "../components/navbar";
import createEmotionCache from "../utility/createEmotionCache";
import lightTheme from "../styles/theme/lightTheme";
import "../styles/globals.css";

const clientSideEmotionCache = createEmotionCache();

const MyApp = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  let store = useReducer(reducer, initState);
  return (
    <context.Provider value={store}>
      <WalletProvider>
        <CacheProvider value={emotionCache}>
          <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <Navbar />
            <Component {...pageProps} />
          </ThemeProvider>
        </CacheProvider>
      </WalletProvider>
    </context.Provider>
  );
};

export default MyApp;

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
