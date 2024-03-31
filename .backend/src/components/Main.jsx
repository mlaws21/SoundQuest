import React, { useState, useEffect, useRef } from 'react';
import {authorize} from "../scripts.js"
import "./styles/Main.css"
import placeholder_playlist from "./images/placeholder_playlist.png"

const ANSWER_TIME = 6000
const THINK_TIME = 6
// TODO can change these with a (easy, medium, hard) setting

const user_data = await authorize();

const profile_data = user_data.profile;
const accessToken = user_data.accessToken;


const Get_available_devices = async () => {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        
        if (!response.ok) {
            throw new Error('Failed to pause');
        }

        const data = await response.json();

        return data;

    } catch (error) {
        console.log("Error: ", error)
    }

    return null
}

const set_volume = async (vol) => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${vol}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to change volume');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


const pause = async () => {
    try {
        const pause_response = await fetch(`https://api.spotify.com/v1/me/player/pause`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!pause_response.ok) {
            throw new Error('Failed to pause');
        }
    } catch (error) {
        console.error('Error:', error);
        return null; // Return null or handle the error as needed
    }
}

const pause_if_playing = async () => {
    try {
        const status_response = await fetch(`https://api.spotify.com/v1/me/player`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!status_response.ok) {
            throw new Error('Failed to get status');
        }

        const data = await status_response.json();
        if (data.is_playing) {

            const pause_response = await fetch(`https://api.spotify.com/v1/me/player/pause`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!pause_response.ok) {
                throw new Error('Failed to pause');
            }

        }

    } catch (error) {
        console.error('Error:', error);
        return null; // Return null or handle the error as needed
    }
}


const play = async () => {
   
    try { 
        const play_response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
                headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                },
        });
    
        if (!play_response.ok) {
            throw new Error('Failed to play');
        }
    } catch (error) {
        console.error("Error:", error)
    }
}

const skip_helper = async () => {

    const skip_response = await fetch(`https://api.spotify.com/v1/me/player/next`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!skip_response.ok) {
        throw new Error('Failed to skip');
    }

    console.log('skipped');

}

const current_player_helper = async () => {
    const data_response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!data_response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await data_response.json();
    return data;
}

const seek_helper = async (pos) => {
    const seek_response = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${pos}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!seek_response.ok) {
        throw new Error('Failed to seek');
    }
}


const safe_get_player_data = async (prev) => {
    let player_data = await current_player_helper();

    // console.log(prev.item.name, player_data.item.name)
    return new Promise((resolve) => {
        const fetchInterval = setInterval(async () => {
            // Perform the action
        

            // Check the condition
            if (player_data.item.name !== prev.item.name) {
                // console.log("loop break", prev.item.name, player_data.item.name)
                clearInterval(fetchInterval); // Stop the interval
                console.log("done");
                resolve(player_data);
                return
                
            }

            console.log("refetching");
            player_data = await current_player_helper();
            


        }, 1000); // Repeat every second (1000 milliseconds)
    });


}

const GetNextSongDataRandom = async () => {
    try {
        await set_volume(0);

        const previous = await current_player_helper()

        await skip_helper();
        console.log("after skip")

        const player_data = await safe_get_player_data(previous);
        

        // console.log(player_data.item.name)

        const max_start = player_data?.item?.duration_ms - 30000;

        const random_pos = Math.floor(Math.random() * max_start);

        await seek_helper(random_pos);

        await set_volume(100);

        return {
            "duration": player_data?.item?.duration_ms,
            "artists": player_data?.item?.artists,
            "name": player_data?.item?.name,
            "cover": player_data?.item?.album?.images[0].url
        };
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};



const playPlaylist = async (playlistId) => {

    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                context_uri: `spotify:playlist:${playlistId}`,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to play playlist');
        }

        console.log('Playlist is now playing');

    } catch (error) {
        console.error('Error:', error);
    }
};

const Shuffle = async () => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=true`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to shuffle');
        }

        console.log('shuffling enabled');
    } catch (error) {
        console.error('Error:', error);
    }
}


const GetArtists = (artist_list) => {
    return (

        <div className='artist_wrap'>
            {artist_list.map((artist, index) => (
                <div key={index} className='artist'>{artist.name}{index === artist_list.length - 1 ? "" : ","} </div>
            ))}
        </div>
    )
}

const GetUserPlaylists = async () => {
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/playlists`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to get user playlists');
        }
        
        const data = await response.json();
    
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

const Game = () => {
    const [songData, setSongData] = useState(null);
    const [reavealed, setReavealed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [songPlaying, setSongPlaying] = useState(false);
    const isGameLive = useRef(false);
    const skipped = useRef(false);
    const [songCorrect, setSongCorrect] = useState(false);
    const [artistCorrect, setArtistCorrect] = useState(false);
    const [p1Score, setP1Score] = useState(0);
    const [p2Score, setP2Score] = useState(0);
    const [currentPlayer1, setCurrentPlayer1] = useState(false);
    const [currentPlaylist, setCurrentPlaylist] = useState(null);
    const [playlistData, setPlaylistData] = useState(null);
    const [searchData, setSearchData] = useState(null);
    // const playlistData = GetUserPlaylists();
    const [query, setQuery] = useState("Search Here...");
    const preloaded = useRef(false);
    const isPaused = useRef(false);
    const isSearching = useRef(false);
    const currentlyAdvancing = useRef(false);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const handleBeforeUnload = (e) => {
            console.log("test")
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    const safe_pause = async () => {
        if (!isPaused.current) {
            isPaused.current = true;
            await pause();
        }
        
    }
    const spotifySearch = async (event) => {
        setQuery(event.target.value);

        if (!isSearching.current && event.target.value !== "") {
            isSearching.current = true;
            try {

            const response = await fetch(`https://api.spotify.com/v1/search?q=${event.target.value}&type=playlist&limit=50`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                isSearching.current = false;
                throw new Error('Failed search');
            }
            const data = await response.json();

            setSearchData(data.playlists)
            isSearching.current = false;

            // console.log(data)
            } catch (error) {
                console.error("Error: ", error)
            }
        }

    };

    const GetPlaylist = (playlist_json) => {
        

        const handle_playlist_click = async (playlist_data) => {
    
            await set_volume(0);
            await playPlaylist(playlist_data.id);
            setCurrentPlaylist(playlist_data);
    
        }
        
        return (
          <div>
            <img className='playlist_image' alt={playlist_json.name} onClick={handle_playlist_click.bind(null, playlist_json)} src={playlist_json.images[0]?.url ?? placeholder_playlist}></img>
            <p className='playlist_name'>{playlist_json.name}</p>
            
          </div>
        );
    };

    const updateScore = () => {
        const thisRound = (songCorrect ? 10 : 0) +  (artistCorrect ? 10 : 0)
        const thisRoundBonus = thisRound === 20 ? 5 : 0
        if (currentPlayer1) {
            setP1Score(p1Score + thisRound + thisRoundBonus)
            
        } else {
            setP2Score(p2Score + thisRound + thisRoundBonus)

        }
        // console.log(p1Score, p2Score)

    }


    useEffect(() => {
        const preProcesses = async () => {
            const devices = await Get_available_devices();
            console.log(devices);
            await pause_if_playing();
            isPaused.current = true;
            await set_volume(100);
            await Shuffle();
            if (!playlistData) {

                console.log(playlistData)
                const fetchedPlData = await GetUserPlaylists();
                setPlaylistData(fetchedPlData)
            }
            

        };
        
        const atomic = async () => {
            if (!preloaded.current) {
                preloaded.current = true;
                await preProcesses();


            }
        };

        atomic();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // preloader
    
    useEffect(() => {
        if (!isGameLive.current) {
            console.log("hello")
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft(prevTimeLeft => {
                if (prevTimeLeft === 0) {
                    clearInterval(interval);

                    if (songPlaying) {
                        setTimeLeft(THINK_TIME);
                        setSongPlaying(false);
                    } else {
                        setReavealed(true)
                        if (isPaused.current) {
                            play();
                        }
                        isPaused.current = false;
                    }
                    
                    return 0;
                }
                return prevTimeLeft - 1;
            });
        }, 1000);

        // Clean up the interval to avoid memory leaks
        return () => clearInterval(interval);
    }, [songData, songPlaying]); // countdown


    useEffect(() => {

        const interval = setInterval(async () => {
            try {
                const response = await fetch(`https://api.spotify.com/v1/me/player/currently-playing`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed cron fetch');
                }
                
                const data = await response.json();
                console.log(data); // This will log the data to the console

                if (data.progress_ms + 20000 > data.item.duration_ms) {
                    console.log("pausing playback to stop overflow")
                    await safe_pause();
                }
            
                
                
            } catch (error) {
                console.error('Error:', error);
            }

        }, 15000);
        
        return () => clearInterval(interval);
    }, []); // check no song overflow

    return (
        <div>
            {/* HEADER */}
            <div id="head">
                {/* <section id="profile"> */}
                <h1 className="headerItem" id="title">SoundQuest</h1>
                <img className="headerItem" alt={"Profile"} id="profile_img" src={profile_data.profileImage} />

                <h2 className="headerItem"  id="username"> {profile_data.displayName}</h2> 
                {/* <ul> */}
                    {/* <li>User ID: <span id="id"></span></li> */}
                    {/* <li>Email: {profile_data.email}</li> */}
                {/* </ul> */}
                {/* </section> */}

            </div>

            {/* PLAYLIST */}
            
            {!currentPlaylist ?
                <div id="playlist_select">
                    <div className='playlist_box_label'>User Playlists:</div>
                    <div id="playlist_select_box">

                        

                        {playlistData ? playlistData.items.map((item, index) => (
                        <div className="playlist" key={index}>{ GetPlaylist(item)}</div>
                        )) : <span id="loading">Loading...</span>}

                    </div> 

                    <input className="searchbar" type="text" value={query} onChange={spotifySearch} />
                    <div className="playlist_box_label">{`${query} Playlists:`}</div>

                    <div id="playlist_select_box">  

                        {searchData ? 
                            searchData.items.length !== 0 ?
                                searchData.items.map((item, index) => (
                                    <div className="playlist" key={index}>{ GetPlaylist(item)}</div>
                                ))
                                :
                                <span id="no-results">{`No results found for ${query}`}</span>
                            : 
                            <span id="loading">Enter Search Above</span>
                        }

                    </div> 
                    

                </div>
                :

                <div className='game_main'> 
                <div className='currentPlaylist'>
                    {/* <div className='my_button' id='playlist_info'>Select new playlist</div> */}
                    <img onClick={() => {if (reavealed || !isGameLive.current) {setCurrentPlaylist(null)}}}className='playlist_image' alt={currentPlaylist.name} src={currentPlaylist ? currentPlaylist.images[0].url : placeholder_playlist}></img>
                    <div id='playlist_info'>{currentPlaylist.name}</div>

                </div>
                <img className='track_image' alt={songData?.name}src={songData && reavealed ? songData.cover : placeholder_playlist}></img>
                <div className="answer_track">Song: {songData && reavealed ? songData.name : ""}</div>
                <div className="answer_artists">Artist: {songData && reavealed ? GetArtists(songData.artists) : ""}</div>

                <div className='info_box'>
                    <div className="timer">Time Left: {`${timeLeft} `}</div>
                    <div className="instructions">{songPlaying ? "Listen" : "Answer"}</div>

                </div>

                <div>
                    <div id="p1">
                        <div id="p1Score_lab" className={(currentPlayer1 && isGameLive.current) ? "hot_score" : "score"}>{`Player 1:`}</div>
                        <div id="p1Score" className={(currentPlayer1 && isGameLive.current) ? "hot_score" : "score"}>{p1Score}</div>

                    </div>

                    <div id="p2">
                        <div id="p2Score_lab" className={(!currentPlayer1 && isGameLive.current) ? "hot_score" : "score"}>{`Player 2:`}</div>
                        <div id="p2Score" className={(!currentPlayer1 && isGameLive.current) ? "hot_score" : "score"}>{p2Score}</div>

                    </div>
                </div>

                {/* BUTTONS :) */}

                <div id="button_box">
                    {
                        reavealed || !isGameLive.current ? 
                        <div id="next_button" className="my_button" onClick={
                            async () => {

                                const atomic = async () => {
                                    currentlyAdvancing.current = true;
                                    console.log(songCorrect, artistCorrect)
                                    updateScore()
                                    setSongCorrect(false);
                                    setArtistCorrect(false);
                                    setCurrentPlayer1(!currentPlayer1)
                                    skipped.current = false
                                    await set_volume(0)
                                    setTimeLeft(THINK_TIME)
                                    setIsLoading(true);
                                    const result = await GetNextSongDataRandom()
                                    if (result) {
                                        setIsLoading(false);

                                        
                                        isPaused.current = false;
                                        setSongPlaying(true)
                                        setSongData(result); 
                                        setReavealed(false);
                                        isGameLive.current = true;
                                        
                                        // need to jump this timer if we skip...
                                        setTimeout(async () => {
                                            if (!skipped.current) {
                                                await safe_pause();

                                            }
                                        }, ANSWER_TIME); // 10000 milliseconds = 10 seconds
                                    }
                                }
                                if (!currentlyAdvancing.current) {
                                    await atomic()
                                    currentlyAdvancing.current = false;
                                }
                                
                            }
                        
                        }>{isGameLive.current ? "Next" : "Start"}</div> : null
                    }
                    

                    {
                        reavealed ? 
                            <div id="scoring_buttons">
                                <div id="song_button" className={songCorrect ? 'correct_button' : "wrong_button"}
                                onClick={
                                    () => setSongCorrect(!songCorrect)
                                }
                                >Song Correct?</div>
                                <div id="artist_button" className={artistCorrect ? 'correct_button' : "wrong_button"}
                                onClick={
                                    () => setArtistCorrect(!artistCorrect)
                                }
                                >Artist Correct?</div>
                            </div> : null
                    }

                    {isGameLive.current && !reavealed ? 
                        <div id="skip_button" className='my_button'
                            onClick={
                                async () => {
                                    if (setSongPlaying) {
                                        await safe_pause()
                                        setTimeLeft(0)
                                        setSongPlaying(songPlaying) // manually trigger the effect
                                        skipped.current = true;
                                    }
                                }
                            }
                        
                        >Skip</div>
                        : 
                        null
                    }

                </div>
                <div id="loading_msg">{isLoading ? "Loading..." : ""}</div> 

            </div>
            
            }

            



            
            
        </div>
    )
}


const Main = () => {
  return (
    <div>
      <Game />


    </div>
  )
  }





export default Main;
