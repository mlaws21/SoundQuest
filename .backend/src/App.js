import React, { useState, useEffect } from 'react';
import Main from "./components/Main.jsx"
import { redirectToAuthCodeFlow, getAccessToken } from "./scripts.js"

const clientId = "379e50830b614f5da69a1b198f950418"; // Replace with your Spotify client ID

function App() {
    // const [accessToken, setAccessToken] = useState('');
    // const [refreshToken, setRefreshToken] = useState('');

    // useEffect(() => {
    //     const storedAccessToken = localStorage.getItem('accessToken');
    //     const storedRefreshToken = localStorage.getItem('refreshToken');
    //     const storedTokenExpiration = localStorage.getItem('tokenExpiration');

    //     if (storedAccessToken && storedRefreshToken && storedTokenExpiration) {
    //         if (Date.now() < parseInt(storedTokenExpiration, 10)) {
    //             setAccessToken(storedAccessToken);
    //             setRefreshToken(storedRefreshToken);
    //         } else {
    //             // Token is expired, refresh it
    //             getAccessToken(clientId, storedRefreshToken)
    //                 .then(newAccessToken => {
    //                     setAccessToken(newAccessToken);
    //                     localStorage.setItem('accessToken', newAccessToken);
    //                     localStorage.setItem('tokenExpiration', (Date.now() + 3600000).toString()); // Assuming tokens expire in 1 hour (3600000 ms)
    //                 })
    //                 .catch(error => {
    //                     console.error("Error refreshing token:", error);
    //                     // Handle error, e.g., redirect to authentication flow
    //                     redirectToAuthCodeFlow(clientId);
    //                 });
    //         }
    //     } else {
    //         // Redirect to authentication flow
    //         redirectToAuthCodeFlow(clientId);
    //     }
    // }, []);

    return (
        <div className="App">
            <Main />
        </div>
    );
}

export default App;
