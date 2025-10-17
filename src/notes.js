import { onValue, push, ref, remove, set, update } from 'firebase/database';

function addNoteToDatabase(db, userId, title, note) {
    try {
        // Create a reference to the user's entries
        const userNotesRef = ref(db, 'users/' + userId + '/notes');

        console.log("User entries ref:", userNotesRef);

        // Push creates a new child with a unique auto-generated key
        const newNotesRef = push(userNotesRef);
        console.log("New notes ref:", newNotesRef);

        // Set the data at the new notes
        set(newNotesRef, {
            title: title,
            note: note,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error writing user data:', error);
        alert('Failed to save user data. Please try again.');
    }
}

// Function to update an existing note
function updateNoteInDatabase(db, userId, noteId, title, note) {
    try {
        const noteRef = ref(db, `users/${userId}/notes/${noteId}`);

        update(noteRef, {
            title: title,
            note: note,
            timestamp: Date.now() // Update timestamp
        });

        console.log('Note updated successfully');
    } catch (error) {
        console.error('Error updating note:', error);
        alert('Failed to update note. Please try again.');
    }
}

// Function to delete a note
function deleteNoteFromDatabase(db, userId, noteId) {
    try {
        const noteRef = ref(db, `users/${userId}/notes/${noteId}`);
        remove(noteRef);
        console.log('Note deleted successfully');
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
    }
}

// Function to display all notes from the database
function displayNotes(db, userId) {
    const notesContainer = document.getElementById('notes-container');
    const userNotesRef = ref(db, 'users/' + userId + '/notes');

    // Listen for changes in the notes
    onValue(userNotesRef, (snapshot) => {
        // Clear the container
        notesContainer.innerHTML = '';

        const notesData = snapshot.val();

        if (!notesData) {
            // No notes exist
            notesContainer.innerHTML = '<p class="no-notes-message">No notes yet. Click the + button to add your first note!</p>';
            return;
        }
        console.log("Notes data fetched:", notesData);

        // Convert notes object to array and sort by timestamp (newest first)
        const notesArray = Object.entries(notesData).map(([key, value]) => ({
            id: key,
            ...value
        })).sort((a, b) => b.timestamp - a.timestamp);
        console.log("Fetched notes:", notesArray);

        // Create a div for each note
        notesArray.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.dataset.noteId = note.id;

            const noteTitle = document.createElement('h3');
            noteTitle.className = 'note-title';
            noteTitle.textContent = note.title;

            const noteContent = document.createElement('p');
            noteContent.className = 'note-content';
            noteContent.textContent = note.note;

            const noteTimestamp = document.createElement('p');
            noteTimestamp.className = 'note-timestamp';
            const date = new Date(note.timestamp);
            noteTimestamp.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            const noteDeleteButton = document.createElement('button');
            noteDeleteButton.className = 'note-delete-button';

            const deleteIcon = document.createElement('img');
            deleteIcon.src = '/assets/icons/delete-icon.png';
            deleteIcon.alt = 'Delete Note';
            noteDeleteButton.appendChild(deleteIcon);

            const noteEditButton = document.createElement('button');
            noteEditButton.className = 'note-edit-button';

            const editIcon = document.createElement('img');
            editIcon.src = '/assets/icons/edit-icon.png';
            editIcon.alt = 'Edit Note';
            noteEditButton.appendChild(editIcon);

            const noteButtonsContainer = document.createElement('div');
            noteButtonsContainer.className = 'note-buttons-container';
            noteButtonsContainer.appendChild(noteEditButton);
            noteButtonsContainer.appendChild(noteDeleteButton);


            noteCard.appendChild(noteTitle);
            noteCard.appendChild(noteContent);
            noteCard.appendChild(noteTimestamp);
            noteCard.appendChild(noteButtonsContainer);

            notesContainer.appendChild(noteCard);
        });
    }, (error) => {
        console.error('Error reading notes:', error);
        notesContainer.innerHTML = '<p class="no-notes-message">Error loading notes. Please refresh the page.</p>';
    });
}

// Modal functionality
export function notesUISetup(auth, db) {
    const addNoteButton = document.getElementById('add-note-button');
    const notesContainer = document.getElementById('notes-container');

    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const cancelButton = document.getElementById('cancel-note-button');
    const saveButton = document.getElementById('save-note-button');
    const titleInput = document.getElementById('note-title-input');
    const contentInput = document.getElementById('note-content-input');

    let editingNoteId = null; // Track which note is being edited

    // If elements don't exist (we're on index.html), just return
    if (!addNoteButton || !modalOverlay) {
        return;
    }

    // Get current user and display their notes
    const currentUser = auth.currentUser;
    if (currentUser) {
        displayNotes(db, currentUser.uid);
    }

    // Event delegation for edit and delete buttons
    notesContainer?.addEventListener('click', (e) => {
        // Check if edit button was clicked
        if (e.target.closest('.note-edit-button')) {
            const noteCard = e.target.closest('.note-card');
            const noteId = noteCard.dataset.noteId;
            const noteTitle = noteCard.querySelector('.note-title').textContent;
            const noteContent = noteCard.querySelector('.note-content').textContent;

            // Populate modal with existing note data
            modalTitle.textContent = 'Edit Note';
            titleInput.value = noteTitle;
            contentInput.value = noteContent;
            editingNoteId = noteId;

            // Open modal
            modalOverlay.classList.add('show');
            titleInput.focus();
        }

        // Check if delete button was clicked
        if (e.target.closest('.note-delete-button')) {
            const noteCard = e.target.closest('.note-card');
            const noteId = noteCard.dataset.noteId;
            const noteTitle = noteCard.querySelector('.note-title').textContent;

            if (confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    deleteNoteFromDatabase(db, currentUser.uid, noteId);
                }
            }
        }
    });

    // Open modal when + button is clicked (for new note)
    addNoteButton?.addEventListener('click', () => {
        modalTitle.textContent = 'Add New Note';
        editingNoteId = null; // Clear editing state
        modalOverlay.classList.add('show');
        titleInput.focus();
    });

    // Close modal when cancel button is clicked
    cancelButton?.addEventListener('click', () => {
        closeModal();
    });

    // Close modal when clicking outside the modal content
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Save note when save button is clicked
    saveButton?.addEventListener('click', () => {
        // Get current user at the time of saving
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Please log in first!');
            window.location.href = 'index.html';
            return;
        }

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('Please enter both title and note content.');
            return;
        }

        // Check if we're editing or adding a new note
        if (editingNoteId) {
            // Update existing note
            console.log('Updating note:', { id: editingNoteId, title, content });
            updateNoteInDatabase(db, currentUser.uid, editingNoteId, title, content);
        } else {
            // Add new note
            console.log('Adding new note:', { title, content });
            addNoteToDatabase(db, currentUser.uid, title, content);
        }

        // Note will appear/update automatically due to onValue listener
        closeModal();
    });

    // Helper function to close modal and clear inputs
    function closeModal() {
        modalOverlay.classList.remove('show');
        titleInput.value = '';
        contentInput.value = '';
        editingNoteId = null; // Clear editing state
        modalTitle.textContent = 'Add New Note'; // Reset title
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
            closeModal();
        }
    });
}