import React, { useEffect, useState } from 'react';
import WaterWave from 'react-water-wave';
import background from '../../assets/images/pexels-mo-eid-1268975-8832898.jpg';
import { db } from '../../firebase';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../authContext';
import './Journal.css';
import icon from '../../assets/images/reading-icon (1).png';
import star from '../../assets/ui/star.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faPlus,
  faTag,
  faTimes,
  faArrowLeft,
  faFilter,
  faSearch,
  faSortDown,
  faSortUp,
} from '@fortawesome/free-solid-svg-icons';

const Journal = () => {
  const { currentUser } = useAuth();
  const [readings, setReadings] = useState([]);
  const [allReadings, setAllReadings] = useState([]);
  const [showTagInput, setShowTagInput] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);
  const [readingTags, setReadingTags] = useState([]);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(true);
  const [errorMessageTag, setErrorMessageTag] = useState('');
  const [errorMessageNote, setErrorMessageNote] = useState('');
  const [activeReading, setActiveReading] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [ascending, setAscending] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [spreads] = useState([
    'Three Card',
    'Five Card',
    'Yes or No',
    'Horseshoe',
    'Relationship'
  ]);

  useEffect(() => {
    const fetchReadings = async () => {
      if (currentUser) {
        const q = query(collection(db, 'zoevestica', currentUser.uid, 'readings'));
        const querySnapshot = await getDocs(q);
        const userReadings = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReadings(userReadings);
        setAllReadings(userReadings);

        // Extract tags from all readings
        const allTags = userReadings.reduce((acc, reading) => {
          reading.tags.forEach(tag => {
            if (!acc.includes(tag)) {
              acc.push(tag);
            }
          });
          return acc;
        }, []);
        setTags(allTags);
      }
    };
    fetchReadings();
  }, [currentUser]);


  const toggleSortOrder = () => {
    setAscending(!ascending); 
  };

  const sortReadings = (readings) => {
    let sortedReadings = [...readings];
    sortedReadings.sort((a, b) => {
      return ascending ? a.createdAt.seconds - b.createdAt.seconds : b.createdAt.seconds - a.createdAt.seconds;
    });
    return sortedReadings;
  };

  const handleDeleteTag = (tagToDelete) => {
    const updatedTags = readingTags.filter(tag => tag !== tagToDelete);
    setReadingTags(updatedTags);
  };


  const handleAddTag = () => {
    if (newTag.trim() === '') {
      setErrorMessageTag('Please enter a tag.');
      document.querySelector('.save-wrapper .tip').classList.remove('fade-out');
      document.querySelector('.save-wrapper .tip').classList.add('fade-in-fwd');
      setTimeout(() => {
        document.querySelector('.save-wrapper .tip').classList.add('fade-out');
      }, 1500);
      return;
    }
  
    if (readingTags.includes(newTag.trim())) {
      setErrorMessageTag('Tag already exists.');
      document.querySelector('.save-wrapper .tip').classList.remove('fade-out');
      document.querySelector('.save-wrapper .tip').classList.add('fade-in-fwd');
      setTimeout(() => {
        document.querySelector('.save-wrapper .tip').classList.add('fade-out');
      }, 1500);
      return;
    }
  
    const newTags = newTag.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setReadingTags([...readingTags, ...newTags]);
    setNewTag('');
    setErrorMessageTag('');
  };
  
  
  const handleAddNote = () => {
    if (note.trim() === '') {
      setErrorMessageNote('Please enter a note.');
      document.querySelector('.save-wrapper .tip-2').classList.remove('fade-out')

      document.querySelector('.save-wrapper .tip-2').classList.add('fade-in-fwd')
      setTimeout(() => {
        document.querySelector('.save-wrapper .tip-2').classList.add('fade-out')
      }, 1500); 
      return;
    } else {
      console.log(note);
      setNote(note)
      setErrorMessageNote('Note saved');
      document.querySelector('.save-wrapper .tip-2').classList.remove('fade-out')

      document.querySelector('.save-wrapper .tip-2').classList.add('fade-in-fwd')
      setTimeout(() => {
        document.querySelector('.save-wrapper .tip-2').classList.add('fade-out')
      }, 1500); 
      setShowNoteInput(true)
      return
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showSearchBar) {
        handleSearch();
      } else {
        handleAddTag();
      }
    }
  };

  const handleReadingClick = (index) => {
    setActiveReading(index);
    setReadingTags(readings[index].tags || []);
  };

  const handleBackToSummary = () => {
    setActiveReading(null);
    setReadingTags([]); 
  };

  const handleTagChange = (tag) => {
    const updatedSelectedTags = [...selectedTags];
    if (updatedSelectedTags.includes(tag)) {
      updatedSelectedTags.splice(updatedSelectedTags.indexOf(tag), 1);
    } else {
      updatedSelectedTags.push(tag);
    }
    setSelectedTags(updatedSelectedTags);
    filterReadings(updatedSelectedTags);
  };

  const handleClearFilter = () => {
    setSelectedTags([]); 
    setReadings(allReadings); 
  };

  const filterReadings = (selectedTags) => {
    if (!selectedTags || selectedTags.length === 0) {
      setReadings(allReadings);
    } else {
      const filteredReadings = allReadings.filter(reading =>
        selectedTags.some(tag => reading.tags.includes(tag))
      );
      setReadings(filteredReadings);
    }
  };

  const handleSearch = () => {
    const filteredReadings = allReadings.filter(reading => {
      const searchText = searchInput.toLowerCase();
      return (
        reading.question.toLowerCase().includes(searchText) ||
        reading.note.toLowerCase().includes(searchText) ||
        reading.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    });
    setReadings(filteredReadings);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.seconds) {
      return ''; 
    }

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='journal'>
      <WaterWave
        className='ripple-container'
        imageUrl={background}
        dropRadius={40}
        perturbance={0.01}
        resolution={256}
        interactive={true}
      >
        {({ drop }) => (
          <></>
        )}
      </WaterWave>
      <div className="journal-container">
        {activeReading === null ? (
          <>
            <div className="summary-header">
              <div className="icon-wrapper">
                <FontAwesomeIcon
                  icon={faFilter}
                  className="icon"
                  onClick={() => {
                    setShowFilter(!showFilter);
                    setShowSearchBar(false)
                  }}
                />
                {showFilter && (
                  <div className="dropdown-wrapper">
                    <label onClick={handleClearFilter} className='clear'>                 
                      <FontAwesomeIcon icon={faTimes} /> 
                      Clear filter
                    </label>
                    {tags.map((tag, index) => (
                      <label key={index}>
                        <input
                          type="checkbox"
                          value={tag}
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagChange(tag)}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                )}
                <div className="sort-toggle" onClick={toggleSortOrder}>
                  {ascending ? (
                    <FontAwesomeIcon icon={faSortUp} className="icon" />
                  ) : (
                    <FontAwesomeIcon icon={faSortDown} className="icon" />
                  )}
                </div>
                <FontAwesomeIcon icon={faSearch} className="icon" onClick={() => {
                    setShowSearchBar(!showSearchBar);
                    setShowFilter(false);
                  }}
                  />
                {showSearchBar && (
                  <div className="search-bar">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={handleSearchKeyPress}
                      placeholder="Search "
                    />
                    <button onClick={handleSearch}>Search</button>
                  </div>
                )}
              </div>
            </div>
            <div className="summary-view">
              <div className="content-wrapper">
                {sortReadings(readings).length > 0 ? (
                  sortReadings(readings).map((reading, index) => (
                    <div key={index} className='summary-item'>
                      <div className="reading-header">
                        <p><img src={icon} alt="" />{reading.question}</p>
                        <div className="info">
                          <p>{formatDate(reading.createdAt)}</p>
                          <img src={star}  className='spinning' alt="" />
                          <p>{spreads[reading.spread]}</p>
                        </div>
                      </div>
                      <div className="reading-content">
                        {reading.result.length > 200 ? `${reading.result.slice(0, 200)}...` : reading.result}
                      </div>
                      <div className="reading-details">
                        <div className="expand-details" onClick={() => handleReadingClick(index)}>
                          <span className="expand-text">View More</span>
                          <FontAwesomeIcon icon={faChevronDown} className="expand-icon" />
                        </div>
                        <div className="tags">
                          {reading.tags &&
                          <ul>
                          {reading.tags && reading.tags.map((tag, index) => (
                            <li key={index}><FontAwesomeIcon icon={faTag} />{tag}</li>
                          ))}
                          </ul>
                          }
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No readings found.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="detail-view">
            <FontAwesomeIcon icon={faArrowLeft} className="return-icon" onClick={handleBackToSummary} />
            {readings.map((reading, index) => {
              if (index !== activeReading) return null;
              const { id, question, result, images } = reading;
              const resultArray = result.split('\n\n');
              const allExceptLast = resultArray.slice(0, -1);
              const lastItem = resultArray[resultArray.length - 1];

              const handleSaveReading = async () => {
                const readingId = readings[activeReading].id;

   
                setErrorMessageNote('Saved.');
                document.querySelector('.save-wrapper .tip-2').classList.remove('fade-out')
          
                document.querySelector('.save-wrapper .tip-2').classList.add('fade-in-fwd')
                setTimeout(() => {
                  document.querySelector('.save-wrapper .tip-2').classList.add('fade-out')
                }, 1500); 
         

                try {
                  const readingRef = doc(db, 'zoevestica', currentUser.uid, 'readings', readingId);
                  await updateDoc(readingRef, {
                    tags: readingTags, 
                    note: note, 
                  });

                  const updatedReadings = readings.map(r => {
                    if (r.id === readingId) {
                      return {
                        ...r,
                        tags: readingTags,
                        note: note,
                      };
                    }
                    return r;
                  });
              
                  setReadings(updatedReadings);
                } catch (error) {
                  console.error('Error updating document:', error);
                }
              };
              
              return (
                <div key={index} className='result-wrapper'>
                  <div className="content-wrapper">
                    <h1><img src={icon} alt="" />{question}</h1>
                    {allExceptLast.map((item, index) => {
                      const [cardName, interpretation] = item.split(':');
                      return (
                        <div key={index} className="card-container">
                          <div className="card-image">
                            <img src={images[index]} className='card-image' alt="" />
                          </div>
                          <div className='card-text'>
                            <h3><img src={star} className='spinning' alt="" /><span>{cardName}</span></h3>
                            <p>{interpretation}</p>
                          </div>
                        </div>
                      );
                    })}
                    {lastItem && (
                      <>
                        <div className="last-item-wrapper">
                          <div className='card-text'>
                            <h3><span>{lastItem.split(':')[0]}</span></h3>
                            <p>{lastItem.split(':')[1]}</p>
                          </div>
                        </div>
                        <div className="save-wrapper">
                          <span>Add tags and note to your reading, and save to your journal.</span>
                          <div className="editor">
                            <div className="tags">
                              <div className='header' onClick={() => setShowTagInput(!showTagInput)} >
                                <FontAwesomeIcon icon={faPlus} /><p>Add Tags</p><span>Separate by comma</span></div>
                              {showTagInput && (
                                <div className='input-wrapper'>
                                  {tags &&
                                  <ul>
                                  {readingTags && readingTags.map((tag, index) => (
                                    <li key={index}><FontAwesomeIcon icon={faTag} />{tag} <FontAwesomeIcon onClick={() => handleDeleteTag(tag)} icon={faTimes} /></li>
                                  ))}
                                  </ul>
                                  }
                                  <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Add tags here"
                                  />
                                  <button onClick={handleAddTag}>Add Tag</button>
                                </div>
                              )}
                              <span className="tip fade-out">{errorMessageTag}</span>
                            </div>

                            <div className="note">
                              <div className='header' onClick={() => setShowNoteInput(!showNoteInput)}>
                                <FontAwesomeIcon icon={faPlus} /><p>Add Note</p><span>You can edit this later in your journal</span>
                              </div>
                              {showNoteInput && (
                                <div className='input-wrapper'>
                                  <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add a note here..."
                                    rows={5}
                                  />
                                  <div className="note-button-wrapper">
                                    <button onClick={handleAddNote}>Add Note</button>
                                  </div>
                                </div>
                              )}
                              <span className="tip-2 fade-out">{errorMessageNote}</span>
                            </div>
                            <div className="button-wrapper">
                              <button className="save" onClick={handleSaveReading}>Save</button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
