// import {jwtDecode} from 'jwt-decode';

const CALLBACK = "http://localhost:3000/callback";

const params = new URLSearchParams(window.location.search);
const code = params.get("code");

function outputUI(profile) {
    return {
        displayName: profile.display_name,
        id: profile.id,
        email: profile.email,
        uri: profile.uri,
        profileImage: profile.images[1]?.url ?? 'placeholder.jpg',
    };
}

async function fetchProfile(token) {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });

    return await result.json();
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", CALLBACK);
    params.append("scope", "user-read-private user-read-email user-modify-playback-state user-read-playback-state");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", CALLBACK);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
    });

    const { access_token, expires_in } = await result.json();
    const expirationTime = Date.now() + 360000; // Convert seconds to milliseconds

    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());

    return access_token;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function authorize() {
    const clientId = "379e50830b614f5da69a1b198f950418"; // Replace with your Spotify client ID

    if (!code) {
        redirectToAuthCodeFlow(clientId);
        return;
    }

    const accessToken = await getAccessToken(clientId, code);
    
    const profile = await fetchProfile(accessToken);
    console.log(profile); // Profile data logs to console
    console.log(accessToken); // Profile data logs to console
    // const decodedToken = jwtDecode(accessToken);
    
    // console.log(decodedToken);
    
    return {"accessToken": accessToken, "profile": outputUI(profile)}
}
