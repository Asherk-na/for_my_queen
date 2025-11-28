function launchConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#6a0dad', '#ffc', '#e6e6fa', '#ff9900'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti');

        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 5 + 's';
        piece.style.width = piece.style.height = (Math.random() * 6 + 4) + 'px';

        container.appendChild(piece);
    }
}

launchConfetti();

// --- Simple modal system for in-page messages (replaces alerts for notes) ---
function createModal() {
    let overlay = document.getElementById('modal-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
        <div class="modal">
            <button class="modal-close" aria-label="Close">×</button>
            <h3 class="modal-title"></h3>
            <div class="modal-body"></div>
        </div>
    `;

    document.body.appendChild(overlay);

    // close handlers
    overlay.querySelector('.modal-close').addEventListener('click', hideModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) hideModal();
    });

    return overlay;
}

function showModal(title, message) {
    const overlay = createModal();
    overlay.style.display = 'flex';
    overlay.querySelector('.modal-title').textContent = title;
    // allow HTML line breaks if the message contains them
    const body = overlay.querySelector('.modal-body');
    body.innerText = message;
}

function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
}

// --- Photo gallery data and renderer ---
const galleryImages = [
    { src: 'Images/Church_day.jpg', caption: 'Church day: First time in a church in months.' },
    { src: 'Images/Oldest_photo.jpg', caption: 'Oldest photo: Oldest photo of me in my gallery.' },
    { src: 'Images/Dog-1.jpg', caption: 'Dog 1: Her name is Goldie.' },
    { src: 'Images/Dog-2.jpg', caption: 'Dog 2: His name is Zimba and he is the kindest and friendliest dog on Earth.' },
    { src: 'Images/Night-walk.jpg', caption: 'Night-walk: Was really bored that day.' },
    { src: 'Images/Pizza-day.jpg', caption: 'Pizza-day: Ate about 19 slices of pizza that day. Friends between 8 and 23.' },
    { src: 'Images/School-life.jpg', caption: 'School-life: You will find me on campus at Uni but never where I am supposed to be.' },
    { src: 'Images/Sunsets.jpg', caption: 'Sunsets: Testing out ways to use the sunset better in my pics.' },
    { src: 'Images/Learn-to-drive.jpg', caption: 'Learn-to-drive: First time driving a car over 200 miles. Had to take a pic of the car I would either come to love or get in an accident with.' },
    { src: 'Images/High-school.jpg', caption: 'High-school: Got my first phone in HS. New to taking pics.' },
];

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';

    galleryImages.forEach((img, i) => {
        const figure = document.createElement('figure');
        figure.className = 'gallery-item';

        const image = document.createElement('img');
        image.src = img.src;
        image.alt = img.caption || `Photo ${i + 1}`;
        image.loading = 'lazy';
        image.dataset.index = i;
        image.addEventListener('click', () => openGallery(i));

        const cap = document.createElement('figcaption');
        cap.textContent = img.caption;

        figure.appendChild(image);
        figure.appendChild(cap);
        grid.appendChild(figure);
    });
}

// Create gallery overlay (lightbox)
function createGalleryOverlay() {
    let overlay = document.getElementById('gallery-overlay');
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = 'gallery-overlay';
    overlay.innerHTML = `
        <div class="gallery-lightbox">
            <button class="gallery-close" aria-label="Close">×</button>
            <button class="gallery-prev" aria-label="Previous">‹</button>
            <div class="gallery-inner">
                <img class="gallery-current" src="" alt="">
                <div class="gallery-caption"></div>
                <div class="gallery-index" aria-hidden="true"></div>
            </div>
            <button class="gallery-next" aria-label="Next">›</button>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.gallery-close').addEventListener('click', closeGallery);
    overlay.querySelector('.gallery-prev').addEventListener('click', showPrevGallery);
    overlay.querySelector('.gallery-next').addEventListener('click', showNextGallery);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGallery(); });

    // keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!document.getElementById('gallery-overlay') || document.getElementById('gallery-overlay').style.display !== 'flex') return;
        if (e.key === 'ArrowLeft') showPrevGallery();
        if (e.key === 'ArrowRight') showNextGallery();
        if (e.key === 'Escape') closeGallery();
    });

    return overlay;
}

let currentGalleryIndex = 0;
let slideshowTimer = null;
const SLIDESHOW_INTERVAL = 4000; // ms

function startSlideshow() {
    stopSlideshow();
    slideshowTimer = setInterval(() => {
        showNextGallery();
    }, SLIDESHOW_INTERVAL);
}

function stopSlideshow() {
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
        slideshowTimer = null;
    }
}

function openGallery(index) {
    currentGalleryIndex = index;
    const overlay = createGalleryOverlay();
    const imgEl = overlay.querySelector('.gallery-current');
    const capEl = overlay.querySelector('.gallery-caption');
    const idxEl = overlay.querySelector('.gallery-index');

    // use displayImage for fade/caption animation
    overlay.style.display = 'flex';
    // force reflow then add open class to trigger CSS transition
    window.requestAnimationFrame(() => overlay.classList.add('open'));
    displayImage(index);

    // start autoplay slideshow
    startSlideshow();
}

function closeGallery() {
    const overlay = document.getElementById('gallery-overlay');
    if (!overlay) return;
    // remove open class to start fade-out
    overlay.classList.remove('open');
    // stop slideshow
    stopSlideshow();
    // after transition, hide
    setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 260);
}

function showNextGallery() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
    displayImage(currentGalleryIndex);
    // restart slideshow timer so user gets the full interval after manual navigation
    if (slideshowTimer) { stopSlideshow(); startSlideshow(); }
}

function showPrevGallery() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    displayImage(currentGalleryIndex);
    if (slideshowTimer) { stopSlideshow(); startSlideshow(); }
}

function displayImage(index) {
    currentGalleryIndex = index;
    const overlay = createGalleryOverlay();
    const imgEl = overlay.querySelector('.gallery-current');
    const capEl = overlay.querySelector('.gallery-caption');
    const idxEl = overlay.querySelector('.gallery-index');

    // prepare for fade: hide caption and fade image out
    if (capEl) capEl.classList.remove('visible');
    if (imgEl) imgEl.style.opacity = 0;

    // update index and caption immediately (caption will animate after load)
    if (idxEl) idxEl.textContent = `${index + 1} / ${galleryImages.length}`;
    if (capEl) capEl.textContent = galleryImages[index].caption || '';

    // load new image then fade it in
    const newSrc = galleryImages[index].src;
    // remove any previous onload handler
    imgEl.onload = null;
    imgEl.onload = function() {
        // fade in image
        imgEl.style.transition = 'opacity 320ms ease';
        imgEl.style.opacity = 1;
        // show caption with slight delay for nicer effect
        setTimeout(() => { if (capEl) capEl.classList.add('visible'); }, 120);
    };
    // set src (browser will fire load even if cached)
    imgEl.src = newSrc;
    imgEl.alt = galleryImages[index].caption || '';
}

// render on load
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
});



const notes = [
    "Your smile is my favorite poem.",
    "Just like a piece of manga, you a masterpiece.",
    "Missing my Otaku Cassky from Cape Town!",
    "Thank you for being you,insecurities and all. You are perfect.",
    "I can't spell love if you aren't in it.",
    "You are what Einstein refered to when he was talking about perfection.",
    "Love might be an illusion but it is an illusion I will fall into, if it means I get to spend my life with you.",

];

const loveNotesArray = [
    { title: "My Favorite Introvert", message: "You don't need to be loud to shine. Your quiet confidence and depth are what I love most about you." },
    { title: "Anime & Manga Queen", message: "I enjoy watching anime and sharing recommendations with you — nothing like talking plots together." },
    { title: "Cape Town Sun", message: "Even though you are far away, you are the brightest part of my day here." },
    { title: "Our Future Recipe", message: "I keep calling you an exquisite chef despite not tasting your cooking yet — I can't wait to try it." },
    { title: "Simply Beautiful", message: "Your brown eyes, your brown hair, and that beautiful skin tone... you are stunning. Please never doubt your worth or beauty." },
    { title: "Poetic Soul", message: "Your love for poetry speaks to my soul. You are a poem I read every day — with every read I see a deeper, more relatable side of you." },
    { title: "A Note on Insecurity", message: "I know you have been feeling insecure, but I love every part of you. The number on a scale doesn't measure your warmth." },
    { title: "Exams Done", message: "Congratulations again on finishing your exams! Now relax and read that manhwa you've been putting off." },
    { title: "Missing You", message: "The distance is tough, but it's all worth it because it's for you. Sending lots of virtual hugs until the real ones come." },
    { title: "The Purple Vibe", message: "Just like your favorite color, you add richness and royalty to my life." },
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function loadNotes() {
    const grid = document.getElementById('notes-grid');
    grid.innerHTML = '';

    const notesTOShow = loveNotesArray.slice(0, 6);

    notesTOShow.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        
        noteDiv.classList.add('note');
        
        noteDiv.style.setProperty('--i', index);
        noteDiv.onclick = function() {
            // use modal instead of alert
            showModal(note.title, note.message);
        };

        noteDiv.innerHTML = `
            <div class="note-header">${note.title}</div>
            <p>Click to flip!<p>
            `;
            grid.appendChild(noteDiv);
    });
}

function shuffleNotes() {
    shuffleArray(loveNotesArray);
    loadNotes();
}

shuffleNotes();

// script.js

// Function 1: Virtual Gift Unwrap
document.getElementById('unwrap-button').addEventListener('click', function() {
    const giftContent = document.getElementById('gift-content');
    
    // Toggle visibility
    if (giftContent.style.display === 'block') {
        giftContent.style.display = 'none';
        this.innerText = 'Click to Unwrap Your Letter!';
    } else {
        giftContent.style.display = 'block';
        this.innerText = 'Letter is Open (Click to Hide)';
        alert("A special letter from me has been unwrapped! ❤️"); // A quick notification
    }
});

// Function 2: "Open When..." Letter Toggles
document.querySelectorAll('.open-when-card h4').forEach(header => {
    header.addEventListener('click', function() {
        // Find the message content inside the same card
        const message = this.parentNode.querySelector('.message-content');
        
        // Simple toggle for display: block/none
        if (message.style.display === 'block') {
            message.style.display = 'none';
        } else {
            message.style.display = 'block';
        }
    });
});
const quizQuestions = [
    // User-provided questions (from attachment)
    {
        question: "What was my first impression of you?",
        options: ["She has the best smile", "She is smart and quite humorous", "She is quite adventurous", "She is quite mysterious"],
        answer: "She has the best smile"
    },
    {
        question: "If we had a movie night, what genre would I pick?",
        options: ["Comedy", "Rom-com", "Action", "Animated"],
        answer: "Comedy"
    },
    {
        question: "What do I do when I miss you too much?",
        options: ["Re-read our messages", "Talk to your pics like a weirdo", "Make a playlist about you", "All the above"],
        answer: "All the above"
    },
    {
        question: "What's my favorite thing about you?",
        options: ["Your eyes", "Your laugh", "Everything", "Your kindness"],
        answer: "Everything"
    },

    // existing (additional) questions kept after the new ones
    {
        question: "What is Ashky's dream holiday destination?",
        options: ["Berlin, Germany", "Paris, France", "Kyoto, Japan", "New York, USA"],
        answer: "Kyoto, Japan"
    },
    {
        question: "What is Ashky's favorite free-time hobby?",
        options: ["Gaming", "Reading", "Sleeping", "Playing Chess"],
        answer: "Playing Chess"
    },
    {
        question: "What is Ashky's favorite time of day?",
        options: ["Morning", "Midnight", "Noon", "Dawn"],
        answer: "Dawn"
    },
    {
        question: "Ashky's favorite artist?",
        options: ["Drake", "Kendrick Lamar", "Rod Wave", "Central Cee"],
        answer: "Kendrick Lamar"
    },
    {
        question: "Favorite Series?",
        options: ["Suits", "Peaky Blinders", "Chernobyl", "Stranger Things"],
        answer: "Chernobyl"
    },
    {
        question: "What is Ashky's favorite genre of music?",
        options: ["UK Drill", "Rock", "Rap", "Jazz"],
        answer: "Rap"
    },
];

function renderQuiz() {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    
    quizQuestions.forEach((q, index) => {
        const qBlock = document.createElement('div');
        qBlock.classList.add('question-block');

        let html = `<h4>${index + 1}. ${q.question}</h4>`;

        q.options.forEach((option) => {
            const optionID = `q${index}-opt-${option.replace(/\s/g, '-')}`;

            html += `
                <label for="${optionID}">
                    <input type="radio" id="${optionID}" name="question${index}" value="${option}">
                    ${option}
                </label>
            `;
        });

        qBlock.innerHTML = html;
        container.appendChild(qBlock);
    });
}

window.checkQuiz = function() {
    let score = 0;
    const totalQuestions = quizQuestions.length;
    const resultDiv = document.getElementById('quiz-result');

    quizQuestions.forEach((q, index) => {
        const selector = `input[name="question${index}"]:checked`;
        const selected = document.querySelector(selector);

        if (selected && selected.value === q.answer) {
            score++;
        }
        // Optional: Add visual feedback here (e.g., change color of the correct answer)
    });

    
    let message = '';
    if (score === totalQuestions) {
        message = `Perfect Score! ${score}/${totalQuestions}! ❤️ You know Cassky best!`;
    } else if (score >= totalQuestions - 1) {
        message = `Excellent! ${score}/${totalQuestions}. You clearly pay attention!`;
    } else {
        message = `Good job! ${score}/${totalQuestions}. But you can do better! Time to listen more closely to my beautiful Cassky! 😉`;
    }

    resultDiv.innerHTML = message;
}

renderQuiz();

window.unlockSurprise = function() {
    const inputField = document.getElementById('secret-phrase');
    if (!inputField) return; // nothing to do
    const input = inputField.value.trim().toLowerCase();
    const secretKey = 'clover';

    const unlockBtn = document.getElementById('unlock-button');

    if (input === secretKey) {
        // disable inputs to prevent duplicate actions
        if (unlockBtn) {
            unlockBtn.disabled = true;
            unlockBtn.innerText = 'UNLOCKED!';
        }
        inputField.disabled = true;

        // Small UX: show a quick message then redirect to the secret page
        try {
            alert('🎉 Access Granted! Redirecting you to your surprise...');
        } catch (e) {
            // ignore alert failures
        }

        // Redirect to the dedicated gallery page
        window.location.href = 'gallery.html';
    } else {
        // Failure: give hint and clear input
        try {
            alert("❌ Incorrect phrase. Hint: It's the special nickname I use for you.");
        } catch (e) {}
        inputField.value = '';
    }
}
