import { useEffect, useState } from "react";

import "./App.css";
import Notes from "./Notes";

function App() {
  const initialNotes = [
    {
      id: 1,
      text: "Go to the gym",
    },
    {
      id: 2,
      text: "Take a bath",
    },
  ];

  const [notes, setNotes] = useState(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) 
    return savedNotes || initialNotes;
  });
console.log('notes in app: ',notes);

  // useEffect(() => {
  //   const latestNotes = JSON.parse(localStorage.getItem("notes"));
  //   setNotes(latestNotes);
  // }, []);

  return <Notes notes={notes} setNotes={setNotes} />;
}

export default App;
