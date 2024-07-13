import React, { useState, useEffect } from 'react';
import { useAuth } from '../../authContext';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import WaterWave from "react-water-wave";
import axios from 'axios';
import './Reading.css'
import background from '../../assets/images/reading.png'
import spreadData from '../../data/spreadData';
import { doSendEmailVerification } from '../../auth';
import LoginModal from '../../components/Authentication/LoginModal';
import RegisterModal from '../../components/Authentication/RegisterModal';
import QuestionInput from '../../components/QuestionInput/QuestionInput';
import PastReadings from '../../components/PastReadings/PastReadings';
import Feedback from '../../components/Feedback/Feedback';
import Design from '../../components/Design/Design';
import Spread from '../../components/Spread/Spread';
import icon1 from '../../assets/images/reading-icon (1).png'
import icon2 from '../../assets/images/reading-icon (2).png'
import icon3 from '../../assets/images/reading-icon (3).png'
import arrow from '../../assets/ui/arrow_cricle.png'
import Shuffle from '../../components/Shuffle/Shuffle';
import Result from '../../components/Result/Result';

const Reading = () => {
    const { userLoggedIn, currentUser } = useAuth();
    const [question, setQuestion] = useState('');
    const [design, setDesign] = useState(0);
    const [spread, setSpread] = useState(0);
    const [selectedCards, setSelectedCards] = useState([]);
    const [cards, setCards] = useState([]);
    const [tagsInput, setTagsInput] = useState('');
    const [tags, setTags] = useState([]);
    const [result, setResult] = useState('')
    const [isLoading, setIsLoading] = useState(true); 
    const [noteInput, setNoteInput] = useState('');
    const [note, setNote] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false); 
    const [editingNote, setEditingNote] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const readingProps = {
        question,
        design,
        spread,
        selectedCards,
        cards,
        result,
        isLoading,
        setQuestion,
        setDesign,
        setSpread,
        setSelectedCards,
        setCards,
        setResult,
        setIsLoading
    };

    useEffect(() => {
        setShowLogin(false);
    }, [userLoggedIn]);

    useEffect(() => {
        if (currentUser) {
            setIsEmailVerified(currentUser.emailVerified)
        };
    }, [userLoggedIn]);

    useEffect(() => {
        if (question) {
            document.querySelector('button#begin').classList = 'floating'
        }
    }, [question, setQuestion])

    const handleBegin = () => {
        if (question) {
            document.querySelector('.reading-container').classList.add('hide')
        } else {
            document.querySelector('.modal').classList.remove('fade-out')
            document.querySelector('.modal').classList.remove('floating')
            document.querySelector('.modal').classList.add('heartbeat')
            setTimeout(() => {
                document.querySelector('.modal').classList.remove('heartbeat');
                document.querySelector('.modal').classList.add('fade-out')
              }, 1500);
        }
        document.querySelector('.shuffle-container').classList.remove('hide')
        document.querySelector('.reading-container').classList.add('hide')
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setTags([...tags, tagsInput.trim()]);
            setTagsInput('');
        }
    };

    const handleSaveReading = async () => {
        try {
            if (!currentUser) {
                console.error('User not authenticated.');
                return;
            }

            const docRef = await addDoc(collection(db, "readings"), {
                uid: currentUser.uid,
                question,
                design,
                spread,
                selectedCards,
                result: 'Your result here',
                tags,
                note,
                createdAt: serverTimestamp()
            });

            console.log('Reading added with ID: ', docRef.id);

            setQuestion('');
            setDesign('');
            setSpread('');
            setSelectedCards([]);
            setCards([])
            setResult('')
            setTags([]);
            setTagsInput('');
            setNote('');
            setNoteInput('');
        } catch (error) {
            console.error('Error saving reading to Firestore: ', error);
        }
    };

    const handleGetResult = () => {
        document.querySelector('.shuffle-container').classList.add('hide')
        document.querySelector('.results-container').classList.remove('hide')
        fetchData()
    }

    const fetchData = async () => {
        try {
        const cardStates = cards.map(card => `${card.name} ${card.reversal}`).join(', ');

    
        const prompt = `My question is: ${question}. I drew ${cards.length} cards. They are: ${cardStates}. Return 35 words per card, formatted like 'Card Name (Reversal Status)', separated by line break, start with the card name at the beginning. Take upright/reverse into account. Lastly, give one paragraph summary start with 'Summary:'. (35 words).`;
    
        console.log("Prompt:", prompt);
    
        const response = await axios.post('https://celestial-backend-bjdf.onrender.com/sendMsgToOpenAI', {
            userMessage: prompt,
        }, {
            timeout: 60000, 
        });
    
        console.log("Axios Response:", response);
        setResult(response.data.generatedResponse);
        setIsLoading(false)
        } catch (error) {
        console.error('Error fetching data:', error);
        }
    };
    // const handleSwitchToRegister = () => {
    //     setShowRegister(true); 
    //     setShowLogin(false);
    // };

    // const handleSwitchToLogin = () => {
    //     setShowLogin(true);
    //     setShowRegister(false);
    // };

    // const handleAddNote = () => {
    //     if (noteInput.trim() !== '') {
    //         setNote(noteInput.trim());
    //         setNoteInput('');
    //     }
    // };

    // const handleEditNote = () => {
    //     setEditingNote(true);
    //     setNoteInput(note);
    // };

    // const handleSaveEditedNote = () => {
    //     setNote(noteInput.trim());
    //     setEditingNote(false);
    // };

    // const handleCancelEditNote = () => {
    //     setEditingNote(false);
    //     setNoteInput('');
    // };

    // const handleRemoveTag = (index) => {
    //     const updatedTags = [...tags];
    //     updatedTags.splice(index, 1);
    //     setTags(updatedTags);
    // };

    return (
        <div className='reading'>
            <WaterWave
                className='ripple-container' 
                imageUrl={background}
                dropRadius={40}
                perturbance={0.01}
                resolution={256}
                interactive={true}
            >
            {({ drop }) => ( 
            <>
            </>
            )}
            </WaterWave>
            <div className="reading-container">
                <div>
                    <div className="heading">
                        <img src={icon1} alt="" />
                        <h1>Question</h1>
                    </div>
                    <QuestionInput {...readingProps} />
                </div>
                <div>
                    <div className="heading">
                        <img src={icon2} alt="" />
                        <h1>Design</h1>
                    </div>
                    <Design  {...readingProps} />
                </div>
                <div>
                    <div className="heading">
                        <img src={icon3} alt="" />
                        <h1>Spread</h1>
                    </div>
                    <Spread  {...readingProps} />
                </div>
                <button onClick={handleBegin} id='begin'>
                    CLICK TO BEGIN 
                    <img src={arrow} alt="" />
                    <div className="modal fade-out">Please enter a question</div>
                </button>
            </div>
            <div className="shuffle-container hide">
                <Shuffle {...readingProps}/>
                {selectedCards.length === spreadData[spread].length ? (
                // If the number of selected cards matches the spread length
                cards.length === spreadData[spread].length ? (
                    // If the number of flipped cards matches the spread length
                    <button onClick={handleGetResult} className='floating' id='get-results'>
                    CLICK TO GET RESULT 
                    <img src={arrow} alt="" />
                    </button>
                ) : (
                    // If not all cards are flipped
                    <button className='floating' id='get-results'>
                    FLIP THE CARDS
                    </button>
                )
                ) : (
                // If not all cards are selected
                <button className='hide' id='get-results'>
                    CLICK TO GET RESULT 
                    <img src={arrow} alt="" />
                </button>
                )}
            </div>
            <div className="results-container hide">
                <Result {...readingProps}/>
            </div>
            {/* {userLoggedIn && isEmailVerified && <p className='result'>Logged in content here...</p>}
            {!userLoggedIn && showLogin && <LoginModal handleSwitchToRegister={handleSwitchToRegister} />}
            {!userLoggedIn && showRegister && <RegisterModal handleSwitchToLogin={handleSwitchToLogin} />} 
            {userLoggedIn && !isEmailVerified && <p>Verify your email before you continue. A link has been sent</p>}
            <div>
                <label>Tags:</label>
                <div>
                    {tags.map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                            <button className="tag-remove" onClick={() => handleRemoveTag(index)}>
                                d
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Press Enter to add tags"
                />
            </div>
            <div>
                <label>Note:</label>
                {editingNote ? (
                    <div>
                        <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Edit note..."
                        />
                        <button onClick={handleSaveEditedNote}>Save Note</button>
                        <button onClick={handleCancelEditNote}>Cancel</button>
                    </div>
                ) : (
                    <div>
                        {note ? (
                            <div>
                                <p>{note}</p>
                                <button onClick={handleEditNote}>Edit Note</button>
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="Add a note..."
                                />
                                <button onClick={handleAddNote}>Add Note</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <button onClick={handleSaveReading}>Save Reading</button> */}

        </div>
    );
};

export default Reading;
