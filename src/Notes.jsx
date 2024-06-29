import React, { forwardRef, createRef, useEffect, useRef } from "react";

const NoteInput = ({ setNotes }) => {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if(inputRef.current?.value){
    const newNote = { id: Math.floor(Math.random()*1000), text: inputRef.current.value };
    setNotes((prev) => [...prev, newNote]);
    inputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} placeholder="Add new note" style= {{ width: '400px', height: '20px', borderRadius : '2px', }}/>
      <button style = {{height: '25px', backgroundColor : 'lightblue', borderRadius: '4px', marginLeft: '4px', cursor: 'pointer'}} type="submit">Add</button>
    </form>
  );
};

const Note = forwardRef(({ content, initialPos, ...props }, ref) => {
  // console.log('ref: ', ref.current)
  return (
    <div
      className="note"
      // draggable
      ref={ref}
      style={{
        position: "absolute",
        left: `${initialPos.x}px`,
        top: `${initialPos.y}px`,
        border: "1px solid black",
        userSelect: "none",
        padding: "10px",
        width: "200px",
        cursor: "move",
        backgroundColor: "lightyellow",
      }}
      {...props}
    >
      📌 {content}
    </div>
  );
});

const Notes = ({ notes = [], setNotes }) => {
  const noteRefs = useRef([]);


  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem("notes")) || [];

    const updatedNotes = notes.map((note) => {
      const savedNote = savedNotes.find((n) => n.id === note.id);
      if (savedNote) {
        return { ...note, position: savedNote.position };
      } else {
        const position = determineNewPosition();
        return { ...note, position };
      }
    });
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  }, [notes.length]);

  const determineNewPosition = () => {
    const maxX = window.innerWidth - 250;
    const maxY = window.innerHeight - 250;

    const position = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    };

    return position;
  };

  const handleDragStart = (e, note) => {
    const { id } = note;
    const noteRef = noteRefs.current[id].current;
    const rect = noteRef.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    // console.log('e.clientX: ', e.clientX, 'e.clientY: ', e.clientY);
    // console.log('noteRef: ',noteRef);
    // console.log('rect: ', rect);
    const handleMouseMove = (event) => {
      const newX = event.clientX - offsetX;
      const newY = event.clientY - offsetY;
      noteRef.style.left = `${newX}px`;
      noteRef.style.top = `${newY}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);

      const newRect = noteRef.getBoundingClientRect();
      const newPosition = { x: newRect.left, y: newRect.top };

      if (checkForOverlap(id)) {
        //check for overlap
        noteRef.style.left = `${note.position.x}px`;
        noteRef.style.top = `${note.position.y}px`;
      } else {
        updateNotePosition(newPosition, id);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const checkForOverlap = (id) => {
    const noteRef = noteRefs.current[id].current;
    const currentRect = noteRef.getBoundingClientRect();

    return notes.some((note) => {
      if (note.id === id) return false;
      const otherNoteRef = noteRefs.current[note.id].current;
      const otherNoteRect = otherNoteRef.getBoundingClientRect();
      const overlap =
        currentRect.left < otherNoteRect.right &&
        currentRect.right > otherNoteRect.left &&
        currentRect.top < otherNoteRect.bottom &&
        currentRect.bottom > otherNoteRect.top;
      // console.log(overlap);

      return overlap;
    });
  };

  const updateNotePosition = (newPosition, id) => {
    const updatedNotes = notes.map((note) => {
      if (note.id === id) return { ...note, position: newPosition };
      else return note;
    });
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  return (
    <div>
      <NoteInput setNotes={setNotes} />
      {notes.map((note) => {
        return (
          <Note
            key={note.id}
            ref={
              noteRefs.current[note.id]
                ? noteRefs.current[note.id]
                : (noteRefs.current[note.id] = createRef())
            }
            initialPos={note.position || { x: 0, y: 0 }}
            content={note.text}
            onMouseDown={(e) => handleDragStart(e, note)}
          />
        );
      })}
    </div>
  );
};

export default Notes;
